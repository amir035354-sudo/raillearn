import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Edit,
  Target,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Question = {
  id: string;
  quiz_id: string;
  question: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  option4: string | null;
  correct_answer: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminQuizDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // =====================================================
  // LOGIN
  // =====================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =====================================================
  // ADMIN
  // =====================================================

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/admin");
  }

  // =====================================================
  // QUIZ
  // =====================================================

  const { data: quiz, error: quizError } =
    await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        subject_id,
        subjects (
          id,
          name,
          code
        )
      `)
      .eq("id", id)
      .maybeSingle();

  if (quizError || !quiz) {
    notFound();
  }

  // =====================================================
  // QUESTIONS
  // =====================================================

  const { data: questionData, error: questionError } =
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
      .eq("quiz_id", id);

  if (questionError) {
    throw new Error(questionError.message);
  }

  const questions =
    (questionData ?? []) as Question[];

  const subject = Array.isArray(quiz.subjects)
    ? quiz.subjects[0]
    : quiz.subjects;

  return (
    <main className="min-h-screen bg-[#030305] px-5 py-8 text-white md:px-8 md:py-10 xl:px-10">
      <div className="mx-auto max-w-[1200px]">
        {/* BACK */}

        <Link
          href="/admin/quizzes"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Quizzes
        </Link>

        {/* HEADER */}

        <div className="mb-8 rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Target size={21} />
              </div>

              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                  <BookOpen size={11} />

                  {subject?.code ||
                    "NO SUBJECT"}
                </p>

                <h1 className="mt-2 text-2xl font-black md:text-4xl">
                  {quiz.title}
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {quiz.description ||
                    "No description yet."}
                </p>

                <p className="mt-4 text-[10px] font-bold text-zinc-500">
                  {subject?.name ||
                    "Unknown Subject"}
                </p>
              </div>
            </div>

            <Link
              href={`/admin/quizzes/${id}/edit`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[10px] font-black text-zinc-400 transition hover:border-purple-500/30 hover:text-white"
            >
              <Edit size={14} />
              Edit Quiz
            </Link>
          </div>
        </div>

        {/* QUESTIONS HEADER */}

        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
              Assessment
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Questions
            </h2>
          </div>

          <p className="text-xs font-bold text-zinc-600">
            {questions.length}{" "}
            {questions.length === 1
              ? "Question"
              : "Questions"}
          </p>
        </div>

        {/* QUESTIONS */}

        {questions.length === 0 ? (
          <div className="rounded-[26px] border border-white/[0.07] bg-[#07080d] p-12 text-center">
            <Target
              size={30}
              className="mx-auto text-zinc-700"
            />

            <h3 className="mt-5 text-lg font-black">
              No questions
            </h3>

            <p className="mt-2 text-xs text-zinc-600">
              This quiz doesn't have any questions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-[24px] border border-white/[0.07] bg-[#07080d] p-5 md:p-7"
              >
                <div className="mb-5 flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-xs font-black text-purple-400">
                    {index + 1}
                  </span>

                  <h3 className="text-base font-black leading-6 md:text-lg">
                    {question.question ||
                      "Untitled Question"}
                  </h3>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["option1", question.option1],
                    ["option2", question.option2],
                    ["option3", question.option3],
                    ["option4", question.option4],
                  ].map(([key, value]) => {
                    const isCorrect =
                      question.correct_answer === key;

                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                          isCorrect
                            ? "border-green-500/25 bg-green-500/[0.06]"
                            : "border-white/[0.06] bg-black/20"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`text-[9px] font-black ${
                              isCorrect
                                ? "text-green-400"
                                : "text-zinc-700"
                            }`}
                          >
                            {String(key).replace(
                              "option",
                              ""
                            )}
                          </span>

                          <span
                            className={`text-xs ${
                              isCorrect
                                ? "font-bold text-green-300"
                                : "text-zinc-500"
                            }`}
                          >
                            {String(value || "")}
                          </span>
                        </div>

                        {isCorrect && (
                          <Check
                            size={15}
                            className="shrink-0 text-green-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/admin/quizzes"
            className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-600 transition hover:text-purple-400"
          >
            All Quizzes
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}