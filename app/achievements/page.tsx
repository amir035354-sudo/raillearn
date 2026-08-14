import Link from "next/link";

import {
  ArrowLeft,
  Award,
  Brain,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  Footprints,
  Lock,
  Sparkles,
  Star,
  Target,
  TrainFront,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string | null;
  xp_reward: number;
  category: string | null;
  requirement_type: string | null;
  requirement_value: number | null;
  display_order: number | null;
  active: boolean | null;
  created_at: string;
};

type UserAchievement = {
  id: string;
  achievement_id: string;
  unlocked_at: string | null;
};

type QuizResultRow = {
  quiz_id: string;
  score: number | null;
  total_questions: number | null;
};

type StudentStatsRow = {
  user_id: string;
  xp: number | null;
  level: number | null;
  current_streak: number | null;
  best_streak: number | null;
  last_activity_date: string | null;
};

/* =========================================================
   ICON
========================================================= */

function AchievementIcon({
  icon,
  unlocked,
}: {
  icon: string | null;
  unlocked: boolean;
}) {
  const iconClass = unlocked
    ? "text-purple-400"
    : "text-zinc-600";

  const size = 28;

  const normalized = (icon ?? "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "trophy":
      return (
        <Trophy
          size={size}
          className={iconClass}
        />
      );

    case "star":
      return (
        <Star
          size={size}
          className={iconClass}
        />
      );

    case "zap":
      return (
        <Zap
          size={size}
          className={iconClass}
        />
      );

    case "flame":
      return (
        <Flame
          size={size}
          className={iconClass}
        />
      );

    case "target":
      return (
        <Target
          size={size}
          className={iconClass}
        />
      );

    case "brain":
      return (
        <Brain
          size={size}
          className={iconClass}
        />
      );

    case "train":
      return (
        <TrainFront
          size={size}
          className={iconClass}
        />
      );

    case "book":
    case "book-open":
      return (
        <BookOpen
          size={size}
          className={iconClass}
        />
      );

    case "footprints":
      return (
        <Footprints
          size={size}
          className={iconClass}
        />
      );

    case "award":
      return (
        <Award
          size={size}
          className={iconClass}
        />
      );

    default:
      return (
        <Trophy
          size={size}
          className={iconClass}
        />
      );
  }
}

/* =========================================================
   CATEGORY
========================================================= */

