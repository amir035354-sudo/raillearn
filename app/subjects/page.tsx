"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  GraduationCap,
  Search,
  Settings,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  X,
  Zap,
  Clock3,
  Flame,
  CircleCheck,
  Map as MapIcon,
  Menu,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

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
};

type ProgressRow = {
  lesson_id: string | null;
  completed: boolean | null;
};

type Subject = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  icon: ElementType;
  image: string;
  href: string;
};

type FilterType = "all" | "active";

/* =====================================================
   ICONS
===================================================== */

const subjectIcons: ElementType[] = [
  TrainFront,
  GraduationCap,
  Settings,
  Zap,
  Target,
  BookOpen,
];

/* =====================================================
   FALLBACK IMAGES
===================================================== */

const fallbackImages = [
  "/images/train-hero.jpg",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
];

/* =====================================================
   PAGE
===================================================== */

export default function SubjectsPage() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [mobileMenu, setMobileMenu] =
    useState(false);

  /* ===================================================
     LOAD
  =================================================== */

  useEffect(() => {
    void loadSubjects();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      setErrorMessage("");

      /* ===============================================
         USER
      =============================================== */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "AUTH ERROR:",
          userError
        );

        throw new Error(
          "Unable to load user."
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /* ===============================================
         SUBJECTS
      =============================================== */

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
        .order("semester", {
          ascending: true,
          nullsFirst: false,
        })
        .order("name", {
          ascending: true,
        });

      if (subjectError) {
        console.error(
          "SUBJECTS ERROR:",
          subjectError
        );

        throw new Error(
          subjectError.message
        );
      }

      /* ===============================================
         LESSONS
      =============================================== */

      const {
        data: lessonData,
        error: lessonError,
      } = await supabase
        .from("lessons")
        .select(
          "id, subject_id"
        )
        .order(
          "lesson_order",
          {
            ascending: true,
            nullsFirst: false,
          }
        );

      if (lessonError) {
        console.error(
          "LESSONS ERROR:",
          lessonError
        );

        throw new Error(
          lessonError.message
        );
      }

      /* ===============================================
         NEW PROGRESS
      =============================================== */

      const {
        data: lessonProgressData,
        error: lessonProgressError,
      } = await supabase
        .from("lesson_progress")
        .select(
          "lesson_id, completed"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "completed",
          true
        );

      if (lessonProgressError) {
        console.warn(
          "LESSON PROGRESS ERROR:",
          lessonProgressError
        );
      }

      /* ===============================================
         LEGACY PROGRESS
      =============================================== */

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from("progress")
        .select(
          "lesson_id, completed"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "completed",
          true
        );

      if (progressError) {
        console.warn(
          "PROGRESS ERROR:",
          progressError
        );
      }

      /* ===============================================
         TYPE DATA
      =============================================== */

      const subjectsFromDb =
        (subjectData ?? []) as SubjectRow[];

      const lessonsFromDb =
        (lessonData ?? []) as LessonRow[];

      const lessonProgressFromDb =
        (lessonProgressData ??
          []) as ProgressRow[];

      const legacyProgressFromDb =
        (progressData ??
          []) as ProgressRow[];

      /* ===============================================
         COMPLETED LESSONS
      =============================================== */

      const completedLessonIds =
        new Set<string>();

      for (
        const item of lessonProgressFromDb
      ) {
        if (
          item.completed === true &&
          item.lesson_id
        ) {
          completedLessonIds.add(
            String(item.lesson_id)
          );
        }
      }

      for (
        const item of legacyProgressFromDb
      ) {
        if (
          item.completed === true &&
          item.lesson_id
        ) {
          completedLessonIds.add(
            String(item.lesson_id)
          );
        }
      }

      /* ===============================================
         GROUP LESSONS BY SUBJECT
         
         IMPORTANT:
         Native JavaScript Map is being used here.
         The Lucide Map icon is imported as MapIcon.
      =============================================== */

      const lessonsBySubject =
        new Map<
          string,
          LessonRow[]
        >();

      for (
        const lesson of lessonsFromDb
      ) {
        if (!lesson.subject_id) {
          continue;
        }

        const subjectId =
          String(
            lesson.subject_id
          );

        const current: LessonRow[] =
          lessonsBySubject.get(
            subjectId
          ) ?? [];

        current.push(
          lesson
        );

        lessonsBySubject.set(
          subjectId,
          current
        );
      }

      /* ===============================================
         BUILD SUBJECTS
      =============================================== */

      const realSubjects: Subject[] =
        subjectsFromDb.map(
          (
            subject: SubjectRow,
            index: number
          ) => {
            const subjectLessons: LessonRow[] =
              lessonsBySubject.get(
                String(subject.id)
              ) ?? [];

            const totalLessons =
              subjectLessons.length;

            const completedLessons =
              subjectLessons.filter(
                (
                  lesson: LessonRow
                ) =>
                  completedLessonIds.has(
                    String(
                      lesson.id
                    )
                  )
              ).length;

            const progress =
              totalLessons > 0
                ? Math.round(
                  (completedLessons /
                    totalLessons) *
                  100
                )
                : 0;

            const shortName =
              subject.code?.trim() ||
              subject.name
                ?.trim()
                .split(/\s+/)[0] ||
              "SUBJECT";

            return {
              id: String(
                subject.id
              ),

              name:
                subject.name?.trim() ||
                "Unnamed Subject",

              shortName,

              description:
                subject.description?.trim() ||
                "Explore this subject and start building your knowledge.",

              progress,

              lessons:
                totalLessons,

              completedLessons,

              icon:
                subjectIcons[
                index %
                subjectIcons.length
                ],

              image:
                subject.image_url?.trim() ||
                fallbackImages[
                index %
                fallbackImages.length
                ],

              href:
                `/subjects/${encodeURIComponent(
                  String(subject.id)
                )}`,
            };
          }
        );

      setSubjects(
        realSubjects
      );
    } catch (error) {
      console.error(
        "LOAD SUBJECTS ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load subjects."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     FILTER
  =================================================== */

  const filteredSubjects =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return subjects.filter(
        (subject: Subject) => {
          const matchesSearch =
            !query ||
            subject.name
              .toLowerCase()
              .includes(query) ||
            subject.shortName
              .toLowerCase()
              .includes(query) ||
            subject.description
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            subject.progress < 100;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      subjects,
      search,
      filter,
    ]);

  /* ===================================================
     NAVIGATION
  =================================================== */

  function goTo(
    path: string
  ) {
    setMobileMenu(false);
    router.push(path);
  }

  /* ===================================================
     GLOBAL STATS
  =================================================== */

  const totalProgress =
    subjects.length > 0
      ? Math.round(
        subjects.reduce(
          (
            sum: number,
            subject: Subject
          ) =>
            sum +
            subject.progress,
          0
        ) /
        subjects.length
      )
      : 0;

  const totalLessons =
    subjects.reduce(
      (
        sum: number,
        subject: Subject
      ) =>
        sum +
        subject.lessons,
      0
    );

  const completedLessons =
    subjects.reduce(
      (
        sum: number,
        subject: Subject
      ) =>
        sum +
        subject.completedLessons,
      0
    );

  const completedSubjects =
    subjects.filter(
      (
        subject: Subject
      ) =>
        subject.lessons > 0 &&
        subject.progress ===
        100
    ).length;

  const currentSubject =
    subjects.find(
      (
        subject: Subject
      ) =>
        subject.lessons > 0 &&
        subject.progress > 0 &&
        subject.progress < 100
    ) ||
    subjects.find(
      (
        subject: Subject
      ) =>
        subject.lessons > 0
    ) ||
    subjects[0];

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  /* ===================================================
     MAIN
  =================================================== */

  return (
    <main className="relative z-10 min-h-screen overflow-hidden bg-[#030305] text-white">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">

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
            x: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-220px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-700/[0.07] blur-[150px]"
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
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
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
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 28,
                }}
                className="relative h-full w-[285px] border-r border-white/10 bg-[#060609] p-5 shadow-2xl"
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
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
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

            <div className="border-t border-white/[0.06] p-4">

              <motion.div
                whileHover={{
                  y: -3,
                }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition"
              >

                <div className="flex items-center gap-3">

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-800 text-sm font-black">
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

              </motion.div>

            </div>

          </div>

        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="min-w-0 flex-1">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="sticky top-0 z-[100] pointer-events-auto border-b border-white/[0.06] bg-[#030305]/75 backdrop-blur-2xl">

            <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">

              <div className="flex items-center gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenu(
                      true
                    )
                  }
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 transition hover:text-white lg:hidden"
                >
                  <Menu size={18} />
                </button>

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                    Railway Academy
                  </p>

                  <h1 className="mt-1 text-sm font-bold">
                    Subjects
                  </h1>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() =>
                    goTo("/ai")
                  }
                  className="hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-purple-400 transition hover:border-purple-500/30 sm:block"
                  title="Ask Miro"
                >
                  <BrainCircuit
                    size={17}
                  />
                </motion.button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="
  relative z-[999]
  pointer-events-auto
  touch-manipulation
  rounded-2xl
  bg-purple-600
  px-8 py-4
  text-white
  font-black
  "
                >
                  Open Dashboard
                </button>

              </div>

            </div>

          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">

            {/* =================================================
                HEADING
            ================================================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="mb-8"
            >

              <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />

                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
                      Your curriculum
                    </p>

                  </div>

                  <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                    My Subjects
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                    Explore your engineering
                    subjects, track your progress
                    and continue learning from where
                    you stopped.
                  </p>

                </div>

                {/* OVERALL */}

                <motion.div
                  whileHover={{
                    y: -4,
                  }}
                  className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-transparent p-4"
                >

                  <div className="absolute right-[-20px] top-[-20px] h-20 w-20 rounded-full bg-purple-500/10 blur-2xl" />

                  <div className="relative flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <TrendingUp
                        size={20}
                      />
                    </div>

                    <div>

                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                        Overall Progress
                      </p>

                      <p className="mt-1 text-xl font-black">
                        {totalProgress}%
                      </p>

                    </div>

                  </div>

                </motion.div>

              </div>

            </motion.section>

            {/* =================================================
                ERROR
            ================================================= */}

            <AnimatePresence>
              {errorMessage && (
                <motion.section
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="mb-8 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
                >

                  <p className="text-sm font-bold text-red-400">
                    Could not load subjects
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    {errorMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void loadSubjects()
                    }
                    className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
                  >
                    Try Again
                  </button>

                </motion.section>
              )}
            </AnimatePresence>

            {/* =================================================
                STATS
            ================================================= */}

            <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">

              <MiniStat
                icon={
                  <BookOpen
                    size={16}
                  />
                }
                value={String(
                  subjects.length
                )}
                label="Subjects"
              />

              <MiniStat
                icon={
                  <GraduationCap
                    size={16}
                  />
                }
                value={String(
                  totalLessons
                )}
                label="Total Lessons"
              />

              <MiniStat
                icon={
                  <CircleCheck
                    size={16}
                  />
                }
                value={String(
                  completedLessons
                )}
                label="Completed"
              />

              <MiniStat
                icon={
                  <Sparkles
                    size={16}
                  />
                }
                value={`${completedSubjects}/${subjects.length}`}
                label="Finished"
              />

            </section>

            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="mb-8">

              <div className="flex flex-col gap-3 lg:flex-row">

                <motion.div
                  layout
                  className="relative flex-1"
                >

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
                    placeholder="Search subjects..."
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#07080d] pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40 focus:bg-purple-500/[0.02]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}

                </motion.div>

                <div className="flex gap-2">

                  <FilterButton
                    active={
                      filter === "all"
                    }
                    onClick={() =>
                      setFilter("all")
                    }
                  >
                    All
                  </FilterButton>

                  <FilterButton
                    active={
                      filter === "active"
                    }
                    onClick={() =>
                      setFilter("active")
                    }
                  >
                    In Progress
                  </FilterButton>

                </div>

              </div>

            </section>

            {/* =================================================
                LOADING / CONTENT
            ================================================= */}

            {!loading ? (
              <>

                {/* =============================================
                    CONTINUE LEARNING
                ============================================= */}

                {!search &&
                  filter === "all" &&
                  currentSubject && (
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
                      className="mb-10"
                    >

                      <div className="mb-5">

                        <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                          Continue Learning
                        </p>

                        <h3 className="mt-2 text-2xl font-black">
                          Pick up where you left off
                        </h3>

                      </div>

                      <motion.button
                        type="button"
                        whileHover={{
                          scale: 1.005,
                        }}
                        whileTap={{
                          scale: 0.995,
                        }}
                        onClick={() =>
                          goTo(
                            currentSubject.href
                          )
                        }
                        className="group relative min-h-[300px] w-full cursor-pointer overflow-hidden rounded-[30px] border border-purple-500/20 bg-[#08070d] text-left shadow-[0_20px_80px_rgba(0,0,0,0.3)]"
                      >

                        <img
                          src={
                            currentSubject.image
                          }
                          alt={
                            currentSubject.name
                          }
                          className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-[1200ms] group-hover:scale-110 group-hover:opacity-50"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/80 to-[#030305]/30" />

                        <div className="absolute right-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[100px]" />

                        <div className="relative z-10 flex min-h-[300px] flex-col justify-between p-6 md:p-9">

                          <div className="flex items-start justify-between">

                            <div>

                              <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-purple-300">

                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />

                                Currently Learning

                              </span>

                              <h3 className="mt-5 text-3xl font-black md:text-4xl">
                                {
                                  currentSubject.name
                                }
                              </h3>

                              <p className="mt-3 max-w-xl text-xs leading-6 text-zinc-500">
                                {
                                  currentSubject.description
                                }
                              </p>

                            </div>

                            <div className="hidden rounded-2xl border border-purple-400/20 bg-black/30 p-3 text-purple-400 backdrop-blur-md md:block">

                              {(() => {
                                const Icon =
                                  currentSubject.icon;

                                return (
                                  <Icon
                                    size={
                                      24
                                    }
                                  />
                                );
                              })()}

                            </div>

                          </div>

                          <div className="mt-8 max-w-[650px]">

                            <div className="flex items-end justify-between">

                              <div>

                                <p className="text-4xl font-black">
                                  {
                                    currentSubject.progress
                                  }
                                  %
                                </p>

                                <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                                  Course Progress
                                </p>

                              </div>

                              <span className="text-[9px] text-zinc-600">
                                {
                                  currentSubject.completedLessons
                                }{" "}
                                /{" "}
                                {
                                  currentSubject.lessons
                                }{" "}
                                lessons
                              </span>

                            </div>

                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">

                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width: `${currentSubject.progress}%`,
                                }}
                                transition={{
                                  duration: 1,
                                  delay: 0.3,
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                              />

                            </div>

                            <div className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-[9px] font-black shadow-[0_10px_35px_rgba(124,58,237,0.2)] transition group-hover:-translate-y-0.5">

                              Continue Learning

                              <ArrowRight
                                size={13}
                              />

                            </div>

                          </div>

                        </div>

                      </motion.button>

                    </motion.section>
                  )}

                {/* =============================================
                    SUBJECTS
                ============================================= */}

                <section>

                  <div className="mb-5 flex items-end justify-between">

                    <div>

                      <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                        All Courses
                      </p>

                      <h3 className="mt-2 text-2xl font-black">
                        Engineering Curriculum
                      </h3>

                    </div>

                    <span className="text-[9px] text-zinc-700">
                      {
                        filteredSubjects.length
                      }{" "}
                      subjects
                    </span>

                  </div>

                  {filteredSubjects.length ===
                    0 ? (
                    <div className="rounded-[25px] border border-white/[0.07] bg-[#07080d] p-12 text-center">

                      <Search
                        size={30}
                        className="mx-auto text-zinc-700"
                      />

                      <h3 className="mt-4 text-lg font-black">
                        No subjects found
                      </h3>

                      <p className="mt-2 text-xs text-zinc-600">
                        There are no subjects matching
                        your search.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilter(
                            "all"
                          );
                        }}
                        className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black transition hover:bg-purple-500"
                      >
                        Clear Filters
                      </button>

                    </div>
                  ) : (
                    <motion.div
                      layout
                      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    >

                      <AnimatePresence mode="popLayout">

                        {filteredSubjects.map(
                          (
                            subject: Subject,
                            index: number
                          ) => (
                            <motion.div
                              layout
                              key={
                                subject.id
                              }
                              initial={{
                                opacity: 0,
                                y: 25,
                                scale: 0.96,
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
                                duration: 0.4,
                                delay:
                                  index *
                                  0.05,
                              }}
                            >

                              <SubjectCard
                                subject={
                                  subject
                                }
                                onClick={() =>
                                  goTo(
                                    subject.href
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

                {/* =============================================
                    AI CTA
                ============================================= */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="relative mt-10 overflow-hidden rounded-[30px] border border-purple-500/15 bg-gradient-to-br from-[#150b20] via-[#08080d] to-[#050507] p-6 md:p-9"
                >

                  <div className="pointer-events-none absolute right-[-80px] top-[-120px] h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />

                  <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">

                    <div>

                      <div className="flex items-center gap-3">

                        <motion.div
                          animate={{
                            rotate: [
                              0,
                              8,
                              -8,
                              0,
                            ],
                          }}
                          transition={{
                            duration: 4,
                            repeat:
                              Infinity,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400"
                        >
                          <BrainCircuit
                            size={19}
                          />
                        </motion.div>

                        <div>

                          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400">
                            AI Tutor
                          </p>

                          <p className="mt-1 text-[8px] text-zinc-600">
                            RailLearn Intelligence
                          </p>

                        </div>

                      </div>

                      <h3 className="mt-5 text-xl font-black md:text-2xl">
                        Not sure what to study?
                      </h3>

                      <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
                        Ask your AI Tutor to explain
                        a topic, generate practice
                        questions or help you decide
                        what to study next.
                      </p>

                    </div>

                    <motion.button
                      type="button"
                      whileHover={{
                        y: -3,
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() =>
                        goTo("/ai")
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3.5 text-[9px] font-black shadow-[0_15px_45px_rgba(124,58,237,0.2)]"
                    >

                      <Sparkles
                        size={13}
                      />

                      Open AI Tutor

                      <ArrowRight
                        size={13}
                      />

                    </motion.button>

                  </div>

                </motion.section>

              </>
            ) : null}

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
    <motion.button
      type="button"
      whileHover={{
        x: 2,
      }}
      onClick={() =>
        router.push(
          "/dashboard"
        )
      }
      className="text-left"
    >

      <p className="text-sm font-black tracking-tight">
        RailLearn
      </p>

      <p className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
        Railway Academy
      </p>

    </motion.button>
  );
}

/* =====================================================
   NAVIGATION
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
          <TrendingUp size={17} />
        }
        label="Dashboard"
        onClick={() =>
          goTo(
            "/dashboard"
          )
        }
      />

      <NavItem
        icon={
          <GraduationCap
            size={17}
          />
        }
        label="My Journey"
        onClick={() =>
          goTo(
            "/journey"
          )
        }
      />

      <NavItem
        icon={
          <BookOpen size={17} />
        }
        label="Subjects"
        active
        onClick={() =>
          goTo(
            "/subjects"
          )
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
          goTo(
            "/ai"
          )
        }
      />

      <NavItem
        icon={
          <Target size={17} />
        }
        label="Quizzes"
        onClick={() =>
          goTo(
            "/quizzes"
          )
        }
      />

      <NavItem
        icon={
          <Zap size={17} />
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
          goTo(
            "/progress"
          )
        }
      />

      <NavItem
        icon={
          <Settings size={17} />
        }
        label="Settings"
        onClick={() =>
          goTo(
            "/settings"
          )
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
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{
        x: active
          ? 0
          : 3,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${active
        ? "bg-purple-500/10 text-purple-300 shadow-[inset_2px_0_0_#a855f7]"
        : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-300"
        }`}
    >

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
   MINI STAT
===================================================== */

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07080d] p-4 transition hover:border-purple-500/20"
    >

      <div className="absolute right-[-25px] top-[-25px] h-20 w-20 rounded-full bg-purple-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />

      <div className="relative flex items-center gap-2 text-purple-400">

        {icon}

        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </span>

      </div>

      <p className="relative mt-3 text-xl font-black">
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
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{
        scale: 0.95,
      }}
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-[9px] font-bold transition ${active
        ? "border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.08)]"
        : "border-white/[0.07] bg-[#07080d] text-zinc-600 hover:border-white/10 hover:text-zinc-300"
        }`}
    >
      {children}
    </motion.button>
  );
}

/* =====================================================
   SUBJECT CARD
===================================================== */

function SubjectCard({
  subject,
  onClick,
}: {
  subject: Subject;
  onClick: () => void;
}) {
  const Icon =
    subject.icon;

  const completed =
    subject.progress === 100;

  const started =
    subject.progress > 0 &&
    subject.progress < 100;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -7,
      }}
      whileTap={{
        scale: 0.985,
      }}
      className="group relative min-h-[350px] w-full overflow-hidden rounded-[27px] border border-white/[0.07] bg-[#07080d] text-left shadow-[0_15px_50px_rgba(0,0,0,0.15)] transition duration-500 hover:border-purple-500/30 hover:shadow-[0_30px_90px_rgba(0,0,0,0.4)]"
    >

      {/* IMAGE */}

      <img
        src={
          subject.image
        }
        alt={
          subject.name
        }
        className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-1000 group-hover:scale-110 group-hover:opacity-45"
        onError={(
          event
        ) => {
          event.currentTarget.style.display =
            "none";
        }}
      />

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-[#030305]/10" />

      {/* HOVER GLOW */}

      <div className="absolute bottom-[-100px] left-1/2 h-[250px] w-[250px] -translate-x-1/2 rounded-full bg-purple-600/10 opacity-0 blur-[80px] transition duration-700 group-hover:opacity-100" />

      {/* CONTENT */}

      <div className="relative z-10 flex min-h-[350px] flex-col justify-between p-5">

        <div className="flex items-start justify-between">

          <motion.div
            whileHover={{
              rotate: 6,
              scale: 1.08,
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-purple-400 backdrop-blur-md transition group-hover:border-purple-400/30 group-hover:bg-purple-500/10"
          >
            <Icon size={19} />
          </motion.div>

          <div className="flex items-center gap-2">

            {completed && (
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.15em] text-green-400">
                Completed
              </span>
            )}

            {started && (
              <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.15em] text-purple-300">
                Active
              </span>
            )}

            <div className="rounded-xl border border-white/10 bg-black/30 p-2 backdrop-blur-md transition group-hover:border-purple-400/30 group-hover:bg-purple-500/10">

              <ChevronRight
                size={15}
                className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-purple-400"
              />

            </div>

          </div>

        </div>

        <div>

          <p className="mb-2 text-[7px] font-bold uppercase tracking-[0.2em] text-purple-400">
            {
              subject.shortName
            }
          </p>

          <h4 className="text-xl font-black leading-tight transition group-hover:text-purple-100">
            {subject.name}
          </h4>

          <p className="mt-3 line-clamp-3 text-[10px] leading-5 text-zinc-500">
            {
              subject.description
            }
          </p>

          {/* LESSON INFO */}

          <div className="mt-5 flex items-center justify-between text-[8px]">

            <span className="flex items-center gap-1.5 text-zinc-600">

              <BookOpen
                size={11}
              />

              {
                subject.completedLessons
              }{" "}
              /{" "}
              {
                subject.lessons
              }{" "}
              lessons

            </span>

            <span className="font-black text-purple-400">
              {
                subject.progress
              }%
            </span>

          </div>

          {/* PROGRESS */}

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${subject.progress}%`,
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
              }}
              className={`h-full rounded-full ${completed
                ? "bg-gradient-to-r from-green-600 to-emerald-400"
                : "bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                }`}
            />

          </div>

          {/* BOTTOM */}

          <div className="mt-5 flex items-center justify-between">

            <span className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-500 transition group-hover:text-zinc-300">

              {completed ? (
                <>
                  <Check
                    size={11}
                  />
                  Review Subject
                </>
              ) : started ? (
                <>
                  <Zap
                    size={11}
                  />
                  Continue Learning
                </>
              ) : (
                <>
                  <Flame
                    size={11}
                  />
                  Start Learning
                </>
              )}

            </span>

            <span className="flex items-center gap-1 text-[8px] font-black text-purple-400">

              Open

              <ArrowRight
                size={11}
              />

            </span>

          </div>

        </div>

      </div>

    </motion.button>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingPage() {
  return (
    <main className="min-h-screen bg-[#030305] text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">

        <div className="absolute left-[-180px] top-[-100px] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]" />

        <div className="absolute right-[-180px] bottom-[-120px] h-[500px] w-[500px] rounded-full bg-fuchsia-700/[0.07] blur-[150px]" />

      </div>

      <div className="relative flex min-h-screen">

        <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">

          <div className="p-7">

            <div className="h-9 w-32 animate-pulse rounded-xl bg-white/[0.06]" />

          </div>

          <div className="space-y-2 px-4">

            {Array.from({
              length: 8,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-11 animate-pulse rounded-xl bg-white/[0.03]"
                />
              )
            )}

          </div>

        </aside>

        <div className="min-w-0 flex-1 p-5 md:p-10">

          <div className="h-16 w-full animate-pulse rounded-2xl bg-white/[0.03]" />

          <div className="mt-8 h-[250px] animate-pulse rounded-[30px] bg-[#07080d]" />

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

            {Array.from({
              length: 4,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-24 animate-pulse rounded-2xl bg-[#07080d]"
                />
              )
            )}

          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {Array.from({
              length: 6,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-[350px] animate-pulse rounded-[27px] bg-[#07080d]"
                />
              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}