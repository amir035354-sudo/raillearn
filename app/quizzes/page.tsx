"use client";

import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    Clock3,
    GraduationCap,
    Search,
    Target,
    TrendingUp,
    Trophy,
    X,
    Zap,
} from "lucide-react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/* =====================================================
   TYPES
===================================================== */

type Subject = {
    id: string;
    name: string;
    code: string | null;
};

type Lesson = {
    id: string;
    subject_id: string | null;
    title: string | null;
};

type Quiz = {
    id: string;
    subject_id: string | null;
    lesson_id: string | null;

    title: string;
    total_questions: number | null;

    created_at: string;

    description: string | null;

    subject: Subject | null;
    lesson: Lesson | null;
};

type QuizResult = {
    quiz_id: string;
    score: number;
    total_questions: number;
    completed_at?: string | null;
};

type FilterType =
    | "all"
    | "available"
    | "completed";

/* =====================================================
   PAGE
===================================================== */

export default function QuizzesPage() {
    const router = useRouter();
    const supabase = createClient();

    const [quizzes, setQuizzes] =
        useState<Quiz[]>([]);

    const [results, setResults] =
        useState<QuizResult[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState<FilterType>("all");

    const [mobileMenu, setMobileMenu] =
        useState(false);

    const [hoveredQuiz, setHoveredQuiz] =
        useState<string | null>(null);

    /* ===================================================
       LOAD
    =================================================== */

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            try {
                setLoading(true);

                /* =============================================
                   USER
                ============================================= */

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                /* =============================================
                   QUIZZES
                ============================================= */

                const {
                    data: quizData,
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
            description,

            subject:subjects!quizzes_subject_id_fkey (
              id,
              name,
              code
            )
          `)
                    .order(
                        "created_at",
                        {
                            ascending: true,
                        }
                    );

                if (quizError) {
                    throw quizError;
                }

                /* =============================================
                   LOAD LESSON IDS
                ============================================= */

                const lessonIds = [
                    ...new Set(
                        (quizData ?? [])
                            .map(
                                (quiz: any) =>
                                    quiz.lesson_id
                            )
                            .filter(Boolean)
                    ),
                ];

                let lessonMap =
                    new Map<
                        string,
                        Lesson
                    >();

                if (lessonIds.length > 0) {
                    const {
                        data: lessons,
                        error: lessonsError,
                    } = await supabase
                        .from("lessons")
                        .select(`
              id,
              subject_id,
              title
            `)
                        .in(
                            "id",
                            lessonIds
                        );

                    if (lessonsError) {
                        console.warn(
                            "LESSON LOAD WARNING:",
                            lessonsError
                        );
                    } else {
                        lessonMap =
                            new Map(
                                (lessons ?? []).map(
                                    (lesson: any) => [
                                        lesson.id,
                                        {
                                            id: lesson.id,
                                            subject_id:
                                                lesson.subject_id,
                                            title:
                                                lesson.title,
                                        },
                                    ]
                                )
                            );
                    }
                }

                /* =============================================
                   FORMAT QUIZZES
                ============================================= */

                const formatted: Quiz[] =
                    (quizData ?? []).map(
                        (quiz: any) => {
                            const subject =
                                Array.isArray(
                                    quiz.subject
                                )
                                    ? quiz.subject[0] ??
                                    null
                                    : quiz.subject ??
                                    null;

                            const lesson =
                                quiz.lesson_id
                                    ? lessonMap.get(
                                        quiz.lesson_id
                                    ) ?? null
                                    : null;

                            return {
                                id: quiz.id,
                                subject_id:
                                    quiz.subject_id,
                                lesson_id:
                                    quiz.lesson_id,
                                title:
                                    quiz.title,
                                total_questions:
                                    quiz.total_questions,
                                created_at:
                                    quiz.created_at,
                                description:
                                    quiz.description,
                                subject,
                                lesson,
                            };
                        }
                    );

                /* =============================================
                   RESULTS
                ============================================= */

                let resultData:
                    QuizResult[] = [];

                if (user) {
                    const {
                        data: resultsData,
                        error: resultsError,
                    } = await supabase
                        .from("quiz_results")
                        .select(`
              quiz_id,
              score,
              total_questions,
              completed_at
            `)
                        .eq(
                            "user_id",
                            user.id
                        )
                        .order(
                            "completed_at",
                            {
                                ascending: false,
                            }
                        );

                    if (
                        !resultsError &&
                        resultsData
                    ) {
                        resultData =
                            resultsData as QuizResult[];
                    }
                }

                if (mounted) {
                    setQuizzes(formatted);
                    setResults(resultData);
                }
            } catch (error) {
                console.error(
                    "QUIZZES LOAD ERROR:",
                    error
                );

                if (mounted) {
                    setQuizzes([]);
                    setResults([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            mounted = false;
        };
    }, [supabase]);

    /* ===================================================
       RESULT MAP
    =================================================== */

    const resultMap =
        useMemo(() => {
            const map =
                new Map<
                    string,
                    QuizResult
                >();

            for (const result of results) {
                /*
                 * Results are ordered newest first,
                 * so keep the first result only.
                 */
                if (
                    !map.has(
                        result.quiz_id
                    )
                ) {
                    map.set(
                        result.quiz_id,
                        result
                    );
                }
            }

            return map;
        }, [results]);

    /* ===================================================
       STATS
    =================================================== */

    const completedCount =
        resultMap.size;

    const averageScore =
        results.length > 0
            ? Math.round(
                results.reduce(
                    (sum, result) =>
                        sum +
                        (result.total_questions >
                            0
                            ? (result.score /
                                result.total_questions) *
                            100
                            : 0),
                    0
                ) /
                results.length
            )
            : 0;

    const earnedXP =
        results.reduce(
            (sum, result) =>
                sum +
                Number(
                    result.score ?? 0
                ) *
                50,
            0
        );

    /* ===================================================
       FILTER
    =================================================== */

    const filteredQuizzes =
        useMemo(() => {
            const query =
                search
                    .toLowerCase()
                    .trim();

            return quizzes.filter(
                (quiz) => {
                    const result =
                        resultMap.get(
                            quiz.id
                        );

                    if (
                        filter ===
                        "available"
                    ) {
                        if (
                            !quiz.total_questions ||
                            quiz.total_questions <=
                            0
                        ) {
                            return false;
                        }
                    }

                    if (
                        filter ===
                        "completed"
                    ) {
                        if (!result) {
                            return false;
                        }
                    }

                    if (!query) {
                        return true;
                    }

                    return (
                        quiz.title
                            ?.toLowerCase()
                            .includes(query) ||
                        quiz.description
                            ?.toLowerCase()
                            .includes(query) ||
                        quiz.subject?.name
                            ?.toLowerCase()
                            .includes(
                                query
                            ) ||
                        quiz.subject?.code
                            ?.toLowerCase()
                            .includes(
                                query
                            ) ||
                        quiz.lesson?.title
                            ?.toLowerCase()
                            .includes(
                                query
                            )
                    );
                }
            );
        }, [
            quizzes,
            search,
            filter,
            resultMap,
        ]);

    /* ===================================================
       NAV
    =================================================== */

    function goTo(
        path: string
    ) {
        setMobileMenu(false);
        router.push(path);
    }

    /* ===================================================
       OPEN QUIZ
    =================================================== */

    function openQuiz(
        quiz: Quiz
    ) {
        if (!quiz.subject_id) {
            console.error(
                "Quiz subject id is missing:",
                quiz
            );
            return;
        }

        /*
         * Preferred route:
         *
         * Subject
         *   ↓
         * Lesson
         *   ↓
         * Quiz
         */

        if (quiz.lesson_id) {
            goTo(
                `/subjects/${encodeURIComponent(
                    quiz.subject_id
                )}/lessons/${encodeURIComponent(
                    quiz.lesson_id
                )}/quiz/${encodeURIComponent(
                    quiz.id
                )}`
            );

            return;
        }

        /*
         * Fallback if the quiz has no lesson_id.
         *
         * This is useful for old quizzes that
         * were created directly under a subject.
         */

        goTo(
            `/subjects/${encodeURIComponent(
                quiz.subject_id
            )}/quizzes/${encodeURIComponent(
                quiz.id
            )}`
        );
    }

    /* ===================================================
       OPEN AI
    =================================================== */

    function openAI(
        quiz: Quiz
    ) {
        const params =
            new URLSearchParams();

        if (quiz.subject_id) {
            params.set(
                "subjectId",
                quiz.subject_id
            );
        }

        if (quiz.lesson_id) {
            params.set(
                "lessonId",
                quiz.lesson_id
            );
        }

        params.set(
            "quizId",
            quiz.id
        );

        goTo(
            `/ai?${params.toString()}`
        );
    }

    /* ===================================================
       RENDER
    =================================================== */

    return (
        <main className="min-h-screen overflow-hidden bg-[#030305] text-white">
            {/* =================================================
          BACKGROUND
      ================================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 70, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-purple-700/10 blur-[150px]"
                />

                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -right-40 top-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]"
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_75%)]" />
            </div>

            <div className="relative flex min-h-screen">
                {/* =================================================
            MOBILE MENU
        ================================================= */}

                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            className="fixed inset-0 z-[100] lg:hidden"
                        >
                            <div
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() =>
                                    setMobileMenu(
                                        false
                                    )
                                }
                            />

                            <motion.aside
                                initial={{
                                    x: -300,
                                }}
                                animate={{
                                    x: 0,
                                }}
                                exit={{
                                    x: -300,
                                }}
                                className="relative h-full w-[285px] border-r border-white/10 bg-[#060609] p-5"
                            >
                                <div className="mb-10 flex items-center justify-between">
                                    <Logo />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMobileMenu(
                                                false
                                            )
                                        }
                                        className="rounded-xl border border-white/10 p-2 text-zinc-400"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <Navigation
                                    goTo={goTo}
                                />
                            </motion.aside>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* =================================================
            SIDEBAR
        ================================================= */}

                <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">
                    <div className="sticky top-0 flex h-screen flex-col">
                        <div className="px-6 py-7">
                            <Logo />
                        </div>

                        <div className="flex-1 px-4">
                            <Navigation
                                goTo={goTo}
                            />
                        </div>

                        <div className="p-4">
                            <div className="rounded-2xl border border-purple-500/10 bg-purple-500/[0.03] p-4">
                                <div className="flex items-center gap-2">
                                    <Zap
                                        size={14}
                                        className="text-purple-400"
                                    />

                                    <span className="text-[9px] font-black text-purple-300">
                                        Keep Learning
                                    </span>
                                </div>

                                <p className="mt-2 text-[8px] leading-4 text-zinc-600">
                                    Complete quizzes to
                                    earn XP, unlock
                                    achievements and level
                                    up your profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* =================================================
            CONTENT
        ================================================= */}

                <div className="min-w-0 flex-1">
                    {/* HEADER */}

                    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/85 backdrop-blur-2xl">
                        <div className="flex h-[76px] items-center justify-between px-5 md:px-8">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMobileMenu(
                                            true
                                        )
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 lg:hidden"
                                >
                                    <span className="text-lg">
                                        ☰
                                    </span>
                                </button>

                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                                        Railway Academy
                                    </p>

                                    <h1 className="mt-1 text-sm font-bold">
                                        Quizzes
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        goTo("/ai")
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/15 bg-purple-500/[0.06] text-purple-400 transition hover:bg-purple-500/[0.12]"
                                    title="Miro AI"
                                >
                                    <BrainCircuit
                                        size={16}
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        goTo(
                                            "/dashboard"
                                        )
                                    }
                                    className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-400 transition hover:border-purple-500/30 hover:text-white sm:flex"
                                >
                                    <ArrowLeft
                                        size={14}
                                    />
                                    Dashboard
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="relative z-10 mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">
                        {/* =================================================
                HERO
            ================================================= */}

                        <motion.section
                            initial={{
                                opacity: 0,
                                y: 25,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.6,
                            }}
                            className="relative mb-7 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-[#12091b] via-[#08070d] to-[#050507] p-7 md:p-10"
                        >
                            <div className="absolute -right-24 -top-32 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px]" />

                            <div className="relative">
                                <div className="max-w-3xl">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">
                                        Knowledge checks
                                    </p>

                                    <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                                        Test your
                                        <span className="text-purple-500">
                                            {" "}
                                            knowledge.
                                        </span>
                                    </h2>

                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                                        Complete quizzes, improve
                                        your railway engineering
                                        knowledge, earn XP, unlock
                                        achievements and build your
                                        level.
                                    </p>
                                </div>

                                {/* MINI STATS */}

                                <div className="mt-8 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
                                    <MiniStat
                                        icon={
                                            <Target
                                                size={15}
                                            />
                                        }
                                        label="Quizzes"
                                        value={`${quizzes.length}`}
                                    />

                                    <MiniStat
                                        icon={
                                            <CheckCircle2
                                                size={15}
                                            />
                                        }
                                        label="Completed"
                                        value={`${completedCount}`}
                                    />

                                    <MiniStat
                                        icon={
                                            <Trophy
                                                size={15}
                                            />
                                        }
                                        label="Average"
                                        value={`${averageScore}%`}
                                    />

                                    <MiniStat
                                        icon={
                                            <Zap
                                                size={15}
                                            />
                                        }
                                        label="Quiz XP"
                                        value={`${earnedXP}`}
                                    />
                                </div>
                            </div>
                        </motion.section>

                        {/* =================================================
                SEARCH
            ================================================= */}

                        <section className="mb-8">
                            <div className="flex flex-col gap-3 lg:flex-row">
                                <div className="relative flex-1">
                                    <Search
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                    />

                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search quizzes, subjects, lessons..."
                                        className="h-13 w-full rounded-2xl border border-white/[0.07] bg-[#07080d] pl-11 pr-4 text-xs outline-none transition focus:border-purple-500/40"
                                    />
                                </div>

                                <div className="flex gap-2 overflow-x-auto">
                                    <FilterButton
                                        active={
                                            filter ===
                                            "all"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "all"
                                            )
                                        }
                                    >
                                        All
                                    </FilterButton>

                                    <FilterButton
                                        active={
                                            filter ===
                                            "available"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "available"
                                            )
                                        }
                                    >
                                        Available
                                    </FilterButton>

                                    <FilterButton
                                        active={
                                            filter ===
                                            "completed"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "completed"
                                            )
                                        }
                                    >
                                        Completed
                                    </FilterButton>
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                CONTENT
            ================================================= */}

                        {loading ? (
                            <LoadingState />
                        ) : filteredQuizzes.length ===
                            0 ? (
                            <EmptyState
                                hasSearch={
                                    search.length >
                                    0
                                }
                                onBack={() =>
                                    goTo(
                                        "/dashboard"
                                    )
                                }
                            />
                        ) : (
                            <section>
                                <div className="mb-5 flex items-end justify-between">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-purple-400">
                                            Available quizzes
                                        </p>

                                        <h3 className="mt-2 text-2xl font-black">
                                            Knowledge Checks
                                        </h3>
                                    </div>

                                    <span className="text-xs text-zinc-700">
                                        {
                                            filteredQuizzes.length
                                        }{" "}
                                        quizzes
                                    </span>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredQuizzes.map(
                                        (
                                            quiz,
                                            index
                                        ) => (
                                            <QuizCard
                                                key={
                                                    quiz.id
                                                }
                                                quiz={quiz}
                                                result={
                                                    resultMap.get(
                                                        quiz.id
                                                    )
                                                }
                                                index={
                                                    index
                                                }
                                                hovered={
                                                    hoveredQuiz ===
                                                    quiz.id
                                                }
                                                onHover={() =>
                                                    setHoveredQuiz(
                                                        quiz.id
                                                    )
                                                }
                                                onLeave={() =>
                                                    setHoveredQuiz(
                                                        null
                                                    )
                                                }
                                                onClick={() =>
                                                    openQuiz(
                                                        quiz
                                                    )
                                                }
                                                onAskAI={() =>
                                                    openAI(
                                                        quiz
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

/* =====================================================
   LOGO
===================================================== */

function Logo() {
    const router =
        useRouter();

    return (
        <button
            type="button"
            onClick={() =>
                router.push(
                    "/dashboard"
                )
            }
            className="text-left"
        >
            <div className="text-xl font-black">
                Rail
                <span className="text-purple-500">
                    Learn
                </span>
            </div>

            <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                Railway Academy
            </p>
        </button>
    );
}

/* =====================================================
   NAV
===================================================== */

function Navigation({
    goTo,
}: {
    goTo: (
        path: string
    ) => void;
}) {
    return (
        <nav className="space-y-1">
            <NavItem
                icon={
                    <GraduationCap
                        size={17}
                    />
                }
                label="Dashboard"
                onClick={() =>
                    goTo("/dashboard")
                }
            />

            <NavItem
                icon={
                    <BookOpen
                        size={17}
                    />
                }
                label="Subjects"
                onClick={() =>
                    goTo("/subjects")
                }
            />

            <NavItem
                icon={
                    <BrainCircuit
                        size={17}
                    />
                }
                label="AI Tutor"
                onClick={() =>
                    goTo("/ai")
                }
            />

            <NavItem
                icon={
                    <Target
                        size={17}
                    />
                }
                label="Quizzes"
                active
                onClick={() =>
                    goTo("/quizzes")
                }
            />

            <NavItem
                icon={
                    <Zap
                        size={17}
                    />
                }
                label="Achievements"
                onClick={() =>
                    goTo(
                        "/achievements"
                    )
                }
            />

            <NavItem
                icon={
                    <TrendingUp
                        size={17}
                    />
                }
                label="Progress"
                onClick={() =>
                    goTo("/progress")
                }
            />
        </nav>
    );
}

/* =====================================================
   NAV ITEM
===================================================== */

function NavItem({
    icon,
    label,
    active = false,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{
                x: 3,
            }}
            onClick={onClick}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${active
                    ? "bg-purple-500/10 text-purple-300"
                    : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-300"
                }`}
        >
            <span
                className={
                    active
                        ? "text-purple-400"
                        : "text-zinc-600"
                }
            >
                {icon}
            </span>

            {label}
        </motion.button>
    );
}

/* =====================================================
   MINI STAT
===================================================== */

function MiniStat({
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

            <p className="mt-2 text-xl font-black">
                {value}
            </p>
        </div>
    );
}

/* =====================================================
   FILTER
===================================================== */

function FilterButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`whitespace-nowrap rounded-2xl border px-4 py-3 text-[9px] font-black transition ${active
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                    : "border-white/[0.07] bg-[#07080d] text-zinc-600 hover:text-zinc-300"
                }`}
        >
            {children}
        </button>
    );
}

