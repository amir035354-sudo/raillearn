import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import QuizForm from "@/components/quiz/quiz-form";

export default async function QuizPage({
  params,
}: {
  params: Promise<{
    code: string;
    quizId: string;
  }>;
}) {
  const { code, quizId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .single();

  if (!subject) {
    notFound();
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("subject_id", subject.id)
    .single();

  if (!quiz) {
    notFound();
  }

  const { data: questions, error } = await supabase
    .from("questions")
    .select(
      "id, quiz_id, question, option1, option2, option3, option4, correct_answer"
    )
    .eq("quiz_id", quiz.id)
    .order("id", { ascending: true });

  if (error) {
    console.error("Questions error:", error);
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12">
        <Link
          href={`/subjects/${code}`}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          ← Back to {subject.name}
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-8 md:p-10">
          <p className="text-sm font-semibold text-purple-400">
            {subject.code}
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            {quiz.title}
          </h1>

          {quiz.description && (
            <p className="mt-4 text-zinc-400">
              {quiz.description}
            </p>
          )}

          <p className="mt-5 text-sm text-zinc-500">
            {questions?.length ?? 0} Questions
          </p>
        </div>

        <div className="mt-6">
          {questions && questions.length > 0 ? (
            <QuizForm
              quizId={quiz.id}
              questions={questions}
              userId={user?.id ?? null}
            />
          ) : (
            <div className="rounded-[2rem] border border-white/5 bg-zinc-900/70 p-8 text-center">
              <p className="text-zinc-400">
                No questions available.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}