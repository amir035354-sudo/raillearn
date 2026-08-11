"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  Flame,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type StudentStats = {
  xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
};

type QuizResult = {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

export default function ProgressPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<StudentStats>({
    xp: 0,
    level: 1,
    current_streak: 0,
    best_streak: 0,
  });

  const [results, setResults] = useState<QuizResult[]>([]);
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("USER ERROR:", userError);
        setLoading(false);
        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "Student";

      setUserName(String(name).split(" ")[0]);

      // =========================
      // STUDENT STATS
      // =========================

      const {
        data: statsData,
        error: statsError,
      } = await supabase
        .from("student_stats")
        .select(
          "xp, level, current_streak, best_streak"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsError) {
        console.error("STATS ERROR:", statsError);
      }

      if (statsData) {
        setStats({
          xp: Number(statsData.xp ?? 0),
          level: Number(statsData.level ?? 1),
          current_streak: Number(
            statsData.current_streak ?? 0
          ),
          best_streak: Number(
            statsData.best_streak ?? 0
          ),
        });
      }

      // =========================
      // QUIZ RESULTS
      // =========================

      const {
        data: quizData,
        error: quizError,
      } = await supabase
        .from("quiz_results")
        .select(
          "id, quiz_id, score, total_questions, completed_at"
        )
        .eq("user_id", user.id)
        .order("completed_at", {
          ascending: false,
        });

      if (quizError) {
        console.error(
          "QUIZ RESULTS ERROR:",
          quizError
        );
      }

      if (quizData) {
        setResults(
          quizData.map((item) => ({
            id: String(item.id),
            quiz_id: String(item.quiz_id),
            score: Number(item.score ?? 0),
            total_questions: Number(
              item.total_questions ?? 0
            ),
            completed_at: String(
              item.completed_at
            ),
          }))
        );
      }
    } catch (error) {
      console.error(
        "PROGRESS LOAD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // CALCULATIONS
  // =========================

  const currentLevelXP = stats.xp % 1000;

  const xpPercentage =
    (currentLevelXP / 1000) * 100;

  const totalQuizzes = results.length;

  const totalCorrect = results.reduce(
    (total, result) =>
      total + Number(result.score ?? 0),
    0
  );

  const totalQuestions = results.reduce(
    (total, result) =>
      total +
      Number(result.total_questions ?? 0),
    0
  );

  const overallPercentage =
    totalQuestions > 0
      ? Math.round(
          (totalCorrect / totalQuestions) *
            100
        )
      : 0;

  const passedQuizzes = results.filter(
    (result) => {
      const total =
        Number(result.total_questions ?? 0);

      const score =
        Number(result.score ?? 0);

      return (
        total > 0 &&
        (score / total) * 100 >= 60
      );
    }
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030305] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />

            <p className="mt-5 text-xs font-bold text-zinc-500">
              Loading progress...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[10%] h-96 w-96 rounded-full bg-purple-700/10 blur-[130px]" />

        <div className="absolute right-[-120px] top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-8 md:px-8 lg:py-10">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="mb-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition hover:text-purple-400"
            >
              <ArrowLeft size={14} />
              Dashboard
            </button>

            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
              Student Analytics
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              Your Progress
            </h1>

            <p className="mt-3 text-sm text-zinc-600">
              Keep going, {userName}. Every lesson
              gets you closer to mastery.
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/subjects")
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 text-[9px] font-black transition hover:bg-purple-500"
          >
            <BookOpen size={14} />
            Continue Learning
          </button>
        </div>

        {/* MAIN STATS */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Zap size={20} />}
            title="Total XP"
            value={String(stats.xp)}
            subtitle={`Level ${stats.level}`}
          />

          <StatCard
            icon={<Flame size={20} />}
            title="Current Streak"
            value={String(stats.current_streak)}
            subtitle={`Best: ${stats.best_streak}`}
          />

          <StatCard
            icon={<Target size={20} />}
            title="Quiz Accuracy"
            value={`${overallPercentage}%`}
            subtitle={`${totalCorrect}/${totalQuestions} correct`}
          />

          <StatCard
            icon={<Trophy size={20} />}
            title="Quizzes Passed"
            value={String(passedQuizzes)}
            subtitle={`${totalQuizzes} completed`}
          />
        </div>

        {/* GRID */}

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT */}

          <div className="space-y-7">
            {/* XP */}

            <section className="rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                    Level Progress
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Level {stats.level}
                  </h2>

                  <p className="mt-2 text-xs text-zinc-600">
                    {1000 - currentLevelXP} XP
                    until the next level
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <TrendingUp size={21} />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold text-zinc-500">
                    {currentLevelXP} / 1000 XP
                  </span>

                  <span className="text-xs font-black text-purple-400">
                    {Math.round(xpPercentage)}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400 transition-all"
                    style={{
                      width: `${xpPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* QUIZ PERFORMANCE */}

            <section className="rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                    Performance
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Quiz Results
                  </h2>
                </div>

                <Award
                  size={22}
                  className="text-purple-400"
                />
              </div>

              {results.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                  <Target
                    size={28}
                    className="mx-auto text-zinc-700"
                  />

                  <p className="mt-4 text-sm font-bold text-zinc-500">
                    No quiz results yet.
                  </p>

                  <button
                    onClick={() =>
                      router.push("/quizzes")
                    }
                    className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black"
                  >
                    Take a Quiz
                  </button>
                </div>
              ) : (
                <div className="mt-7 space-y-4">
                  {results.map((result) => {
                    const total =
                      Number(
                        result.total_questions
                      ) || 0;

                    const score =
                      Number(result.score) || 0;

                    const percentage =
                      total > 0
                        ? Math.round(
                            (score / total) *
                              100
                          )
                        : 0;

                    const passed =
                      percentage >= 60;

                    return (
                      <div
                        key={result.id}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black">
                              Track Geometry Quiz
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-600">
                              {formatDate(
                                result.completed_at
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-2xl font-black ${
                                passed
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {percentage}%
                            </p>

                            <p className="text-[8px] text-zinc-600">
                              {score}/{total}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={`h-full rounded-full ${
                              passed
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-4 flex justify-between">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-700">
                            Result
                          </span>

                          <span
                            className={`text-[8px] font-black uppercase tracking-wider ${
                              passed
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {passed
                              ? "Passed"
                              : "Failed"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT */}

          <div className="space-y-7">
            {/* LEVEL */}

            <section className="rounded-[30px] border border-purple-500/20 bg-gradient-to-br from-[#180b25] via-[#0b0910] to-[#050609] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Trophy size={21} />
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400">
                    Current Level
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    Level {stats.level}
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex justify-between text-[9px]">
                  <span className="text-zinc-600">
                    Progress
                  </span>

                  <span className="font-bold text-purple-400">
                    {Math.round(xpPercentage)}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{
                      width: `${xpPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-zinc-500">
                Earn XP by completing quizzes and
                learning activities.
              </p>
            </section>

            {/* STREAK */}

            <section className="rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Consistency
                  </p>

                  <h3 className="mt-2 text-xl font-black">
                    Study Streak
                  </h3>
                </div>

                <div className="text-3xl">
                  🔥
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <MiniStat
                  value={String(
                    stats.current_streak
                  )}
                  label="Current"
                />

                <MiniStat
                  value={String(
                    stats.best_streak
                  )}
                  label="Best"
                />
              </div>
            </section>

            {/* SUMMARY */}

            <section className="rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Overall Summary
              </p>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="Total quizzes"
                  value={String(totalQuizzes)}
                />

                <SummaryRow
                  label="Questions answered"
                  value={String(totalQuestions)}
                />

                <SummaryRow
                  label="Correct answers"
                  value={String(totalCorrect)}
                />

                <SummaryRow
                  label="Overall accuracy"
                  value={`${overallPercentage}%`}
                />

                <SummaryRow
                  label="Total XP"
                  value={String(stats.xp)}
                />
              </div>
            </section>

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] py-4 text-[9px] font-black text-zinc-500 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[25px] border border-white/[0.07] bg-[#07080d] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>

        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-700">
          {title}
        </span>
      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-zinc-600">
        {subtitle}
      </p>
    </div>
  );
}

// =====================================================
// MINI STAT
// =====================================================

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}

// =====================================================
// SUMMARY ROW
// =====================================================

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
      <span className="text-[10px] text-zinc-600">
        {label}
      </span>

      <span className="text-xs font-black text-white">
        {value}
      </span>
    </div>
  );
}

// =====================================================
// DATE
// =====================================================

function formatDate(value: string) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}