import axios from "axios";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function GET(req: Request) {
  const data = await req.json();
  const { mood = "happy", setting = "future", story = "romance" } = data;
  
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate a movie or series recommendation, I'm ${mood}, I prefer to be ${story} story, and in ${setting}. Please return only one result.`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const recommendation = completion.choices[0].message?.content;

    if (!recommendation) {
      return NextResponse.json({ error: "No recommendation found" }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/multi?query=${recommendation}&include_adult=yes&language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      }
    );

    const result = response.data.results[0];

    if (!result) {
      return NextResponse.json({ error: "No results found" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
  }
}
