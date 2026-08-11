import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Trophy,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AchievementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#08080c] px-6 py-10 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/5 bg-zinc-900/70 p-10 text-center">
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

  // Get all achievements
  const { data: achievements, error: achievementsError } =
    await supabase
      .from("achievements")
      .select(
        "id, code, title, description, icon, xp_reward"
      )
      .order("xp_reward", {
        ascending: true,
      });

  if (achievementsError) {
    console.error(achievementsError);
    notFound();
  }

  // Get user's unlocked achievements
  const { data: unlockedAchievements } = await supabase
    .from("user_achievements")
    .select(
      "achievement_id, unlocked_at"
    )
    .eq("user_id", user.id);

  const unlockedMap = new Map(
    (unlockedAchievements ?? []).map((item) => [
      item.achievement_id,
      item.unlocked_at,
    ])
  );

  const totalAchievements =
    achievements?.length ?? 0;

  const unlockedCount =
    unlockedAchievements?.length ?? 0;

  const progress =
    totalAchievements > 0
      ? Math.round(
          (unlockedCount / totalAchievements) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#08080c] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-purple-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Hero */}
        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-purple-950/50 via-zinc-900 to-zinc-950 p-8 md:p-12">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />

          <div className="relative">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400">
                    <Trophy size={25} />
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
                    Achievements
                  </p>
                </div>

                <h1 className="mt-5 text-4xl font-bold md:text-5xl">
                  Your Journey
                </h1>

                <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                  Complete lessons, maintain your streak,
                  improve your level, and unlock achievements
                  along your RailLearn journey.
                </p>

              </div>

              {/* Counter */}
              <div className="rounded-3xl border border-white/5 bg-black/20 p-6 text-center backdrop-blur-xl">

                <p className="text-5xl font-bold text-purple-400">
                  {unlockedCount}
                  <span className="text-zinc-600">
                    {" "}
                    / {totalAchievements}
                  </span>
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Achievements Unlocked
                </p>

              </div>

            </div>

            {/* Progress */}
            <div className="mt-10">

              <div className="mb-3 flex items-center justify-between">

                <p className="text-sm font-semibold text-zinc-400">
                  Overall Progress
                </p>

                <p className="text-sm font-bold text-purple-400">
                  {progress}%
                </p>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">
            <p className="text-sm text-zinc-500">
              Unlocked
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {unlockedCount}
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">
            <p className="text-sm text-zinc-500">
              Remaining
            </p>

            <p className="mt-2 text-3xl font-bold text-zinc-300">
              {Math.max(
                totalAchievements - unlockedCount,
                0
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-6">
            <p className="text-sm text-zinc-500">
              Completion
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-400">
              {progress}%
            </p>
          </div>

        </section>

        {/* Achievements */}
        <section className="mt-10">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                Collection
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                All Achievements
              </h2>
            </div>

            <Sparkles
              className="text-purple-400"
              size={24}
            />

          </div>

          {achievements &&
          achievements.length > 0 ? (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {achievements.map((achievement) => {

                const unlocked =
                  unlockedMap.has(
                    achievement.id
                  );

                const unlockedAt =
                  unlockedMap.get(
                    achievement.id
                  );

                return (
                  <div
                    key={achievement.id}
                    className={`group relative overflow-hidden rounded-[2rem] border p-6 transition duration-300 ${
                      unlocked
                        ? "border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-zinc-900/80 to-zinc-950 hover:-translate-y-1 hover:border-purple-500/40"
                        : "border-white/5 bg-zinc-900/50"
                    }`}
                  >

                    {/* Glow */}
                    {unlocked && (
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-600/10 blur-3xl" />
                    )}

                    <div className="relative">

                      {/* Icon */}
                      <div className="flex items-start justify-between">

                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                            unlocked
                              ? "bg-purple-600/10 ring-1 ring-purple-500/20"
                              : "bg-zinc-800/70 grayscale"
                          }`}
                        >
                          {unlocked
                            ? achievement.icon ??
                              "🏆"
                            : "🔒"}
                        </div>

                        {unlocked ? (
                          <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                            <CheckCircle2 size={13} />
                            Unlocked
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-500">
                            <Lock size={13} />
                            Locked
                          </div>
                        )}

                      </div>

                      {/* Content */}
                      <h3
                        className={`mt-6 text-xl font-bold ${
                          unlocked
                            ? "text-white"
                            : "text-zinc-500"
                        }`}
                      >
                        {achievement.title}
                      </h3>

                      <p
                        className={`mt-3 min-h-[48px] text-sm leading-6 ${
                          unlocked
                            ? "text-zinc-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {achievement.description}
                      </p>

                      {/* XP */}
                      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">

                        <span className="text-xs uppercase tracking-wider text-zinc-600">
                          Reward
                        </span>

                        <span
                          className={`font-bold ${
                            unlocked
                              ? "text-purple-400"
                              : "text-zinc-600"
                          }`}
                        >
                          +{achievement.xp_reward ?? 0} XP
                        </span>

                      </div>

                      {/* Date */}
                      {unlocked &&
                        unlockedAt && (
                          <p className="mt-3 text-xs text-zinc-600">
                            Unlocked{" "}
                            {new Date(
                              unlockedAt
                            ).toLocaleDateString()}
                          </p>
                        )}

                    </div>

                  </div>
                );
              })}

            </div>

          ) : (
            <div className="rounded-3xl border border-white/5 bg-zinc-900/70 p-10 text-center">

              <Trophy
                size={40}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-4 text-zinc-500">
                No achievements available yet.
              </p>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}