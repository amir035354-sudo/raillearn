"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  HelpCircle,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Quiz = {
  id: string;
  subject_id: string;
  title: string;
};

type Question = {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number | null;
  question_order: number | null;
  created_at: string;
};

export default function AdminQuizQuestionsPage() {
  const supabase = createClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [points, setPoints] = useState("1");

  const [quizId, setQuizId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("quiz_id");

    if (!id) {
      setError("Quiz ID is missing.");
      setLoading(false);
      return;
    }

    setQuizId(id);
    loadData(id);
  }, []);

  async function loadData(id: string) {
    setLoading(true);
    setError("");

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("id, subject_id, title")
      .eq("id", id)
      .single();

    if (quizError) {
      setError(quizError.message);
      setLoading(false);
      return;
    }

    const { data: questionsData, error: questionsError } =
      await supabase
        .from("questions")
        .select(
          "id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, question_order, created_at"
        )
        .eq("quiz_id", id)
        .order("question_order", {
          ascending: true,
        });

    if (questionsError) {
      setError(questionsError.message);
      setLoading(false);
      return;
    }

    setQuiz(quizData as Quiz);
    setQuestions((questionsData ?? []) as Question[]);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setPoints("1");
  }

  function openAddModal() {
    resetForm();
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  function editQuestion(item: Question) {
    setEditingId(item.id);

    setQuestion(item.question);
    setOptionA(item.option_a);
    setOptionB(item.option_b);
    setOptionC(item.option_c);
    setOptionD(item.option_d);

    setCorrectAnswer(item.correct_answer);

    setPoints(
      item.points !== null ? String(item.points) : "1"
    );

    setError("");
    setModalOpen(true);
  }

  async function saveQuestion() {
    if (saving) return;

    setError("");

    if (!question.trim()) {
      setError("Please enter the question.");
      return;
    }

    if (!optionA.trim()) {
      setError("Please enter option A.");
      return;
    }

    if (!optionB.trim()) {
      setError("Please enter option B.");
      return;
    }

    if (!optionC.trim()) {
      setError("Please enter option C.");
      return;
    }

    if (!optionD.trim()) {
      setError("Please enter option D.");
      return;
    }

    const parsedPoints = Number(points);

    if (
      !Number.isInteger(parsedPoints) ||
      parsedPoints <= 0
    ) {
      setError("Points must be a positive number.");
      return;
    }

    setSaving(true);

    const nextOrder =
      questions.length > 0
        ? Math.max(
            ...questions.map(
              (item) => item.question_order ?? 0
            )
          ) + 1
        : 1;

    const payload = {
      quiz_id: quizId,
      question: question.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      correct_answer: correctAnswer,
      points: parsedPoints,
      question_order: nextOrder,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("questions")
        .update({
          question: payload.question,
          option_a: payload.option_a,
          option_b: payload.option_b,
          option_c: payload.option_c,
          option_d: payload.option_d,
          correct_answer: payload.correct_answer,
          points: payload.points,
        })
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("questions")
        .insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setModalOpen(false);
    resetForm();

    await loadData(quizId);

    setSaving(false);
  }

  async function deleteQuestion(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    setError("");

    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setQuestions((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  const filteredQuestions = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return questions;
    }

    return questions.filter((item) =>
      item.question.toLowerCase().includes(value)
    );
  }, [questions, search]);

  return (
    <div className="min-h-screen bg-[#08080b] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/5 bg-[#0b0b0f] p-6 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 shadow-lg shadow-purple-600/20">
                <ClipboardCheck size={22} />
              </div>

              <div>
                <h1 className="text-lg font-black">
                  RailLearn
                </h1>

                <p className="mt-1 text-xs text-zinc-600">
                  Admin Control Center
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={18} />
              Admin Dashboard
            </Link>

            <Link
              href="/admin/subjects"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <BookOpen size={18} />
              Subjects
            </Link>

            <Link
              href="/admin/lessons"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <BookOpen size={18} />
              Lessons
            </Link>

            <Link
              href="/admin/quizzes"
              className="flex items-center gap-3 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold shadow-lg shadow-purple-600/10"
            >
              <ClipboardCheck size={18} />
              Quizzes
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl border border-purple-500/10 bg-purple-600/5 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Question Manager
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Create and manage quiz questions.
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="border-b border-white/5 bg-[#0b0b0f]/80 px-6 py-5 backdrop-blur-xl md:px-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/quizzes"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    <ArrowLeft size={18} />
                  </Link>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
                      Quiz Management
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {quiz?.title ?? "Quiz Questions"}
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm text-zinc-600">
                  Create, edit and manage questions for
                  this quiz.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold shadow-lg shadow-purple-600/10 transition hover:bg-purple-700"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>
          </header>

          <div className="p-6 md:p-10">
            {/* ERROR */}
            {error && !modalOpen && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={<HelpCircle size={20} />}
                label="Questions"
                value={questions.length}
                tone="purple"
              />

              <StatCard
                icon={<CheckCircle2 size={20} />}
                label="Answered"
                value={questions.filter(
                  (item) =>
                    Boolean(item.correct_answer)
                ).length}
                tone="green"
              />

              <StatCard
                icon={<ClipboardCheck size={20} />}
                label="Showing"
                value={filteredQuestions.length}
                tone="blue"
              />
            </div>

            {/* SEARCH */}
            <div className="mt-8 rounded-3xl border border-white/5 bg-[#101014] p-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search questions..."
                  className="w-full rounded-xl border border-white/5 bg-[#08080b] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* QUESTIONS */}
            <section className="mt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  Question Bank
                </p>

                <h3 className="mt-1 text-xl font-black">
                  All Questions
                </h3>

                <p className="mt-1 text-sm text-zinc-600">
                  Showing {filteredQuestions.length} of{" "}
                  {questions.length} questions
                </p>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-white/5 bg-[#101014] p-14 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-purple-500" />

                  <p className="mt-4 text-sm text-zinc-600">
                    Loading questions...
                  </p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="rounded-3xl border border-white/5 bg-[#101014] p-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400">
                    <HelpCircle size={30} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    No questions found
                  </h3>

                  <p className="mt-2 text-sm text-zinc-600">
                    Add your first question to this
                    quiz.
                  </p>

                  <button
                    type="button"
                    onClick={openAddModal}
                    className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold transition hover:bg-purple-700"
                  >
                    Add Question
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredQuestions.map(
                    (item, index) => (
                      <article
                        key={item.id}
                        className="rounded-3xl border border-white/5 bg-[#101014] p-6 transition hover:border-purple-500/20"
                      >
                        <div className="flex flex-col gap-5">
                          {/* QUESTION HEADER */}
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600/10 text-sm font-black text-purple-400">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-purple-600/10 px-2.5 py-1 text-xs font-bold text-purple-400">
                                  Question{" "}
                                  {item.question_order ??
                                    index + 1}
                                </span>

                                <span className="rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400">
                                  Correct:{" "}
                                  {item.correct_answer}
                                </span>

                                <span className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                                  {item.points ?? 1}{" "}
                                  point
                                  {(item.points ?? 1) !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-black leading-7 text-white">
                                {item.question}
                              </h3>
                            </div>
                          </div>

                          {/* OPTIONS */}
                          <div className="grid gap-3 md:grid-cols-2">
                            <Option
                              letter="A"
                              text={item.option_a}
                              correct={
                                item.correct_answer ===
                                "A"
                              }
                            />

                            <Option
                              letter="B"
                              text={item.option_b}
                              correct={
                                item.correct_answer ===
                                "B"
                              }
                            />

                            <Option
                              letter="C"
                              text={item.option_c}
                              correct={
                                item.correct_answer ===
                                "C"
                              }
                            />

                            <Option
                              letter="D"
                              text={item.option_d}
                              correct={
                                item.correct_answer ===
                                "D"
                              }
                            />
                          </div>

                          {/* ACTIONS */}
                          <div className="flex flex-wrap gap-3 border-t border-white/5 pt-5">
                            <button
                              type="button"
                              onClick={() =>
                                editQuestion(item)
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteQuestion(
                                  item.id
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#101014] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  Question Manager
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {editingId
                    ? "Edit Question"
                    : "Create Question"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6">
              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* QUESTION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Question
                  </label>

                  <textarea
                    value={question}
                    onChange={(e) =>
                      setQuestion(e.target.value)
                    }
                    rows={4}
                    placeholder="Write the question here..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#08080b] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500"
                  />
                </div>

                {/* OPTIONS */}
                <div className="grid gap-4 md:grid-cols-2">
                  <OptionField
                    letter="A"
                    value={optionA}
                    onChange={setOptionA}
                    placeholder="Option A"
                  />

                  <OptionField
                    letter="B"
                    value={optionB}
                    onChange={setOptionB}
                    placeholder="Option B"
                  />

                  <OptionField
                    letter="C"
                    value={optionC}
                    onChange={setOptionC}
                    placeholder="Option C"
                  />

                  <OptionField
                    letter="D"
                    value={optionD}
                    onChange={setOptionD}
                    placeholder="Option D"
                  />
                </div>

                {/* SETTINGS */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Correct Answer
                    </label>

                    <select
                      value={correctAnswer}
                      onChange={(e) =>
                        setCorrectAnswer(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#08080b] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                    >
                      <option value="A">
                        A
                      </option>

                      <option value="B">
                        B
                      </option>

                      <option value="C">
                        C
                      </option>

                      <option value="D">
                        D
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-400">
                      Points
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={points}
                      onChange={(e) =>
                        setPoints(e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#08080b] px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl bg-zinc-800 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveQuestion}
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-black shadow-lg shadow-purple-600/10 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   OPTION
========================================================= */

function Option({
  letter,
  text,
  correct,
}: {
  letter: string;
  text: string;
  correct: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        correct
          ? "border-green-500/20 bg-green-500/5"
          : "border-white/5 bg-[#0b0b0f]"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          correct
            ? "bg-green-500/10 text-green-400"
            : "bg-zinc-800 text-zinc-500"
        }`}
      >
        {letter}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-6 ${
            correct
              ? "font-semibold text-green-300"
              : "text-zinc-400"
          }`}
        >
          {text}
        </p>
      </div>

      {correct && (
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-green-400"
        />
      )}
    </div>
  );
}

/* =========================================================
   OPTION FIELD
========================================================= */

function OptionField({
  letter,
  value,
  onChange,
  placeholder,
}: {
  letter: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-400">
        Option {letter}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-purple-600/10 text-xs font-black text-purple-400">
          {letter}
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-[#08080b] py-3 pl-14 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500"
        />
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "purple" | "blue" | "green";
}) {
  const styles = {
    purple: "bg-purple-600/10 text-purple-400",
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#101014] p-5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black md:text-3xl">
        {value}
      </p>
    </div>
  );
}