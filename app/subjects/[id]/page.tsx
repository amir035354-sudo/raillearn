"use client";

import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    BookOpen,
    BrainCircuit,
    Check,
    ChevronRight,
    CircleCheck,
    Clock3,
    Flame,
    GraduationCap,
    Play,
    Search,
    Target,
    TrainFront,
    X,
    Zap,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

/* =====================================================
   TYPES
===================================================== */

type SubjectRow = {
    id: string;
    name: string | null;
    code: string | null;
    semester: number | null;
    description: string | null;
    image_url: string | null;
};

type LessonRow = {
    id: string;
    subject_id: string | null;
    title: string | null;
    slug: string | null;
    thumbnail_url: string | null;
    duration_minutes: number | null;
    difficulty: string | null;
    lesson_order: number | null;
    is_published: boolean | null;
};

type ProgressRow = {
    lesson_id: string | null;
    completed: boolean | null;
};

type Lesson = {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    duration: number;
    difficulty: string;
    order: number;
    completed: boolean;
};

type FilterType = "all" | "completed" | "remaining";

/* =====================================================
   FALLBACK IMAGES
===================================================== */

const fallbackImages = [
    "/images/train-hero.jpg",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
];

/* =====================================================
   PAGE
===================================================== */

export default function SubjectPage() {
    const router = useRouter();
    const params = useParams();

    const supabase = useMemo(() => createClient(), []);

    const subjectId =
        typeof params?.id === "string"
            ? params.id
            : Array.isArray(params?.id)
                ? params.id[0]
                : "";

    const [subject, setSubject] = useState<SubjectRow | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");

    const [mobileMenu, setMobileMenu] = useState(false);

    /* =====================================================
       LOAD SUBJECT
    ===================================================== */

    useEffect(() => {
        if (!subjectId) {
            setLoading(false);
            return;
        }

        loadSubject();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectId]);

    async function loadSubject() {
        try {
            setLoading(true);
            setErrorMessage("");

            /* =================================================
               AUTH
            ================================================= */

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error("AUTH ERROR:", userError);
                throw new Error(userError.message);
            }

            if (!user) {
                router.replace("/login");
                return;
            }

            /* =================================================
               SUBJECT
            ================================================= */

            const {
                data: subjectData,
                error: subjectError,
            } = await supabase
                .from("subjects")
                .select(
                    `
                    id,
                    name,
                    code,
                    semester,
                    description,
                    image_url
                    `
                )
                .eq("id", subjectId)
                .single();

            if (subjectError) {
                console.error("SUBJECT ERROR:", subjectError);
                throw new Error(subjectError.message);
            }

            /* =================================================
               LESSONS
            ================================================= */

            const {
                data: lessonData,
                error: lessonError,
            } = await supabase
                .from("lessons")
                .select(
                    `
                    id,
                    subject_id,
                    title,
                    slug,
                    thumbnail_url,
                    duration_minutes,
                    difficulty,
                    lesson_order,
                    is_published
                    `
                )
                .eq("subject_id", subjectId)
                .eq("is_published", true)
                .order("lesson_order", {
                    ascending: true,
                    nullsFirst: false,
                });

            if (lessonError) {
                console.error("LESSONS ERROR:", lessonError);
                throw new Error(lessonError.message);
            }

            /* =================================================
               PROGRESS

               IMPORTANT:
               We use "progress", NOT "lesson_progress".
            ================================================= */

            const {
                data: progressData,
                error: progressError,
            } = await supabase
                .from("progress")
                .select(
                    `
                    lesson_id,
                    completed
                    `
                )
                .eq("user_id", user.id);

            if (progressError) {
                console.error("PROGRESS ERROR:", progressError);
                throw new Error(progressError.message);
            }

            /* =================================================
               COMPLETED LESSON IDS
            ================================================= */

            const completedLessonIds = new Set<string>();

            (progressData ?? []).forEach(
                (row: ProgressRow) => {
                    if (
                        row.lesson_id &&
                        row.completed === true
                    ) {
                        completedLessonIds.add(
                            String(row.lesson_id)
                        );
                    }
                }
            );

            /* =================================================
               BUILD LESSONS
            ================================================= */

            const finalLessons: Lesson[] = (
                (lessonData ?? []) as LessonRow[]
            ).map((lesson, index) => {
                const lessonId = String(lesson.id);

                return {
                    id: lessonId,

                    title:
                        lesson.title?.trim() ||
                        `Lesson ${index + 1}`,

                    slug:
                        lesson.slug?.trim() ||
                        lessonId,

                    thumbnail:
                        lesson.thumbnail_url?.trim() ||
                        fallbackImages[
                        index % fallbackImages.length
                        ],

                    duration:
                        lesson.duration_minutes ?? 0,

                    difficulty:
                        lesson.difficulty?.trim() ||
                        "Beginner",

                    order:
                        lesson.lesson_order ??
                        index + 1,

                    completed:
                        completedLessonIds.has(
                            lessonId
                        ),
                };
            });

            /* =================================================
               SET STATE
            ================================================= */

            setSubject(subjectData as SubjectRow);
            setLessons(finalLessons);

        } catch (error) {
            console.error(
                "LOAD SUBJECT ERROR:",
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to load subject."
            );

        } finally {
            setLoading(false);
        }
    }

    /* =====================================================
       FILTERED LESSONS
    ===================================================== */

    const filteredLessons = useMemo(() => {
        const query = search
            .toLowerCase()
            .trim();

        return lessons.filter((lesson) => {
            const matchesSearch =
                !query ||
                lesson.title
                    .toLowerCase()
                    .includes(query) ||
                lesson.difficulty
                    .toLowerCase()
                    .includes(query);

            const matchesFilter =
                filter === "all" ||
                (filter === "completed" &&
                    lesson.completed) ||
                (filter === "remaining" &&
                    !lesson.completed);

            return (
                matchesSearch &&
                matchesFilter
            );
        });
    }, [lessons, search, filter]);

    /* =====================================================
       STATS
    ===================================================== */

    const totalLessons = lessons.length;

    const completedLessons = lessons.filter(
        (lesson) => lesson.completed
    ).length;

    const remainingLessons =
        Math.max(
            totalLessons - completedLessons,
            0
        );

    const progress =
        totalLessons > 0
            ? Math.round(
                (completedLessons /
                    totalLessons) *
                100
            )
            : 0;

    const totalMinutes = lessons.reduce(
        (total, lesson) =>
            total + lesson.duration,
        0
    );

    /* =====================================================
       CURRENT LESSON
    ===================================================== */

    const currentLesson =
        lessons.find(
            (lesson) => !lesson.completed
        ) || lessons[0];

    /* =====================================================
       NAVIGATION
    ===================================================== */

    function goTo(path: string) {
        setMobileMenu(false);
        router.push(path);
    }

    function openLesson(
        lessonId: string
    ) {
        goTo(
            `/subjects/${subjectId}/lesson/${lessonId}`
        );
    }

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return <LoadingPage />;
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (errorMessage) {
        return (
            <ErrorPage
                message={errorMessage}
                onBack={() => router.back()}
                onRetry={loadSubject}
            />
        );
    }

    /* =====================================================
       NOT FOUND
    ===================================================== */

    if (!subject) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#030305] px-5 text-white">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                        <BookOpen size={25} />
                    </div>

                    <h1 className="mt-6 text-2xl font-black">
                        Subject not found
                    </h1>

                    <p className="mt-2 text-sm text-zinc-600">
                        This subject does not exist.
                    </p>

                    <button
                        onClick={() =>
                            router.push(
                                "/subjects"
                            )
                        }
                        className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3 text-xs font-black transition hover:from-purple-500 hover:to-violet-500"
                    >
                        Back to Subjects
                    </button>
                </div>
            </main>
        );
    }

    /* =====================================================
       MAIN
    ===================================================== */

    return (
        <main className="min-h-screen overflow-hidden bg-[#030305] text-white">

            {/* =================================================
                BACKGROUND EFFECTS
            ================================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-[-180px] top-[5%] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]"
                />

                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 70, 0],
                        scale: [1.1, 1, 1.1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute right-[-180px] top-[30%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]"
                />

                <motion.div
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute left-[45%] top-[45%] h-[300px] w-[300px] rounded-full bg-fuchsia-600/5 blur-[120px]"
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_75%)]" />
            </div>

            <div className="relative flex min-h-screen">

                {/* =================================================
                    DESKTOP SIDEBAR
                ================================================= */}

                <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.06] bg-[#050507] lg:block">

                    <div className="sticky top-0 flex h-screen flex-col">

                        <div className="px-6 py-7">
                            <Logo />
                        </div>

                        <div className="flex-1 px-4">
                            <Navigation goTo={goTo} />
                        </div>

                        <div className="border-t border-white/[0.06] p-4">
                            <StudentProfile />
                        </div>

                    </div>
                </aside>

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
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                onClick={() =>
                                    setMobileMenu(
                                        false
                                    )
                                }
                            />

                            <motion.aside
                                initial={{
                                    x: -320,
                                }}
                                animate={{
                                    x: 0,
                                }}
                                exit={{
                                    x: -320,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                className="relative h-full w-[290px] border-r border-white/10 bg-[#060609] p-5"
                            >
                                <div className="mb-10 flex items-center justify-between">

                                    <Logo />

                                    <button
                                        onClick={() =>
                                            setMobileMenu(
                                                false
                                            )
                                        }
                                        className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:text-white"
                                    >
                                        <X size={18} />
                                    </button>

                                </div>

                                <Navigation
                                    goTo={goTo}
                                />

                                <div className="absolute bottom-5 left-5 right-5">
                                    <StudentProfile />
                                </div>

                            </motion.aside>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* =================================================
                    MAIN AREA
                ================================================= */}

                <div className="min-w-0 flex-1">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/80 backdrop-blur-2xl">

                        <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">

                            <div className="flex min-w-0 items-center gap-4">

                                <button
                                    onClick={() =>
                                        setMobileMenu(
                                            true
                                        )
                                    }
                                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 transition hover:border-purple-500/30 hover:text-white lg:hidden"
                                >
                                    <span className="text-lg leading-none">
                                        ☰
                                    </span>
                                </button>

                                <div className="min-w-0">

                                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                                        Railway Academy
                                    </p>

                                    <h1 className="mt-1 truncate text-sm font-bold md:text-base">
                                        {subject.name}
                                    </h1>

                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3">

                                <button
                                    onClick={() =>
                                        goTo("/ai")
                                    }
                                    className="hidden rounded-xl border border-purple-500/10 bg-purple-500/[0.04] p-3 text-purple-400 transition hover:border-purple-500/30 hover:bg-purple-500/10 sm:block"
                                >
                                    <BrainCircuit
                                        size={17}
                                    />
                                </button>

                                <button
                                    onClick={() =>
                                        goTo(
                                            "/subjects"
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[9px] font-bold text-zinc-500 transition hover:border-white/10 hover:text-white"
                                >
                                    <ArrowLeft size={13} />

                                    <span className="hidden sm:block">
                                        Subjects
                                    </span>
                                </button>

                            </div>
                        </div>
                    </header>

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">

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
                            className="group relative mb-8 min-h-[430px] overflow-hidden rounded-[32px] border border-purple-500/15 bg-[#08070d] shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
                        >

                            {/* IMAGE */}

                            {subject.image_url ? (
                                <img
                                    src={
                                        subject.image_url
                                    }
                                    alt={
                                        subject.name ||
                                        "Subject"
                                    }
                                    className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-[2000ms] group-hover:scale-105 group-hover:opacity-45"
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-[#08070d] to-black opacity-70" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/90 to-[#030305]/35" />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent" />

                            <div className="absolute right-[-100px] top-[-100px] h-[380px] w-[380px] rounded-full bg-purple-600/20 blur-[110px]" />

                            <div className="absolute bottom-[-150px] left-[25%] h-[300px] w-[300px] rounded-full bg-fuchsia-600/10 blur-[100px]" />

                            {/* CONTENT */}

                            <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-6 md:p-10 xl:p-12">

                                <div>

                                    {/* BADGES */}

                                    <div className="flex flex-wrap items-center gap-2">

                                        {subject.code && (
                                            <span className="rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-purple-300 backdrop-blur-md">
                                                {subject.code}
                                            </span>
                                        )}

                                        {subject.semester && (
                                            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[8px] font-bold text-zinc-400 backdrop-blur-md">
                                                Semester{" "}
                                                {
                                                    subject.semester
                                                }
                                            </span>
                                        )}

                                        <span className="rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1.5 text-[8px] font-bold text-green-400 backdrop-blur-md">
                                            Active Course
                                        </span>

                                    </div>

                                    {/* TITLE */}

                                    <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] md:text-6xl xl:text-7xl">
                                        {subject.name}
                                    </h2>

                                    {/* DESCRIPTION */}

                                    <p className="mt-5 max-w-2xl text-xs leading-7 text-zinc-400 md:text-sm">
                                        {subject.description ||
                                            "Explore this subject, study every lesson and build your knowledge step by step."}
                                    </p>

                                    {/* QUICK INFO */}

                                    <div className="mt-7 flex flex-wrap gap-3">

                                        <HeroInfo
                                            icon={
                                                <BookOpen
                                                    size={14}
                                                />
                                            }
                                            value={`${totalLessons}`}
                                            label="Lessons"
                                        />

                                        <HeroInfo
                                            icon={
                                                <Clock3
                                                    size={14}
                                                />
                                            }
                                            value={`${totalMinutes}m`}
                                            label="Study time"
                                        />

                                        <HeroInfo
                                            icon={
                                                <CircleCheck
                                                    size={14}
                                                />
                                            }
                                            value={`${completedLessons}`}
                                            label="Completed"
                                        />

                                    </div>

                                </div>

                                {/* PROGRESS */}

                                <div className="mt-10 max-w-[750px]">

                                    <div className="flex items-end justify-between">

                                        <div>

                                            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                                                Course Progress
                                            </p>

                                            <div className="mt-1 flex items-baseline gap-2">

                                                <motion.span
                                                    key={progress}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="text-5xl font-black tracking-tight"
                                                >
                                                    {progress}%
                                                </motion.span>

                                                <span className="text-[9px] text-zinc-600">
                                                    completed
                                                </span>

                                            </div>

                                        </div>

                                        <p className="text-[9px] font-semibold text-zinc-600">
                                            {completedLessons} / {totalLessons} lessons
                                        </p>

                                    </div>

                                    {/* PROGRESS BAR */}

                                    <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">

                                        <motion.div
                                            initial={{
                                                width: 0,
                                            }}
                                            animate={{
                                                width: `${progress}%`,
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                ease: "easeOut",
                                            }}
                                            className="relative h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                                        >
                                            <div className="absolute right-0 top-0 h-full w-16 bg-white/20 blur-md" />
                                        </motion.div>

                                    </div>

                                    {/* CONTINUE */}

                                    {currentLesson && (
                                        <motion.button
                                            whileHover={{
                                                y: -2,
                                            }}
                                            whileTap={{
                                                scale: 0.98,
                                            }}
                                            onClick={() =>
                                                openLesson(
                                                    currentLesson.id
                                                )
                                            }
                                            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3.5 text-[9px] font-black shadow-[0_15px_45px_rgba(124,58,237,0.25)] transition hover:from-purple-500 hover:to-violet-500"
                                        >

                                            <Play
                                                size={12}
                                                fill="currentColor"
                                            />

                                            {progress === 0
                                                ? "Start Learning"
                                                : progress === 100
                                                    ? "Review Course"
                                                    : "Continue Learning"}

                                            <ArrowRight
                                                size={13}
                                            />

                                        </motion.button>
                                    )}

                                </div>
                            </div>
                        </motion.section>

                        {/* =================================================
                            STATS
                        ================================================= */}

                        <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">

                            <MiniStat
                                icon={
                                    <BookOpen
                                        size={17}
                                    />
                                }
                                value={String(
                                    totalLessons
                                )}
                                label="Lessons"
                            />

                            <MiniStat
                                icon={
                                    <CircleCheck
                                        size={17}
                                    />
                                }
                                value={String(
                                    completedLessons
                                )}
                                label="Completed"
                            />

                            <MiniStat
                                icon={
                                    <Target
                                        size={17}
                                    />
                                }
                                value={String(
                                    remainingLessons
                                )}
                                label="Remaining"
                            />

                            <MiniStat
                                icon={
                                    <Clock3
                                        size={17}
                                    />
                                }
                                value={`${totalMinutes}m`}
                                label="Study Time"
                            />

                        </section>

                        {/* =================================================
                            LESSONS
                        ================================================= */}

                        <section>

                            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                                <div>

                                    <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                                        Course Content
                                    </p>

                                    <h3 className="mt-2 text-3xl font-black tracking-tight">
                                        Lessons
                                    </h3>

                                    <p className="mt-2 text-xs text-zinc-600">
                                        Continue where you stopped and complete the course.
                                    </p>

                                </div>

                                <div className="flex flex-col gap-3 md:flex-row">

                                    {/* SEARCH */}

                                    <div className="relative">

                                        <Search
                                            size={15}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
                                        />

                                        <input
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Search lessons..."
                                            className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#07080d] pl-10 pr-9 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40 focus:bg-[#090a10] md:w-[250px]"
                                        />

                                        {search && (
                                            <button
                                                onClick={() =>
                                                    setSearch("")
                                                }
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-white"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}

                                    </div>

                                    {/* FILTER */}

                                    <div className="flex rounded-xl border border-white/[0.07] bg-[#07080d] p-1">

                                        <FilterButton
                                            active={
                                                filter === "all"
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
                                                filter === "remaining"
                                            }
                                            onClick={() =>
                                                setFilter(
                                                    "remaining"
                                                )
                                            }
                                        >
                                            Remaining
                                        </FilterButton>

                                        <FilterButton
                                            active={
                                                filter === "completed"
                                            }
                                            onClick={() =>
                                                setFilter(
                                                    "completed"
                                                )
                                            }
                                        >
                                            Done
                                        </FilterButton>

                                    </div>

                                </div>
                            </div>

                            {/* LESSONS */}

                            {filteredLessons.length === 0 ? (
                                <EmptyLessons
                                    clear={() => {
                                        setSearch("");
                                        setFilter("all");
                                    }}
                                />
                            ) : (
                                <motion.div
                                    layout
                                    className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                                >
                                    <AnimatePresence mode="popLayout">

                                        {filteredLessons.map(
                                            (
                                                lesson,
                                                index
                                            ) => (
                                                <motion.div
                                                    key={
                                                        lesson.id
                                                    }
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        y: 25,
                                                        scale: 0.97,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.95,
                                                    }}
                                                    transition={{
                                                        duration:
                                                            0.4,
                                                        delay:
                                                            index *
                                                            0.04,
                                                    }}
                                                >
                                                    <LessonCard
                                                        lesson={
                                                            lesson
                                                        }
                                                        onClick={() =>
                                                            openLesson(
                                                                lesson.id
                                                            )
                                                        }
                                                    />
                                                </motion.div>
                                            )
                                        )}

                                    </AnimatePresence>
                                </motion.div>
                            )}

                        </section>

                        {/* =================================================
                            AI CTA
                        ================================================= */}

                        <motion.section
                            initial={{
                                opacity: 0,
                                y: 25,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                                margin: "-80px",
                            }}
                            className="relative mt-12 overflow-hidden rounded-[30px] border border-purple-500/15 bg-gradient-to-br from-[#160b22] via-[#09080e] to-[#050507] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.25)] md:p-10"
                        >

                            <div className="pointer-events-none absolute right-[-100px] top-[-150px] h-[350px] w-[350px] rounded-full bg-purple-600/15 blur-[110px]" />

                            <div className="pointer-events-none absolute bottom-[-120px] left-[25%] h-[250px] w-[250px] rounded-full bg-violet-600/10 blur-[100px]" />

                            <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">

                                <div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/10 bg-purple-500/10 text-purple-400">
                                            <BrainCircuit
                                                size={21}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400">
                                                AI Tutor
                                            </p>

                                            <p className="mt-1 text-[8px] text-zinc-600">
                                                RailLearn Intelligence
                                            </p>
                                        </div>

                                    </div>

                                    <h3 className="mt-6 text-2xl font-black tracking-tight md:text-3xl">
                                        Need help with{" "}
                                        {subject.name}?
                                    </h3>

                                    <p className="mt-3 max-w-xl text-xs leading-6 text-zinc-500">
                                        Ask your AI Tutor to explain a topic, generate practice questions, or help you understand your lessons.
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        goTo("/ai")
                                    }
                                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3.5 text-[9px] font-black shadow-[0_15px_50px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500"
                                >
                                    <BrainCircuit size={14} />
                                    Open AI Tutor
                                    <ArrowRight size={13} />
                                </button>

                            </div>
                        </motion.section>

                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="py-10 text-center">
                            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-800">
                                RailLearn • Railway Academy
                            </p>
                        </div>

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
    const router = useRouter();

    return (
        <motion.button
            whileHover={{
                x: 2,
            }}
            onClick={() =>
                router.push("/dashboard")
            }
            className="group text-left"
        >
            <div className="flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-800 shadow-[0_8px_25px_rgba(124,58,237,0.25)]">
                    <TrainFront
                        size={17}
                        className="text-white"
                    />
                </div>

                <div>

                    <p className="text-sm font-black tracking-tight">
                        RailLearn
                    </p>

                    <p className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                        Railway Academy
                    </p>

                </div>

            </div>
        </motion.button>
    );
}

/* =====================================================
   NAVIGATION
===================================================== */

function Navigation({
    goTo,
}: {
    goTo: (path: string) => void;
}) {
    return (
        <nav className="space-y-1">

            <NavItem
                icon={
                    <BarChart3 size={17} />
                }
                label="Dashboard"
                onClick={() =>
                    goTo("/dashboard")
                }
            />

            <NavItem
                icon={
                    <GraduationCap size={17} />
                }
                label="My Journey"
                onClick={() =>
                    goTo("/journey")
                }
            />

            <NavItem
                icon={
                    <BookOpen size={17} />
                }
                label="Subjects"
                active
                onClick={() =>
                    goTo("/subjects")
                }
            />

            <NavItem
                icon={
                    <BrainCircuit size={17} />
                }
                label="AI Tutor"
                onClick={() =>
                    goTo("/ai")
                }
            />

            <NavItem
                icon={
                    <Target size={17} />
                }
                label="Quizzes"
                onClick={() =>
                    goTo("/quizzes")
                }
            />

            <NavItem
                icon={
                    <Zap size={17} />
                }
                label="Achievements"
                onClick={() =>
                    goTo("/achievements")
                }
            />

            <NavItem
                icon={
                    <TrainFront size={17} />
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
            whileHover={{
                x: active ? 0 : 3,
            }}
            whileTap={{
                scale: 0.98,
            }}
            onClick={onClick}
            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${active
                    ? "bg-purple-500/10 text-purple-300"
                    : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-300"
                }`}
        >
            {active && (
                <motion.div
                    layoutId="active-nav"
                    className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-purple-500"
                />
            )}

            <span
                className={
                    active
                        ? "text-purple-400"
                        : "text-zinc-600 transition group-hover:text-zinc-300"
                }
            >
                {icon}
            </span>

            {label}
        </motion.button>
    );
}

/* =====================================================
   STUDENT PROFILE
===================================================== */

function StudentProfile() {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">

            <div className="flex items-center gap-3">

                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-800 text-sm font-black shadow-[0_8px_25px_rgba(124,58,237,0.2)]">

                    A

                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#060609] bg-green-400" />

                </div>

                <div className="min-w-0">

                    <p className="truncate text-xs font-bold">
                        Railway Student
                    </p>

                    <p className="mt-1 text-[9px] text-purple-400">
                        RailLearn
                    </p>

                </div>

            </div>

        </div>
    );
}

/* =====================================================
   HERO INFO
===================================================== */

function HeroInfo({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 backdrop-blur-md">

            <span className="text-purple-400">
                {icon}
            </span>

            <div>

                <p className="text-[10px] font-black text-white">
                    {value}
                </p>

                <p className="text-[7px] uppercase tracking-wider text-zinc-600">
                    {label}
                </p>

            </div>

        </div>
    );
}

/* =====================================================
   MINI STAT
===================================================== */

function MiniStat({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <motion.div
            whileHover={{
                y: -5,
            }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07080d] p-5 transition hover:border-purple-500/20 hover:bg-[#090a10]"
        >

            <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-purple-600/5 blur-2xl transition group-hover:bg-purple-600/10" />

            <div className="relative flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    {icon}
                </div>

                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                    {label}
                </span>

            </div>

            <p className="relative mt-4 text-2xl font-black">
                {value}
            </p>

        </motion.div>
    );
}

/* =====================================================
   FILTER BUTTON
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
        <motion.button
            whileTap={{
                scale: 0.95,
            }}
            onClick={onClick}
            className={`rounded-lg px-3.5 py-2.5 text-[9px] font-bold transition ${active
                    ? "bg-purple-500/10 text-purple-300"
                    : "text-zinc-600 hover:text-zinc-300"
                }`}
        >
            {children}
        </motion.button>
    );
}

/* =====================================================
   LESSON CARD
===================================================== */

function LessonCard({
    lesson,
    onClick,
}: {
    lesson: Lesson;
    onClick: () => void;
}) {
    const difficultyClass =
        lesson.difficulty
            .toLowerCase()
            .includes("hard")
            ? "text-red-400 bg-red-500/10 border-red-500/15"
            : lesson.difficulty
                .toLowerCase()
                .includes("easy")
                ? "text-green-400 bg-green-500/10 border-green-500/15"
                : "text-amber-400 bg-amber-500/10 border-amber-500/15";

    return (
        <motion.button
            onClick={onClick}
            whileHover={{
                y: -8,
            }}
            whileTap={{
                scale: 0.985,
            }}
            className={`group relative min-h-[325px] w-full overflow-hidden rounded-[27px] border text-left shadow-[0_15px_50px_rgba(0,0,0,0.2)] transition ${lesson.completed
                    ? "border-green-500/20 bg-[#070c0a] hover:border-green-400/30 hover:shadow-[0_30px_90px_rgba(34,197,94,0.08)]"
                    : "border-white/[0.07] bg-[#07080d] hover:border-purple-500/30 hover:shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                }`}
        >

            {/* IMAGE */}

            <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className={`absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-110 ${lesson.completed
                        ? "opacity-20 group-hover:opacity-30"
                        : "opacity-25 group-hover:opacity-40"
                    }`}
                onError={(e) => {
                    e.currentTarget.style.display =
                        "none";
                }}
            />

            {/* OVERLAY */}

            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/85 to-[#030305]/20" />

            {/* COMPLETED GREEN GLOW */}

            {lesson.completed && (
                <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-green-500/15 blur-[70px]" />
            )}

            {/* NORMAL PURPLE GLOW */}

            {!lesson.completed && (
                <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-purple-600/0 blur-[70px] transition duration-700 group-hover:bg-purple-600/20" />
            )}

            {/* CONTENT */}

            <div className="relative z-10 flex min-h-[325px] flex-col justify-between p-5">

                {/* TOP */}

                <div className="flex items-start justify-between">

                    {/* PLAY / CHECK */}

                    <motion.div
                        whileHover={{
                            rotate: lesson.completed
                                ? 0
                                : 5,
                        }}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md transition ${lesson.completed
                                ? "border-green-400/30 bg-green-500/15 text-green-400"
                                : "border-white/10 bg-black/50 text-purple-400 group-hover:border-purple-400/30 group-hover:bg-purple-500/10 group-hover:text-purple-300"
                            }`}
                    >
                        {lesson.completed ? (
                            <Check
                                size={21}
                                strokeWidth={3}
                            />
                        ) : (
                            <Play
                                size={18}
                                fill="currentColor"
                            />
                        )}
                    </motion.div>

                    {/* STATUS */}

                    {lesson.completed ? (
                        <motion.span
                            initial={{
                                scale: 0.8,
                                opacity: 0,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.15em] text-green-400 backdrop-blur-md"
                        >
                            <Check size={10} strokeWidth={3} />
                            Completed
                        </motion.span>
                    ) : (
                        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.15em] text-purple-300 backdrop-blur-md">
                            Lesson {lesson.order}
                        </span>
                    )}

                </div>

                {/* BOTTOM */}

                <div>

                    {/* META */}

                    <div className="mb-4 flex flex-wrap items-center gap-2">

                        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1.5 text-[7px] font-bold text-zinc-500 backdrop-blur-md">
                            <Clock3 size={10} />
                            {lesson.duration} min
                        </span>

                        <span
                            className={`rounded-full border px-2.5 py-1.5 text-[7px] font-bold ${difficultyClass}`}
                        >
                            {lesson.difficulty}
                        </span>

                    </div>

                    {/* TITLE */}

                    <h4 className="line-clamp-2 text-xl font-black leading-tight tracking-tight transition group-hover:text-purple-100">
                        {lesson.title}
                    </h4>

                    {/* BOTTOM */}

                    <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">

                        <span className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-500 transition group-hover:text-zinc-300">

                            {lesson.completed ? (
                                <>
                                    <CircleCheck
                                        size={12}
                                        className="text-green-400"
                                    />
                                    Review Lesson
                                </>
                            ) : (
                                <>
                                    <Flame
                                        size={12}
                                        className="text-orange-400"
                                    />
                                    Start Lesson
                                </>
                            )}

                        </span>

                        <span
                            className={`flex items-center gap-1 text-[8px] font-black transition group-hover:gap-2 ${lesson.completed
                                    ? "text-green-400"
                                    : "text-purple-400"
                                }`}
                        >
                            {lesson.completed
                                ? "Completed"
                                : "Open"}

                            <ChevronRight
                                size={12}
                            />
                        </span>

                    </div>

                </div>
            </div>
        </motion.button>
    );
}

/* =====================================================
   EMPTY LESSONS
===================================================== */

function EmptyLessons({
    clear,
}: {
    clear: () => void;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-14 text-center"
        >

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <Search size={27} />
            </div>

            <h3 className="mt-5 text-xl font-black">
                No lessons found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-zinc-600">
                We couldn't find any lessons matching your current search or filter.
            </p>

            <button
                onClick={clear}
                className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-[9px] font-black transition hover:bg-purple-500"
            >
                Clear Filters
            </button>

        </motion.div>
    );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingPage() {
    return (
        <main className="min-h-screen bg-[#030305] text-white">

            <div className="flex min-h-screen">

                <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">

                    <div className="p-7">
                        <div className="h-9 w-32 animate-pulse rounded-xl bg-white/[0.06]" />
                    </div>

                    <div className="space-y-2 px-4">

                        {Array.from({
                            length: 7,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="h-11 animate-pulse rounded-xl bg-white/[0.03]"
                            />
                        ))}

                    </div>
                </aside>

                <div className="flex-1 p-5 md:p-10">

                    <div className="h-[430px] animate-pulse rounded-[32px] bg-[#07080d]" />

                    <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                        {Array.from({
                            length: 6,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[325px] animate-pulse rounded-[27px] bg-[#07080d]"
                            />
                        ))}

                    </div>
                </div>
            </div>
        </main>
    );
}

/* =====================================================
   ERROR
===================================================== */

function ErrorPage({
    message,
    onBack,
    onRetry,
}: {
    message: string;
    onBack: () => void;
    onRetry: () => void;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#030305] px-5 text-white">

            <div className="w-full max-w-md rounded-[30px] border border-red-500/20 bg-red-500/[0.04] p-8 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                    <X size={25} />
                </div>

                <h1 className="mt-6 text-xl font-black">
                    Could not load subject
                </h1>

                <p className="mt-3 text-xs leading-6 text-zinc-500">
                    {message}
                </p>

                <div className="mt-7 flex justify-center gap-3">

                    <button
                        onClick={onBack}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold text-zinc-400 transition hover:text-white"
                    >
                        Go Back
                    </button>

                    <button
                        onClick={onRetry}
                        className="rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
                    >
                        Try Again
                    </button>

                </div>
            </div>
        </main>
    );
}