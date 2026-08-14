import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Clock3,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { notFound } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import QuizForm from "@/components/quiz/quiz-form";

/* =====================================================
   PAGE
===================================================== */

export default async function QuizPage({
  params,
}: {
  params: Promise<{
    subjectId: string;
    lessonId: string;
    quizId: string;
  }>;
}) {
  const {
    subjectId,
    lessonId,
    quizId,
  } = await params;

  const supabase =
    await createClient();

  /* ===================================================
     USER
  =================================================== */

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030305] text-white">
        <div className="rounded-[30px] border border-white/10 bg-[#08080c] p-10 text-center">
          <h1 className="text-2xl font-black">
            Login required
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Please login to start this quiz.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  /* ===================================================
     SUBJECT
  =================================================== */

  const {
    data: subject,
    error: subjectError,
  } =
    await supabase
      .from("subjects")
      .select(`
        id,
        name,
        code,
        description,
        image_url
      `)
      .eq(
        "id",
        subjectId
      )
      .maybeSingle();

  if (
    subjectError ||
    !subject
  ) {
    notFound();
  }

  /* ===================================================
     LESSON
  =================================================== */

  const {
    data: lesson,
    error: lessonError,
  } =
    await supabase
      .from("lessons")
      .select(`
        id,
        subject_id,
        title,
        description,
        lesson_order,
        order_number
      `)
      .eq(
        "id",
        lessonId
      )
      .eq(
        "subject_id",
        subject.id
      )
      .maybeSingle();

  if (
    lessonError ||
    !lesson
  ) {
    notFound();
  }

  /* ===================================================
     QUIZ
  =================================================== */

  const {
    data: quiz,
    error: quizError,
  } =
    await supabase
      .from("quizzes")
      .select(`
        id,
        subject_id,
        lesson_id,
        title,
        total_questions,
        created_at,
        description
      `)
      .eq(
        "id",
        quizId
      )
      .eq(
        "subject_id",
        subject.id
      )
      .maybeSingle();

  if (
    quizError ||
    !quiz
  ) {
    notFound();
  }

  /*
   * Since this route is specifically:
   *
   * Subject -> Lesson -> Quiz
   *
   * make sure the quiz really belongs
   * to this lesson.
   */

  if (
    quiz.lesson_id &&
    quiz.lesson_id !==
    lesson.id
  ) {
    notFound();
  }

  /* ===================================================
     QUESTIONS
  =================================================== */

  const {
    data: rawQuestions,
    error: questionsError,
  } =
    await supabase
      .from("quiz_questions")
      .select(`
        id,
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        question_order
      `)
      .eq(
        "quiz_id",
        quiz.id
      )
      .order(
        "question_order",
        {
          ascending: true,
        }
      );

  if (questionsError) {
    console.error(
      "QUIZ QUESTIONS ERROR:",
      questionsError
    );
  }

  const questions =
    (rawQuestions ?? []).map(
      (question) => ({
        id: question.id,
        quiz_id:
          question.quiz_id,
        question:
          question.question,
        option_a:
          question.option_a,
        option_b:
          question.option_b,
        option_c:
          question.option_c,
        option_d:
          question.option_d,
        correct_answer:
          question.correct_answer,
        question_order:
          question.question_order,
      })
    );

  /* ===================================================
     OPTIONAL FALLBACK
     
     If this quiz was created with the old
     questions table and doesn't have quiz_questions
     yet, we can still load it.
  =================================================== */

  let finalQuestions =
    questions;

  if (
    finalQuestions.length === 0
  ) {
    const {
      data: legacyQuestions,
      error:
      legacyQuestionsError,
    } =
      await supabase
        .from("questions")
        .select(`
          id,
          quiz_id,
          question,
          option1,
          option2,
          option3,
          option4,
          correct_answer
        `)
        .eq(
          "quiz_id",
          quiz.id
        );

    if (
      legacyQuestionsError
    ) {
      console.error(
        "LEGACY QUESTIONS ERROR:",
        legacyQuestionsError
      );
    }

    finalQuestions =
      (legacyQuestions ?? []).map(
        (question) => ({
          id: question.id,
          quiz_id:
            question.quiz_id,
          question:
            question.question,
          option_a:
            question.option1,
          option_b:
            question.option2,
          option_c:
            question.option3,
          option_d:
            question.option4,
          correct_answer:
            question.correct_answer,
          question_order: 0,
        })
      );
  }

  /* ===================================================
     PREVIOUS RESULT
  =================================================== */

  const {
    data: previousResult,
    error: previousResultError,
  } =
    await supabase
      .from("quiz_results")
      .select(`
        id,
        score,
        total_questions,
        completed_at
      `)
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "quiz_id",
        quiz.id
      )
      .order(
        "completed_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  if (
    previousResultError
  ) {
    console.warn(
      "PREVIOUS RESULT WARNING:",
      previousResultError
    );
  }

  const questionCount =
    finalQuestions.length;

  const previousPercentage =
    previousResult
      ? Math.round(
        (Number(
          previousResult.score
        ) /
          Math.max(
            Number(
              previousResult.total_questions
            ),
            1
          )) *
        100
      )
      : null;

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <main className="min-h-screen overflow-hidden bg-[#030305] text-white">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]" />

        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-violet-700/[0.06] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-7 md:px-8 md:py-10">
        {/* =================================================
            BACK
        ================================================= */}

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/subjects/${subject.id}`}
            className="group inline-flex items-center gap-2 text-xs font-bold text-zinc-600 transition hover:text-purple-400"
          >
            <ArrowLeft
              size={14}
              className="transition group-hover:-translate-x-1"
            />

            Back to{" "}
            {subject.name}
          </Link>

          <span className="text-zinc-800">
            /
          </span>

          <Link
            href={`/subjects/${subject.id}/lessons/${lesson.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 transition hover:text-purple-400"
          >
            {lesson.title ||
              "Lesson"}
          </Link>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mt-7 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-[#12091b] via-[#08070d] to-[#050507] p-7 md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-600/15 blur-[100px]" />

          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-fuchsia-600/[0.06] blur-[90px]" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[8px] font-black text-purple-300">
                    {subject.code ||
                      "RAIL"}
                  </span>

                  <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[8px] font-bold text-zinc-500">
                    <Target
                      size={10}
                    />
                    Knowledge Check
                  </span>
                </div>

                <p className="mt-5 text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                  {lesson.title ||
                    "Lesson"}
                </p>

                <h1 className="mt-2 break-words text-3xl font-black tracking-tight md:text-5xl">
                  {quiz.title}
                </h1>

                {quiz.description && (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                    {
                      quiz.description
                    }
                  </p>
                )}
              </div>

              <div className="shrink-0 rounded-2xl border border-purple-500/10 bg-black/20 p-5">
                <Trophy
                  size={24}
                  className="text-purple-400"
                />

                <p className="mt-3 text-2xl font-black">
                  +50
                </p>

                <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                  XP / correct
                </p>
              </div>
            </div>

            {/* INFO */}

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <QuizMeta
                icon={
                  <BookOpen
                    size={15}
                  />
                }
                label="Questions"
                value={`${questionCount}`}
              />

              <QuizMeta
                icon={
                  <Clock3
                    size={15}
                  />
                }
                label="Mode"
                value="Practice"
              />

              <QuizMeta
                icon={
                  <Zap
                    size={15}
                  />
                }
                label="Reward"
                value="+50 XP"
              />

              <QuizMeta
                icon={
                  <Trophy
                    size={15}
                  />
                }
                label="Previous"
                value={
                  previousPercentage !==
                    null
                    ? `${previousPercentage}%`
                    : "New"
                }
              />
            </div>
          </div>
        </section>

        {/* =================================================
            AI CONTEXT CARD
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-purple-500/10 bg-gradient-to-r from-purple-500/[0.06] to-transparent p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <BrainCircuit
                  size={19}
                />
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-purple-400">
                  Miro AI
                </p>

                <p className="mt-1 text-sm font-black">
                  Need help with this quiz?
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  ميرو يقدر يشرحلك أسئلة الكويز
                  وهو عارف المادة والدرس الحالي.
                </p>
              </div>
            </div>

            <Link
              href={`/ai?subjectId=${encodeURIComponent(
                subject.id
              )}&lessonId=${encodeURIComponent(
                lesson.id
              )}&quizId=${encodeURIComponent(
                quiz.id
              )}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/[0.08] px-4 py-3 text-[9px] font-black text-purple-300 transition hover:bg-purple-500/[0.13]"
            >
              Ask Miro
              <ArrowLeft
                size={13}
                className="rotate-180"
              />
            </Link>
          </div>
        </section>

        {/* =================================================
            QUESTIONS
        ================================================= */}

        <section className="mt-7">
          {finalQuestions.length >
            0 ? (
            <QuizForm
              quizId={quiz.id}
              questions={
                finalQuestions
              }
              userId={user.id}
              subjectId={subject.id}
              lessonId={lesson.id}
            />
          ) : (
            <div className="rounded-[30px] border border-white/[0.06] bg-[#07080d] p-12 text-center">
              <Target
                size={30}
                className="mx-auto text-purple-400"
              />

              <h2 className="mt-5 text-xl font-black">
                No questions yet
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                This quiz has been
                created but no
                questions have
                been added yet.
              </p>

              <Link
                href={`/subjects/${subject.id}/lessons/${lesson.id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3 text-[9px] font-black text-zinc-400 transition hover:text-white"
              >
                <ArrowLeft
                  size={13}
                />
                Back to Lesson
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =====================================================
   META
===================================================== */

function QuizMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-black">
        {value}
      </p>
    </div>
  );
}