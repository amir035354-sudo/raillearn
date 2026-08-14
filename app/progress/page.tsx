"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Settings,
  Target,
  TrainFront,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
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
  title: string | null;
  lesson_order: number | null;
  duration_minutes: number | null;
  estimated_minutes?: number | null;
  is_published: boolean | null;
};

type LessonProgressRow = {
  lesson_id: string | null;
  completed: boolean | null;
  completed_at?: string | null;
  updated_at?: string | null;
};

type LegacyProgressRow = {
  lesson_id: string | null;
  completed: boolean | null;
};

type QuizRow = {
  id: string;
  subject_id: string | null;
  lesson_id: string | null;
  title: string | null;
  total_questions: number | null;
};

type QuizResultRow = {
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string | null;
};

type StudentStatsRow = {
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null;
};

type StudentProfileData = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

type SubjectProgress = {
  id: string;
  name: string;
  code: string;
  semester: number | null;
  description: string;
  image: string;

  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;
  progress: number;
  totalMinutes: number;

  totalQuizzes: number;
  completedQuizzes: number;
  quizAverage: number;
};

type GlobalStats = {
  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;

  totalMinutes: number;
  totalQuizzes: number;
  completedQuizzes: number;

  quizAverage: number;

  xp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
};

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

export default function ProgressPage() {
  const router = useRouter();
  const supabase = createClient();

  const [subjects, setSubjects] =
    useState<SubjectProgress[]>([]);

  const [studentProfile, setStudentProfile] =
    useState<StudentProfileData>({
      name: "Railway Student",
      email: "",
      avatarUrl: null,
    });

  const [globalStats, setGlobalStats] =
    useState<GlobalStats>({
      totalLessons: 0,
      completedLessons: 0,
      remainingLessons: 0,

      totalMinutes: 0,
      totalQuizzes: 0,
      completedQuizzes: 0,

      quizAverage: 0,

      xp: 0,
      level: 1,
      currentStreak: 0,
      bestStreak: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  /* =================================================
     LOAD
  ================================================= */

  useEffect(() => {
    void loadProgress();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProgress() {
    try {
      setLoading(true);
      setErrorMessage("");

      /* =================================================
         AUTH
      ================================================= */

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        console.error(
          "AUTH ERROR:",
          userError
        );

        throw new Error(
          userError.message
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /* =================================================
         PROFILE
      ================================================= */

      const {
        data: userRow,
        error: userRowError,
      } =
        await supabase
          .from("users")
          .select(`
            full_name,
            name,
            email,
            avatar_url
          `)
          .eq("id", user.id)
          .maybeSingle();

      if (userRowError) {
        console.warn(
          "PROFILE LOAD WARNING:",
          userRowError
        );
      }

      const metadata =
        user.user_metadata ?? {};

      setStudentProfile({
        name:
          userRow?.full_name?.trim() ||
          userRow?.name?.trim() ||
          metadata.full_name?.trim() ||
          metadata.name?.trim() ||
          "Railway Student",

        email:
          userRow?.email ||
          user.email ||
          "",

        avatarUrl:
          userRow?.avatar_url ||
          metadata.avatar_url ||
          metadata.picture ||
          null,
      });

      /* =================================================
         PARALLEL LOAD
      ================================================= */

      const [
        subjectsResponse,
        lessonsResponse,
        lessonProgressResponse,
        legacyProgressResponse,
        quizzesResponse,
        quizResultsResponse,
        statsResponse,
      ] = await Promise.all([
        supabase
          .from("subjects")
          .select(`
            id,
            name,
            code,
            semester,
            description,
            image_url
          `)
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("lessons")
          .select(`
            id,
            subject_id,
            title,
            lesson_order,
            duration_minutes,
            estimated_minutes,
            is_published
          `)
          .eq(
            "is_published",
            true
          )
          .order(
            "lesson_order",
            {
              ascending: true,
              nullsFirst: false,
            }
          ),

        supabase
          .from("lesson_progress")
          .select(`
            lesson_id,
            completed,
            completed_at,
            updated_at
          `)
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "completed",
            true
          ),

        supabase
          .from("progress")
          .select(`
            lesson_id,
            completed
          `)
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "completed",
            true
          ),

        supabase
          .from("quizzes")
          .select(`
            id,
            subject_id,
            lesson_id,
            title,
            total_questions
          `),

        supabase
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
          ),

        supabase
          .from("student_stats")
          .select(`
            user_id,
            xp,
            level,
            current_streak,
            best_streak,
            last_activity_date
          `)
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle(),
      ]);

      /* =================================================
         CHECK CRITICAL DATA
      ================================================= */

      if (
        subjectsResponse.error
      ) {
        throw new Error(
          subjectsResponse.error.message
        );
      }

      if (
        lessonsResponse.error
      ) {
        throw new Error(
          lessonsResponse.error.message
        );
      }

      /* =================================================
         DATA
      ================================================= */

      const subjectData =
        (subjectsResponse.data ?? []) as SubjectRow[];

      const lessonData =
        (lessonsResponse.data ?? []) as LessonRow[];

      const lessonProgressData =
        (lessonProgressResponse.data ?? []) as LessonProgressRow[];

      const legacyProgressData =
        (legacyProgressResponse.data ?? []) as LegacyProgressRow[];

      const quizData =
        (quizzesResponse.data ?? []) as QuizRow[];

      const quizResultsData =
        (quizResultsResponse.data ?? []) as QuizResultRow[];

      const statsData =
        statsResponse.data as
        | StudentStatsRow
        | null;

      /* =================================================
         COMPLETED LESSON IDS
      ================================================= */

      const completedLessonIds =
        new Set<string>();

      for (
        const row of lessonProgressData
      ) {
        if (
          row.completed === true &&
          row.lesson_id
        ) {
          completedLessonIds.add(
            String(row.lesson_id)
          );
        }
      }

      for (
        const row of legacyProgressData
      ) {
        if (
          row.completed === true &&
          row.lesson_id
        ) {
          completedLessonIds.add(
            String(row.lesson_id)
          );
        }
      }

      /* =================================================
         LATEST QUIZ RESULTS
      ================================================= */

      const latestQuizResults =
        new Map<
          string,
          QuizResultRow
        >();

      for (
        const result of quizResultsData
      ) {
        if (
          !latestQuizResults.has(
            String(result.quiz_id)
          )
        ) {
          latestQuizResults.set(
            String(result.quiz_id),
            result
          );
        }
      }

      /* =================================================
         SUBJECT PROGRESS
      ================================================= */

      const finalSubjects: SubjectProgress[] =
        subjectData.map(
          (
            subject,
            subjectIndex
          ) => {
            const subjectLessons =
              lessonData.filter(
                (lesson) =>
                  String(
                    lesson.subject_id
                  ) ===
                  String(subject.id)
              );

            const subjectQuizzes =
              quizData.filter(
                (quiz) =>
                  String(
                    quiz.subject_id
                  ) ===
                  String(subject.id)
              );

            const completedLessons =
              subjectLessons.filter(
                (lesson) =>
                  completedLessonIds.has(
                    String(lesson.id)
                  )
              );

            const completedQuizzes =
              subjectQuizzes.filter(
                (quiz) =>
                  latestQuizResults.has(
                    String(quiz.id)
                  )
              );

            const totalLessons =
              subjectLessons.length;

            const completedCount =
              completedLessons.length;

            const remainingCount =
              Math.max(
                totalLessons -
                completedCount,
                0
              );

            const percentage =
              totalLessons > 0
                ? Math.round(
                  (completedCount /
                    totalLessons) *
                  100
                )
                : 0;

            const totalMinutes =
              subjectLessons.reduce(
                (
                  sum,
                  lesson
                ) =>
                  sum +
                  Number(
                    lesson.duration_minutes ??
                    lesson.estimated_minutes ??
                    0
                  ),
                0
              );

            const subjectQuizScores =
              completedQuizzes
                .map(
                  (quiz) =>
                    latestQuizResults.get(
                      String(quiz.id)
                    )
                )
                .filter(
                  (
                    result
                  ): result is QuizResultRow =>
                    Boolean(result)
                )
                .map(
                  (result) =>
                    result.total_questions >
                      0
                      ? (result.score /
                        result.total_questions) *
                      100
                      : 0
                );

            const quizAverage =
              subjectQuizScores.length >
                0
                ? Math.round(
                  subjectQuizScores.reduce(
                    (
                      sum,
                      score
                    ) =>
                      sum + score,
                    0
                  ) /
                  subjectQuizScores.length
                )
                : 0;

            return {
              id:
                String(subject.id),

              name:
                subject.name?.trim() ||
                "Untitled Subject",

              code:
                subject.code?.trim() ||
                `SUB-${subjectIndex + 1}`,

              semester:
                subject.semester,

              description:
                subject.description?.trim() ||
                "Track your learning progress in this subject.",

              image:
                subject.image_url?.trim() ||
                fallbackImages[
                subjectIndex %
                fallbackImages.length
                ],

              totalLessons,

              completedLessons:
                completedCount,

              remainingLessons:
                remainingCount,

              progress:
                percentage,

              totalMinutes,

              totalQuizzes:
                subjectQuizzes.length,

              completedQuizzes:
                completedQuizzes.length,

              quizAverage,
            };
          }
        );

      /* =================================================
         VISIBLE SUBJECTS
      ================================================= */

      const visibleSubjects =
        finalSubjects.filter(
          (subject) =>
            subject.totalLessons >
            0 ||
            subject.totalQuizzes >
            0
        );

      /* =================================================
         GLOBAL LESSON STATS
      ================================================= */

      const totalLessons =
        lessonData.length;

      const completedLessons =
        lessonData.filter(
          (lesson) =>
            completedLessonIds.has(
              String(lesson.id)
            )
        ).length;

      const remainingLessons =
        Math.max(
          totalLessons -
          completedLessons,
          0
        );

      const totalMinutes =
        lessonData.reduce(
          (
            sum,
            lesson
          ) =>
            sum +
            Number(
              lesson.duration_minutes ??
              lesson.estimated_minutes ??
              0
            ),
          0
        );

      /* =================================================
         GLOBAL QUIZ STATS
      ================================================= */

      const totalQuizzes =
        quizData.length;

      const completedQuizzes =
        latestQuizResults.size;

      const quizScores =
        Array.from(
          latestQuizResults.values()
        ).map(
          (result) =>
            result.total_questions >
              0
              ? (result.score /
                result.total_questions) *
              100
              : 0
        );

      const quizAverage =
        quizScores.length > 0
          ? Math.round(
            quizScores.reduce(
              (
                sum,
                score
              ) =>
                sum + score,
              0
            ) /
            quizScores.length
          )
          : 0;

      /* =================================================
         STUDENT STATS
      ================================================= */

      const stats: GlobalStats = {
        totalLessons,
        completedLessons,
        remainingLessons,

        totalMinutes,

        totalQuizzes,
        completedQuizzes,

        quizAverage,

        xp:
          Number(
            statsData?.xp ?? 0
          ),

        level:
          Number(
            statsData?.level ?? 1
          ),

        currentStreak:
          Number(
            statsData?.current_streak ??
            0
          ),

        bestStreak:
          Number(
            statsData?.best_streak ??
            0
          ),
      };

      setSubjects(
        visibleSubjects
      );

      setGlobalStats(stats);
    } catch (error) {
      console.error(
        "LOAD PROGRESS ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load progress."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =================================================
     DERIVED STATS
  ================================================= */

  const overallProgress =
    globalStats.totalLessons > 0
      ? Math.round(
        (globalStats.completedLessons /
          globalStats.totalLessons) *
        100
      )
      : 0;

  const completedSubjects =
    subjects.filter(
      (subject) =>
        subject.totalLessons >
        0 &&
        subject.progress ===
        100
    ).length;

  const activeSubject =
    useMemo(
      () =>
        subjects
          .filter(
            (subject) =>
              subject.progress > 0 &&
              subject.progress < 100
          )
          .sort(
            (a, b) =>
              b.progress -
              a.progress
          )[0] ?? null,
      [subjects]
    );

  const strongestQuizSubject =
    useMemo(
      () =>
        [...subjects]
          .filter(
            (subject) =>
              subject.completedQuizzes >
              0
          )
          .sort(
            (a, b) =>
              b.quizAverage -
              a.quizAverage
          )[0] ?? null,
      [subjects]
    );

  /* =================================================
     XP LEVEL
  ================================================= */

  const XP_PER_LEVEL = 500;

  const currentLevelXP =
    globalStats.xp %
    XP_PER_LEVEL;

  const levelProgress =
    Math.min(
      100,
      Math.round(
        (currentLevelXP /
          XP_PER_LEVEL) *
        100
      )
    );

  const xpRemaining =
    currentLevelXP === 0
      ? XP_PER_LEVEL
      : XP_PER_LEVEL -
      currentLevelXP;

  /* =================================================
     LOADING
  ================================================= */

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  /* =================================================
     ERROR
  ================================================= */

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030305] px-5 text-white">
        <div className="w-full max-w-md rounded-[30px] border border-red-500/20 bg-red-500/[0.04] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <X size={26} />
          </div>

          <h1 className="mt-6 text-xl font-black">
            Could not load progress
          </h1>

          <p className="mt-3 text-xs leading-6 text-zinc-500">
            {errorMessage}
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold text-zinc-400 transition hover:text-white"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={() =>
                void loadProgress()
              }
              className="rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =================================================
     MAIN
  ================================================= */

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
            scale: [
              1,
              1.15,
              1,
            ],
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
            x: [0, -60, 0],
            y: [0, 70, 0],
            scale: [
              1.1,
              1,
              1.1,
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-180px] top-[35%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]"
        />

        <motion.div
          animate={{
            opacity: [
              0.15,
              0.35,
              0.15,
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[40%] top-[55%] h-[350px] w-[350px] rounded-full bg-fuchsia-600/5 blur-[120px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_75%)]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-[255px] shrink-0 border-r border-white/[0.06] bg-[#050507]/95 backdrop-blur-xl lg:block">
          <div className="sticky top-0 flex h-screen flex-col">

            <div className="px-6 py-7">
              <Logo />
            </div>

            <div className="flex-1 px-4">
              <Navigation />
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <StudentProfile
                stats={globalStats}
                profile={studentProfile}
              />
            </div>

          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="min-w-0 flex-1">

          {/* HEADER */}

          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/80 backdrop-blur-2xl">
            <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">

              <div className="flex items-center gap-4">

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                    RailLearn
                  </p>

                  <h1 className="mt-1 text-lg font-black tracking-tight">
                    My Progress
                  </h1>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/profile")
                  }
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-400 transition hover:border-purple-500/30 hover:text-white"
                  title="Profile"
                >
                  {studentProfile.avatarUrl ? (
                    <img
                      src={
                        studentProfile.avatarUrl
                      }
                      alt={
                        studentProfile.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-black">
                      {studentProfile.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/ai")
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/15 bg-purple-500/[0.06] text-purple-400 transition hover:bg-purple-500/[0.12]"
                  title="Ask Miro"
                >
                  <BrainCircuit
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/subjects"
                    )
                  }
                  className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/30 hover:text-white sm:flex"
                >
                  <BookOpen
                    size={14}
                  />

                  Subjects

                  <ChevronRight
                    size={13}
                  />
                </button>

              </div>
            </div>
          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">

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
              className="relative mb-8 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-[#12091c] via-[#08070d] to-[#050507] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] md:p-10"
            >

              <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px]" />

              <div className="pointer-events-none absolute bottom-[-150px] left-[25%] h-[350px] w-[350px] rounded-full bg-fuchsia-600/10 blur-[120px]" />

              <div className="relative z-10">

                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

                  <div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/10 text-purple-400">
                        <TrendingUp
                          size={22}
                        />
                      </div>

                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                          Learning Analytics
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-600">
                          Your academic journey
                        </p>
                      </div>

                    </div>

                    <h2 className="mt-7 max-w-3xl text-4xl font-black tracking-[-0.04em] md:text-6xl">
                      Keep moving
                      forward.
                    </h2>

                    <p className="mt-4 max-w-2xl text-xs leading-7 text-zinc-500 md:text-sm">
                      Track lessons,
                      quizzes, XP,
                      streaks and your
                      overall learning
                      journey across
                      RailLearn.
                    </p>

                  </div>

                  <div className="shrink-0 lg:text-right">

                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                      Overall Progress
                    </p>

                    <div className="mt-1 flex items-baseline gap-2 lg:justify-end">
                      <motion.span
                        key={
                          overallProgress
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="text-6xl font-black tracking-tight"
                      >
                        {
                          overallProgress
                        }
                        %
                      </motion.span>
                    </div>

                  </div>

                </div>

                {/* OVERALL BAR */}

                <div className="mt-10">

                  <div className="flex justify-between text-[9px] font-bold text-zinc-600">
                    <span>
                      {
                        globalStats.completedLessons
                      }{" "}
                      completed
                    </span>

                    <span>
                      {
                        globalStats.remainingLessons
                      }{" "}
                      remaining
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.06]">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${overallProgress}%`,
                      }}
                      transition={{
                        duration: 1.4,
                        ease: "easeOut",
                      }}
                      className="relative h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                    >

                      <motion.div
                        animate={{
                          x: [
                            "-100%",
                            "300%",
                          ],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-y-0 w-24 bg-white/20 blur-md"
                      />

                    </motion.div>

                  </div>

                </div>

              </div>
            </motion.section>

            {/* =================================================
                GLOBAL STATS
            ================================================= */}

            <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">

              <StatCard
                icon={
                  <BookOpen
                    size={18}
                  />
                }
                value={String(
                  subjects.length
                )}
                label="Subjects"
              />

              <StatCard
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
                value={String(
                  globalStats.completedLessons
                )}
                label="Lessons Done"
              />

              <StatCard
                icon={
                  <Target
                    size={18}
                  />
                }
                value={String(
                  globalStats.completedQuizzes
                )}
                label="Quizzes Done"
              />

              <StatCard
                icon={
                  <Zap
                    size={18}
                  />
                }
                value={`${globalStats.xp} XP`}
                label="Total XP"
              />

            </section>

            {/* =================================================
                GAMIFICATION STATS
            ================================================= */}

            <section className="mb-10 grid gap-5 md:grid-cols-3">

              <GamificationCard
                icon={
                  <Trophy
                    size={19}
                  />
                }
                eyebrow="Current Level"
                value={`Level ${globalStats.level}`}
                description={`${globalStats.xp} XP earned so far`}
                progress={
                  levelProgress
                }
                footer={`${xpRemaining} XP to next level`}
              />

              <GamificationCard
                icon={
                  <Zap
                    size={19}
                  />
                }
                eyebrow="Current Streak"
                value={`${globalStats.currentStreak} days`}
                description={`Best streak: ${globalStats.bestStreak} days`}
                progress={
                  globalStats.bestStreak > 0
                    ? Math.min(
                      100,
                      Math.round(
                        (globalStats.currentStreak /
                          globalStats.bestStreak) *
                        100
                      )
                    )
                    : 0
                }
                footer="Daily consistency"
              />

              <GamificationCard
                icon={
                  <Target
                    size={19}
                  />
                }
                eyebrow="Quiz Average"
                value={`${globalStats.quizAverage}%`}
                description={`${globalStats.completedQuizzes}/${globalStats.totalQuizzes} quizzes completed`}
                progress={
                  globalStats.quizAverage
                }
                footer="Latest quiz performance"
              />

            </section>

            {/* =================================================
                PROFILE SNAPSHOT
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
              className="mb-10 overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#07080d]"
            >

              <div className="relative p-6 md:p-7">

                <div className="absolute right-[-70px] top-[-100px] h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-center">

                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border border-purple-500/20 bg-gradient-to-br from-purple-500 to-violet-800">

                    {studentProfile.avatarUrl ? (
                      <img
                        src={
                          studentProfile.avatarUrl
                        }
                        alt={
                          studentProfile.name
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black">
                        {studentProfile.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                      Student Snapshot
                    </p>

                    <h3 className="mt-2 truncate text-2xl font-black">
                      {studentProfile.name}
                    </h3>

                    <p className="mt-1 truncate text-[9px] text-zinc-600">
                      {studentProfile.email ||
                        "Railway Student"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span className="rounded-full border border-purple-500/15 bg-purple-500/10 px-3 py-1.5 text-[8px] font-black text-purple-300">
                        Level{" "}
                        {
                          globalStats.level
                        }
                      </span>

                      <span className="rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1.5 text-[8px] font-black text-green-400">
                        {
                          globalStats.xp
                        }{" "}
                        XP
                      </span>

                      <span className="rounded-full border border-orange-500/15 bg-orange-500/10 px-3 py-1.5 text-[8px] font-black text-orange-400">
                        🔥{" "}
                        {
                          globalStats.currentStreak
                        }{" "}
                        day streak
                      </span>

                    </div>

                  </div>

                  <div className="flex shrink-0 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/profile"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[9px] font-black text-zinc-400 transition hover:border-purple-500/25 hover:text-white"
                    >
                      <User
                        size={13}
                      />
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/settings"
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-500 transition hover:border-purple-500/25 hover:text-white"
                      title="Settings"
                    >
                      <Settings
                        size={15}
                      />
                    </button>

                  </div>

                </div>

              </div>
            </motion.section>

            {/* =================================================
                ACTIVE SUBJECT
            ================================================= */}

            {activeSubject && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-10 overflow-hidden rounded-[28px] border border-purple-500/15 bg-[#07080d]"
              >

                <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-7">

                  <div className="absolute right-[-60px] top-[-100px] h-64 w-64 rounded-full bg-purple-600/10 blur-[90px]" />

                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl md:h-28 md:w-48">

                    <img
                      src={
                        activeSubject.image
                      }
                      alt={
                        activeSubject.name
                      }
                      className="h-full w-full object-cover opacity-60 transition duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-transparent" />

                  </div>

                  <div className="relative min-w-0 flex-1">

                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                      Currently Learning
                    </p>

                    <h3 className="mt-2 truncate text-xl font-black">
                      {
                        activeSubject.name
                      }
                    </h3>

                    <p className="mt-1 text-[9px] text-zinc-600">
                      {
                        activeSubject.completedLessons
                      }{" "}
                      of{" "}
                      {
                        activeSubject.totalLessons
                      }{" "}
                      lessons completed
                    </p>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${activeSubject.progress}%`,
                        }}
                        transition={{
                          duration: 1,
                        }}
                        className="relative h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400"
                      >
                        <div className="absolute right-0 top-0 h-full w-10 bg-white/20 blur-md" />
                      </motion.div>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/subjects/${activeSubject.id}`
                      )
                    }
                    className="relative flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black transition hover:-translate-y-0.5 hover:bg-purple-500"
                  >
                    Continue

                    <ArrowRight
                      size={13}
                    />
                  </button>

                </div>

              </motion.section>
            )}

            {/* =================================================
                QUIZ HIGHLIGHT
            ================================================= */}

            {strongestQuizSubject && (
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
                  delay: 0.1,
                }}
                className="mb-10 rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-7"
              >

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400">
                      Best Quiz Performance
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      {
                        strongestQuizSubject.name
                      }
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-zinc-600">
                      Your strongest quiz
                      average is{" "}
                      {
                        strongestQuizSubject.quizAverage
                      }
                      % in this
                      subject.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/quizzes"
                      )
                    }
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/[0.06] px-5 py-3 text-[9px] font-black text-purple-300 transition hover:bg-purple-500/[0.12]"
                  >
                    Open Quizzes

                    <ArrowRight
                      size={13}
                    />
                  </button>

                </div>

              </motion.section>
            )}

            {/* =================================================
                QUICK METRICS
            ================================================= */}

            <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">

              <QuickMetric
                icon={
                  <Clock3
                    size={16}
                  />
                }
                label="Study Time"
                value={`${globalStats.totalMinutes}m`}
              />

              <QuickMetric
                icon={
                  <Target
                    size={16}
                  />
                }
                label="Remaining"
                value={String(
                  globalStats.remainingLessons
                )}
              />

              <QuickMetric
                icon={
                  <Trophy
                    size={16}
                  />
                }
                label="Completed Subjects"
                value={String(
                  completedSubjects
                )}
              />

              <QuickMetric
                icon={
                  <Flame
                    size={16}
                  />
                }
                label="Best Streak"
                value={`${globalStats.bestStreak}d`}
              />

            </section>

            {/* =================================================
                SUBJECTS
            ================================================= */}

            <section>

              <div className="mb-6 flex items-end justify-between">

                <div>

                  <p className="text-[8px] font-black uppercase tracking-[0.28em] text-purple-400">
                    Academic Progress
                  </p>

                  <h3 className="mt-2 text-3xl font-black tracking-tight">
                    Your Subjects
                  </h3>

                  <p className="mt-2 text-xs text-zinc-600">
                    Progress calculated from
                    your lessons and quiz
                    activity.
                  </p>

                </div>

                <div className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[8px] font-bold text-zinc-600 sm:flex">

                  <Trophy
                    size={12}
                    className="text-purple-400"
                  />

                  {
                    completedSubjects
                  }{" "}
                  completed
                  subjects

                </div>

              </div>

              {subjects.length === 0 ? (
                <EmptyProgress />
              ) : (
                <motion.div
                  layout
                  className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                >

                  <AnimatePresence>
                    {subjects.map(
                      (
                        subject,
                        index
                      ) => (
                        <SubjectProgressCard
                          key={
                            subject.id
                          }
                          subject={
                            subject
                          }
                          index={
                            index
                          }
                          onClick={() =>
                            router.push(
                              `/subjects/${subject.id}`
                            )
                          }
                        />
                      )
                    )}
                  </AnimatePresence>

                </motion.div>
              )}

            </section>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="py-12 text-center">

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

function Navigation() {
  const router =
    useRouter();

  return (
    <nav className="space-y-1">

      <NavItem
        icon={
          <BarChart3 size={17} />
        }
        label="Dashboard"
        onClick={() =>
          router.push(
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
          router.push(
            "/journey"
          )
        }
      />

      <NavItem
        icon={
          <BookOpen size={17} />
        }
        label="Subjects"
        onClick={() =>
          router.push(
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
          router.push(
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
          router.push(
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
          router.push(
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
        active
        onClick={() =>
          router.push(
            "/progress"
          )
        }
      />

      <div className="my-3 h-px bg-white/[0.05]" />

      <NavItem
        icon={
          <User size={17} />
        }
        label="Profile"
        onClick={() =>
          router.push(
            "/profile"
          )
        }
      />

      <NavItem
        icon={
          <Settings size={17} />
        }
        label="Settings"
        onClick={() =>
          router.push(
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
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
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
          layoutId="progress-active-nav"
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

function StudentProfile({
  stats,
  profile,
}: {
  stats: GlobalStats;
  profile: StudentProfileData;
}) {
  const router =
    useRouter();

  const firstLetter =
    profile.name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "A";

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          "/profile"
        )
      }
      className="group w-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-purple-500/20 hover:bg-purple-500/[0.04]"
    >

      <div className="flex items-center gap-3">

        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500 to-violet-800">

          {profile.avatarUrl ? (
            <img
              src={
                profile.avatarUrl
              }
              alt={
                profile.name
              }
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-black">
              {
                firstLetter
              }
            </div>
          )}

          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#060609] bg-green-400" />

        </div>

        <div className="min-w-0 flex-1">

          <p className="truncate text-xs font-black text-white">
            {
              profile.name
            }
          </p>

          <p className="mt-1 truncate text-[8px] text-zinc-600">
            {
              profile.email ||
              "Railway Student"
            }
          </p>

          <p className="mt-1 text-[8px] font-bold text-purple-400">
            Level{" "}
            {stats.level}{" "}
            • {stats.xp} XP
          </p>

        </div>

        <ChevronRight
          size={14}
          className="shrink-0 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-purple-400"
        />

      </div>

    </button>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
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
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07080d] p-5 transition hover:border-purple-500/20"
    >

      <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-purple-600/5 blur-2xl transition group-hover:bg-purple-600/10" />

      <div className="relative flex items-center gap-2.5">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>

        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </span>

      </div>

      <p className="relative mt-4 text-3xl font-black">
        {value}
      </p>

    </motion.div>
  );
}

/* =====================================================
   GAMIFICATION CARD
===================================================== */

function GamificationCard({
  icon,
  eyebrow,
  value,
  description,
  progress,
  footer,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  value: string;
  description: string;
  progress: number;
  footer: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#07080d] p-6"
    >

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-600/10 blur-3xl transition group-hover:bg-purple-600/20" />

      <div className="relative">

        <div className="flex items-center gap-2 text-purple-400">

          {icon}

          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            {eyebrow}
          </span>

        </div>

        <p className="mt-4 text-3xl font-black">
          {value}
        </p>

        <p className="mt-2 text-[9px] leading-5 text-zinc-600">
          {description}
        </p>

        <div className="mt-5">

          <div className="flex justify-between text-[8px] font-bold">

            <span className="text-zinc-700">
              Progress
            </span>

            <span className="text-purple-400">
              {Math.max(
                0,
                Math.min(
                  100,
                  progress
                )
              )}
              %
            </span>

          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    progress
                  )
                )}%`,
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
              className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
            />

          </div>

          <p className="mt-2 text-[8px] text-zinc-700">
            {footer}
          </p>

        </div>

      </div>

    </motion.div>
  );
}

/* =====================================================
   QUICK METRIC
===================================================== */

function QuickMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-purple-500/15"
    >

      <div className="flex items-center gap-2 text-purple-400">

        {icon}

        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-700">
          {label}
        </span>

      </div>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>

    </motion.div>
  );
}

/* =====================================================
   SUBJECT PROGRESS CARD
===================================================== */

function SubjectProgressCard({
  subject,
  index,
  onClick,
}: {
  subject: SubjectProgress;
  index: number;
  onClick: () => void;
}) {
  const isComplete =
    subject.totalLessons >
    0 &&
    subject.progress ===
    100;

  const hasStarted =
    subject.progress > 0;

  return (
    <motion.button
      type="button"
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
      transition={{
        duration: 0.45,
        delay:
          index * 0.05,
      }}
      whileHover={{
        y: -7,
      }}
      whileTap={{
        scale: 0.985,
      }}
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#07080d] text-left shadow-[0_15px_50px_rgba(0,0,0,0.2)] transition hover:border-purple-500/25 hover:shadow-[0_25px_80px_rgba(0,0,0,0.4)]"
    >

      {/* IMAGE */}

      <div className="relative h-44 overflow-hidden">

        <img
          src={subject.image}
          alt={subject.name}
          className="h-full w-full object-cover opacity-35 transition duration-1000 group-hover:scale-110 group-hover:opacity-50"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/35 to-transparent" />

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between">

          <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.15em] text-purple-300 backdrop-blur-md">
            {
              subject.code
            }
          </span>

          {isComplete ? (
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-green-400/30 bg-green-500/15 text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.15)]"
            >
              <CheckCircle2
                size={18}
              />
            </motion.div>
          ) : (
            <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[7px] font-bold text-zinc-500 backdrop-blur-md">
              Semester{" "}
              {subject.semester ??
                "—"}
            </div>
          )}

        </div>

        <div className="absolute bottom-5 left-5 right-5">

          <h4 className="line-clamp-2 text-2xl font-black tracking-tight">
            {
              subject.name
            }
          </h4>

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-5">

        <div className="flex items-end justify-between">

          <div>

            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Course Progress
            </p>

            <p className="mt-1 text-4xl font-black tracking-tight">
              {
                subject.progress
              }%
            </p>

          </div>

          <div className="text-right">

            <p className="text-[9px] font-bold text-zinc-500">
              {
                subject.completedLessons
              }{" "}
              /{" "}
              {
                subject.totalLessons
              }
            </p>

            <p className="mt-1 text-[7px] uppercase tracking-wider text-zinc-700">
              lessons
            </p>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">

          <motion.div
            initial={{
              width: 0,
            }}
            whileInView={{
              width: `${subject.progress}%`,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1,
              delay:
                index * 0.05,
              ease: "easeOut",
            }}
            className={`relative h-full rounded-full ${isComplete
                ? "bg-gradient-to-r from-green-500 to-emerald-300"
                : "bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
              }`}
          >

            <div className="absolute right-0 top-0 h-full w-10 bg-white/20 blur-md" />

          </motion.div>

        </div>

        {/* META */}

        <div className="mt-5 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className={`h-2 w-2 rounded-full ${isComplete
                  ? "bg-green-400"
                  : hasStarted
                    ? "bg-purple-400"
                    : "bg-zinc-700"
                }`}
            />

            <span className="text-[8px] font-bold text-zinc-500">

              {isComplete
                ? "Completed"
                : hasStarted
                  ? "In Progress"
                  : "Not Started"}

            </span>

          </div>

          <span className="flex items-center gap-1 text-[8px] font-black text-purple-400 transition group-hover:gap-2">

            View Subject

            <ChevronRight
              size={12}
            />

          </span>

        </div>

        {/* EXTRA STATS */}

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">

          <div className="flex items-center justify-center gap-1 text-[8px] text-zinc-600">

            <Clock3
              size={11}
            />

            {
              subject.totalMinutes
            }m

          </div>

          <div className="flex items-center justify-center gap-1 text-[8px] text-zinc-600">

            <Target
              size={11}
            />

            {
              subject.remainingLessons
            }{" "}
            left

          </div>

          <div className="flex items-center justify-center gap-1 text-[8px] text-zinc-600">

            <Trophy
              size={11}
            />

            {
              subject.quizAverage
            }%

          </div>

        </div>

      </div>

    </motion.button>
  );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyProgress() {
  const router =
    useRouter();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-[30px] border border-white/[0.07] bg-[#07080d] p-14 text-center"
    >

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">

        <TrendingUp
          size={27}
        />

      </div>

      <h3 className="mt-6 text-2xl font-black">
        No progress yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-zinc-600">
        Start studying a lesson
        or take a quiz and your
        progress will appear here.
      </p>

      <button
        type="button"
        onClick={() =>
          router.push(
            "/subjects"
          )
        }
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3.5 text-[9px] font-black shadow-[0_15px_45px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500"
      >

        Browse Subjects

        <ArrowRight
          size={13}
        />

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

        <aside className="hidden w-[255px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">

          <div className="p-7">

            <div className="h-9 w-32 animate-pulse rounded-xl bg-white/[0.06]" />

          </div>

          <div className="space-y-2 px-4">

            {Array.from({
              length: 9,
            }).map(
              (_, index) => (
                <div
                  key={
                    `loading-nav-${index}`
                  }
                  className="h-11 animate-pulse rounded-xl bg-white/[0.03]"
                />
              )
            )}

          </div>

        </aside>

        <div className="flex-1 p-5 md:p-10">

          <div className="h-[360px] animate-pulse rounded-[32px] bg-[#07080d]" />

          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={
                    `loading-card-${index}`
                  }
                  className="h-[420px] animate-pulse rounded-[28px] bg-[#07080d]"
                />
              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}