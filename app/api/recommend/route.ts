import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function POST(req: Request) {
  const data = await req.json();
  const { mood = "happy", setting = "future", story = "romance" } = data;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate a personalized movie or series recommendation, I'm ${mood}, I prefer to be ${story} story, and in ${setting}. Please return 3 result with only the name of each result`,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    return NextResponse.json(completion.choices[0]);
  } catch (error) {
    console.log(error);
  }
}
