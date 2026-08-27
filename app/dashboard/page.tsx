"use client";

import {
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Play,
  Settings,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  Trophy,
  X,
  Zap,
  Clock3,
  ShieldCheck,
  BarChart3,
  UserRound,
  CircleUserRound,
  Pencil,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type StudentStats = {
  xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
};

type UserProfile = {
  full_name: string | null;
  email: string | null;
  faculty: string | null;
  department: string | null;
  level: number | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
};

type Subject = {
  id: string;
  name: string;
  code: string | null;
  progress: number;
  image: string | null;
  icon: ElementType;
};

type QuizResult = {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string | null;
  quiz_title: string;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
};

type DashboardNavItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PURPLE = "#a855f7";

const fallbackSubjectImages = [
  "/images/train-hero.jpg",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
];

const navigation: DashboardNavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={17} />,
  },
  {
    label: "My Journey",
    path: "/journey",
    icon: <GraduationCap size={17} />,
  },
  {
    label: "Subjects",
    path: "/subjects",
    icon: <BookOpen size={17} />,
  },
  {
    label: "AI Tutor",
    path: "/ai",
    icon: <BrainCircuit size={17} />,
  },
  {
    label: "Quizzes",
    path: "/quizzes",
    icon: <Target size={17} />,
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: <Trophy size={17} />,
  },
  {
    label: "Progress",
    path: "/progress",
    icon: <TrendingUp size={17} />,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <UserRound size={17} />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings size={17} />,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [contactOpen, setContactOpen] =
    useState(false);

  const [profile, setProfile] =
    useState<UserProfile>({
      full_name: null,
      email: null,
      faculty: null,
      department: null,
      level: null,
      avatar_url: null,
      bio: null,
      role: null,
    });

  const [stats, setStats] =
    useState<StudentStats>({
      xp: 0,
      level: 1,
      current_streak: 0,
      best_streak: 0,
    });

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [quizResult, setQuizResult] =
    useState<QuizResult | null>(null);

  const [achievements, setAchievements] =
    useState<Achievement[]>([]);

  const [completedLessons, setCompletedLessons] =
    useState(0);

  const [totalLessons, setTotalLessons] =
    useState(0);

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      /* =====================================================
         AUTH
      ===================================================== */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "AUTH ERROR:",
          authError
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /* =====================================================
         USER PROFILE
      ===================================================== */

      const {
        data: userRow,
        error: userError,
      } = await supabase
        .from("users")
        .select(
          `
          full_name,
          email,
          faculty,
          department,
          level,
          avatar_url,
          bio,
          role
          `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (userError) {
        console.error(
          "USERS ERROR:",
          userError
        );
      }

      setProfile({
        full_name:
          userRow?.full_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          null,

        email:
          userRow?.email ??
          user.email ??
          null,

        faculty:
          userRow?.faculty ??
          null,

        department:
          userRow?.department ??
          null,

        level:
          userRow?.level ??
          null,

        avatar_url:
          userRow?.avatar_url ??
          user.user_metadata?.avatar_url ??
          null,

        bio:
          userRow?.bio ??
          null,

        role:
          userRow?.role ??
          "student",
      });

      /* =====================================================
         STUDENT STATS
      ===================================================== */

      const {
        data: statsRow,
        error: statsError,
      } = await supabase
        .from("student_stats")
        .select(
          `
          xp,
          level,
          current_streak,
          best_streak
          `
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsError) {
        console.error(
          "STATS ERROR:",
          statsError
        );
      }

      if (statsRow) {
        setStats({
          xp: Number(
            statsRow.xp ?? 0
          ),
          level: Number(
            statsRow.level ?? 1
          ),
          current_streak: Number(
            statsRow.current_streak ?? 0
          ),
          best_streak: Number(
            statsRow.best_streak ?? 0
          ),
        });
      }

      /* =====================================================
         SUBJECTS + LESSONS
      ===================================================== */

      const [
        {
          data: subjectRows,
          error: subjectError,
        },
        {
          data: lessonRows,
          error: lessonError,
        },
      ] = await Promise.all([
        supabase
          .from("subjects")
          .select(
            `
            id,
            name,
            code,
            image_url
            `
          )
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("lessons")
          .select(
            `
            id,
            subject_id
            `
          ),
      ]);

      if (subjectError) {
        console.error(
          "SUBJECTS ERROR:",
          subjectError
        );
      }

      if (lessonError) {
        console.error(
          "LESSONS ERROR:",
          lessonError
        );
      }

      const lessons =
        lessonRows ?? [];

      setTotalLessons(
        lessons.length
      );

      /* =====================================================
         PROGRESS
      ===================================================== */

      const {
        data: progressRows,
        error: progressError,
      } = await supabase
        .from("progress")
        .select(
          `
          lesson_id,
          completed
          `
        )
        .eq(
          "user_id",
          user.id
        );

      if (progressError) {
        console.error(
          "PROGRESS ERROR:",
          progressError
        );
      }

      let completedIds =
        new Set(
          (progressRows ?? [])
            .filter(
              (row) =>
                row.completed ===
                true
            )
            .map(
              (row) =>
                String(
                  row.lesson_id
                )
            )
        );

      /* =====================================================
         FALLBACK TO lesson_progress
      ===================================================== */

      if (
        completedIds.size === 0
      ) {
        const {
          data: lessonProgressRows,
          error:
          lessonProgressError,
        } = await supabase
          .from("lesson_progress")
          .select(
            `
            lesson_id,
            completed
            `
          )
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "completed",
            true
          );

        if (
          !lessonProgressError
        ) {
          completedIds =
            new Set(
              (
                lessonProgressRows ??
                []
              ).map(
                (row) =>
                  String(
                    row.lesson_id
                  )
              )
            );
        }
      }

      setCompletedLessons(
        completedIds.size
      );

      /* =====================================================
         SUBJECT ICON
      ===================================================== */

      const iconFor = (
        name: string
      ): ElementType => {
        const value =
          name.toLowerCase();

        if (
          value.includes("rail")
        ) {
          return TrainFront;
        }

        if (
          value.includes("math")
        ) {
          return Target;
        }

        if (
          value.includes("mechan")
        ) {
          return Settings;
        }

        if (
          value.includes("electric")
        ) {
          return Zap;
        }

        if (
          value.includes("signal")
        ) {
          return ShieldCheck;
        }

        if (
          value.includes(
            "program"
          ) ||
          value.includes(
            "computer"
          )
        ) {
          return BrainCircuit;
        }

        return BookOpen;
      };

      /* =====================================================
         BUILD SUBJECTS
      ===================================================== */

      setSubjects(
        (subjectRows ?? []).map(
          (
            subject,
            index
          ) => {
            const subjectLessons =
              lessons.filter(
                (lesson) =>
                  String(
                    lesson.subject_id
                  ) ===
                  String(
                    subject.id
                  )
              );

            const completed =
              subjectLessons.filter(
                (lesson) =>
                  completedIds.has(
                    String(
                      lesson.id
                    )
                  )
              ).length;

            const progress =
              subjectLessons.length >
                0
                ? Math.round(
                  (completed /
                    subjectLessons.length) *
                  100
                )
                : 0;

            return {
              id: String(
                subject.id
              ),

              name: String(
                subject.name ??
                "Subject"
              ),

              code: subject.code
                ? String(
                  subject.code
                )
                : null,

              progress,

              image:
                subject.image_url
                  ? String(
                    subject.image_url
                  )
                  : fallbackSubjectImages[
                  index %
                  fallbackSubjectImages.length
                  ],

              icon: iconFor(
                String(
                  subject.name ??
                  ""
                )
              ),
            };
          }
        )
      );

      /* =====================================================
         LATEST QUIZ
      ===================================================== */

      const {
        data: quizRows,
        error: quizError,
      } = await supabase
        .from("quiz_results")
        .select(
          `
          id,
          quiz_id,
          score,
          total_questions,
          completed_at,
          quizzes (
            title
          )
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "completed_at",
          {
            ascending: false,
          }
        )
        .limit(1);

      if (quizError) {
        console.error(
          "QUIZ ERROR:",
          quizError
        );
      }

      const latestQuiz =
        quizRows?.[0] as
        | any
        | undefined;

      if (latestQuiz) {
        const relation =
          Array.isArray(
            latestQuiz.quizzes
          )
            ? latestQuiz.quizzes[0]
            : latestQuiz.quizzes;

        setQuizResult({
          id: String(
            latestQuiz.id
          ),

          quiz_id: String(
            latestQuiz.quiz_id
          ),

          score: Number(
            latestQuiz.score ?? 0
          ),

          total_questions:
            Number(
              latestQuiz.total_questions ??
              0
            ),

          completed_at:
            latestQuiz.completed_at
              ? String(
                latestQuiz.completed_at
              )
              : null,

          quiz_title:
            String(
              relation?.title ??
              "Latest Quiz"
            ),
        });
      } else {
        setQuizResult(null);
      }

      /* =====================================================
         ACHIEVEMENTS
      ===================================================== */

      const {
        data: achievementRows,
        error:
        achievementError,
      } = await supabase
        .from("user_achievements")
        .select(
          `
          achievement_id,
          achievements (
            id,
            title,
            description,
            icon,
            xp_reward
          )
          `
        )
        .eq(
          "user_id",
          user.id
        );

      if (achievementError) {
        console.error(
          "ACHIEVEMENT ERROR:",
          achievementError
        );
      }

      if (
        !achievementError
      ) {
        setAchievements(
          (
            achievementRows ??
            []
          )
            .map(
              (row: any) => {
                const achievement =
                  Array.isArray(
                    row.achievements
                  )
                    ? row
                      .achievements[0]
                    : row.achievements;

                if (!achievement) {
                  return null;
                }

                return {
                  id: String(
                    achievement.id
                  ),

                  title: String(
                    achievement.title ??
                    "Achievement"
                  ),

                  description:
                    String(
                      achievement.description ??
                      ""
                    ),

                  icon: String(
                    achievement.icon ??
                    "trophy"
                  ),

                  xp_reward: Number(
                    achievement.xp_reward ??
                    0
                  ),
                };
              }
            )
            .filter(
              Boolean
            ) as Achievement[]
        );
      }
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function goTo(
    path: string
  ) {
    setMobileMenu(false);
    router.push(path);
  }

  /* =========================================================
     DERIVED
  ========================================================= */

  const userName =
    profile.full_name
      ?.trim()
      .split(/\s+/)[0] ||
    "Student";

  const fullUserName =
    profile.full_name?.trim() ||
    "RailLearn Student";

  const lessonPercentage =
    totalLessons > 0
      ? Math.round(
        (completedLessons /
          totalLessons) *
        100
      )
      : 0;

  const xpProgress =
    stats.xp % 1000;

  const xpPercentage =
    Math.min(
      100,
      Math.round(
        (xpProgress / 1000) *
        100
      )
    );

  const quizPercentage =
    quizResult &&
      quizResult.total_questions >
      0
      ? Math.round(
        (quizResult.score /
          quizResult.total_questions) *
        100
      )
      : 0;

  const averageSubjectProgress =
    useMemo(
      () =>
        subjects.length
          ? Math.round(
            subjects.reduce(
              (
                total,
                subject
              ) =>
                total +
                subject.progress,
              0
            ) /
            subjects.length
          )
          : 0,
      [subjects]
    );

  const completedSubjects =
    subjects.filter(
      (subject) =>
        subject.progress === 100
    ).length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#020204] text-white selection:bg-purple-500/30">
      {/* =====================================================
         GLOBAL STYLE
      ===================================================== */}

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }

          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }
        }

        @keyframes scan {
          0% {
            transform: translateX(-120%);
          }

          100% {
            transform: translateX(120%);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-140%);
          }

          50%,
          100% {
            transform: translateX(140%);
          }
        }

        .rail-grid {
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 44px 44px;
        }

        .premium-card {
          box-shadow:
            0 25px 90px rgba(0, 0, 0, 0.38),
            inset 0 1px rgba(255, 255, 255, 0.04);
        }

        .shine {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .shine::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 30%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent
          );
          animation: scan 7s linear infinite;
        }
      `}</style>

      {/* =====================================================
         BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -left-48 -top-40 h-[600px] w-[600px] rounded-full bg-purple-700/15 blur-[150px]"
          style={{
            animation:
              "pulseGlow 8s ease-in-out infinite",
          }}
        />

        <div
          className="absolute right-[-180px] top-[22%] h-[620px] w-[620px] rounded-full bg-fuchsia-600/10 blur-[170px]"
          style={{
            animation:
              "pulseGlow 10s ease-in-out infinite reverse",
          }}
        />

        <div className="rail-grid absolute inset-0 opacity-40" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020204_80%)]" />
      </div>

      {/* =====================================================
         MOBILE MENU
      ===================================================== */}

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
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() =>
                setMobileMenu(false)
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
                stiffness: 280,
                damping: 28,
              }}
              className="relative max-h-[100dvh] w-[300px] overflow-y-auto overscroll-contain border-r border-white/10 bg-[#050507] p-5 pb-36 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenu(false)
                  }
                  className="min-h-10 min-w-10 touch-manipulation rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <Navigation
                goTo={goTo}
                activePath="/dashboard"
              />

              <div className="absolute bottom-5 left-5 right-5">
                <StudentProfileCard
                  name={fullUserName}
                  avatarUrl={
                    profile.avatar_url
                  }
                  level={stats.level}
                  xp={stats.xp}
                  xpPercentage={
                    xpPercentage
                  }
                  onProfile={() =>
                    goTo("/profile")
                  }
                />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
         MAIN APP
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen">
        {/* ===================================================
           DESKTOP SIDEBAR
        =================================================== */}

        <aside className="hidden w-[265px] shrink-0 border-r border-white/[.06] bg-[#050507]/90 backdrop-blur-xl lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="px-6 py-7">
              <Logo />
            </div>

            <div className="flex-1 px-4">
              <Navigation
                goTo={goTo}
                activePath="/dashboard"
              />
            </div>

            <div className="border-t border-white/[.06] p-4">
              <StudentProfileCard
                name={fullUserName}
                avatarUrl={
                  profile.avatar_url
                }
                level={stats.level}
                xp={stats.xp}
                xpPercentage={
                  xpPercentage
                }
                onProfile={() =>
                  goTo("/profile")
                }
              />
            </div>
          </div>
        </aside>

        {/* ===================================================
           CONTENT
        =================================================== */}

        <div className="min-w-0 flex-1">
          {/* =================================================
             HEADER
          ================================================= */}

          <header className="sticky top-0 z-50 border-b border-white/[.06] bg-[#020204]/75 backdrop-blur-2xl">
            <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setMobileMenu(true)
                  }
                  className="min-h-11 min-w-11 touch-manipulation rounded-xl border border-white/10 bg-white/[.03] p-2.5 text-zinc-400 transition hover:text-white lg:hidden"
                >
                  <Menu size={19} />
                </button>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[.3em] text-purple-400">
                    RAILLEARN / SYSTEM
                  </p>

                  <h1 className="mt-1 text-sm font-black">
                    Student Command Center
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    goTo("/ai")
                  }
                  className="hidden rounded-xl border border-white/[.08] bg-white/[.03] p-3 text-zinc-500 transition hover:border-purple-500/30 hover:text-purple-400 sm:block"
                  title="Miro AI"
                >
                  <BrainCircuit
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/profile")
                  }
                  className="group flex items-center gap-3 rounded-xl border border-white/[.08] bg-white/[.03] px-2 py-2 pr-3 transition hover:border-purple-500/30 hover:bg-purple-500/[.04]"
                >
                  <Avatar
                    name={userName}
                    avatarUrl={
                      profile.avatar_url
                    }
                    size="sm"
                  />

                  <div className="hidden text-left sm:block">
                    <p className="text-[10px] font-black">
                      {userName}
                    </p>

                    <p className="text-[8px] text-zinc-600 transition group-hover:text-purple-400">
                      Profile
                    </p>
                  </div>

                  <ChevronRight
                    size={12}
                    className="hidden text-zinc-700 transition group-hover:translate-x-1 group-hover:text-purple-400 sm:block"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setContactOpen(
                      true
                    )
                  }
                  className="relative rounded-xl border border-white/[.08] bg-white/[.03] p-3 text-zinc-500 transition hover:border-purple-500/30 hover:text-white"
                >
                  <Bell size={17} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
                </button>
              </div>
            </div>
          </header>

          {/* =================================================
             PAGE CONTENT
          ================================================= */}

          <div className="mx-auto min-h-[calc(100dvh-76px)] max-w-[1580px] px-4 pb-16 pt-5 sm:p-5 md:p-8 xl:p-10">
            {loading ? (
              <LoadingScreen />
            ) : (
              <>
                {/* =================================================
                   WELCOME
                ================================================= */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-8 flex flex-col justify-between gap-7 xl:flex-row xl:items-end"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="h-px w-10 bg-gradient-to-r from-purple-500 to-transparent" />

                      <p className="text-[8px] font-black uppercase tracking-[.32em] text-purple-400">
                        Personal learning cockpit
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                        Welcome,{" "}
                        <span className="bg-gradient-to-r from-purple-300 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                          {userName}
                        </span>
                      </h2>

                      <img
                        src="/images/hey.png"
                        alt=""
                        className="hidden h-12 w-12 object-contain md:block"
                      />
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                      {profile.department ||
                        "Your intelligent railway engineering learning environment. Track your progress, master your curriculum and keep moving forward."}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <MiniStat
                      icon={
                        <Zap size={14} />
                      }
                      value={String(
                        stats.xp
                      )}
                      label="XP"
                    />

                    <MiniStat
                      icon={
                        <Trophy
                          size={14}
                        />
                      }
                      value={String(
                        stats.level
                      )}
                      label="Level"
                    />

                    <MiniStat
                      image="/images/streak.png"
                      value={String(
                        stats.current_streak
                      )}
                      label="Streak"
                    />
                  </div>
                </motion.section>

                {/* =================================================
                   HERO
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
                    delay: 0.08,
                  }}
                  className="relative mb-7 overflow-hidden rounded-[34px] border border-white/[.09] bg-[#07070b] premium-card"
                >
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020204] via-[#030305]/65 to-transparent" />

                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020204] via-transparent to-transparent" />

                  <div className="absolute right-[8%] top-[20%] h-72 w-72 rounded-full bg-purple-500/15 blur-[100px]" />

                  <img
                    src="/images/train-hero.jpg"
                    alt="Railway"
                    className="absolute inset-0 h-full w-full object-cover object-center opacity-50 transition duration-[1600ms] hover:scale-[1.025]"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div className="shine" />

                  <div className="relative z-20 grid min-h-[570px] items-end p-7 md:p-11 lg:grid-cols-[1fr_390px] lg:items-center lg:gap-10">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400 shadow-[0_0_12px_#a855f7]" />

                        <span className="text-[8px] font-black uppercase tracking-[.22em] text-purple-300">
                          Learning system online
                        </span>
                      </div>

                      <h3 className="mt-7 max-w-2xl text-5xl font-black leading-[.9] tracking-tight md:text-7xl">
                        Railway
                        <br />
                        <span className="bg-gradient-to-r from-purple-300 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                          Engineering
                        </span>
                      </h3>

                      <p className="mt-6 max-w-xl text-sm leading-6 text-zinc-400">
                        Master railway technology,
                        transportation systems and
                        engineering fundamentals
                        through an intelligent
                        learning experience designed
                        for your department.
                      </p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            goTo(
                              "/subjects"
                            )
                          }
                          className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-[10px] font-black shadow-[0_15px_50px_rgba(124,58,237,.3)] transition hover:-translate-y-0.5"
                        >
                          Continue Learning

                          <ArrowRight
                            size={15}
                            className="transition group-hover:translate-x-1"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            goTo("/ai")
                          }
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-5 py-4 text-[10px] font-black text-zinc-300 transition hover:bg-white/[.07]"
                        >
                          <Sparkles
                            size={14}
                            className="text-purple-400"
                          />

                          Ask AI
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            goTo(
                              "/profile"
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-[10px] font-black text-zinc-400 backdrop-blur-md transition hover:border-purple-500/30 hover:text-white"
                        >
                          <Pencil
                            size={13}
                            className="text-purple-400"
                          />

                          Edit Profile
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/[.08] bg-black/35 p-5 backdrop-blur-xl">
                      <p className="text-[8px] font-black uppercase tracking-[.25em] text-purple-400">
                        Live overview
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <MetricBox
                          icon={
                            <Target
                              size={15}
                            />
                          }
                          value={`${lessonPercentage}%`}
                          label="Course complete"
                        />

                        <MetricBox
                          icon={
                            <BookOpen
                              size={15}
                            />
                          }
                          value={String(
                            completedLessons
                          )}
                          label="Lessons done"
                        />

                        <MetricBox
                          icon={
                            <BarChart3
                              size={15}
                            />
                          }
                          value={`${averageSubjectProgress}%`}
                          label="Avg. subjects"
                        />

                        <MetricBox
                          icon={
                            <Flame
                              size={15}
                            />
                          }
                          value={String(
                            stats.best_streak
                          )}
                          label="Best streak"
                        />
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-500">
                            Overall journey
                          </span>

                          <span className="font-bold text-purple-400">
                            {
                              lessonPercentage
                            }
                            %
                          </span>
                        </div>

                        <div className="mt-2 h-2 rounded-full bg-white/[.07]">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${lessonPercentage}%`,
                            }}
                            transition={{
                              duration: 1.2,
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-500 to-purple-300 shadow-[0_0_20px_rgba(168,85,247,.4)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* =================================================
                   PROFILE SNAPSHOT
                ================================================= */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.15,
                  }}
                  className="mb-7 overflow-hidden rounded-[28px] border border-purple-500/15 bg-gradient-to-r from-purple-500/[.06] via-[#08080d] to-[#050507] p-5 md:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <Avatar
                      name={userName}
                      avatarUrl={
                        profile.avatar_url
                      }
                      size="lg"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black">
                          {fullUserName}
                        </p>

                        <span className="rounded-full border border-purple-500/15 bg-purple-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-wider text-purple-400">
                          {profile.role ||
                            "Student"}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-zinc-600">
                        {profile.email ||
                          "Student Account"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-[8px] font-bold text-zinc-600">
                        {profile.faculty && (
                          <span className="rounded-lg border border-white/[.06] bg-white/[.02] px-2.5 py-1.5">
                            {profile.faculty}
                          </span>
                        )}

                        {profile.department && (
                          <span className="rounded-lg border border-white/[.06] bg-white/[.02] px-2.5 py-1.5">
                            {profile.department}
                          </span>
                        )}

                        {profile.level && (
                          <span className="rounded-lg border border-white/[.06] bg-white/[.02] px-2.5 py-1.5">
                            Academic Level{" "}
                            {profile.level}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        goTo("/profile")
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/[.07] px-5 py-3 text-[9px] font-black text-purple-300 transition hover:-translate-y-0.5 hover:bg-purple-500/[.12]"
                    >
                      <CircleUserRound
                        size={14}
                      />

                      Open Profile

                      <ArrowRight
                        size={13}
                      />
                    </button>
                  </div>
                </motion.section>

                {/* =================================================
                   MAIN GRID
                ================================================= */}

                <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div>
                    {/* =================================================
                       LATEST QUIZ
                    ================================================= */}

                    <section className="rounded-[28px] border border-white/[.07] bg-gradient-to-br from-[#09090d] to-[#050507] p-6 premium-card md:p-8">
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />

                            <p className="text-[8px] font-black uppercase tracking-[.25em] text-purple-400">
                              Latest activity
                            </p>
                          </div>

                          <h3 className="mt-3 text-2xl font-black">
                            {quizResult?.quiz_title ||
                              "Your Quiz Results"}
                          </h3>

                          <p className="mt-2 text-xs text-zinc-600">
                            {quizResult
                              ? "Your latest submitted quiz result."
                              : "Complete your first quiz and your result will appear here."}
                          </p>
                        </div>

                        {quizResult ? (
                          <div className="flex items-center gap-5">
                            <div className="text-right">
                              <p className="text-4xl font-black text-purple-400">
                                {
                                  quizPercentage
                                }
                                %
                              </p>

                              <p className="mt-1 text-[9px] text-zinc-600">
                                {
                                  quizResult.score
                                }
                                /
                                {
                                  quizResult.total_questions
                                }{" "}
                                correct
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                goTo(
                                  "/quizzes"
                                )
                              }
                              className="rounded-xl border border-white/10 p-3 text-zinc-500 transition hover:border-purple-500/30 hover:text-purple-400"
                              title="Open quizzes"
                            >
                              <Play
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              goTo(
                                "/quizzes"
                              )
                            }
                            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black transition hover:bg-purple-500"
                          >
                            Browse Quizzes

                            <ArrowRight
                              size={
                                14
                              }
                            />
                          </button>
                        )}
                      </div>

                      {quizResult && (
                        <div className="mt-7">
                          <div className="h-2 rounded-full bg-white/[.06]">
                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${quizPercentage}%`,
                              }}
                              transition={{
                                duration:
                                  0.9,
                              }}
                              className={`h-full rounded-full ${quizPercentage >=
                                60
                                ? "bg-green-500"
                                : "bg-red-500"
                                }`}
                            />
                          </div>

                          <div className="mt-3 flex justify-between text-[9px]">
                            <span className="text-zinc-600">
                              Performance
                            </span>

                            <span
                              className={
                                quizPercentage >=
                                  60
                                  ? "font-bold text-green-400"
                                  : "font-bold text-red-400"
                              }
                            >
                              {quizPercentage >=
                                60
                                ? "Passed"
                                : "Needs Improvement"}
                            </span>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* =================================================
                       SUBJECTS
                    ================================================= */}

                    <section className="mt-11">
                      <div className="mb-6 flex items-end justify-between">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[.28em] text-purple-400">
                            Your curriculum
                          </p>

                          <h3 className="mt-2 text-2xl font-black md:text-3xl">
                            My Subjects
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            goTo(
                              "/subjects"
                            )
                          }
                          className="flex items-center gap-1 text-[9px] font-bold text-zinc-600 transition hover:text-white"
                        >
                          View All

                          <ChevronRight
                            size={14}
                          />
                        </button>
                      </div>

                      {subjects.length ===
                        0 ? (
                        <EmptySubjects />
                      ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {subjects.map(
                            (
                              subject,
                              index
                            ) => (
                              <motion.div
                                key={
                                  subject.id
                                }
                                initial={{
                                  opacity: 0,
                                  y: 20,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay:
                                    index *
                                    0.04,
                                }}
                              >
                                <SubjectCard
                                  {...subject}
                                  onClick={() =>
                                    goTo(
                                      `/subjects/${subject.id}`
                                    )
                                  }
                                />
                              </motion.div>
                            )
                          )}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* =================================================
                     RIGHT SIDEBAR
                  ================================================= */}

                  <aside className="space-y-5">
                    {/* XP */}

                    <Panel>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[.2em] text-zinc-600">
                            Your progress
                          </p>

                          <h3 className="mt-2 text-lg font-black">
                            XP Progress
                          </h3>
                        </div>

                        <div className="rounded-xl border border-purple-500/10 bg-purple-500/10 p-2.5 text-purple-400">
                          <TrendingUp
                            size={17}
                          />
                        </div>
                      </div>

                      <div className="mt-7 flex items-center gap-5">
                        <div
                          className="relative flex h-24 w-24 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(${PURPLE} ${xpPercentage}%, #17171f ${xpPercentage}%)`,
                          }}
                        >
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#07080c]">
                            <span className="text-lg font-black">
                              {
                                xpPercentage
                              }
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xl font-black">
                            {stats.xp} XP
                          </p>

                          <p className="mt-1 text-[9px] text-zinc-600">
                            Level{" "}
                            {
                              stats.level
                            }
                          </p>

                          <p className="mt-3 flex items-center gap-2 text-[9px] font-bold text-purple-400">
                            <Zap
                              size={
                                11
                              }
                            />

                            {stats.current_streak
                              ? `${stats.current_streak} day streak`
                              : "Start your streak"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          goTo(
                            "/progress"
                          )
                        }
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.06] bg-white/[.02] py-3 text-[9px] font-black text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
                      >
                        View Full Progress

                        <ArrowRight
                          size={12}
                        />
                      </button>
                    </Panel>

                    {/* ACHIEVEMENTS */}

                    <Panel>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[.2em] text-zinc-600">
                            Achievements
                          </p>

                          <h3 className="mt-2 text-lg font-black">
                            Unlocked
                          </h3>
                        </div>

                        <Trophy
                          size={18}
                          className="text-purple-400"
                        />
                      </div>

                      <div className="mt-5 space-y-3">
                        {achievements.length ? (
                          achievements
                            .slice(0, 4)
                            .map(
                              (
                                achievement
                              ) => (
                                <div
                                  key={
                                    achievement.id
                                  }
                                  className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3 transition hover:border-purple-500/20 hover:bg-purple-500/[.04]"
                                >
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                                    <Trophy
                                      size={
                                        15
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-[10px] font-black">
                                      {
                                        achievement.title
                                      }
                                    </p>

                                    <p className="truncate text-[8px] text-zinc-600">
                                      {
                                        achievement.description
                                      }
                                    </p>
                                  </div>

                                  <span className="ml-auto text-[8px] font-bold text-purple-400">
                                    +
                                    {
                                      achievement.xp_reward
                                    }
                                  </span>
                                </div>
                              )
                            )
                        ) : (
                          <p className="rounded-xl border border-white/[.06] p-4 text-center text-[9px] text-zinc-600">
                            No achievements unlocked yet.
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          goTo(
                            "/achievements"
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.06] bg-white/[.02] py-3 text-[9px] font-black text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
                      >
                        Achievement Center

                        <ArrowRight
                          size={12}
                        />
                      </button>
                    </Panel>

                    {/* AI */}

                    <section className="relative overflow-hidden rounded-[27px] border border-purple-500/20 bg-gradient-to-br from-[#180b25] via-[#0b0910] to-[#050609] p-6 premium-card">
                      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-purple-500/20 blur-3xl" />

                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/10 text-purple-400">
                            <BrainCircuit
                              size={19}
                            />
                          </div>

                          <div>
                            <p className="text-[8px] font-black uppercase tracking-[.2em] text-purple-400">
                              AI Tutor
                            </p>

                            <p className="mt-1 text-[8px] text-zinc-600">
                              RailLearn Intelligence
                            </p>
                          </div>
                        </div>

                        <p className="mt-6 text-lg font-black">
                          Your private study copilot.
                        </p>

                        <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                          Ask questions,
                          simplify difficult
                          concepts or generate
                          practice questions.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            goTo("/ai")
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-[10px] font-black transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500"
                        >
                          <Sparkles
                            size={13}
                          />

                          Open AI Tutor
                        </button>

                        <div className="mt-3 space-y-2">
                          <AIQuestion
                            onClick={() =>
                              goTo(
                                "/ai?question=Explain%20railway%20track%20geometry"
                              )
                            }
                          >
                            Explain railway
                            track geometry
                          </AIQuestion>

                          <AIQuestion
                            onClick={() =>
                              goTo(
                                "/ai?question=How%20does%20track%20cant%20work"
                              )
                            }
                          >
                            How does track
                            cant work?
                          </AIQuestion>

                          <AIQuestion
                            onClick={() =>
                              goTo(
                                "/quizzes"
                              )
                            }
                          >
                            Generate practice
                            questions
                          </AIQuestion>
                        </div>
                      </div>
                    </section>

                    {/* QUICK ACTIONS */}

                    <Panel>
                      <p className="text-[8px] font-black uppercase tracking-[.2em] text-zinc-600">
                        Quick actions
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <QuickAction
                          icon={
                            <BookOpen
                              size={15}
                            />
                          }
                          label="Subjects"
                          onClick={() =>
                            goTo(
                              "/subjects"
                            )
                          }
                        />

                        <QuickAction
                          icon={
                            <Target
                              size={15}
                            />
                          }
                          label="Quizzes"
                          onClick={() =>
                            goTo(
                              "/quizzes"
                            )
                          }
                        />

                        <QuickAction
                          icon={
                            <GraduationCap
                              size={15}
                            />
                          }
                          label="Journey"
                          onClick={() =>
                            goTo(
                              "/journey"
                            )
                          }
                        />

                        <QuickAction
                          icon={
                            <Clock3
                              size={15}
                            />
                          }
                          label="Progress"
                          onClick={() =>
                            goTo(
                              "/progress"
                            )
                          }
                        />

                        <QuickAction
                          icon={
                            <UserRound
                              size={15}
                            />
                          }
                          label="Profile"
                          onClick={() =>
                            goTo(
                              "/profile"
                            )
                          }
                        />

                        <QuickAction
                          icon={
                            <Settings
                              size={15}
                            />
                          }
                          label="Settings"
                          onClick={() =>
                            goTo(
                              "/settings"
                            )
                          }
                        />
                      </div>
                    </Panel>

                    {/* ACCOUNT CARD */}

                    <section className="rounded-[27px] border border-white/[.07] bg-[#07080d] p-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={userName}
                          avatarUrl={
                            profile.avatar_url
                          }
                          size="md"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-black">
                            {fullUserName}
                          </p>

                          <p className="mt-1 truncate text-[8px] text-zinc-600">
                            {profile.email ||
                              "RailLearn account"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          goTo(
                            "/profile"
                          )
                        }
                        className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[.06] bg-white/[.02] px-3 py-3 text-[9px] font-black text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <Pencil
                            size={12}
                            className="text-purple-400"
                          />
                          Edit profile
                        </span>

                        <ChevronRight
                          size={12}
                        />
                      </button>
                    </section>
                  </aside>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ContactCard
        open={contactOpen}
        setOpen={setContactOpen}
      />
    </main>
  );
}

/* =========================================================
   LOGO
========================================================= */

function Logo() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          "/dashboard"
        )
      }
      className="group flex items-center gap-3 text-left"
    >
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-violet-800 shadow-lg shadow-purple-900/30">
        <TrainFront
          size={19}
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      <div>
        <p className="text-sm font-black">
          RailLearn
        </p>

        <p className="text-[7px] font-black uppercase tracking-[.25em] text-zinc-600">
          Railway Academy
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function Navigation({
  goTo,
  activePath,
}: {
  goTo: (
    path: string
  ) => void;

  activePath: string;
}) {
  return (
    <nav className="space-y-1">
      {navigation.map(
        (item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={
              item.path ===
              activePath
            }
            onClick={() =>
              goTo(
                item.path
              )
            }
          />
        )
      )}
    </nav>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

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
        x: active ? 0 : 3,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${active
        ? "bg-purple-500/10 text-purple-300 shadow-[inset_2px_0_0_#a855f7]"
        : "text-zinc-600 hover:bg-white/[.03] hover:text-zinc-300"
        }`}
    >
      {active && (
        <motion.div
          layoutId="dashboard-active-nav"
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

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?:
  | "sm"
  | "md"
  | "lg";
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-16 w-16 text-lg"
        : "h-10 w-10 text-sm";

  const showImage =
    Boolean(avatarUrl) &&
    !imageError;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-violet-800 font-black shadow-lg shadow-purple-900/20 ${sizeClass}`}
    >
      {showImage ? (
        <img
          src={avatarUrl!}
          alt={name}
          className="h-full w-full object-cover"
          onError={() =>
            setImageError(
              true
            )
          }
        />
      ) : (
        name
          .charAt(0)
          .toUpperCase()
      )}

      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#050507] bg-green-400" />
    </div>
  );
}

