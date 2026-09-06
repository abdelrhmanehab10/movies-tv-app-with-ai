import axios from "axios";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getTmdbAuthConfig } from "@/lib/tmdb-auth";

const recommendationSchema = z.object({
  mood: z.enum(["happy", "reflective", "excited"]),
  setting: z.enum(["past", "present", "future"]),
  story: z.enum(["action", "comedy", "romance"]),
});

export async function POST(req: Request) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const tmdbApiKey = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY;

    const missingKeys = [
      !groqApiKey && "GROQ_API_KEY",
      !tmdbApiKey && "NEXT_PUBLIC_API_KEY",
    ].filter((key): key is string => Boolean(key));

    if (missingKeys.length > 0) {
      return NextResponse.json(
        {
          error: `Groq recommendation service is not configured. Missing: ${missingKeys.join(
            ", "
          )}`,
        },
        { status: 503 }
      );
    }

    const parsed = recommendationSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide valid mood, story, and setting values." },
        { status: 400 }
      );
    }

    const { mood, setting, story } = parsed.data;
    const groq = new OpenAI({
      apiKey: groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: [
            "Recommend one movie or TV series.",
            `Mood: ${mood}`,
            `Story: ${story}`,
            `Setting: ${setting}`,
            "Return only the exact title.",
            "Do not include markdown, quotes, the release year, a synopsis, or any other text.",
          ].join("\n"),
        },
      ],
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
    });

    const recommendation = completion.choices[0].message?.content?.trim();

    if (!recommendation) {
      return NextResponse.json({ error: "No recommendation found" }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        recommendation
      )}&include_adult=yes&language=en-US&page=1`,
      getTmdbAuthConfig(tmdbApiKey)
    );

    const result = response.data.results[0];

    if (!result) {
      return NextResponse.json({ error: "No results found" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const isTmdbError = error.config?.url?.includes("api.themoviedb.org");
      const service = isTmdbError ? "TMDB" : "Groq";
      const status = error.response?.status;

      console.error("Recommendation upstream request failed", {
        service,
        status,
        data: error.response?.data,
      });

      if (status === 401) {
        return NextResponse.json(
          { error: `${service} authentication failed. Check the API key.` },
          { status: 502 }
        );
      }

      if (status === 429) {
        return NextResponse.json(
          { error: `${service} rate limit reached. Please try again shortly.` },
          { status: 503 }
        );
      }
    } else {
      console.error("Recommendation request failed", error);
    }

    return NextResponse.json(
      { error: "Unable to generate a recommendation" },
      { status: 502 }
    );
  }
}
