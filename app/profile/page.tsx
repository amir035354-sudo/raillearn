import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  User,
  ShieldCheck,
  GraduationCap,
  Trophy,
  Zap,
  Flame,
  BookOpen,
  BrainCircuit,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/5 bg-zinc-900 p-10 text-center">
          <h1 className="text-3xl font-bold">
            Please login again
          </h1>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-700"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  // =========================================
  // USER INFO
  // =========================================

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "RailLearn Student";

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  // =========================================
  // STUDENT STATS
  // =========================================

  const { data: stats } = await supabase
    .from("student_stats")
    .select(
      "xp, level, current_streak, best_streak, last_activity_date"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const currentStreak =
    stats?.current_streak ?? 0;
  const bestStreak =
    stats?.best_streak ?? 0;

  // =========================================
  // XP PROGRESS
  // =========================================

  const currentLevelXP =
    Math.pow(level, 2) * 50;

  const nextLevelXP =
    Math.pow(level + 1, 2) * 50;

  const levelXPRange =
    nextLevelXP - currentLevelXP;

  const earnedThisLevel =
    Math.max(0, xp - currentLevelXP);

  const xpProgress =
    levelXPRange > 0
      ? Math.min(
          100,
          Math.round(
            (earnedThisLevel /
              levelXPRange) *
              100
          )
        )
      : 0;

  const xpToNextLevel =
    Math.max(0, nextLevelXP - xp);

  // =========================================
  // LESSONS
  // =========================================

  const { count: completedLessons } =
    await supabase
      .from("lesson_progress")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

  // =========================================
  // QUIZ RESULTS
  // =========================================

  const { data: quizResults } =
    await supabase
      .from("quiz_results")
      .select(
        "id, score, total_questions, completed_at, quizzes(title)"
      )
      .eq("user_id", user.id)
      .order("completed_at", {
        ascending: false,
      });

  const quizzesCompleted =
    quizResults?.length ?? 0;

  let averageScore = 0;

  if (
    quizResults &&
    quizResults.length > 0
  ) {
    const totalPercentage =
      quizResults.reduce(
        (sum, quiz) => {
          if (
            !quiz.total_questions ||
            quiz.total_questions <= 0
          ) {
            return sum;
          }

          return (
            sum +
            (quiz.score /
              quiz.total_questions) *
              100
          );
        },
        0
      );

    averageScore = Math.round(
      totalPercentage /
        quizResults.length
    );
  }

  // =========================================
  // ACHIEVEMENTS
  // =========================================

  const { data: achievements } =
    await supabase
      .from("achievements")
      .select(
        "id, code, title, description, icon"
      )
      .order("created_at", {
        ascending: true,
      });

  const { data: userAchievements } =
    await supabase
      .from("user_achievements")
      .select(
        "achievement_id, unlocked_at"
      )
      .eq("user_id", user.id);

  const unlockedIds = new Set(
    (userAchievements ?? []).map(
      (item) => item.achievement_id
    )
  );

  const unlockedAchievements =
    (achievements ?? []).filter(
      (achievement) =>
        unlockedIds.has(
          achievement.id
        )
    );

  const lockedAchievements =
    (achievements ?? []).filter(
      (achievement) =>
        !unlockedIds.has(
          achievement.id
        )
    );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-purple-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* ===================================== */}
        {/* HERO */}
        {/* ===================================== */}

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-purple-950/50 via-zinc-900 to-zinc-950 p-8 md:p-10">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-purple-600/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-7 md:flex-row">

            {/* Avatar */}
            <div className="relative">

              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] bg-purple-600/10 ring-2 ring-purple-500/20">

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User
                    size={52}
                    className="text-purple-400"
                  />
                )}

              </div>

              <div className="absolute -bottom-3 -right-3 flex h-11 w-11 items-center justify-center rounded-xl border-4 border-zinc-950 bg-purple-600 font-bold">
                {level}
              </div>

            </div>

            {/* Name */}
            <div className="text-center md:text-left">

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
                Student Profile
              </p>

              <h1 className="mt-2 text-4xl font-bold md:text-5xl">
                {name}
              </h1>

              <p className="mt-3 flex items-center justify-center gap-2 text-zinc-400 md:justify-start">
                <Mail size={16} />
                {user.email}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">

                <span className="rounded-full border border-purple-500/20 bg-purple-600/10 px-4 py-2 text-sm font-semibold text-purple-300">
                  Level {level}
                </span>

                <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300">
                  🔥 {currentStreak} Day Streak
                </span>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================== */}
        {/* XP / LEVEL / STREAK */}
        {/* ===================================== */}

        <section className="mt-6 grid gap-5 md:grid-cols-3">

          {/* XP */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400">
                <Zap size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Experience
              </span>

            </div>

            <p className="mt-5 text-4xl font-bold">
              {xp}
              <span className="ml-2 text-lg text-zinc-600">
                XP
              </span>
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-purple-600 transition-all"
                style={{
                  width: `${xpProgress}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              {xpToNextLevel} XP to Level{" "}
              {level + 1}
            </p>

          </div>

          {/* Level */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                <Trophy size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Rank
              </span>

            </div>

            <p className="mt-5 text-4xl font-bold">
              Level {level}
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Keep learning to reach Level{" "}
              {level + 1}.
            </p>

          </div>

          {/* Streak */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Flame size={22} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Streak
              </span>

            </div>

            <p className="mt-5 text-4xl font-bold">
              {currentStreak}
              <span className="ml-2 text-lg text-zinc-600">
                days
              </span>
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Best streak:{" "}
              <span className="font-semibold text-orange-400">
                {bestStreak} days
              </span>
            </p>

          </div>

        </section>

        {/* ===================================== */}
        {/* STATISTICS */}
        {/* ===================================== */}

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <BookOpen size={22} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Lessons
                </p>

                <p className="text-2xl font-bold">
                  {completedLessons ?? 0}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <BrainCircuit size={22} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Quizzes
                </p>

                <p className="text-2xl font-bold">
                  {quizzesCompleted}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Average Score
                </p>

                <p className="text-2xl font-bold">
                  {averageScore}%
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ===================================== */}
        {/* DEPARTMENT */}
        {/* ===================================== */}

        <section className="mt-6 rounded-3xl border border-white/5 bg-zinc-900/70 p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400">
              <GraduationCap size={24} />
            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Department
              </p>

              <h2 className="mt-1 font-bold">
                Railway & Modern Transportation Technology
              </h2>

            </div>

          </div>

        </section>

        {/* ===================================== */}
        {/* ACHIEVEMENTS */}
        {/* ===================================== */}

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-7 md:p-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Trophy size={22} />
                </div>

                <h2 className="text-2xl font-bold">
                  Achievements
                </h2>

              </div>

              <p className="mt-3 text-sm text-zinc-500">
                {unlockedAchievements.length} of{" "}
                {achievements?.length ?? 0} unlocked
              </p>

            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 sm:w-40">

              <div
                className="h-full rounded-full bg-yellow-500"
                style={{
                  width: `${
                    achievements &&
                    achievements.length > 0
                      ? Math.round(
                          (unlockedAchievements.length /
                            achievements.length) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

          {/* Unlocked */}
          {unlockedAchievements.length >
            0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {unlockedAchievements.map(
                (achievement) => (
                  <div
                    key={achievement.id}
                    className="rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-5"
                  >

                    <div className="flex items-start gap-4">

                      <div className="text-3xl">
                        {achievement.icon ||
                          "🏆"}
                      </div>

                      <div>

                        <h3 className="font-bold text-yellow-300">
                          {achievement.title}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          {achievement.description}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-green-400">
                          ✓ Unlocked
                        </p>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {/* Locked */}
          {lockedAchievements.length >
            0 && (
            <>
              <div className="mt-8 border-t border-white/5 pt-8">

                <div className="flex items-center gap-2">

                  <Lock
                    size={18}
                    className="text-zinc-600"
                  />

                  <h3 className="font-bold">
                    Locked Achievements
                  </h3>

                </div>

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {lockedAchievements.map(
                  (achievement) => (
                    <div
                      key={achievement.id}
                      className="rounded-2xl border border-white/5 bg-zinc-950/50 p-5 opacity-60"
                    >

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-600">
                          <Lock size={18} />
                        </div>

                        <div>

                          <h3 className="font-bold text-zinc-400">
                            {achievement.title}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-600">
                            {achievement.description}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            </>
          )}

        </section>

        {/* ===================================== */}
        {/* RECENT QUIZZES */}
        {/* ===================================== */}

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-7 md:p-8">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Recent Quizzes
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Your latest quiz results
              </p>

            </div>

          </div>

          {quizResults &&
          quizResults.length > 0 ? (
            <div className="mt-6 space-y-3">

              {quizResults
                .slice(0, 5)
                .map((quiz) => {

                  const percentage =
                    quiz.total_questions >
                    0
                      ? Math.round(
                          (quiz.score /
                            quiz.total_questions) *
                            100
                        )
                      : 0;

                  const quizData =
                    Array.isArray(
                      quiz.quizzes
                    )
                      ? quiz.quizzes[0]
                      : quiz.quizzes;

                  return (
                    <div
                      key={quiz.id}
                      className="flex flex-col gap-4 rounded-2xl bg-zinc-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>

                        <h3 className="font-bold">
                          {quizData?.title ||
                            "Quiz"}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-600">
                          {quiz.score} /{" "}
                          {quiz.total_questions}
                        </p>

                      </div>

                      <div className="flex items-center gap-4">

                        <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-800">

                          <div
                            className={`h-full rounded-full ${
                              percentage >= 50
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <span
                          className={`font-bold ${
                            percentage >= 50
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {percentage}%
                        </span>

                      </div>

                    </div>
                  );
                })}

            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-zinc-950 p-8 text-center">

              <p className="text-zinc-500">
                No quizzes completed yet.
              </p>

            </div>
          )}

        </section>

        {/* ===================================== */}
        {/* ACCOUNT INFORMATION */}
        {/* ===================================== */}

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-7 md:p-8">

          <h2 className="text-2xl font-bold">
            Account Information
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-zinc-950 p-5">

              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Email
              </p>

              <p className="mt-2 break-all text-zinc-300">
                {user.email}
              </p>

            </div>

            <div className="rounded-2xl bg-zinc-950 p-5">

              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Account Status
              </p>

              <p className="mt-2 flex items-center gap-2 font-semibold text-green-400">
                <ShieldCheck size={17} />
                Active
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}