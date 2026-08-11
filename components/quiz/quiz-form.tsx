"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  question: string | null;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  question_order: number | null;
};

type Props = {
  quizId: string;
  questions: Question[];
  userId: string | null;
};

export default function QuizForm({
  quizId,
  questions,
  userId,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    xp: number;
  } | null>(null);

  const [error, setError] = useState("");

  function chooseAnswer(
    questionId: string,
    answer: string
  ) {
    if (result) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }

  async function submitQuiz() {
    if (submitting || result) return;

    setError("");

    if (!userId) {
      setError("You must be logged in to submit this quiz.");
      return;
    }

    const unanswered = questions.filter(
      (question) => !answers[question.id]
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${unanswered.length} remaining.`
      );
      return;
    }

    setSubmitting(true);

    try {
      let score = 0;

      for (const question of questions) {
        const selected = answers[question.id];

        if (
          selected &&
          question.correct_answer &&
          selected === question.correct_answer
        ) {
          score++;
        }
      }

      const total = questions.length;

      const percentage =
        total > 0
          ? Math.round((score / total) * 100)
          : 0;

      /*
       * احنا بنحفظ النتيجة هنا.
       *
       * لو عندك أعمدة إضافية في quiz_results
       * زي score/total_questions/percentage
       * أضفها هنا حسب الـschema عندك.
       */

      const { error: insertError } = await supabase
        .from("quiz_results")
        .insert({
          quiz_id: quizId,
          user_id: userId,
          score,
        });

      if (insertError) {
        console.error(insertError);

        if (
          insertError.message
            .toLowerCase()
            .includes("duplicate")
        ) {
          setError(
            "You have already submitted this quiz."
          );
        } else {
          setError(insertError.message);
        }

        return;
      }

      /*
       * حساب XP محليًا للعرض.
       * الـRPC الخاص بك يقدر يتولى XP بشكل مركزي
       * لو الـquiz_results مربوط به.
       */

      let xp = 25;

      if (percentage >= 90) {
        xp = 150;
      } else if (percentage >= 80) {
        xp = 125;
      } else if (percentage >= 60) {
        xp = 100;
      }

      setResult({
        score,
        total,
        percentage,
        xp,
      });

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-[2rem] border border-green-500/20 bg-zinc-900/80 p-8 text-center">
        <CheckCircle2
          size={55}
          className="mx-auto text-green-400"
        />

        <h2 className="mt-5 text-3xl font-black">
          Quiz Completed
        </h2>

        <p className="mt-3 text-zinc-500">
          You scored {result.score} / {result.total}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-zinc-800 p-4">
            <p className="text-2xl font-black">
              {result.percentage}%
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Score
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-800 p-4">
            <p className="text-2xl font-black text-purple-400">
              +{result.xp}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              XP
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-800 p-4">
            <p className="text-2xl font-black">
              {result.total}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Questions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((question, index) => {
        const options = [
  question.option_a,
  question.option_b,
  question.option_c,
  question.option_d,
].filter(Boolean) as string[];

        return (
          <div
            key={question.id}
            className="rounded-[2rem] border border-white/5 bg-zinc-900/70 p-6 md:p-8"
          >
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-sm font-black text-purple-400">
                {index + 1}
              </div>

              <h2 className="pt-1 text-lg font-bold leading-7">
                {question.question}
              </h2>
            </div>

            <div className="mt-6 grid gap-3">
              {options.map((option, optionIndex) => {
                const selected =
                  answers[question.id] === option;

                return (
                  <button
                    key={`${question.id}-${optionIndex}`}
                    type="button"
                    onClick={() =>
                      chooseAnswer(
                        question.id,
                        option
                      )
                    }
                    className={`rounded-xl border p-4 text-left text-sm transition ${
                      selected
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                        : "border-white/5 bg-zinc-950 text-zinc-400 hover:border-purple-500/20 hover:text-white"
                    }`}
                  >
                    <span className="mr-3 font-bold text-zinc-600">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>

                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <XCircle className="mr-2 inline" size={17} />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submitQuiz}
        disabled={submitting}
        className="w-full rounded-2xl bg-purple-600 px-6 py-4 font-black transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting..."
          : "Submit Quiz"}
      </button>
    </div>
  );
}