/* =========================================================
   STUDENT PROFILE CARD
========================================================= */

function StudentProfileCard({
  name,
  avatarUrl,
  level,
  xp,
  xpPercentage,
  onProfile,
}: {
  name: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  xpPercentage: number;
  onProfile: () => void;
}) {
  return (
    <div className="premium-card rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/[.08] to-transparent p-4">
      <div className="flex items-center gap-3">
        <Avatar
          name={name}
          avatarUrl={avatarUrl}
        />

        <div className="min-w-0">
          <p className="truncate text-xs font-black">
            {name}
          </p>

          <p className="mt-1 text-[9px] text-purple-400">
            Level {level}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-[9px]">
          <span className="text-zinc-600">
            {xp % 1000} / 1000 XP
          </span>

          <span className="text-purple-400">
            {xpPercentage}%
          </span>
        </div>

        <div className="mt-2 h-1.5 rounded-full bg-white/[.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
            style={{
              width: `${xpPercentage}%`,
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onProfile}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[.06] bg-white/[.02] px-3 py-2.5 text-[8px] font-black text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
      >
        <span className="flex items-center gap-2">
          <UserRound
            size={12}
            className="text-purple-400"
          />

          Profile
        </span>

        <ChevronRight size={11} />
      </button>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  image,
  value,
  label,
}: {
  icon?: ReactNode;
  image?: string;
  value: string;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      className="min-w-[78px] rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-purple-400">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-4 w-4 object-contain"
          />
        ) : (
          icon
        )}

        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </motion.div>
  );
}

