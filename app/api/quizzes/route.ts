import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CleanedQuestion = {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_answer: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // =====================================================
    // CHECK LOGIN
    // =====================================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // CHECK ADMIN
    // =====================================================

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);

      return NextResponse.json(
        {
          error: "Failed to verify admin access.",
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Admin profile not found.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      String(profile.role).trim().toLowerCase() !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // READ REQUEST
    // =====================================================

    const body = await request.json();

    const title = String(body.title ?? "").trim();

    const description = String(
      body.description ?? ""
    ).trim();

    const subjectId = String(
      body.subject_id ??
        body.subjectId ??
        ""
    ).trim();

    const questions = Array.isArray(body.questions)
      ? body.questions
      : [];

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!title) {
      return NextResponse.json(
        {
          error: "Quiz title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!subjectId) {
      return NextResponse.json(
        {
          error: "Subject is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: "At least one question is required.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CHECK SUBJECT
    // =====================================================

    const {
      data: subject,
      error: subjectError,
    } = await supabase
      .from("subjects")
      .select("id")
      .eq("id", subjectId)
      .maybeSingle();

    if (subjectError) {
      console.error(
        "SUBJECT CHECK ERROR:",
        subjectError
      );

      return NextResponse.json(
        {
          error: subjectError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          error: "Selected subject was not found.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CLEAN QUESTIONS
    // =====================================================

    const cleanedQuestions: CleanedQuestion[] =
      questions
        .map((item: any) => ({
          question: String(
            item.question ?? ""
          ).trim(),

          option1: String(
            item.option1 ?? ""
          ).trim(),

          option2: String(
            item.option2 ?? ""
          ).trim(),

          option3: String(
            item.option3 ?? ""
          ).trim(),

          option4: String(
            item.option4 ?? ""
          ).trim(),

          correct_answer: String(
            item.correct_answer ?? ""
          ).trim(),
        }))
        .filter(
          (item: CleanedQuestion) =>
            item.question &&
            item.option1 &&
            item.option2 &&
            item.option3 &&
            item.option4 &&
            item.correct_answer
        );

    // =====================================================
    // CHECK CLEANED QUESTIONS
    // =====================================================

    if (cleanedQuestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid questions were provided.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CREATE QUIZ
    // =====================================================

    const {
      data: quiz,
      error: quizError,
    } = await supabase
      .from("quizzes")
      .insert({
        title,
        description:
          description || null,
        subject_id: subjectId,
      })
      .select()
      .single();

    if (quizError) {
      console.error(
        "CREATE QUIZ ERROR:",
        quizError
      );

      return NextResponse.json(
        {
          error: quizError.message,
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // PREPARE QUESTIONS
    // =====================================================

    const questionRows = cleanedQuestions.map(
      (item: CleanedQuestion) => ({
        quiz_id: quiz.id,
        question: item.question,
        option1: item.option1,
        option2: item.option2,
        option3: item.option3,
        option4: item.option4,
        correct_answer: item.correct_answer,
      })
    );

    // =====================================================
    // INSERT QUESTIONS
    // =====================================================

    const {
      data: createdQuestions,
      error: questionsError,
    } = await supabase
      .from("questions")
      .insert(questionRows)
      .select(
        "id, quiz_id, question, option1, option2, option3, option4, correct_answer"
      );

    // =====================================================
    // ROLLBACK QUIZ IF QUESTIONS FAIL
    // =====================================================

    if (questionsError) {
      console.error(
        "QUESTIONS INSERT ERROR:",
        questionsError
      );

      await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id);

      return NextResponse.json(
        {
          error: questionsError.message,
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        quiz,
        questions:
          createdQuestions ?? [],
        questionsCount:
          createdQuestions?.length ?? 0,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // =====================================================
    // UNEXPECTED ERROR
    // =====================================================

    console.error(
      "CREATE QUIZ API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}