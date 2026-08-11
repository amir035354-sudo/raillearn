"use client";

import {
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Target,
  Trophy,
  TrainFront,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { ReactNode, ElementType } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const QUIZ_ID = "7760ba9f-bfe2-448a-82f7-8a75f4dc29cc";

type QuizResult = {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

type StudentStats = {
  xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
};

type Subject = {
  name: string;
  progress: number;
  image: string;
  icon: ElementType;
  href: string;
};

const subjects: Subject[] = [
  {
    name: "Railway Engineering",
    progress: 72,
    image: "/images/train-hero.jfif",
    icon: TrainFront,
    href: "/subjects/railway-engineering",
  },
  {
    name: "Engineering Mathematics",
    progress: 80,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
    icon: Gauge,
    href: "/subjects",
  },
  {
    name: "Mechanics",
    progress: 65,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    icon: Settings,
    href: "/subjects",
  },
  {
    name: "Electrical Engineering",
    progress: 48,
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
    icon: Zap,
    href: "/subjects",
  },
  {
    name: "Railway Signaling",
    progress: 35,
    image:
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1200&auto=format&fit=crop",
    icon: Target,
    href: "/subjects",
  },
  {
    name: "Programming",
    progress: 91,
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    icon: Code2,
    href: "/subjects",
  },
];

const journey = [
  { title: "Basics", done: true },
  { title: "Rail Types", done: true },
  { title: "Track Structure", done: true },
  { title: "Track Geometry", current: true },
  { title: "Signals", done: false },
  { title: "Final Review", done: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<StudentStats>({
    xp: 0,
    level: 1,
    current_streak: 0,
    best_streak: 0,
  });

  const [quizResult, setQuizResult] =
    useState<QuizResult | null>(null);

  const [userName, setUserName] = useState("Amir");

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // ==========================================
      // USER
      // ==========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("USER ERROR:", userError);
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // ==========================================
      // USER NAME
      // ==========================================

      const metadataName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "Amir";

      setUserName(
        String(metadataName).split(" ")[0] || "Amir"
      );

      // ==========================================
      // STUDENT STATS
      // ==========================================

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

      // ==========================================
      // LATEST QUIZ RESULT
      // ==========================================

      const {
        data: quizRows,
        error: quizResultError,
      } = await supabase
        .from("quiz_results")
        .select(
          "id, quiz_id, score, total_questions, completed_at"
        )
        .eq("user_id", user.id)
        .eq("quiz_id", QUIZ_ID)
        .order("completed_at", {
          ascending: false,
        })
        .limit(1);

      if (quizResultError) {
        console.error(
          "QUIZ RESULT ERROR:",
          quizResultError
        );

        setQuizResult(null);
      } else {
        const row = quizRows?.[0] ?? null;

        if (row) {
          setQuizResult({
            id: String(row.id),
            quiz_id: String(row.quiz_id),
            score: Number(row.score ?? 0),
            total_questions: Number(
              row.total_questions ?? 0
            ),
            completed_at: String(
              row.completed_at ?? ""
            ),
          });
        } else {
          setQuizResult(null);
        }
      }
    } catch (error) {
      console.error(
        "DASHBOARD LOAD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function goTo(path: string) {
    setMobileMenu(false);
    router.push(path);
  }

  const quizPercentage =
    quizResult &&
    quizResult.total_questions > 0
      ? Math.round(
          (quizResult.score /
            quizResult.total_questions) *
            100
        )
      : 0;

  const xpProgress = stats.xp % 1000;

  const xpPercentage =
    (xpProgress / 1000) * 100;

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[10%] h-96 w-96 rounded-full bg-purple-700/10 blur-[130px]" />

        <div className="absolute right-[-120px] top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/[0.07] blur-[130px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* =========================================
            MOBILE MENU
        ========================================= */}

        {mobileMenu && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() =>
                setMobileMenu(false)
              }
            />

            <aside className="relative h-full w-[285px] border-r border-white/10 bg-[#060609] p-5 shadow-2xl">
              <div className="mb-10 flex items-center justify-between">
                <Logo />

                <button
                  onClick={() =>
                    setMobileMenu(false)
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>

              <Navigation goTo={goTo} />
            </aside>
          </div>
        )}

        {/* =========================================
            SIDEBAR
        ========================================= */}

        <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="px-6 py-7">
              <Logo />
            </div>

            <div className="flex-1 px-4">
              <Navigation goTo={goTo} />
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-800 text-sm font-black">
                    {userName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      {userName}
                    </p>

                    <p className="mt-1 text-[9px] text-purple-400">
                      Railway Student
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-zinc-600">
                      {xpProgress} / 1000 XP
                    </span>

                    <span className="text-purple-400">
                      {Math.round(
                        xpPercentage
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400"
                      style={{
                        width: `${xpPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================
            MAIN
        ========================================= */}

        <div className="min-w-0 flex-1">
          {/* HEADER */}

          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/80 backdrop-blur-2xl">
            <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setMobileMenu(true)
                  }
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 lg:hidden"
                >
                  <Menu size={19} />
                </button>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                    Railway Academy
                  </p>

                  <h1 className="mt-1 text-sm font-bold">
                    Student Dashboard
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    goTo("/ai")
                  }
                  className="hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-zinc-500 transition hover:text-white sm:block"
                >
                  <BrainCircuit size={17} />
                </button>

                <button
                  onClick={() =>
                    alert(
                      "You have no new notifications."
                    )
                  }
                  className="relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-zinc-500 transition hover:text-white"
                >
                  <Bell size={17} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-purple-500" />
                </button>

                <div className="hidden h-8 w-px bg-white/[0.07] sm:block" />

                <button
                  onClick={() =>
                    goTo("/settings")
                  }
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-2 pr-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-800 text-xs font-black">
                    {userName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="hidden text-left sm:block">
                    <p className="text-[10px] font-bold">
                      {userName}
                    </p>

                    <p className="text-[8px] text-zinc-600">
                      Level {stats.level}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">
            {loading ? (
              <div className="flex min-h-[600px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />

                  <p className="mt-5 text-xs font-bold text-zinc-500">
                    Loading dashboard...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* =====================================
                    TOP
                ===================================== */}

                <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
                      Your learning dashboard
                    </p>

                    <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                      Good evening,{" "}
                      <span className="text-purple-500">
                        {userName}
                      </span>{" "}
                      👋
                    </h2>

                    <p className="mt-2 text-sm text-zinc-600">
                      Continue your journey through
                      railway engineering.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Stat
                      icon={<Zap size={14} />}
                      value={String(stats.xp)}
                      label="XP"
                    />

                    <Stat
                      icon={<Trophy size={14} />}
                      value={String(stats.level)}
                      label="Level"
                    />

                    <Stat
                      icon={<span>🔥</span>}
                      value={String(
                        stats.current_streak
                      )}
                      label="Streak"
                    />
                  </div>
                </div>

                <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_330px]">
                  <div>
                    {/* =================================
                        HERO
                    ================================= */}

                    <section className="group relative min-h-[535px] overflow-hidden rounded-[30px] border border-white/[0.09] bg-gradient-to-br from-[#11091b] via-[#08080d] to-[#050507] shadow-[0_25px_100px_rgba(0,0,0,0.35)]">
                      <img
                        src="/images/train-hero.jfif"
                        alt="Railway"
                        className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-[1800ms] group-hover:scale-[1.035]"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/85 to-transparent" />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-[#030305]/20" />

                      <div className="relative z-10 flex min-h-[535px] flex-col p-6 md:p-10">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-300">
                              Currently Learning
                            </span>
                          </div>

                          <h3 className="mt-5 max-w-xl text-3xl font-black leading-tight md:text-5xl">
                            Railway
                            <br />
                            <span className="text-purple-500">
                              Engineering
                            </span>
                          </h3>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                            <span className="text-zinc-500">
                              Chapter 04
                            </span>

                            <span className="h-1 w-1 rounded-full bg-zinc-700" />

                            <span className="font-bold">
                              Track Geometry
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto max-w-[680px]">
                          <div className="mb-7 flex items-end gap-10">
                            <div>
                              <p className="text-5xl font-black">
                                72%
                              </p>

                              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                                Course complete
                              </p>
                            </div>

                            <div>
                              <p className="text-2xl font-black">
                                18m
                              </p>

                              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                                Remaining
                              </p>
                            </div>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400" />
                          </div>

                          <div className="mt-6 flex flex-wrap items-center gap-4">
                            <button
                              onClick={() =>
                                goTo(
                                  "/subjects/railway-engineering"
                                )
                              }
                              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3.5 text-[10px] font-black transition hover:opacity-90"
                            >
                              Continue Learning
                              <ArrowRight size={15} />
                            </button>

                            <div className="flex items-center gap-2 text-[9px] text-zinc-600">
                              <BookOpen size={13} />
                              Lesson 14 of 21
                            </div>
                          </div>

                          <div className="relative mt-10">
                            <div className="absolute left-0 right-0 top-4 h-px bg-white/[0.08]" />

                            <div className="absolute left-0 top-4 h-px w-[72%] bg-gradient-to-r from-purple-700 to-fuchsia-400" />

                            <div className="relative flex justify-between">
                              {journey.map(
                                (item, index) => (
                                  <div
                                    key={item.title}
                                    className="flex max-w-[85px] flex-col items-center text-center"
                                  >
                                    <div
                                      className={`flex items-center justify-center rounded-full border text-[8px] font-bold ${
                                        item.current
                                          ? "h-10 w-10 border-purple-300 bg-purple-500 text-white"
                                          : item.done
                                          ? "h-8 w-8 border-purple-500/40 bg-purple-500/15 text-purple-300"
                                          : "h-8 w-8 border-white/10 bg-[#08080d] text-zinc-700"
                                      }`}
                                    >
                                      {item.done ? (
                                        <Check size={13} />
                                      ) : (
                                        index + 1
                                      )}
                                    </div>

                                    <span className="mt-3 hidden text-[8px] font-semibold text-zinc-600 sm:block">
                                      {item.title}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* =================================
                        QUIZ RESULT
                    ================================= */}

                    <section className="mt-7 rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                            Latest Quiz
                          </p>

                          <h3 className="mt-2 text-2xl font-black">
                            Track Geometry Quiz
                          </h3>

                          <p className="mt-2 text-xs text-zinc-600">
                            {quizResult
                              ? "Your latest submitted result"
                              : "You have not completed this quiz yet."}
                          </p>
                        </div>

                        {quizResult ? (
                          <div className="text-right">
                            <p className="text-4xl font-black text-purple-400">
                              {quizPercentage}%
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-600">
                              {quizResult.score}/
                              {
                                quizResult.total_questions
                              }{" "}
                              correct
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              goTo(
                                "/subjects/railway-engineering/lessons/track-geometry/quiz"
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black transition hover:bg-purple-500"
                          >
                            Start Quiz
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>

                      {quizResult && (
                        <div className="mt-6">
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className={`h-full rounded-full ${
                                quizPercentage >= 60
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${quizPercentage}%`,
                              }}
                            />
                          </div>

                          <div className="mt-4 flex justify-between text-[9px]">
                            <span className="text-zinc-600">
                              Result
                            </span>

                            <span
                              className={
                                quizPercentage >= 60
                                  ? "font-bold text-green-400"
                                  : "font-bold text-red-400"
                              }
                            >
                              {quizPercentage >= 60
                                ? "Passed"
                                : "Failed"}
                            </span>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* =================================
                        SUBJECTS
                    ================================= */}

                    <section className="mt-10">
                      <div className="mb-5 flex items-end justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                            Your curriculum
                          </p>

                          <h3 className="mt-2 text-2xl font-black">
                            My Subjects
                          </h3>
                        </div>

                        <button
                          onClick={() =>
                            goTo("/subjects")
                          }
                          className="flex items-center gap-1 text-[9px] font-bold text-zinc-600 transition hover:text-white"
                        >
                          View All
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {subjects.map(
                          (subject) => (
                            <SubjectCard
                              key={subject.name}
                              {...subject}
                              onClick={() =>
                                goTo(subject.href)
                              }
                            />
                          )
                        )}
                      </div>
                    </section>
                  </div>

                  {/* =====================================
                      RIGHT SIDEBAR
                  ===================================== */}

                  <aside className="space-y-5">
                    {/* PROGRESS */}

                    <Panel>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            Your Progress
                          </p>

                          <h3 className="mt-2 text-lg font-black">
                            XP Progress
                          </h3>
                        </div>

                        <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                          <TrendingUp size={17} />
                        </div>
                      </div>

                      <div className="mt-7 flex items-center gap-5">
                        <div
                          className="flex h-24 w-24 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(#a855f7 ${xpPercentage}%, #17171f ${xpPercentage}%)`,
                          }}
                        >
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#07080c]">
                            <span className="text-lg font-black">
                              {Math.round(
                                xpPercentage
                              )}
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xl font-black">
                            {stats.xp} XP
                          </p>

                          <p className="mt-1 text-[9px] text-zinc-600">
                            Level {stats.level}
                          </p>

                          <p className="mt-3 flex items-center gap-1 text-[9px] font-bold text-green-400">
                            <Zap size={11} />
                            Keep going
                          </p>
                        </div>
                      </div>
                    </Panel>

                    {/* QUIZ PANEL */}

                    <Panel>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            Quiz
                          </p>

                          <h3 className="mt-2 text-lg font-black">
                            Latest Result
                          </h3>
                        </div>

                        <Target
                          size={18}
                          className="text-purple-400"
                        />
                      </div>

                      <div className="mt-5">
                        {quizResult ? (
                          <>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-4xl font-black text-purple-400">
                                  {quizPercentage}%
                                </p>

                                <p className="mt-1 text-[9px] text-zinc-600">
                                  {quizResult.score} of{" "}
                                  {
                                    quizResult.total_questions
                                  }{" "}
                                  correct
                                </p>
                              </div>

                              <span
                                className={`rounded-lg px-2 py-1 text-[8px] font-bold ${
                                  quizPercentage >= 60
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {quizPercentage >= 60
                                  ? "PASSED"
                                  : "FAILED"}
                              </span>
                            </div>

                            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-purple-500"
                                style={{
                                  width: `${quizPercentage}%`,
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-xs text-zinc-600">
                              No quiz result yet.
                            </p>

                            <button
                              onClick={() =>
                                goTo(
                                  "/subjects/railway-engineering/lessons/track-geometry/quiz"
                                )
                              }
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-[9px] font-black"
                            >
                              Start Quiz
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </Panel>

                    {/* AI */}

                    <section className="relative overflow-hidden rounded-[25px] border border-purple-500/20 bg-gradient-to-br from-[#180b25] via-[#0b0910] to-[#050609] p-5">
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/10 text-purple-400">
                            <BrainCircuit size={19} />
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

                        <p className="mt-6 text-lg font-black">
                          Need some help?
                        </p>

                        <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                          Ask anything about your
                          subjects and let your AI
                          tutor explain it step by
                          step.
                        </p>

                        <button
                          onClick={() =>
                            goTo("/ai")
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-[10px] font-black"
                        >
                          <Sparkles size={13} />
                          Open AI Tutor
                        </button>

                        <div className="mt-3 space-y-2">
                          <AIQuestion
                            onClick={() =>
                              goTo(
                                "/ai?question=Explain%20Superlevation"
                              )
                            }
                          >
                            Explain Superlevation
                          </AIQuestion>

                          <AIQuestion
                            onClick={() =>
                              goTo(
                                "/ai?question=How%20does%20track%20cant%20work"
                              )
                            }
                          >
                            How does track cant work?
                          </AIQuestion>

                          <AIQuestion
                            onClick={() =>
                              goTo("/quizzes")
                            }
                          >
                            Generate practice questions
                          </AIQuestion>
                        </div>
                      </div>
                    </section>
                  </aside>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// LOGO
// =====================================================

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-800 shadow-lg shadow-purple-900/20">
        <TrainFront size={19} />
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
  );
}

// =====================================================
// NAVIGATION
// =====================================================

function Navigation({
  goTo,
}: {
  goTo: (path: string) => void;
}) {
  return (
    <nav className="space-y-1">
      <NavItem
        icon={<LayoutDashboard size={17} />}
        label="Dashboard"
        active
        onClick={() =>
          goTo("/dashboard")
        }
      />

      <NavItem
        icon={<GraduationCap size={17} />}
        label="My Journey"
        onClick={() =>
          goTo("/journey")
        }
      />

      <NavItem
        icon={<BookOpen size={17} />}
        label="Subjects"
        onClick={() =>
          goTo("/subjects")
        }
      />

      <NavItem
        icon={<BrainCircuit size={17} />}
        label="AI Tutor"
        onClick={() =>
          goTo("/ai")
        }
      />

      <NavItem
        icon={<Target size={17} />}
        label="Quizzes"
        onClick={() =>
          goTo("/quizzes")
        }
      />

      <NavItem
        icon={<Trophy size={17} />}
        label="Achievements"
        onClick={() =>
          goTo("/achievements")
        }
      />

      <NavItem
        icon={<TrendingUp size={17} />}
        label="Progress"
        onClick={() =>
          goTo("/progress")
        }
      />

      <NavItem
        icon={<Settings size={17} />}
        label="Settings"
        onClick={() =>
          goTo("/settings")
        }
      />
    </nav>
  );
}

// =====================================================
// NAV ITEM
// =====================================================

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
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${
        active
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
    </button>
  );
}

// =====================================================
// STAT
// =====================================================

function Stat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// PANEL
// =====================================================

function Panel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="rounded-[25px] border border-white/[0.07] bg-[#07080d] p-5">
      {children}
    </section>
  );
}

// =====================================================
// AI QUESTION
// =====================================================

function AIQuestion({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-white"
    >
      <span>{children}</span>

      <ArrowRight size={11} />
    </button>
  );
}

// =====================================================
// SUBJECT CARD
// =====================================================

function SubjectCard({
  name,
  progress,
  image,
  icon: Icon,
  onClick,
}: {
  name: string;
  progress: number;
  image: string;
  icon: ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative h-[190px] overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#07080d] text-left transition hover:-translate-y-1 hover:border-purple-500/20"
    >
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-110"
        onError={(e) => {
          e.currentTarget.style.display =
            "none";
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#040507] via-[#040507]/65 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-purple-400 backdrop-blur-md">
            <Icon size={18} />
          </div>

          <div className="rounded-lg border border-white/10 bg-black/30 p-1.5 backdrop-blur-md">
            <ChevronRight
              size={14}
              className="text-zinc-500"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black">
            {name}
          </h4>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">
              Progress
            </span>

            <span className="text-[9px] font-black text-purple-400">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </button>
  );
} 
