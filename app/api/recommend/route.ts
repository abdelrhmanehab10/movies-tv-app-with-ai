import axios from "axios";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import {
  FreeLimitReachedError,
  runWithQuota,
} from "@/lib/recommendation-quota";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { getTmdbAuthConfig } from "@/lib/tmdb-auth";
import type { FilmType } from "@/types";

const FREE_RECOMMENDATION_LIMIT = 3;

const recommendationSchema = z.object({
  mood: z.enum(["happy", "reflective", "excited"]),
  setting: z.enum(["past", "present", "future"]),
  story: z.enum(["action", "comedy", "romance"]),
});

type RecommendationInput = z.infer<typeof recommendationSchema>;

class QuotaUnavailableError extends Error {
  constructor() {
    super("The recommendation quota is temporarily unavailable.");
    this.name = "QuotaUnavailableError";
  }
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly service: "Groq" | "TMDB",
    readonly upstreamStatus?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

function errorResponse(
  status: number,
  code: string,
  error: string,
  remaining?: number
) {
  return NextResponse.json(
    { code, error, ...(remaining === undefined ? {} : { remaining }) },
    { status }
  );
}

async function fetchRecommendation(
  input: RecommendationInput,
  groqApiKey: string,
  tmdbApiKey: string
): Promise<FilmType> {
  const groq = new OpenAI({
    apiKey: groqApiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  let recommendation: string | undefined;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: [
            "Recommend one movie or TV series.",
            `Mood: ${input.mood}`,
            `Story: ${input.story}`,
            `Setting: ${input.setting}`,
            "Return only the exact title.",
            "Do not include markdown, quotes, the release year, a synopsis, or any other text.",
          ].join("\n"),
        },
      ],
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
    });

    recommendation = completion.choices[0].message?.content?.trim();
  } catch (error) {
    const upstreamStatus =
      error instanceof OpenAI.APIError ? error.status : undefined;
    throw new ProviderError(
      "The AI provider could not generate a recommendation.",
      "Groq",
      upstreamStatus
    );
  }

  if (!recommendation) {
    throw new ProviderError(
      "The AI provider returned an empty recommendation.",
      "Groq"
    );
  }

  try {
    const response = await axios.get<{ results: FilmType[] }>(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        recommendation
      )}&include_adult=yes&language=en-US&page=1`,
      getTmdbAuthConfig(tmdbApiKey)
    );
    const result = response.data.results.find(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );

    if (!result) {
      throw new ProviderError(
        "TMDB could not find a movie or TV result for that recommendation.",
        "TMDB"
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }

    const upstreamStatus = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    throw new ProviderError(
      "TMDB could not resolve the recommendation.",
      "TMDB",
      upstreamStatus
    );
  }
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse(
      401,
      "AUTH_REQUIRED",
      "Sign in to use your 3 free AI picks."
    );
  }

  const { data: quota, error } = await supabase
    .from("recommendation_quotas")
    .select("free_limit, free_used")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to read recommendation quota", error);
    return errorResponse(
      503,
      "QUOTA_UNAVAILABLE",
      "Unable to check your remaining AI picks."
    );
  }

  const limit = quota?.free_limit ?? FREE_RECOMMENDATION_LIMIT;
  const remaining = Math.max(limit - (quota?.free_used ?? 0), 0);

  return NextResponse.json({ authenticated: true, limit, remaining });
}

export async function POST(req: Request) {
  let requestBody: unknown;

  try {
    requestBody = await req.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "Please provide valid mood, story, and setting values."
    );
  }

  const parsed = recommendationSchema.safeParse(requestBody);

  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "Please provide valid mood, story, and setting values."
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse(
      401,
      "AUTH_REQUIRED",
      "Sign in to use your 3 free AI picks."
    );
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const tmdbApiKey = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_API_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missingKeys = [
    !groqApiKey && "GROQ_API_KEY",
    !tmdbApiKey && "TMDB_API_KEY",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter((key): key is string => Boolean(key));

  if (!groqApiKey || !tmdbApiKey || !serviceRoleKey) {
    return errorResponse(
      503,
      "SERVICE_UNAVAILABLE",
      `Recommendation service is not configured. Missing: ${missingKeys.join(
        ", "
      )}`
    );
  }

  const admin = createAdminClient();
  const { mood, setting, story } = parsed.data;

  try {
    const response = await runWithQuota({
      claim: async () => {
        const { data, error } = await admin.rpc("claim_free_recommendation", {
          p_user_id: user.id,
        });
        const claim = data?.[0];

        if (error || !claim) {
          console.error("Failed to claim a free recommendation", error);
          throw new QuotaUnavailableError();
        }

        return claim;
      },
      release: async () => {
        const { error } = await admin.rpc("release_free_recommendation", {
          p_user_id: user.id,
        });

        if (error) {
          throw error;
        }
      },
      recommend: () =>
        fetchRecommendation(parsed.data, groqApiKey, tmdbApiKey),
      onReleaseError: (error) => {
        console.error("Failed to refund a free recommendation", error);
      },
    });

    const { error: historyError } = await supabase
      .from("recommendations")
      .insert({
        user_id: user.id,
        mood,
        story,
        setting,
        tmdb_id: response.result.id,
        media_type: response.result.media_type as "movie" | "tv",
      });

    if (historyError) {
      console.error("Failed to save recommendation history", historyError);
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof FreeLimitReachedError) {
      return errorResponse(403, error.code, error.message, error.remaining);
    }

    if (error instanceof QuotaUnavailableError) {
      return errorResponse(503, "QUOTA_UNAVAILABLE", error.message);
    }

    if (error instanceof ProviderError) {
      console.error("Recommendation upstream request failed", {
        service: error.service,
        status: error.upstreamStatus,
      });

      const status = error.upstreamStatus === 429 ? 503 : 502;
      const message =
        error.upstreamStatus === 429
          ? `${error.service} rate limit reached. Please try again shortly.`
          : error.message;

      return errorResponse(status, "PROVIDER_ERROR", message);
    }

    console.error("Recommendation request failed", error);
    return errorResponse(
      502,
      "RECOMMENDATION_FAILED",
      "Unable to generate a recommendation."
    );
  }
}