/* =====================================================
   QUIZ CARD
===================================================== */

function QuizCard({
    quiz,
    result,
    index,
    hovered,
    onHover,
    onLeave,
    onClick,
    onAskAI,
}: {
    quiz: Quiz;
    result?: QuizResult;
    index: number;
    hovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    onClick: () => void;
    onAskAI: () => void;
}) {
    const percentage =
        result &&
            result.total_questions >
            0
            ? Math.round(
                (result.score /
                    result.total_questions) *
                100
            )
            : null;

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 30,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                delay:
                    index * 0.06,
                duration: 0.45,
            }}
            whileHover={{
                y: -8,
            }}
            onHoverStart={
                onHover
            }
            onHoverEnd={
                onLeave
            }
            className="group relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 text-left shadow-[0_20px_70px_rgba(0,0,0,0.2)] transition hover:border-purple-500/30 hover:shadow-[0_25px_90px_rgba(124,58,237,0.12)]"
        >
            {/* Glow */}

            <motion.div
                animate={{
                    scale: hovered
                        ? 1.25
                        : 1,
                    opacity:
                        hovered
                            ? 0.22
                            : 0.1,
                }}
                className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-600 blur-3xl"
            />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <motion.div
                        animate={{
                            rotate: hovered
                                ? [0, -8, 8, 0]
                                : 0,
                            scale: hovered
                                ? 1.08
                                : 1,
                        }}
                        className="flex h-13 w-13 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400"
                    >
                        <Target size={23} />
                    </motion.div>

                    {result ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-green-500/15 bg-green-500/10 px-2.5 py-1.5 text-[7px] font-black text-green-400">
                            <CheckCircle2
                                size={10}
                            />
                            Completed
                        </div>
                    ) : (
                        <ChevronRight
                            size={18}
                            className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-purple-400"
                        />
                    )}
                </div>

                <p className="mt-6 text-[8px] font-black uppercase tracking-[0.2em] text-purple-400">
                    {quiz.subject?.code ??
                        "QUIZ"}
                </p>

                <h4 className="mt-2 text-xl font-black">
                    {quiz.title}
                </h4>

                {quiz.subject && (
                    <p className="mt-2 text-xs font-semibold text-zinc-600">
                        {quiz.subject.name}
                    </p>
                )}

                {quiz.lesson && (
                    <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5">
                        <BookOpen
                            size={10}
                            className="shrink-0 text-purple-400"
                        />

                        <span className="truncate text-[8px] font-bold text-zinc-600">
                            {quiz.lesson.title ??
                                "Lesson"}
                        </span>
                    </div>
                )}

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                    {quiz.description ??
                        "Test your knowledge and improve your railway engineering skills."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2">
                    <QuizInfo
                        icon={
                            <CheckCircle2
                                size={13}
                            />
                        }
                        value={
                            quiz.total_questions
                                ? `${quiz.total_questions} Questions`
                                : "Questions —"
                        }
                    />

                    <QuizInfo
                        icon={
                            <Clock3
                                size={13}
                            />
                        }
                        value="Knowledge Check"
                    />
                </div>

                {percentage !==
                    null && (
                        <div className="mt-5">
                            <div className="mb-2 flex justify-between text-[8px]">
                                <span className="text-zinc-600">
                                    Last score
                                </span>

                                <span className="font-black text-purple-400">
                                    {percentage}%
                                </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                <motion.div
                                    initial={{
                                        width: 0,
                                    }}
                                    animate={{
                                        width: `${percentage}%`,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay:
                                            index * 0.05,
                                    }}
                                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400"
                                />
                            </div>
                        </div>
                    )}

                {/* ACTIONS */}

                <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
                    <button
                        type="button"
                        onClick={onClick}
                        className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-[9px] font-black transition hover:bg-purple-500"
                    >
                        {result
                            ? "Retry Quiz"
                            : "Start Quiz"}

                        <ArrowRight
                            size={13}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={onAskAI}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/15 bg-purple-500/[0.05] text-purple-400 transition hover:bg-purple-500/[0.12]"
                        title="Ask Miro"
                    >
                        <BrainCircuit
                            size={16}
                        />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* =====================================================
   QUIZ INFO
===================================================== */

function QuizInfo({
    icon,
    value,
}: {
    icon: React.ReactNode;
    value: string;
}) {
    return (
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 text-[9px] font-bold text-zinc-500">
            {icon}

            <span>
                {value}
            </span>
        </div>
    );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({
                length: 6,
            }).map((_, index) => (
                <div
                    key={`quiz-loading-${index}`}
                    className="h-[430px] animate-pulse rounded-[30px] border border-white/[0.05] bg-[#07080d]"
                />
            ))}
        </div>
    );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyState({
    hasSearch,
    onBack,
}: {
    hasSearch: boolean;
    onBack: () => void;
}) {
    return (
        <div className="rounded-[30px] border border-white/[0.06] bg-[#07080d] p-10 text-center md:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-400">
                <Target size={32} />
            </div>

            <p className="mt-7 text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                {hasSearch
                    ? "No Results"
                    : "Coming Soon"}
            </p>

            <h3 className="mt-3 text-2xl font-black">
                {hasSearch
                    ? "No quizzes found"
                    : "No quizzes available yet"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
                {hasSearch
                    ? "Try searching with another quiz name, subject or lesson."
                    : "Your quizzes will appear here as soon as they are added to RailLearn."}
            </p>

            <button
                type="button"
                onClick={onBack}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 text-[9px] font-black transition hover:bg-purple-500"
            >
                <ArrowLeft
                    size={14}
                />
                Back to Dashboard
            </button>
        </div>
    );
}