"use client";

import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    BrainCircuit,
    Check,
    CheckCircle2,
    Clock3,
    Flame,
    Map as MapIcon,
    Play,
    Sparkles,
    Star,
    Target,
    TrainFront,
    TrendingUp,
    Trophy,
    Zap,
} from "lucide-react";

import {
    Suspense,
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

/* ============================================================
   TYPES
============================================================ */

type Subject = {
    id: string;
    name: string;
    code: string | null;
};

type Lesson = {
    id: string;
    subject_id: string;
    title: string;
    description: string | null;
    order_number: number | null;
    lesson_order: number | null;
    created_at: string;
    duration_minutes: number | null;
    estimated_minutes?: number | null;
    is_published: boolean | null;
};

type LessonProgress = {
    lesson_id: string;
    completed: boolean;
};

type StudentStats = {
    user_id: string;
    xp: number | null;
    level: number | null;
    current_streak: number | null;
    best_streak: number | null;
    last_activity_date: string | null;
};

type Quiz = {
    id: string;
    subject_id: string | null;
    lesson_id: string | null;
    title: string | null;
    total_questions: number | null;
};

type QuizResult = {
    quiz_id: string;
    score: number;
    total_questions: number;
    completed_at?: string | null;
};

type JourneyStatus =
    | "completed"
    | "current"
    | "available";

type JourneyChapter = {
    id: string;
    number: string;
    title: string;
    description: string;
    progress: number;
    lessons: number;
    duration: number;
    status: JourneyStatus;

    /*
     * Actual lesson route:
     * /subjects/[id]/lesson/[lessonId]
     */
    href: string;

    quizId: string | null;
    quizTitle: string | null;
    quizHref: string | null;

    quizCompleted: boolean;
    quizScore: number | null;
    quizPercentage: number | null;
};

/* ============================================================
   CONTENT
============================================================ */

function JourneyContent() {
    const router =
        useRouter();

    const searchParams =
        useSearchParams();

    const supabase =
        useMemo(
            () => createClient(),
            []
        );

    const subjectParam =
        searchParams.get(
            "subject"
        );

    /* ==========================================================
       STATE
    ========================================================== */

    const [subject, setSubject] =
        useState<Subject | null>(
            null
        );

    const [lessons, setLessons] =
        useState<Lesson[]>(
            []
        );

    const [lessonProgress, setLessonProgress] =
        useState<
            LessonProgress[]
        >([]);

    const [studentStats, setStudentStats] =
        useState<StudentStats | null>(
            null
        );

    const [quizzes, setQuizzes] =
        useState<Quiz[]>(
            []
        );

    const [quizResults, setQuizResults] =
        useState<QuizResult[]>(
            []
        );

    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(
            null
        );

    /* ==========================================================
       LOAD JOURNEY
    ========================================================== */

    useEffect(() => {
        let mounted = true;

        async function loadJourney() {
            try {
                setLoading(true);
                setErrorMessage(null);

                /* ======================================================
                   USER
                ====================================================== */

                const {
                    data: {
                        user,
                    },
                    error: authError,
                } =
                    await supabase.auth.getUser();

                if (authError) {
                    console.error(
                        "JOURNEY AUTH ERROR:",
                        authError
                    );
                }

                if (!user) {
                    router.replace(
                        "/login"
                    );

                    return;
                }

                /* ======================================================
                   SUBJECT
                ====================================================== */

                let subjectData:
                    | Subject
                    | null =
                    null;

                if (subjectParam) {
                    const {
                        data: byCode,
                        error:
                        byCodeError,
                    } =
                        await supabase
                            .from(
                                "subjects"
                            )
                            .select(
                                "id, name, code"
                            )
                            .eq(
                                "code",
                                subjectParam
                            )
                            .maybeSingle();

                    if (
                        byCodeError
                    ) {
                        console.error(
                            "SUBJECT CODE ERROR:",
                            byCodeError
                        );
                    }

                    if (byCode) {
                        subjectData =
                            byCode as Subject;
                    }

                    if (
                        !subjectData
                    ) {
                        const {
                            data: byId,
                            error:
                            byIdError,
                        } =
                            await supabase
                                .from(
                                    "subjects"
                                )
                                .select(
                                    "id, name, code"
                                )
                                .eq(
                                    "id",
                                    subjectParam
                                )
                                .maybeSingle();

                        if (
                            byIdError
                        ) {
                            console.error(
                                "SUBJECT ID ERROR:",
                                byIdError
                            );
                        }

                        if (byId) {
                            subjectData =
                                byId as Subject;
                        }
                    }
                } else {
                    const {
                        data: firstSubject,
                        error:
                        firstSubjectError,
                    } =
                        await supabase
                            .from(
                                "subjects"
                            )
                            .select(
                                "id, name, code"
                            )
                            .order(
                                "name",
                                {
                                    ascending:
                                        true,
                                }
                            )
                            .limit(
                                1
                            )
                            .maybeSingle();

                    if (
                        firstSubjectError
                    ) {
                        console.error(
                            "FIRST SUBJECT ERROR:",
                            firstSubjectError
                        );
                    }

                    if (
                        firstSubject
                    ) {
                        subjectData =
                            firstSubject as Subject;
                    }
                }

                if (!subjectData) {
                    if (mounted) {
                        setSubject(
                            null
                        );

                        setLessons(
                            []
                        );

                        setLessonProgress(
                            []
                        );

                        setStudentStats(
                            null
                        );

                        setQuizzes(
                            []
                        );

                        setQuizResults(
                            []
                        );

                        setErrorMessage(
                            subjectParam
                                ? `Subject "${subjectParam}" was not found in Supabase.`
                                : "No subjects were found in Supabase."
                        );
                    }

                    return;
                }

                if (!mounted) {
                    return;
                }

                setSubject(
                    subjectData
                );

                /* ======================================================
                   NORMALIZE SUBJECT URL
                ====================================================== */

                const subjectIdentifier =
                    subjectData.code ??
                    subjectData.id;

                const expectedJourneyUrl =
                    `/journey?subject=${encodeURIComponent(
                        subjectIdentifier
                    )}`;

                if (
                    subjectParam !==
                    subjectIdentifier
                ) {
                    router.replace(
                        expectedJourneyUrl
                    );
                }

                /* ======================================================
                   LOAD LESSONS
                ====================================================== */

                const {
                    data: lessonData,
                    error:
                    lessonError,
                } =
                    await supabase
                        .from(
                            "lessons"
                        )
                        .select(
                            `
                                id,
                                subject_id,
                                title,
                                description,
                                order_number,
                                lesson_order,
                                created_at,
                                duration_minutes,
                                estimated_minutes,
                                is_published
                            `
                        )
                        .eq(
                            "subject_id",
                            subjectData.id
                        )
                        .eq(
                            "is_published",
                            true
                        )
                        .order(
                            "lesson_order",
                            {
                                ascending:
                                    true,
                                nullsFirst:
                                    false,
                            }
                        )
                        .order(
                            "order_number",
                            {
                                ascending:
                                    true,
                                nullsFirst:
                                    false,
                            }
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    true,
                            }
                        );

                if (
                    lessonError
                ) {
                    console.error(
                        "JOURNEY LESSON ERROR:",
                        lessonError
                    );

                    if (mounted) {
                        setLessons(
                            []
                        );
                    }
                } else if (
                    mounted
                ) {
                    setLessons(
                        (lessonData ??
                            []) as Lesson[]
                    );
                }

                /* ======================================================
                   PRIMARY PROGRESS
                ====================================================== */

                const {
                    data: lessonProgressData,
                    error:
                    lessonProgressError,
                } =
                    await supabase
                        .from(
                            "lesson_progress"
                        )
                        .select(
                            "lesson_id, completed"
                        )
                        .eq(
                            "user_id",
                            user.id
                        );

                if (
                    lessonProgressError
                ) {
                    console.error(
                        "LESSON_PROGRESS ERROR:",
                        lessonProgressError
                    );
                }

                const primaryProgress =
                    (lessonProgressData ??
                        []) as LessonProgress[];

                /* ======================================================
                   LEGACY PROGRESS
                ====================================================== */

                const {
                    data: legacyProgressData,
                    error:
                    legacyProgressError,
                } =
                    await supabase
                        .from(
                            "progress"
                        )
                        .select(
                            "lesson_id, completed"
                        )
                        .eq(
                            "user_id",
                            user.id
                        );

                if (
                    legacyProgressError
                ) {
                    console.error(
                        "LEGACY PROGRESS ERROR:",
                        legacyProgressError
                    );
                }

                const legacyProgress =
                    (legacyProgressData ??
                        []) as LessonProgress[];

                /* ======================================================
                   MERGE PROGRESS
                ====================================================== */

                const mergedProgress:
                    Record<
                        string,
                        boolean
                    > = {};

                for (
                    const item of
                    legacyProgress
                ) {
                    if (
                        item.lesson_id
                    ) {
                        mergedProgress[
                            String(
                                item.lesson_id
                            )
                        ] =
                            item.completed ===
                            true;
                    }
                }

                for (
                    const item of
                    primaryProgress
                ) {
                    if (
                        item.lesson_id
                    ) {
                        const key =
                            String(
                                item.lesson_id
                            );

                        if (
                            item.completed ===
                            true
                        ) {
                            mergedProgress[
                                key
                            ] =
                                true;
                        } else if (
                            !(
                                key in
                                mergedProgress
                            )
                        ) {
                            mergedProgress[
                                key
                            ] =
                                false;
                        }
                    }
                }

                const normalizedProgress =
                    Object.entries(
                        mergedProgress
                    ).map(
                        ([
                            lesson_id,
                            completed,
                        ]) => ({
                            lesson_id,
                            completed,
                        })
                    );

                if (mounted) {
                    setLessonProgress(
                        normalizedProgress
                    );
                }

                /* ======================================================
                   STUDENT STATS
                ====================================================== */

                const {
                    data: statsData,
                    error:
                    statsError,
                } =
                    await supabase
                        .from(
                            "student_stats"
                        )
                        .select(
                            `
                                user_id,
                                xp,
                                level,
                                current_streak,
                                best_streak,
                                last_activity_date
                            `
                        )
                        .eq(
                            "user_id",
                            user.id
                        )
                        .maybeSingle();

                if (
                    statsError
                ) {
                    console.error(
                        "STUDENT STATS ERROR:",
                        statsError
                    );
                }

                if (mounted) {
                    setStudentStats(
                        (statsData ??
                            null) as StudentStats | null
                    );
                }

                /* ======================================================
                   QUIZZES
                ====================================================== */

                const {
                    data: quizData,
                    error:
                    quizError,
                } =
                    await supabase
                        .from(
                            "quizzes"
                        )
                        .select(
                            `
                                id,
                                subject_id,
                                lesson_id,
                                title,
                                total_questions
                            `
                        )
                        .eq(
                            "subject_id",
                            subjectData.id
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    true,
                            }
                        );

                if (
                    quizError
                ) {
                    console.error(
                        "JOURNEY QUIZ LOAD ERROR:",
                        quizError
                    );
                }

                if (mounted) {
                    setQuizzes(
                        (quizData ??
                            []) as Quiz[]
                    );
                }

                /* ======================================================
                   QUIZ RESULTS
                ====================================================== */

                const {
                    data: quizResultsData,
                    error:
                    quizResultsError,
                } =
                    await supabase
                        .from(
                            "quiz_results"
                        )
                        .select(
                            `
                                quiz_id,
                                score,
                                total_questions,
                                completed_at
                            `
                        )
                        .eq(
                            "user_id",
                            user.id
                        )
                        .order(
                            "completed_at",
                            {
                                ascending:
                                    false,
                            }
                        );

                if (
                    quizResultsError
                ) {
                    console.error(
                        "JOURNEY QUIZ RESULT ERROR:",
                        quizResultsError
                    );
                }

                if (mounted) {
                    setQuizResults(
                        (quizResultsData ??
                            []) as QuizResult[]
                    );
                }
            } catch (
            error
            ) {
                console.error(
                    "JOURNEY LOAD ERROR:",
                    error
                );

                if (mounted) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Something went wrong while loading your journey."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(
                        false
                    );
                }
            }
        }

        void loadJourney();

        return () => {
            mounted = false;
        };
    }, [
        router,
        supabase,
        subjectParam,
    ]);

    /* ============================================================
       COMPLETED LESSON LOOKUP
    ============================================================ */

    const completedLookup =
        useMemo(() => {
            const lookup: Record<
                string,
                boolean
            > = {};

            for (
                const item of
                lessonProgress
            ) {
                if (
                    item.completed &&
                    item.lesson_id
                ) {
                    lookup[
                        String(
                            item.lesson_id
                        )
                    ] = true;
                }
            }

            return lookup;
        }, [
            lessonProgress,
        ]);

    /* ============================================================
       LATEST QUIZ RESULTS
    ============================================================ */

    const latestQuizResults =
        useMemo(() => {
            const lookup: Record<
                string,
                QuizResult
            > = {};

            for (
                const result of
                quizResults
            ) {
                const key =
                    String(
                        result.quiz_id
                    );

                if (
                    !lookup[key]
                ) {
                    lookup[key] =
                        result;
                }
            }

            return lookup;
        }, [
            quizResults,
        ]);

    /* ============================================================
       QUIZ BY LESSON
    ============================================================ */

    const quizByLesson =
        useMemo(() => {
            const lookup: Record<
                string,
                Quiz
            > = {};

            for (
                const quiz of
                quizzes
            ) {
                if (
                    !quiz.lesson_id
                ) {
                    continue;
                }

                const key =
                    String(
                        quiz.lesson_id
                    );

                if (
                    !lookup[key]
                ) {
                    lookup[key] =
                        quiz;
                }
            }

            return lookup;
        }, [
            quizzes,
        ]);

    /* ============================================================
       BUILD JOURNEY
    ============================================================ */

    const journey =
        useMemo<JourneyChapter[]>(
            () => {
                if (
                    !lessons.length ||
                    !subject
                ) {
                    return [];
                }

                let currentAssigned =
                    false;

                return lessons.map(
                    (
                        lesson,
                        index
                    ) => {
                        const lessonId =
                            String(
                                lesson.id
                            );

                        const completed =
                            Boolean(
                                completedLookup[
                                lessonId
                                ]
                            );

                        let status:
                            JourneyStatus;

                        if (
                            completed
                        ) {
                            status =
                                "completed";
                        } else if (
                            !currentAssigned
                        ) {
                            status =
                                "current";

                            currentAssigned =
                                true;
                        } else {
                            status =
                                "available";
                        }

                        const quiz =
                            quizByLesson[
                            lessonId
                            ] ??
                            null;

                        const quizResult =
                            quiz
                                ? latestQuizResults[
                                String(
                                    quiz.id
                                )
                                ] ??
                                null
                                : null;

                        const quizPercentage =
                            quizResult &&
                                Number(
                                    quizResult.total_questions
                                ) >
                                0
                                ? Math.round(
                                    (
                                        Number(
                                            quizResult.score
                                        ) /
                                        Number(
                                            quizResult.total_questions
                                        )
                                    ) *
                                    100
                                )
                                : null;

                        /*
                         * Actual lesson route:
                         * /subjects/[id]/lesson/[lessonId]
                         */

                        const lessonHref =
                            `/subjects/${encodeURIComponent(
                                subject.id
                            )}/lesson/${encodeURIComponent(
                                lesson.id
                            )}`;

                        /*
                         * Quiz route:
                         * /subjects/[id]/quizzes/[quizId]
                         */

                        const quizHref =
                            quiz
                                ? `/subjects/${encodeURIComponent(
                                    subject.id
                                )}/quizzes/${encodeURIComponent(
                                    quiz.id
                                )}`
                                : null;

                        return {
                            id:
                                lessonId,

                            number:
                                String(
                                    index +
                                    1
                                ).padStart(
                                    2,
                                    "0"
                                ),

                            title:
                                lesson.title ||
                                `${subject.name} Lesson ${index +
                                1
                                }`,

                            description:
                                lesson.description ||
                                `Continue your ${subject.name} journey and build your technical knowledge step by step.`,

                            progress:
                                completed
                                    ? 100
                                    : status ===
                                        "current"
                                        ? 35
                                        : 0,

                            lessons:
                                1,

                            status,

                            href:
                                lessonHref,

                            duration:
                                Number(
                                    lesson.duration_minutes ??
                                    lesson.estimated_minutes ??
                                    0
                                ),

                            quizId:
                                quiz
                                    ? String(
                                        quiz.id
                                    )
                                    : null,

                            quizTitle:
                                quiz?.title ??
                                null,

                            quizHref,

                            quizCompleted:
                                Boolean(
                                    quizResult
                                ),

                            quizScore:
                                quizResult
                                    ? Number(
                                        quizResult.score
                                    )
                                    : null,

                            quizPercentage,
                        };
                    }
                );
            },
            [
                lessons,
                completedLookup,
                subject,
                quizByLesson,
                latestQuizResults,
            ]
        );

    /* ============================================================
       STATS
    ============================================================ */

    const totalLessons =
        journey.length;

    const completedCount =
        journey.filter(
            chapter =>
                chapter.status ===
                "completed"
        ).length;

    const currentChapter =
        journey.find(
            chapter =>
                chapter.status ===
                "current"
        );

    const availableLessons =
        journey.filter(
            chapter =>
                chapter.status ===
                "available"
        ).length;

    const completedPercentage =
        totalLessons > 0
            ? Math.round(
                (
                    completedCount /
                    totalLessons
                ) *
                100
            )
            : 0;

    const totalMinutes =
        journey.reduce(
            (
                sum,
                chapter
            ) =>
                sum +
                chapter.duration,
            0
        );

    const xp =
        Number(
            studentStats?.xp ??
            0
        );

    const level =
        Number(
            studentStats?.level ??
            1
        );

    const currentStreak =
        Number(
            studentStats?.current_streak ??
            0
        );

    const completedQuizLookup =
        useMemo(() => {
            const lookup: Record<
                string,
                boolean
            > = {};

            for (
                const result of
                quizResults
            ) {
                lookup[
                    String(
                        result.quiz_id
                    )
                ] = true;
            }

            return lookup;
        }, [
            quizResults,
        ]);

    const completedQuizzes =
        Object.keys(
            completedQuizLookup
        ).length;

    const perfectQuizzes =
        quizResults.filter(
            item =>
                Number(
                    item.total_questions
                ) >
                0 &&
                Number(
                    item.score
                ) ===
                Number(
                    item.total_questions
                )
        ).length;

    const totalSubjectQuizzes =
        quizzes.length;

    const completedJourneyQuizzes =
        journey.filter(
            chapter =>
                chapter.quizCompleted
        ).length;

    const quizAverage =
        quizResults.length >
            0
            ? Math.round(
                quizResults.reduce(
                    (
                        sum,
                        result
                    ) => {
                        const total =
                            Number(
                                result.total_questions
                            ) ||
                            0;

                        const score =
                            Number(
                                result.score
                            ) ||
                            0;

                        return (
                            sum +
                            (
                                total >
                                    0
                                    ? (
                                        score /
                                        total
                                    ) *
                                    100
                                    : 0
                            )
                        );
                    },
                    0
                ) /
                quizResults.length
            )
            : 0;

    /* ============================================================
       NAVIGATION
    ============================================================ */

    function goTo(
        path: string
    ) {
        router.push(
            path
        );
    }

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <PremiumLoading />
        );
    }

    /* ============================================================
       SUBJECT ERROR
    ============================================================ */

    if (!subject) {
        return (
            <main className="min-h-screen bg-[#020203] text-white">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute left-[-200px] top-[-150px] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]"></div>

                    <div className="absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-fuchsia-700/10 blur-[150px]"></div>
                </div>

                <div className="relative mx-auto flex min-h-screen max-w-xl items-center justify-center px-5">
                    <div className="w-full rounded-[32px] border border-white/[0.08] bg-[#07070b]/90 p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-red-500/20 bg-red-500/10 text-red-400">
                            <Target
                                size={
                                    30
                                }
                            />
                        </div>

                        <p className="mt-7 text-[8px] font-black uppercase tracking-[0.3em] text-red-400">
                            Journey Error
                        </p>

                        <h1 className="mt-3 text-2xl font-black">
                            Subject not found
                        </h1>

                        <p className="mt-3 text-sm leading-7 text-zinc-600">
                            {errorMessage ??
                                "The selected subject could not be found in Supabase."}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                goTo(
                                    "/subjects"
                                )
                            }
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-[9px] font-black shadow-[0_15px_40px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
                        >
                            <ArrowLeft
                                size={
                                    14
                                }
                            />

                            Back to Subjects
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    /* ============================================================
       MAIN
    ============================================================ */

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#020203] text-white">
            {/* BACKGROUND */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[-220px] top-[-180px] h-[650px] w-[650px] rounded-full bg-purple-700/[0.10] blur-[180px]"></div>

                <div className="absolute right-[-250px] top-[20%] h-[650px] w-[650px] rounded-full bg-violet-600/[0.09] blur-[180px]"></div>

                <div className="absolute bottom-[-250px] left-[25%] h-[600px] w-[600px] rounded-full bg-fuchsia-700/[0.07] blur-[180px]"></div>

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                        backgroundSize:
                            "60px 60px",
                    }}
                ></div>
            </div>

            <div className="relative mx-auto max-w-[1450px] px-5 py-6 md:px-8 lg:py-9 xl:px-10">
                {/* TOP BAR */}

                <header className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() =>
                            goTo(
                                "/subjects"
                            )
                        }
                        className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500 backdrop-blur-md transition hover:border-purple-500/20 hover:bg-purple-500/[0.04] hover:text-purple-300"
                    >
                        <ArrowLeft
                            size={
                                14
                            }
                            className="transition group-hover:-translate-x-1"
                        />

                        Subjects
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                goTo(
                                    `/ai?subjectId=${encodeURIComponent(
                                        subject.id
                                    )}&subjectName=${encodeURIComponent(
                                        subject.name
                                    )}`
                                )
                            }
                            title="Ask Miro about this subject"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.12)] transition hover:bg-purple-500/[0.16]"
                        >
                            <BrainCircuit
                                size={
                                    17
                                }
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                goTo(
                                    "/dashboard"
                                )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-gradient-to-br from-purple-500/20 to-violet-700/10 text-purple-400"
                        >
                            <TrainFront
                                size={
                                    18
                                }
                            />
                        </button>

                        <div className="hidden sm:block">
                            <p className="text-sm font-black">
                                RailLearn
                            </p>

                            <p className="text-[7px] font-black uppercase tracking-[0.28em] text-zinc-700">
                                Railway Academy
                            </p>
                        </div>
                    </div>
                </header>

                {/* HERO */}

                <section className="mt-10">
                    <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="h-px w-9 bg-gradient-to-r from-purple-500 to-transparent"></div>

                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                                    Learning Path
                                </p>
                            </div>

                            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] md:text-6xl">
                                My
                                <span className="ml-3 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">
                                    Journey
                                </span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                                Follow your personalized path through{" "}
                                <span className="font-bold text-zinc-300">
                                    {
                                        subject.name
                                    }
                                </span>
                                . Every lesson takes you one step closer to mastering this subject.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <JourneyStat
                                icon={
                                    <Trophy
                                        size={
                                            14
                                        }
                                    />
                                }
                                value={String(
                                    completedCount
                                )}
                                label="Completed"
                            />

                            <JourneyStat
                                icon={
                                    <MapIcon
                                        size={
                                            14
                                        }
                                    />
                                }
                                value={String(
                                    totalLessons
                                )}
                                label="Lessons"
                            />

                            <JourneyStat
                                icon={
                                    <Zap
                                        size={
                                            14
                                        }
                                    />
                                }
                                value={String(
                                    xp
                                )}
                                label="Total XP"
                            />
                        </div>
                    </div>
                </section>

                {/* PROFILE SNAPSHOT */}

                <section className="mt-7 grid gap-3 md:grid-cols-4">
                    <ProgressMini
                        icon={
                            <TrendingUp
                                size={
                                    14
                                }
                            />
                        }
                        value={`Level ${level}`}
                        label="Student Level"
                    />

                    <ProgressMini
                        icon={
                            <Flame
                                size={
                                    14
                                }
                            />
                        }
                        value={`${currentStreak} days`}
                        label="Current Streak"
                    />

                    <ProgressMini
                        icon={
                            <Trophy
                                size={
                                    14
                                }
                            />
                        }
                        value={String(
                            completedQuizzes
                        )}
                        label="Quizzes Done"
                    />

                    <ProgressMini
                        icon={
                            <Star
                                size={
                                    14
                                }
                            />
                        }
                        value={String(
                            perfectQuizzes
                        )}
                        label="Perfect Quizzes"
                    />
                </section>

                {/* PROGRESS HERO */}

                <section className="relative mt-7 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#07070b]/90 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-purple-600/20 blur-[100px]"></div>

                    <div className="pointer-events-none absolute -bottom-32 left-20 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-[100px]"></div>

                    <div className="relative p-6 md:p-9">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-5">
                                <div
                                    className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#a855f7_var(--progress),#171720_0)]"
                                    style={
                                        {
                                            "--progress": `${completedPercentage}%`,
                                        } as CSSProperties
                                    }
                                >
                                    <div className="absolute inset-[5px] rounded-full bg-[#07070b]"></div>

                                    <div className="relative text-center">
                                        <p className="text-xl font-black text-white">
                                            {
                                                completedPercentage
                                            }
                                            %
                                        </p>

                                        <p className="text-[6px] font-black uppercase tracking-wider text-zinc-600">
                                            Complete
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                                        Course Progress
                                    </p>

                                    <h2 className="mt-2 text-xl font-black md:text-2xl">
                                        {
                                            subject.name
                                        }
                                    </h2>

                                    <p className="mt-2 text-[10px] text-zinc-600">
                                        {
                                            completedCount
                                        }{" "}
                                        of{" "}
                                        {
                                            totalLessons
                                        }{" "}
                                        lessons completed
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <ProgressMini
                                    icon={
                                        <CheckCircle2
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={String(
                                        completedCount
                                    )}
                                    label="Finished"
                                />

                                <ProgressMini
                                    icon={
                                        <Play
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={
                                        currentChapter
                                            ? "1"
                                            : "0"
                                    }
                                    label="Current"
                                />

                                <ProgressMini
                                    icon={
                                        <BookOpen
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={String(
                                        availableLessons
                                    )}
                                    label="Available"
                                />

                                <ProgressMini
                                    icon={
                                        <Clock3
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={`${totalMinutes}m`}
                                    label="Content"
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider">
                                <span className="text-zinc-600">
                                    Your progress
                                </span>

                                <span className="text-purple-400">
                                    {
                                        completedPercentage
                                    }
                                    %
                                </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                                <motion.div
                                    initial={{
                                        width: 0,
                                    }}
                                    animate={{
                                        width: `${completedPercentage}%`,
                                    }}
                                    transition={{
                                        duration:
                                            1.2,
                                        ease:
                                            "easeOut",
                                    }}
                                    className="relative h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400 shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CURRENT LESSON */}

                {currentChapter ? (
                    <section className="relative mt-7 overflow-hidden rounded-[32px] border border-purple-500/20 bg-gradient-to-br from-[#170a24] via-[#0a080e] to-[#050507] shadow-[0_25px_90px_rgba(109,40,217,0.12)]">
                        <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-purple-500/20 blur-[90px]"></div>

                        <div className="relative flex flex-col gap-7 p-6 md:p-9 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400"></span>

                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-purple-300">
                                        Currently Learning
                                    </span>
                                </div>

                                <p className="mt-5 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                    Lesson{" "}
                                    {
                                        currentChapter.number
                                    }
                                </p>

                                <h2 className="mt-2 max-w-2xl text-2xl font-black md:text-3xl">
                                    {
                                        currentChapter.title
                                    }
                                </h2>

                                <p className="mt-3 max-w-2xl text-xs leading-6 text-zinc-500">
                                    {
                                        currentChapter.description
                                    }
                                </p>

                                {currentChapter.quizId ? (
                                    <div className="mt-6 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[7px] font-black text-purple-300">
                                            Quiz linked
                                        </span>

                                        {currentChapter.quizCompleted ? (
                                            <span className="rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1.5 text-[7px] font-black text-green-400">
                                                Quiz completed
                                                {currentChapter.quizPercentage !==
                                                    null
                                                    ? ` • ${currentChapter.quizPercentage}%`
                                                    : ""}
                                            </span>
                                        ) : (
                                            <span className="rounded-full border border-yellow-500/15 bg-yellow-500/10 px-3 py-1.5 text-[7px] font-black text-yellow-300">
                                                Quiz available
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex shrink-0 flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        goTo(
                                            currentChapter.href
                                        )
                                    }
                                    className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-7 py-4 text-[9px] font-black shadow-[0_15px_50px_rgba(124,58,237,0.3)] transition hover:-translate-y-1"
                                >
                                    Continue Lesson

                                    <ArrowRight
                                        size={
                                            15
                                        }
                                        className="transition group-hover:translate-x-1"
                                    />
                                </button>

                                {currentChapter.quizHref ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            goTo(
                                                currentChapter.quizHref!
                                            )
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-6 py-3 text-[8px] font-black text-purple-300 transition hover:bg-purple-500/15"
                                    >
                                        <Target
                                            size={
                                                13
                                            }
                                        />

                                        {currentChapter.quizCompleted
                                            ? "Retry Quiz"
                                            : "Take Quiz"}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* ROADMAP TITLE */}

                <section className="mt-12">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                                Your roadmap
                            </p>

                            <h2 className="mt-2 text-2xl font-black md:text-3xl">
                                {
                                    subject.name
                                }{" "}
                                Path
                            </h2>
                        </div>
                    </div>
                </section>

                {/* ROADMAP */}

                <section className="mt-7">
                    {journey.length ===
                        0 ? (
                        <EmptyJourney
                            subjectName={
                                subject.name
                            }
                        />
                    ) : (
                        <div className="relative">
                            <div className="absolute bottom-12 left-[27px] top-12 hidden w-px bg-gradient-to-b from-purple-500/40 via-white/[0.08] to-transparent md:block"></div>

                            <div className="space-y-5">
                                {journey.map(
                                    (
                                        chapter,
                                        index
                                    ) => (
                                        <JourneyCard
                                            key={
                                                chapter.id
                                            }
                                            chapter={
                                                chapter
                                            }
                                            index={
                                                index
                                            }
                                            onClick={() =>
                                                goTo(
                                                    chapter.href
                                                )
                                            }
                                            onOpenQuiz={
                                                chapter.quizHref
                                                    ? () =>
                                                        goTo(
                                                            chapter.quizHref!
                                                        )
                                                    : undefined
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* QUIZ SUMMARY */}

                <section className="relative mt-10 overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#07070b]">
                    <div className="relative p-7 md:p-9">
                        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                                    Quiz Integration
                                </p>

                                <h3 className="mt-2 text-xl font-black">
                                    Lessons & quizzes are connected
                                </h3>

                                <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
                                    Every lesson can display its connected quiz,
                                    while your latest quiz score is reflected
                                    here automatically.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <ProgressMini
                                    icon={
                                        <Target
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={String(
                                        totalSubjectQuizzes
                                    )}
                                    label="Quizzes"
                                />

                                <ProgressMini
                                    icon={
                                        <CheckCircle2
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={String(
                                        completedJourneyQuizzes
                                    )}
                                    label="Done"
                                />

                                <ProgressMini
                                    icon={
                                        <Trophy
                                            size={
                                                14
                                            }
                                        />
                                    }
                                    value={`${quizAverage}%`}
                                    label="Average"
                                />
                            </div>
                        </div>

                        {totalSubjectQuizzes >
                            0 ? (
                            <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                <motion.div
                                    initial={{
                                        width: 0,
                                    }}
                                    animate={{
                                        width: `${totalSubjectQuizzes >
                                                0
                                                ? Math.min(
                                                    100,
                                                    Math.round(
                                                        (
                                                            completedJourneyQuizzes /
                                                            totalSubjectQuizzes
                                                        ) *
                                                        100
                                                    )
                                                )
                                                : 0
                                            }%`,
                                    }}
                                    transition={{
                                        duration:
                                            1,
                                    }}
                                    className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                                ></motion.div>
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* AI CTA */}

                <section className="relative mt-7 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-purple-600/[0.10] via-[#07070b] to-[#050507]">
                    <div className="relative flex flex-col justify-between gap-7 p-7 md:p-9 lg:flex-row lg:items-center">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                <BrainCircuit
                                    size={
                                        20
                                    }
                                />
                            </div>

                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                                    Miro AI Tutor
                                </p>

                                <h3 className="mt-2 text-xl font-black">
                                    Need help with{" "}
                                    {
                                        subject.name
                                    }
                                    ?
                                </h3>

                                <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
                                    Ask Miro to explain lessons,
                                    review your progress, prepare you
                                    for quizzes and help you understand
                                    where you're struggling.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                goTo(
                                    `/ai?subjectId=${encodeURIComponent(
                                        subject.id
                                    )}&subjectName=${encodeURIComponent(
                                        subject.name
                                    )}`
                                )
                            }
                            className="group flex shrink-0 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-[9px] font-black shadow-[0_15px_45px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
                        >
                            Ask Miro

                            <ArrowRight
                                size={
                                    14
                                }
                                className="transition group-hover:translate-x-1"
                            />
                        </button>
                    </div>
                </section>

                {/* FINAL CTA */}

                {journey.length >
                    0 ? (
                    <section className="relative mt-7 overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#07070b]">
                        <div className="relative flex flex-col justify-between gap-7 p-7 md:p-9 lg:flex-row lg:items-center">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                    <Sparkles
                                        size={
                                            20
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                                        Keep Going
                                    </p>

                                    <h3 className="mt-2 text-xl font-black">
                                        Your next milestone is waiting.
                                    </h3>

                                    <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
                                        Complete lessons, earn XP,
                                        unlock achievements and master{" "}
                                        {
                                            subject.name
                                        }
                                        .
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        currentChapter?.href
                                    ) {
                                        goTo(
                                            currentChapter.href
                                        );
                                    } else {
                                        goTo(
                                            `/subjects/${encodeURIComponent(
                                                subject.id
                                            )}`
                                        );
                                    }
                                }}
                                className="group flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-[9px] font-black text-black transition hover:-translate-y-0.5 hover:bg-purple-100"
                            >
                                Continue Journey

                                <ArrowRight
                                    size={
                                        14
                                    }
                                    className="transition group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </section>
                ) : null}

                {/* FOOTER */}

                <footer className="py-12 text-center">
                    <div className="mx-auto mb-4 h-px w-20 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

                    <p className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-800">
                        RailLearn • Railway Academy
                    </p>
                </footer>
            </div>
        </main>
    );
}

/* ============================================================
   JOURNEY PAGE WRAPPER
   Keeps useSearchParams() inside Suspense.
============================================================ */

export default function JourneyPage() {
    return (
        <Suspense
            fallback={
                <PremiumLoading />
            }
        >
            <JourneyContent />
        </Suspense>
    );
}

/* ============================================================
   JOURNEY CARD
============================================================ */

function JourneyCard({
    chapter,
    index,
    onClick,
    onOpenQuiz,
}: {
    chapter: JourneyChapter;
    index: number;
    onClick: () => void;
    onOpenQuiz?: () => void;
}) {
    const completed =
        chapter.status ===
        "completed";

    const current =
        chapter.status ===
        "current";

    const available =
        chapter.status ===
        "available";

    return (
        <div className="group relative flex w-full gap-5 text-left">
            {/* NODE */}

            <button
                type="button"
                onClick={
                    onClick
                }
                aria-label={`Open ${chapter.title}`}
                className={`relative z-10 flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[19px] border text-[10px] font-black transition duration-500 ${completed
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : current
                            ? "border-purple-400/60 bg-gradient-to-br from-purple-500 to-violet-700 text-white"
                            : "border-white/[0.07] bg-[#07070b] text-zinc-500"
                    } hover:scale-105`}
            >
                {completed ? (
                    <Check
                        size={
                            19
                        }
                    />
                ) : (
                    <span>
                        {
                            chapter.number
                        }
                    </span>
                )}

                {current ? (
                    <span className="absolute inset-[-5px] -z-10 animate-pulse rounded-[23px] border border-purple-500/10"></span>
                ) : null}
            </button>

            {/* CARD */}

            <div
                className={`min-w-0 flex-1 overflow-hidden rounded-[28px] border p-5 transition-all duration-500 md:p-7 ${current
                        ? "border-purple-500/25 bg-gradient-to-r from-purple-500/[0.08] via-[#09090f] to-[#07070b]"
                        : completed
                            ? "border-green-500/10 bg-gradient-to-r from-green-500/[0.025] to-[#07070b]"
                            : "border-white/[0.07] bg-[#07070b]"
                    } group-hover:-translate-y-0.5 group-hover:border-purple-500/20 group-hover:bg-[#09090f]`}
            >
                <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                    <button
                        type="button"
                        onClick={
                            onClick
                        }
                        className="min-w-0 flex-1 text-left"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            {current ? (
                                <StatusBadge
                                    color="purple"
                                    icon={
                                        <Play
                                            size={
                                                9
                                            }
                                        />
                                    }
                                >
                                    Currently Learning
                                </StatusBadge>
                            ) : null}

                            {completed ? (
                                <StatusBadge
                                    color="green"
                                    icon={
                                        <Check
                                            size={
                                                9
                                            }
                                        />
                                    }
                                >
                                    Completed
                                </StatusBadge>
                            ) : null}

                            {available ? (
                                <StatusBadge
                                    color="gray"
                                    icon={
                                        <BookOpen
                                            size={
                                                9
                                            }
                                        />
                                    }
                                >
                                    Available
                                </StatusBadge>
                            ) : null}

                            <span className="text-[7px] font-black uppercase tracking-[0.18em] text-zinc-700">
                                Lesson{" "}
                                {
                                    chapter.number
                                }
                            </span>

                            {chapter.quizId ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/10 bg-purple-500/[0.05] px-2 py-1 text-[7px] font-black text-purple-400">
                                    <Target
                                        size={
                                            9
                                        }
                                    />

                                    Quiz
                                </span>
                            ) : null}
                        </div>

                        <h3 className="mt-4 truncate text-xl font-black text-white md:text-2xl">
                            {
                                chapter.title
                            }
                        </h3>

                        <p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-600">
                            {
                                chapter.description
                            }
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-5">
                            <span className="flex items-center gap-2 text-[8px] font-bold text-zinc-600">
                                <BookOpen
                                    size={
                                        12
                                    }
                                />

                                1 Lesson
                            </span>

                            <span
                                className={`flex items-center gap-2 text-[8px] font-bold ${current
                                        ? "text-purple-400"
                                        : completed
                                            ? "text-green-400"
                                            : "text-zinc-600"
                                    }`}
                            >
                                <Zap
                                    size={
                                        12
                                    }
                                />

                                {completed
                                    ? "Completed"
                                    : "Study & earn XP"}
                            </span>

                            {chapter.duration >
                                0 ? (
                                <span className="flex items-center gap-2 text-[8px] font-bold text-zinc-600">
                                    <Clock3
                                        size={
                                            12
                                        }
                                    />

                                    {
                                        chapter.duration
                                    }{" "}
                                    min
                                </span>
                            ) : null}

                            {completed ? (
                                <span className="flex items-center gap-2 text-[8px] font-bold text-green-500/70">
                                    <Star
                                        size={
                                            11
                                        }
                                    />

                                    Mastered
                                </span>
                            ) : null}

                            {chapter.quizCompleted &&
                                chapter.quizPercentage !==
                                null ? (
                                <span className="flex items-center gap-2 text-[8px] font-bold text-purple-400">
                                    <Trophy
                                        size={
                                            11
                                        }
                                    />

                                    Quiz{" "}
                                    {
                                        chapter.quizPercentage
                                    }
                                    %
                                </span>
                            ) : null}
                        </div>
                    </button>

                    {/* RIGHT SIDE */}

                    <div className="w-full shrink-0 lg:w-[220px]">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider">
                            <span className="text-zinc-700">
                                Progress
                            </span>

                            <span
                                className={
                                    completed
                                        ? "text-green-400"
                                        : current
                                            ? "text-purple-400"
                                            : "text-zinc-600"
                                }
                            >
                                {
                                    chapter.progress
                                }
                                %
                            </span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${completed
                                        ? "bg-gradient-to-r from-green-600 to-emerald-400"
                                        : current
                                            ? "bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                                            : "bg-zinc-800"
                                    }`}
                                style={{
                                    width: `${chapter.progress}%`,
                                }}
                            ></div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2 text-[8px] font-black uppercase tracking-[0.14em]">
                            <button
                                type="button"
                                onClick={
                                    onClick
                                }
                                className={
                                    completed
                                        ? "text-green-400"
                                        : current
                                            ? "text-purple-400"
                                            : "text-zinc-500"
                                }
                            >
                                {completed
                                    ? "Review Lesson"
                                    : current
                                        ? "Start Lesson"
                                        : "Open Lesson"}
                            </button>

                            <ArrowRight
                                size={
                                    12
                                }
                                className="text-zinc-600 transition group-hover:translate-x-1"
                            />
                        </div>

                        {chapter.quizId &&
                            onOpenQuiz ? (
                            <button
                                type="button"
                                onClick={
                                    onOpenQuiz
                                }
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/[0.05] px-3 py-2.5 text-[8px] font-black text-purple-300 transition hover:border-purple-500/30 hover:bg-purple-500/[0.10]"
                            >
                                <Target
                                    size={
                                        12
                                    }
                                />

                                {chapter.quizCompleted
                                    ? `Retry Quiz${chapter.quizPercentage !==
                                        null
                                        ? ` • ${chapter.quizPercentage}%`
                                        : ""
                                    }`
                                    : "Take Quiz"}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
    children,
    color,
    icon,
}: {
    children: ReactNode;
    color:
    | "purple"
    | "green"
    | "gray";
    icon: ReactNode;
}) {
    const styles = {
        purple:
            "border-purple-400/20 bg-purple-500/10 text-purple-300",

        green:
            "border-green-500/20 bg-green-500/10 text-green-400",

        gray:
            "border-white/[0.06] bg-white/[0.03] text-zinc-500",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.15em] ${styles[color]}`}
        >
            {icon}
            {children}
        </span>
    );
}

/* ============================================================
   JOURNEY STAT
============================================================ */

function JourneyStat({
    icon,
    value,
    label,
}: {
    icon: ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="min-w-[90px] rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-purple-400">
                {icon}

                <span className="text-[7px] font-black uppercase tracking-wider text-zinc-700">
                    {label}
                </span>
            </div>

            <p className="mt-1 text-lg font-black">
                {value}
            </p>
        </div>
    );
}

/* ============================================================
   PROGRESS MINI
============================================================ */

function ProgressMini({
    icon,
    value,
    label,
}: {
    icon: ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2 text-purple-400">
                {icon}

                <span className="text-[7px] font-black uppercase tracking-wider text-zinc-700">
                    {label}
                </span>
            </div>

            <p className="mt-1 text-lg font-black">
                {value}
            </p>
        </div>
    );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyJourney({
    subjectName,
}: {
    subjectName: string;
}) {
    const router =
        useRouter();

    return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#07070b] p-12 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[90px]"></div>

            <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-purple-500/15 bg-purple-500/10 text-purple-400">
                    <BookOpen
                        size={
                            30
                        }
                    />
                </div>

                <p className="mt-7 text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                    No Lessons Yet
                </p>

                <h3 className="mt-3 text-2xl font-black">
                    Your journey is waiting
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-600">
                    No lessons have been added to{" "}
                    <span className="font-bold text-zinc-400">
                        {subjectName}
                    </span>{" "}
                    yet. Add lessons from the admin panel and they
                    will automatically appear here.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/subjects"
                        )
                    }
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-[9px] font-black transition hover:bg-purple-500"
                >
                    <ArrowLeft
                        size={
                            13
                        }
                    />

                    Browse Subjects
                </button>
            </div>
        </div>
    );
}

/* ============================================================
   LOADING
============================================================ */

function PremiumLoading() {
    return (
        <main className="min-h-screen bg-[#020203] text-white">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/10 blur-[130px]"></div>
            </div>

            <div className="relative flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="relative mx-auto h-20 w-20">
                        <div className="absolute inset-0 animate-ping rounded-[25px] bg-purple-500/10"></div>

                        <div className="absolute inset-0 rounded-[25px] border border-purple-500/20"></div>

                        <div className="relative flex h-20 w-20 items-center justify-center rounded-[25px] bg-purple-500/10 shadow-[0_0_60px_rgba(168,85,247,0.15)]">
                            <TrainFront
                                size={
                                    28
                                }
                                className="animate-pulse text-purple-400"
                            />
                        </div>
                    </div>

                    <p className="mt-7 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        Loading your journey
                    </p>

                    <p className="mt-3 text-[8px] text-zinc-700">
                        Synchronizing your learning path...
                    </p>
                </div>
            </div>
        </main>
    );
}