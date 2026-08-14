import {
    ArrowLeft,
    BookOpen,
    Clock3,
    Target,
    Trophy,
    Zap,
} from "lucide-react";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import QuizForm from "@/components/quiz/quiz-form";

/* =====================================================
   TYPES
===================================================== */

type QuizQuestion = {
    id: string;
    quiz_id: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    question_order: number;
};

/* =====================================================
   PAGE
===================================================== */

export default async function QuizPage({
    params,
}: {
    params: Promise<{
        id: string;
        quizId: string;
    }>;
}) {
    const { id, quizId } = await params;

    const supabase = await createClient();

    /* =====================================================
       AUTH
    ===================================================== */

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        console.error("QUIZ AUTH ERROR:", authError);
    }

    if (!user) {
        redirect(
            `/login?redirect=${encodeURIComponent(
                `/subjects/${id}/quizzes/${quizId}`
            )}`
        );
    }

    /* =====================================================
       SUBJECT
    ===================================================== */

    const {
        data: subject,
        error: subjectError,
    } = await supabase
        .from("subjects")
        .select(`
      id,
      name,
      code,
      description
    `)
        .eq("id", id)
        .maybeSingle();

    if (subjectError) {
        console.error(
            "QUIZ SUBJECT ERROR:",
            subjectError
        );
    }

    if (!subject) {
        notFound();
    }

    /* =====================================================
       QUIZ
    ===================================================== */

    const {
        data: quiz,
        error: quizError,
    } = await supabase
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
        .eq("id", quizId)
        .eq("subject_id", id)
        .maybeSingle();

    if (quizError) {
        console.error(
            "QUIZ LOAD ERROR:",
            quizError
        );
    }

    if (!quiz) {
        notFound();
    }

    /* =====================================================
       QUESTIONS
       
       NEW SYSTEM:
       quiz_questions
    ===================================================== */

    const {
        data: rawQuestions,
        error: questionsError,
    } = await supabase
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
        .eq("quiz_id", quiz.id)
        .order("question_order", {
            ascending: true,
        });

    if (questionsError) {
        console.error(
            "QUIZ QUESTIONS ERROR:",
            questionsError
        );
    }

    const questions: QuizQuestion[] = (
        rawQuestions ?? []
    ).map((question) => ({
        id: question.id,
        quiz_id: question.quiz_id,
        question: question.question ?? "",
        option_a: question.option_a ?? "",
        option_b: question.option_b ?? "",
        option_c: question.option_c ?? "",
        option_d: question.option_d ?? "",
        correct_answer:
            question.correct_answer ?? "",
        question_order:
            question.question_order ?? 0,
    }));

    /* =====================================================
       LESSON
       
       Optional because quizzes can exist without lesson_id.
    ===================================================== */

    let lesson: {
        id: string;
        title: string | null;
    } | null = null;

    if (quiz.lesson_id) {
        const {
            data: lessonData,
            error: lessonError,
        } = await supabase
            .from("lessons")
            .select(`
        id,
        title
      `)
            .eq("id", quiz.lesson_id)
            .maybeSingle();

        if (lessonError) {
            console.warn(
                "QUIZ LESSON LOAD WARNING:",
                lessonError
            );
        }

        lesson = lessonData ?? null;
    }

    /* =====================================================
       PREVIOUS RESULT
    ===================================================== */

    const {
        data: previousResult,
        error: previousResultError,
    } = await supabase
        .from("quiz_results")
        .select(`
      id,
      score,
      total_questions,
      completed_at
    `)
        .eq("user_id", user.id)
        .eq("quiz_id", quiz.id)
        .order("completed_at", {
            ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (previousResultError) {
        console.warn(
            "PREVIOUS QUIZ RESULT WARNING:",
            previousResultError
        );
    }

    /* =====================================================
       QUESTION COUNT
    ===================================================== */

    const questionCount =
        questions.length;

    const totalQuestions =
        Number(
            quiz.total_questions ?? 0
        ) || questionCount;

    const previousPercentage =
        previousResult &&
            Number(
                previousResult.total_questions ?? 0
            ) > 0
            ? Math.round(
                (Number(
                    previousResult.score ?? 0
                ) /
                    Number(
                        previousResult.total_questions
                    )) *
                100
            )
            : null;

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main className="min-h-screen overflow-hidden bg-[#030305] text-white">
            {/* =================================================
          BACKGROUND
      ================================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]" />

                <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

                <div className="absolute bottom-[-180px] left-[30%] h-[400px] w-[400px] rounded-full bg-violet-700/[0.07] blur-[140px]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_78%)]" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-5 py-7 md:px-8 md:py-10">
                {/* =================================================
            TOP NAVIGATION
        ================================================= */}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={`/subjects/${id}`}
                        className="group inline-flex items-center gap-2 text-xs font-bold text-zinc-600 transition hover:text-purple-400"
                    >
                        <ArrowLeft
                            size={14}
                            className="transition group-hover:-translate-x-1"
                        />

                        Back to{" "}
                        {subject.name}
                    </Link>

                    <div className="flex items-center gap-2">
                        {lesson && (
                            <Link
                                href={`/subjects/${id}/lessons/${lesson.id}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
                            >
                                <BookOpen size={12} />

                                Lesson
                            </Link>
                        )}

                        <Link
                            href="/ai"
                            className="inline-flex items-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/[0.06] px-3 py-2 text-[9px] font-bold text-purple-400 transition hover:bg-purple-500/[0.12]"
                        >
                            Ask Miro
                        </Link>
                    </div>
                </div>

                {/* =================================================
            HERO
        ================================================= */}

                <section className="relative mt-7 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-[#12091b] via-[#08070d] to-[#050507] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.4)] md:p-10">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-600/15 blur-[110px]" />

                    <div className="pointer-events-none absolute bottom-[-130px] left-[30%] h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[110px]" />

                    <div className="relative">
                        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-start">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    {subject.code && (
                                        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[8px] font-black text-purple-300">
                                            {subject.code}
                                        </span>
                                    )}

                                    <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[8px] font-bold text-zinc-500">
                                        <Target size={10} />

                                        Knowledge Check
                                    </span>

                                    {lesson && (
                                        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[8px] font-bold text-zinc-500">
                                            {lesson.title ??
                                                "Lesson Quiz"}
                                        </span>
                                    )}
                                </div>

                                <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                                    {quiz.title}
                                </h1>

                                {quiz.description && (
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                                        {quiz.description}
                                    </p>
                                )}
                            </div>

                            {/* XP CARD */}

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

                        {/* =================================================
                INFO
            ================================================= */}

                        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                            <QuizMeta
                                icon={
                                    <BookOpen size={15} />
                                }
                                label="Questions"
                                value={String(
                                    questionCount
                                )}
                            />

                            <QuizMeta
                                icon={
                                    <Clock3 size={15} />
                                }
                                label="Mode"
                                value="Practice"
                            />

                            <QuizMeta
                                icon={
                                    <Zap size={15} />
                                }
                                label="Reward"
                                value="+50 XP"
                            />

                            <QuizMeta
                                icon={
                                    <Trophy size={15} />
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
            QUESTIONS
        ================================================= */}

                <section className="mt-7">
                    {questions.length > 0 ? (
                        <QuizForm
                            quizId={quiz.id}
                            questions={questions}
                            userId={user.id}
                            subjectId={quiz.subject_id}
                            lessonId={quiz.lesson_id}
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

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                                This quiz exists, but no
                                questions have been added
                                yet.
                            </p>

                            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link
                                    href={`/subjects/${id}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3 text-xs font-bold text-zinc-400 transition hover:text-white"
                                >
                                    <ArrowLeft size={14} />

                                    Back to Subject
                                </Link>

                                <Link
                                    href="/ai"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
                                >
                                    Ask Miro for Help
                                </Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* =================================================
            FOOTER
        ================================================= */}

                <footer className="py-12 text-center">
                    <div className="mx-auto mb-4 h-px w-20 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                    <p className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-800">
                        RailLearn • Railway Academy
                    </p>
                </footer>
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
        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 backdrop-blur-xl">
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