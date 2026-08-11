"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Trash2,
  Target,
} from "lucide-react";

type Subject = {
  id: string;
  name: string | null;
  code: string | null;
};

type Question = {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_answer: string;
};

const emptyQuestion = (): Question => ({
  id: crypto.randomUUID(),
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_answer: "option1",
});

export default function NewQuizPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [questions, setQuestions] = useState<Question[]>([
    emptyQuestion(),
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        const response = await fetch("/api/admin/subjects", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load subjects."
          );
        }

        setSubjects(data.subjects || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subjects."
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, []);

  function updateQuestion(
    id: string,
    field: keyof Question,
    value: string
  ) {
    setQuestions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      emptyQuestion(),
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function validate() {
    if (!title.trim()) {
      return "Quiz title is required.";
    }

    if (!subjectId) {
      return "Please select a subject.";
    }

    if (questions.length === 0) {
      return "Add at least one question.";
    }

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      if (!question.question.trim()) {
        return `Question ${index + 1} is required.`;
      }

      if (!question.option1.trim()) {
        return `Question ${index + 1}: Option 1 is required.`;
      }

      if (!question.option2.trim()) {
        return `Question ${index + 1}: Option 2 is required.`;
      }

      if (!question.option3.trim()) {
        return `Question ${index + 1}: Option 3 is required.`;
      }

      if (!question.option4.trim()) {
        return `Question ${index + 1}: Option 4 is required.`;
      }

      if (
        ![
          "option1",
          "option2",
          "option3",
          "option4",
        ].includes(question.correct_answer)
      ) {
        return `Question ${index + 1}: Select the correct answer.`;
      }
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          subject_id: subjectId,
          questions: questions.map((item) => ({
            question: item.question.trim(),
            option1: item.option1.trim(),
            option2: item.option2.trim(),
            option3: item.option3.trim(),
            option4: item.option4.trim(),
            correct_answer: item.correct_answer,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create quiz."
        );
      }

      router.push("/admin/quizzes");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#030305] px-5 py-8 text-white md:px-8 md:py-10 xl:px-10">
      <div className="mx-auto max-w-[1100px]">
        <Link
          href="/admin/quizzes"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Quizzes
        </Link>

        <div className="mb-8">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400">
            Assessment
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            Create Quiz
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Create a quiz with multiple-choice questions for
            RailLearn students.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* QUIZ INFO */}

          <section className="rounded-[26px] border border-white/[0.07] bg-[#07080d] p-5 md:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Target size={18} />
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                  Quiz Information
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Basic Details
                </h2>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Quiz Title
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Railway Signaling Basics"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Subject
                </label>

                <select
                  value={subjectId}
                  onChange={(event) =>
                    setSubjectId(event.target.value)
                  }
                  disabled={loadingSubjects}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#08090e] px-4 py-3 text-sm outline-none focus:border-purple-500/50"
                >
                  <option value="">
                    {loadingSubjects
                      ? "Loading subjects..."
                      : "Select a subject"}
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.code
                        ? `${subject.code} — ${subject.name}`
                        : subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  placeholder="Short description of the quiz..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm leading-6 outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                />
              </div>
            </div>
          </section>

          {/* QUESTIONS */}

          <section className="rounded-[26px] border border-white/[0.07] bg-[#07080d] p-5 md:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                  Questions
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Quiz Questions
                </h2>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2.5 text-[10px] font-black text-purple-300 transition hover:bg-purple-500/20"
              >
                <Plus size={14} />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-white/[0.07] bg-black/20 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-xs font-black text-purple-400">
                        {index + 1}
                      </span>

                      <h3 className="text-sm font-black">
                        Question {index + 1}
                      </h3>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeQuestion(item.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        Question
                      </label>

                      <textarea
                        value={item.question}
                        onChange={(event) =>
                          updateQuestion(
                            item.id,
                            "question",
                            event.target.value
                          )
                        }
                        rows={3}
                        placeholder="Write the question..."
                        className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm leading-6 outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        ["option1", "Option 1"],
                        ["option2", "Option 2"],
                        ["option3", "Option 3"],
                        ["option4", "Option 4"],
                      ].map(([field, label]) => (
                        <div key={field}>
                          <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            {label}
                          </label>

                          <input
                            value={
                              item[
                                field as keyof Question
                              ] as string
                            }
                            onChange={(event) =>
                              updateQuestion(
                                item.id,
                                field as keyof Question,
                                event.target.value
                              )
                            }
                            placeholder={`Enter ${label.toLowerCase()}...`}
                            className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="mb-3 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        Correct Answer
                      </label>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[
                          ["option1", "Option 1"],
                          ["option2", "Option 2"],
                          ["option3", "Option 3"],
                          ["option4", "Option 4"],
                        ].map(([value, label]) => {
                          const active =
                            item.correct_answer === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                updateQuestion(
                                  item.id,
                                  "correct_answer",
                                  value
                                )
                              }
                              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-[10px] font-black transition ${
                                active
                                  ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                                  : "border-white/[0.07] bg-black/20 text-zinc-600 hover:border-white/[0.15] hover:text-zinc-300"
                              }`}
                            >
                              {active && (
                                <Check size={13} />
                              )}

                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SUBMIT */}

          <div className="flex justify-end pb-10">
            <button
              type="submit"
              disabled={loading || loadingSubjects}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-7 py-3.5 text-[10px] font-black transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}