/* =========================================================
   METRIC BOX
========================================================= */

function MetricBox({
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
        y: -3,
      }}
      className="rounded-2xl border border-white/[.07] bg-white/[.03] p-3"
    >
      <div className="text-purple-400">
        {icon}
      </div>

      <p className="mt-3 text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </motion.div>
  );
}

/* =========================================================
   PANEL
========================================================= */

function Panel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="rounded-[27px] border border-white/[.07] bg-[#07080d] p-5 shadow-[0_15px_60px_rgba(0,0,0,.2)]">
      {children}
    </section>
  );
}

/* =========================================================
   SUBJECT CARD
========================================================= */

function SubjectCard({
  name,
  code,
  progress,
  image,
  icon: Icon,
  onClick,
}: {
  name: string;
  code: string | null;
  progress: number;
  image: string | null;
  icon: ElementType;
  onClick: () => void;
}) {
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
      className="group premium-card relative h-[235px] w-full overflow-hidden rounded-[25px] border border-white/[.07] bg-[#07080d] text-left transition duration-500 hover:border-purple-500/30 hover:shadow-[0_25px_70px_rgba(124,58,237,.16)]"
    >
      {image && (
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-700 group-hover:scale-110 group-hover:opacity-45"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/75 to-[#030305]/10" />

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-500/10 blur-3xl transition group-hover:bg-purple-500/20" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/45 text-purple-400 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-purple-500/10">
            <Icon size={19} />
          </div>

          <ChevronRight
            size={15}
            className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-purple-400"
          />
        </div>

        <div>
          <p className="mb-1 text-[8px] font-black uppercase tracking-wider text-purple-400">
            {code ||
              "SUBJECT"}
          </p>

          <h4 className="text-base font-black">
            {name}
          </h4>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500">
              Progress
            </span>

            <span className="text-[9px] font-black text-purple-400">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.8,
              }}
              className="h-full rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-400"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-white/[.06] bg-white/[.02] p-3 text-left text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-white"
    >
      <span className="text-purple-400">
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =========================================================
   AI QUESTION
========================================================= */

function AIQuestion({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-white/[.06] bg-white/[.02] px-3 py-3 text-left text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-white"
    >
      <span>
        {children}
      </span>

      <ArrowRight
        size={11}
      />
    </button>
  );
}

/* =========================================================
   EMPTY SUBJECTS
========================================================= */

function EmptySubjects() {
  return (
    <div className="rounded-[25px] border border-white/[.07] bg-[#07080d] p-10 text-center">
      <BookOpen className="mx-auto text-zinc-700" />

      <p className="mt-3 text-sm font-bold text-zinc-500">
        No subjects found
      </p>

      <p className="mt-1 text-xs text-zinc-700">
        Add subjects to your
        database.
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingScreen() {
  return (
    <div className="flex min-h-[650px] items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/10" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
            <TrainFront
              size={24}
              className="animate-pulse text-purple-400"
            />
          </div>
        </div>

        <p className="mt-5 text-xs font-black text-zinc-500">
          Loading RailLearn...
        </p>

        <p className="mt-1 text-[9px] text-zinc-700">
          Synchronizing your
          learning data
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   CONTACT CARD
========================================================= */

function ContactCard({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (
    value: boolean
  ) => void;
}) {
  const contacts = [
    {
      name: "WhatsApp",
      description:
        "Chat with me directly",
      href: "https://wa.me/201276730148",
      icon: "/images/whatsapp.png",
    },

    {
      name: "Facebook",
      description:
        "My Facebook profile",
      href: "https://www.facebook.com/profile.php?id=100090523804929",
      icon: "/images/facebook.png",
    },

    {
      name: "Instagram",
      description:
        "Follow me on Instagram",
      href: "https://www.instagram.com/__1privv_vamir_/",
      icon: "/images/instagram.png",
    },

    {
      name: "Messenger",
      description:
        "Message me on Messenger",
      href: "https://m.me/100090523804929",
      icon: "/images/messenger.png",
    },

    {
      name: "Email",
      description:
        "Send me an email",
      href: "mailto:a33329035@gmail.com",
      icon: "/images/email.png",
    },
  ];

  return (
    <>
      <div
        className={`fixed bottom-24 right-5 z-[80] w-[300px] origin-bottom-right transition-all duration-300 ${open
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-90 opacity-0"
          }`}
      >
        <div className="rounded-[25px] border border-purple-500/20 bg-[#08080d]/95 p-4 shadow-[0_25px_100px_rgba(0,0,0,.65)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[.25em] text-purple-400">
                Contact
              </p>

              <p className="mt-1 text-sm font-black">
                Connect with me
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map(
              (contact) => (
                <a
                  key={
                    contact.name
                  }
                  href={
                    contact.href
                  }
                  target={
                    contact.href.startsWith(
                      "http"
                    )
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    contact.href.startsWith(
                      "http"
                    )
                      ? "noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3 transition hover:border-purple-500/20 hover:bg-purple-500/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[.04]">
                    <img
                      src={
                        contact.icon
                      }
                      alt={
                        contact.name
                      }
                      className="h-6 w-6 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black">
                      {
                        contact.name
                      }
                    </p>

                    <p className="mt-0.5 truncate text-[8px] text-zinc-600">
                      {
                        contact.description
                      }
                    </p>
                  </div>

                  <ArrowRight
                    size={12}
                    className="ml-auto text-zinc-700"
                  />
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Open contacts"
        onClick={() =>
          setOpen(!open)
        }
        className="fixed bottom-6 right-6 z-[81] flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-[0_15px_50px_rgba(124,58,237,.4)] transition hover:scale-110"
      >
        {open ? (
          <X size={20} />
        ) : (
          <MessageCircle
            size={21}
          />
        )}
      </button>
    </>
  );
}