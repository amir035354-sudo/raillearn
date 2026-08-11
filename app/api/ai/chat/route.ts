import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    // =====================================================
    // CHECK API KEY
    // =====================================================

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // READ REQUEST
    // =====================================================

    const body = await request.json();

    const messages = body.messages as ChatMessage[];

    const subjectId =
      typeof body.subjectId === "string"
        ? body.subjectId
        : null;

    const subjectName =
      typeof body.subjectName === "string"
        ? body.subjectName
        : null;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        {
          error: "Invalid messages.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // CLEAN MESSAGES
    // =====================================================

    const cleanedMessages = messages
      .filter(
        (message) =>
          (message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      )
      .slice(-20);

    if (cleanedMessages.length === 0) {
      return NextResponse.json(
        {
          error: "No messages provided.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // SUPABASE
    // =====================================================

    const supabase = await createClient();

    let lessonContext = "";

    // =====================================================
    // LOAD SUBJECT + LESSONS
    // =====================================================

    if (subjectId) {
      const { data: subject, error: subjectError } =
        await supabase
          .from("subjects")
          .select(
            "id, name, code, semester, description"
          )
          .eq("id", subjectId)
          .maybeSingle();

      if (subjectError) {
        console.error(
          "AI SUBJECT ERROR:",
          subjectError
        );
      }

      if (subject) {
        const { data: lessons, error: lessonsError } =
          await supabase
            .from("lessons")
            .select(
              `
              id,
              title,
              description,
              content,
              lesson_order,
              order_number
            `
            )
            .eq("subject_id", subject.id)
            .order("lesson_order", {
              ascending: true,
              nullsFirst: false,
            })
            .order("order_number", {
              ascending: true,
              nullsFirst: false,
            });

        if (lessonsError) {
          console.error(
            "AI LESSONS ERROR:",
            lessonsError
          );
        }

        lessonContext = `
RAILLEARN SUBJECT CONTEXT

Subject:
Name: ${subject.name ?? "Unknown"}
Code: ${subject.code ?? "Unknown"}
Semester: ${subject.semester ?? "Unknown"}
Description: ${subject.description ?? "No description"}

LESSONS:

${
  lessons && lessons.length > 0
    ? lessons
        .map(
          (lesson, index) => `
------------------------------
Lesson ${lesson.lesson_order ?? index + 1}

Title:
${lesson.title ?? "Untitled"}

Description:
${lesson.description ?? "No description"}

Content:
${lesson.content ?? "No lesson content available."}
`
        )
        .join("\n")
    : "No lessons are currently available for this subject."
}
`;
      }
    }

    // =====================================================
    // SYSTEM PROMPT
    // =====================================================

    const systemPrompt = `
You are RailLearn AI Tutor.

You are an educational AI assistant for students studying
Railway and Modern Transportation Technology.

==================================================
LANGUAGE
==================================================

- If the student speaks Egyptian Arabic, answer in clear Egyptian Arabic.
- If the student speaks English, answer in English.
- You may use English technical terms inside Arabic when useful.

==================================================
TEACHING STYLE
==================================================

- Explain concepts clearly and step by step.
- Start simple before adding technical details.
- Use examples when useful.
- If the student is confused, explain the idea differently.
- Be professional and friendly.
- Do not be childish.
- Do not unnecessarily repeat yourself.
- Keep normal answers reasonably concise.
- Give more detail when the student asks for it.
- Use headings and bullet points when they improve readability.

==================================================
RAILLEARN SUBJECTS
==================================================

You can help with:

- Railway engineering
- Railway signaling
- Railway systems
- Modern transportation technology
- Mechanics
- Physics
- Mathematics
- Electronics
- Electrical engineering
- Thermodynamics
- Fluid mechanics
- Materials
- Programming
- Technology

==================================================
IMPORTANT LESSON RULE
==================================================

When RailLearn lesson context is provided:

1. Prioritize the provided RailLearn content.
2. Use the lessons to explain the student's question.
3. Do not invent facts and claim they came from RailLearn.
4. If the answer is not available in the provided lesson content,
   clearly tell the student that the information is not available
   in the current RailLearn material.
5. You may use general knowledge to explain a concept when helpful,
   but clearly distinguish it from the RailLearn lesson content.
6. Never fabricate lesson information.

==================================================
QUIZZES
==================================================

If the student asks for a quiz:

- Create multiple-choice questions.
- Give four options.
- Do not immediately reveal the correct answer.
- Ask the student to answer.
- After the student answers, explain whether the answer is correct
  and why.
- When lesson content is available, make the quiz from that content.

==================================================
MATHEMATICS
==================================================

- Write formulas clearly.
- Explain every important variable.
- Show calculations step by step.
- Check the final result when possible.

==================================================
ACCURACY
==================================================

Never pretend to know something you do not know.

Never invent lesson content.

If the available RailLearn content does not contain the requested
information, say so clearly.

You are a tutor, not just a chatbot.

Your goal is to help the student actually understand the subject.

==================================================
CURRENT SUBJECT
==================================================

${
  subjectName
    ? `The student is currently studying: ${subjectName}`
    : "No specific subject was selected."
}

==================================================
RAILLEARN LESSON MATERIAL
==================================================

${lessonContext || "No specific RailLearn lesson context was provided."}
`.trim();

    // =====================================================
    // ASK GROQ
    // =====================================================

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },

          ...cleanedMessages,
        ],

        temperature: 0.4,

        max_tokens: 2000,
      });

    // =====================================================
    // GET ANSWER
    // =====================================================

    const answer =
      completion.choices?.[0]?.message?.content;

    if (!answer) {
      return NextResponse.json(
        {
          error: "AI returned an empty response.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,
      message: answer,
    });
  } catch (error) {
    console.error("AI CHAT ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "AI request failed.",
      },
      { status: 500 }
    );
  }
}