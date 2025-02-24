import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { topic, userLevel } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let promptDifficulty = "";

    switch (userLevel) {
      case "beginner":
        promptDifficulty = `
          Use simple language and basic concepts.
          Provide many examples.
          Explain terms thoroughly.
          Avoid advanced terminology.
          Break down concepts into small steps.
        `;
        break;
      case "intermediate":
        promptDifficulty = `
          Balance simplicity with some advanced concepts.
          Provide relevant examples.
          Assume basic knowledge but explain moderately complex terms.
          Connect concepts to practical applications.
        `;
        break;
      case "expert":
        promptDifficulty = `
          Use technical language appropriate for experts.
          Focus on advanced concepts.
          Provide in-depth analysis.
          Reference related advanced topics.
          Use industry-standard terminology without extensive explanation.
        `;
        break;
      default:
        promptDifficulty = `
          Balance simplicity with some advanced concepts.
          Provide relevant examples.
        `;
    }

    const prompt = `Generate  practice questions and detailed solutions for the topic: ${topic}.
      Format each question with its solution. Include examples where appropriate.
      
      The user's expertise level is: ${userLevel}
      
      ${promptDifficulty}
      
      Make sure each question is appropriate for a ${userLevel} level understanding.`;

    const stream = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