function formatCategory(
  category: string | null
) {
  if (!category) {
    return "General";
  }

  return category
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   REQUIREMENT TYPE
========================================================= */

function normalizeRequirementType(
  value: string | null | undefined
) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/* =========================================================
   REQUIREMENT TEXT
========================================================= */

function formatRequirement(
  type: string | null,
  value: number | null
) {
  const normalizedType =
    normalizeRequirementType(type);

  const amount = Math.max(
    Number(value ?? 1),
    1
  );

  switch (normalizedType) {
    case "lesson":
    case "lessons":
    case "lesson_completed":
    case "lessons_completed":
    case "completed_lessons":
      return `Complete ${amount} lesson${amount === 1 ? "" : "s"
        }`;

    case "quiz":
    case "quizzes":
    case "quiz_completed":
    case "quizzes_completed":
    case "quiz_attempt":
    case "quiz_attempts":
    case "quizzes_taken":
      return `Complete ${amount} quiz${amount === 1 ? "" : "zes"
        }`;

    case "xp":
    case "total_xp":
    case "xp_earned":
      return `Earn ${amount} XP`;

    case "level":
      return `Reach level ${amount}`;

    case "streak":
    case "current_streak":
      return `Maintain a ${amount} day streak`;

    case "perfect_quiz":
      return "Get a perfect quiz score";

    case "course":
    case "courses":
    case "course_completed":
    case "courses_completed":
      return `Complete ${amount} course${amount === 1 ? "" : "s"
        }`;

    default:
      return `${formatCategory(type)}: ${amount}`;
  }
}

/* =========================================================
   REQUIREMENT PROGRESS
========================================================= */

function getAchievementProgress({
  achievement,
  completedLessons,
  completedQuizzes,
  hasPerfectQuiz,
  xp,
  level,
  currentStreak,
  bestStreak,
  officiallyUnlocked,
}: {
  achievement: Achievement;
  completedLessons: number;
  completedQuizzes: number;
  hasPerfectQuiz: boolean;
  xp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  officiallyUnlocked: boolean;
}) {
  const type =
    normalizeRequirementType(
      achievement.requirement_type
    );

  const required = Math.max(
    Number(
      achievement.requirement_value ?? 1
    ),
    1
  );

  let current = 0;

  switch (type) {
    case "lesson":
    case "lessons":
    case "lesson_completed":
    case "lessons_completed":
    case "completed_lessons":
      current = completedLessons;
      break;

    case "quiz":
    case "quizzes":
    case "quiz_completed":
    case "quizzes_completed":
    case "quiz_attempt":
    case "quiz_attempts":
    case "quizzes_taken":
      current = completedQuizzes;
      break;

    case "xp":
    case "total_xp":
    case "xp_earned":
      current = xp;
      break;

    case "level":
      current = level;
      break;

    case "streak":
    case "current_streak":
      current = Math.max(
        currentStreak,
        bestStreak
      );
      break;

    case "perfect_quiz":
      current = hasPerfectQuiz ? 1 : 0;
      break;

    default:
      current = 0;
      break;
  }

  const percentage =
    type === "perfect_quiz"
      ? officiallyUnlocked
        ? 100
        : 0
      : Math.min(
        Math.round(
          (current / required) * 100
        ),
        100
      );

  return {
    current,
    required,
    percentage,
    unlocked: officiallyUnlocked,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function AchievementsPage() {
  const supabase =
    await createClient();

  /* =======================================================
     USER
  ======================================================= */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(
      "ACHIEVEMENTS USER ERROR:",
      userError
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#020203] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-white/[0.07] bg-[#07070b] p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-purple-500/20 bg-purple-500/10">
              <Trophy
                size={32}
                className="text-purple-400"
              />
            </div>

            <p className="mt-7 text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
              RailLearn
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Please login again
            </h1>

            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Your session has expired.
              Login again to view your
              achievements.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-[9px] font-black uppercase tracking-wider shadow-[0_15px_40px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
            >
              Login
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PARALLEL DATA
  ======================================================= */

  const [
    achievementsResponse,
    lessonProgressResponse,
    legacyProgressResponse,
    quizResultsResponse,
    studentStatsResponse,
    userAchievementsResponse,
  ] = await Promise.all([
    /* ACHIEVEMENTS */
    supabase
      .from("achievements")
      .select(`
        id,
        code,
        title,
        description,
        icon,
        xp_reward,
        category,
        requirement_type,
        requirement_value,
        display_order,
        active,
        created_at
      `)
      .eq("active", true)
      .order("display_order", {
        ascending: true,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: true,
      }),

    /* CURRENT PROGRESS */
    supabase
      .from("lesson_progress")
      .select(`
        lesson_id,
        completed
      `)
      .eq("user_id", user.id)
      .eq("completed", true),

    /* LEGACY PROGRESS */
    supabase
      .from("progress")
      .select(`
        lesson_id,
        completed
      `)
      .eq("user_id", user.id)
      .eq("completed", true),

    /* QUIZ RESULTS */
    supabase
      .from("quiz_results")
      .select(`
        quiz_id,
        score,
        total_questions
      `)
      .eq("user_id", user.id),

    /* STATS */
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
      .eq("user_id", user.id)
      .maybeSingle(),

    /* OFFICIAL UNLOCKED ACHIEVEMENTS */
    supabase
      .from("user_achievements")
      .select(`
        id,
        achievement_id,
        unlocked_at
      `)
      .eq("user_id", user.id),
  ]);

  /* =======================================================
     ACHIEVEMENTS ERROR
  ======================================================= */

  if (
    achievementsResponse.error
  ) {
    console.error(
      "ACHIEVEMENTS LOAD ERROR:",
      achievementsResponse.error
    );

    return (
      <main className="min-h-screen bg-[#020203] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-red-500/10 bg-[#07070b] p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-red-500/20 bg-red-500/10">
              <Target
                size={30}
                className="text-red-400"
              />
            </div>

            <p className="mt-7 text-[8px] font-black uppercase tracking-[0.3em] text-red-400">
              Achievements Error
            </p>

            <h1 className="mt-3 text-2xl font-black">
              Could not load achievements
            </h1>

            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Something went wrong while
              loading the achievement
              collection.
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-4 text-[9px] font-black uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     CLEAN DATA
  ======================================================= */

  const cleanAchievements =
    (achievementsResponse.data ??
      []) as Achievement[];

  const userAchievements =
    (userAchievementsResponse.data ??
      []) as UserAchievement[];

  /* =======================================================
     OFFICIAL UNLOCK MAP
     
     IMPORTANT:
     user_achievements is now the source
     of truth for unlocked state.
  ======================================================= */

  const unlockedAchievementMap =
    new Map<string, UserAchievement>();

  for (const row of userAchievements) {
    unlockedAchievementMap.set(
      String(row.achievement_id),
      row
    );
  }

  /* =======================================================
     LESSON STATS
  ======================================================= */

  const completedLessonIds =
    new Set<string>();

  for (const row of
    (lessonProgressResponse.data ??
      []) as Array<{
        lesson_id: string | null;
        completed: boolean | null;
      }>) {
    if (
      row.completed === true &&
      row.lesson_id
    ) {
      completedLessonIds.add(
        String(row.lesson_id)
      );
    }
  }

  for (const row of
    (legacyProgressResponse.data ??
      []) as Array<{
        lesson_id: string | null;
        completed: boolean | null;
      }>) {
    if (
      row.completed === true &&
      row.lesson_id
    ) {
      completedLessonIds.add(
        String(row.lesson_id)
      );
    }
  }

  const completedLessons =
    completedLessonIds.size;

  /* =======================================================
     QUIZ STATS
  ======================================================= */

  const quizResults =
    (quizResultsResponse.data ??
      []) as QuizResultRow[];

  const completedQuizIds =
    new Set<string>();

  for (const result of quizResults) {
    if (result.quiz_id) {
      completedQuizIds.add(
        String(result.quiz_id)
      );
    }
  }

  const completedQuizzes =
    completedQuizIds.size;

  const hasPerfectQuiz =
    quizResults.some((result) => {
      const score =
        Number(result.score ?? 0);

      const total =
        Number(
          result.total_questions ?? 0
        );

      return (
        total > 0 &&
        score === total
      );
    });

  /* =======================================================
     STUDENT STATS
  ======================================================= */

  const studentStats =
    studentStatsResponse.data as
    | StudentStatsRow
    | null;

  const xp = Number(
    studentStats?.xp ?? 0
  );

  const level = Number(
    studentStats?.level ?? 1
  );

  const currentStreak = Number(
    studentStats?.current_streak ?? 0
  );

  const bestStreak = Number(
    studentStats?.best_streak ?? 0
  );

  /* =======================================================
     ACHIEVEMENT STATE
  ======================================================= */

  const achievementState =
    cleanAchievements.map(
      (achievement) => {
        const official =
          unlockedAchievementMap.get(
            String(achievement.id)
          );

        const progress =
          getAchievementProgress({
            achievement,
            completedLessons,
            completedQuizzes,
            hasPerfectQuiz,
            xp,
            level,
            currentStreak,
            bestStreak,
            officiallyUnlocked:
              Boolean(official),
          });

        return {
          achievement,
          ...progress,
          unlockedAt:
            official?.unlocked_at ??
            null,
        };
      }
    );

  /* =======================================================
     UNLOCKED / LOCKED
  ======================================================= */

  const unlockedAchievements =
    achievementState.filter(
      (item) => item.unlocked
    );

  const lockedAchievements =
    achievementState.filter(
      (item) => !item.unlocked
    );

  const totalAchievements =
    cleanAchievements.length;

  const unlockedCount =
    unlockedAchievements.length;

  const lockedCount =
    lockedAchievements.length;

  const completion =
    totalAchievements > 0
      ? Math.round(
        (unlockedCount /
          totalAchievements) *
        100
      )
      : 0;

  /* =======================================================
     UNLOCKED XP
  ======================================================= */

  const unlockedXP =
    unlockedAchievements.reduce(
      (total, item) =>
        total +
        Number(
          item.achievement
            .xp_reward ?? 0
        ),
      0
    );

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories =
    Array.from(
      new Set(
        cleanAchievements.map(
          (achievement) =>
            achievement.category ??
            "general"
        )
      )
    );

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020203] text-white">
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-220px] top-[-180px] h-[650px] w-[650px] rounded-full bg-purple-700/[0.10] blur-[180px]" />

        <div className="absolute right-[-250px] top-[15%] h-[650px] w-[650px] rounded-full bg-violet-600/[0.08] blur-[180px]" />

        <div className="absolute bottom-[-250px] left-[25%] h-[600px] w-[600px] rounded-full bg-fuchsia-700/[0.06] blur-[180px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize:
              "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1450px] px-5 py-6 md:px-8 lg:py-9 xl:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500 backdrop-blur-md transition hover:border-purple-500/20 hover:bg-purple-500/[0.04] hover:text-purple-300"
          >
            <ArrowLeft
              size={14}
              className="transition group-hover:-translate-x-1"
            />
            Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/ai"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-400 transition hover:bg-purple-500/[0.15]"
              title="Ask Miro"
            >
              <Brain size={17} />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-400">
              <Trophy size={18} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-black">
                RailLearn
              </p>

              <p className="text-[7px] font-black uppercase tracking-[0.28em] text-zinc-700">
                Achievement Center
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mt-10 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#07070b]/90 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />

          <div className="pointer-events-none absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[110px]" />

          <div className="relative p-7 md:p-10 lg:p-12">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="h-px w-9 bg-gradient-to-r from-purple-500 to-transparent" />

                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                    Achievement Center
                  </p>
                </div>

                <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] md:text-6xl">
                  Your

                  <span className="ml-3 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">
                    Achievements
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-500">
                  Complete lessons, master
                  quizzes, build your streak
                  and earn XP to unlock
                  achievements throughout
                  your RailLearn journey.
                </p>
              </div>

              <div className="shrink-0 rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-7 text-center backdrop-blur-xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                  <Trophy size={25} />
                </div>

                <p className="mt-4 text-4xl font-black">
                  {unlockedCount}

                  <span className="text-zinc-700">
                    /{totalAchievements}
                  </span>
                </p>

                <p className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  Unlocked
                </p>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="mt-10">
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider">
                <span className="text-zinc-600">
                  Collection Progress
                </span>

                <span className="text-purple-400">
                  {completion}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400 shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all duration-1000"
                  style={{
                    width: `${completion}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <AchievementStat
            icon={<Trophy size={17} />}
            label="Unlocked"
            value={String(unlockedCount)}
          />

          <AchievementStat
            icon={<Lock size={17} />}
            label="Remaining"
            value={String(lockedCount)}
          />

          <AchievementStat
            icon={<Zap size={17} />}
            label="Achievement XP"
            value={String(unlockedXP)}
          />

          <AchievementStat
            icon={<TrendingUp size={17} />}
            label="Level"
            value={String(level)}
          />

          <AchievementStat
            icon={<Flame size={17} />}
            label="Streak"
            value={`${currentStreak}d`}
          />
        </section>

        {/* =================================================
            PLAYER SNAPSHOT
        ================================================= */}

        <section className="mt-8 grid gap-3 md:grid-cols-4">
          <Snapshot
            icon={<BookOpen size={16} />}
            label="Lessons"
            value={String(completedLessons)}
          />

          <Snapshot
            icon={<Target size={16} />}
            label="Quizzes"
            value={String(completedQuizzes)}
          />

          <Snapshot
            icon={<Zap size={16} />}
            label="XP"
            value={String(xp)}
          />

          <Snapshot
            icon={<Flame size={16} />}
            label="Best Streak"
            value={`${bestStreak} days`}
          />
        </section>

        {/* =================================================
            CATEGORY SUMMARY
        ================================================= */}

        {categories.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                Categories
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Achievement Collection
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(
                (category) => {
                  const categoryState =
                    achievementState.filter(
                      (item) =>
                        (item
                          .achievement
                          .category ??
                          "general") ===
                        category
                    );

                  const categoryUnlocked =
                    categoryState.filter(
                      (item) =>
                        item.unlocked
                    ).length;

                  return (
                    <div
                      key={category}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <p className="text-[8px] font-black uppercase tracking-wider text-zinc-500">
                        {formatCategory(
                          category
                        )}
                      </p>

                      <p className="mt-1 text-xs font-black">
                        {categoryUnlocked}/
                        {
                          categoryState.length
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* =================================================
            COLLECTION
        ================================================= */}

        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                Collection
              </p>

              <h2 className="mt-2 text-2xl font-black md:text-3xl">
                All Achievements
              </h2>
            </div>

            <Sparkles
              size={22}
              className="text-purple-400"
            />
          </div>

          {cleanAchievements.length ===
            0 ? (
            <EmptyAchievements />
          ) : (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {achievementState.map(
                (item) => (
                  <AchievementCard
                    key={
                      item
                        .achievement
                        .id
                    }
                    achievement={
                      item.achievement
                    }
                    unlocked={
                      item.unlocked
                    }
                    current={
                      item.current
                    }
                    required={
                      item.required
                    }
                    percentage={
                      item.percentage
                    }
                    unlockedAt={
                      item.unlockedAt
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="py-14 text-center">
          <div className="mx-auto mb-4 h-px w-20 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <p className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-800">
            RailLearn • Railway &
            Modern Transportation
            Technology
          </p>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   ACHIEVEMENT CARD
========================================================= */

function AchievementCard({
  achievement,
  unlocked,
  current,
  required,
  percentage,
  unlockedAt,
}: {
  achievement: Achievement;
  unlocked: boolean;
  current: number;
  required: number;
  percentage: number;
  unlockedAt: string | null;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[30px] border p-6 transition-all duration-500 ${unlocked
          ? "border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] via-[#08080d] to-[#07070b] shadow-[0_20px_80px_rgba(124,58,237,0.06)] hover:-translate-y-1 hover:border-purple-500/35"
          : "border-white/[0.07] bg-[#07070b]"
        }`}
    >
      {unlocked && (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-purple-600/15 blur-[70px]" />

          <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-fuchsia-600/[0.05] blur-[70px]" />
        </>
      )}

      <div className="relative">
        {/* TOP */}

        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border ${unlocked
                ? "border-purple-500/20 bg-purple-500/10"
                : "border-white/[0.05] bg-white/[0.03]"
              }`}
          >
            {unlocked ? (
              <AchievementIcon
                icon={achievement.icon}
                unlocked
              />
            ) : (
              <Lock
                size={26}
                className="text-zinc-700"
              />
            )}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[7px] font-black uppercase tracking-[0.14em] ${unlocked
                ? "border-green-500/15 bg-green-500/10 text-green-400"
                : "border-white/[0.06] bg-white/[0.03] text-zinc-700"
              }`}
          >
            {unlocked ? (
              <>
                <CheckCircle2 size={10} />
                Unlocked
              </>
            ) : (
              <>
                <Lock size={10} />
                Locked
              </>
            )}
          </div>
        </div>

        {/* CATEGORY */}

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-purple-400">
            {formatCategory(
              achievement.category
            )}
          </span>

          <span className="text-[7px] font-black uppercase tracking-[0.15em] text-zinc-700">
            {achievement.code}
          </span>
        </div>

        {/* TITLE */}

        <h3
          className={`mt-3 text-xl font-black ${unlocked
              ? "text-white"
              : "text-zinc-500"
            }`}
        >
          {achievement.title}
        </h3>

        {/* DESCRIPTION */}

        <p
          className={`mt-3 min-h-[48px] text-xs leading-6 ${unlocked
              ? "text-zinc-500"
              : "text-zinc-700"
            }`}
        >
          {achievement.description}
        </p>

        {/* REQUIREMENT */}

        <div
          className={`mt-5 rounded-2xl border p-4 ${unlocked
              ? "border-purple-500/10 bg-purple-500/[0.04]"
              : "border-white/[0.05] bg-white/[0.02]"
            }`}
        >
          <div className="flex items-center gap-2">
            <Target
              size={13}
              className={
                unlocked
                  ? "text-purple-400"
                  : "text-zinc-700"
              }
            />

            <span className="text-[7px] font-black uppercase tracking-[0.15em] text-zinc-600">
              Requirement
            </span>
          </div>

          <p
            className={`mt-2 text-xs font-bold ${unlocked
                ? "text-zinc-300"
                : "text-zinc-600"
              }`}
          >
            {formatRequirement(
              achievement.requirement_type,
              achievement.requirement_value
            )}
          </p>

          {!unlocked &&
            achievement.requirement_type && (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400 transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-[8px] font-bold text-zinc-700">
                  {formatCurrentProgress(
                    achievement.requirement_type,
                    current,
                    required
                  )}
                </p>
              </>
            )}

          {unlocked &&
            unlockedAt && (
              <p className="mt-3 text-[8px] font-bold text-green-500/60">
                Unlocked{" "}
                {new Date(
                  unlockedAt
                ).toLocaleDateString()}
              </p>
            )}
        </div>

        {/* BOTTOM */}

        <div className="mt-5 flex items-end justify-between border-t border-white/[0.05] pt-5">
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.15em] text-zinc-700">
              Reward
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <Zap
                size={13}
                className={
                  unlocked
                    ? "text-purple-400"
                    : "text-zinc-700"
                }
              />

              <span
                className={`text-sm font-black ${unlocked
                    ? "text-purple-400"
                    : "text-zinc-600"
                  }`}
              >
                +{achievement.xp_reward} XP
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[7px] font-black uppercase tracking-[0.15em] text-zinc-700">
              Status
            </p>

            <p
              className={`mt-1 text-[9px] font-bold ${unlocked
                  ? "text-green-400"
                  : "text-zinc-700"
                }`}
            >
              {unlocked
                ? "Unlocked"
                : "In Progress"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CURRENT PROGRESS TEXT
========================================================= */

function formatCurrentProgress(
  type: string | null,
  current: number,
  required: number
) {
  const normalized =
    normalizeRequirementType(type);

  if (
    normalized === "perfect_quiz"
  ) {
    return current >= 1
      ? "1 / 1"
      : "0 / 1";
  }

  return `${Math.min(
    current,
    required
  )} / ${required}`;
}

/* =========================================================
   STAT
========================================================= */

function AchievementStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[7px] font-black uppercase tracking-[0.18em] text-zinc-700">
          {label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SNAPSHOT
========================================================= */

function Snapshot({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-700">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-black">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyAchievements() {
  return (
    <div className="relative mt-7 overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#07070b] p-12 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[100px]" />

      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-purple-500/15 bg-purple-500/10">
          <Trophy
            size={30}
            className="text-purple-400"
          />
        </div>

        <p className="mt-7 text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
          Collection Empty
        </p>

        <h3 className="mt-3 text-2xl font-black">
          No achievements yet
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-600">
          Achievements will appear
          here once they are added
          to the RailLearn system.
        </p>
      </div>
    </div>
  );
}