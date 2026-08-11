"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Lock,
  Play,
  Target,
  TrainFront,
  Trophy,
  Zap,
} from "lucide-react";

import { useRouter } from "next/navigation";

const journey = [
  {
    number: "01",
    title: "Railway Basics",
    description:
      "Learn the fundamentals of railway transportation, infrastructure, and modern railway systems.",
    progress: 100,
    status: "completed",
    lessons: 4,
  },
  {
    number: "02",
    title: "Rail Types",
    description:
      "Understand different rail types, their construction, materials, and applications.",
    progress: 100,
    status: "completed",
    lessons: 3,
  },
  {
    number: "03",
    title: "Track Structure",
    description:
      "Explore sleepers, ballast, rails, fasteners, and the complete railway track structure.",
    progress: 100,
    status: "completed",
    lessons: 5,
  },
  {
    number: "04",
    title: "Track Geometry",
    description:
      "Study cant, super-elevation, curves, gradients, and railway track geometry.",
    progress: 72,
    status: "current",
    lessons: 6,
    href: "/subjects/railway-engineering/lessons/track-geometry",
  },
  {
    number: "05",
    title: "Railway Signaling",
    description:
      "Learn the principles of railway signaling and how railway traffic is controlled.",
    progress: 0,
    status: "locked",
    lessons: 5,
  },
  {
    number: "06",
    title: "Final Review",
    description:
      "Review everything you've learned and prepare for your final railway engineering assessment.",
    progress: 0,
    status: "locked",
    lessons: 4,
  },
];

export default function JourneyPage() {
  const router = useRouter();

  function goTo(path: string) {
    router.push(path);
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[5%] h-[450px] w-[450px] rounded-full bg-purple-700/10 blur-[140px]" />

        <div className="absolute right-[-150px] top-[35%] h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-fuchsia-700/[0.07] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-[1250px] px-5 py-8 md:px-8 lg:py-12">
        {/* TOP BAR */}

        <div className="flex items-center justify-between">
          <button
            onClick={() => goTo("/dashboard")}
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition hover:text-purple-400"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-purple-400">
              <TrainFront size={17} />
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-black">RailLearn</p>

              <p className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                Railway Academy
              </p>
            </div>
          </div>
        </div>

        {/* HEADER */}

        <section className="mt-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-purple-400">
            Your learning path
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                My Journey
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
                Follow your journey through Railway Engineering.
                Complete each chapter and build your knowledge step by
                step.
              </p>
            </div>

            <div className="flex gap-3">
              <MiniStat
                icon={<Trophy size={13} />}
                value="3"
                label="Completed"
              />

              <MiniStat
                icon={<Target size={13} />}
                value="6"
                label="Chapters"
              />
            </div>
          </div>
        </section>

        {/* OVERALL PROGRESS */}

        <section className="mt-10 overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                Overall Progress
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Railway Engineering
              </h2>

              <p className="mt-2 text-xs text-zinc-600">
                You&apos;re making great progress. Keep going.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-4xl font-black text-purple-400">
                72%
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Course Complete
              </p>
            </div>
          </div>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400" />
          </div>

          <div className="mt-4 flex justify-between text-[9px]">
            <span className="text-zinc-600">
              18 lessons completed
            </span>

            <span className="font-bold text-purple-400">
              72 / 100
            </span>
          </div>
        </section>

        {/* JOURNEY */}

        <section className="mt-10">
          <div className="mb-7">
            <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
              Chapters
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Your Roadmap
            </h2>
          </div>

          <div className="relative">
            {/* LINE */}

            <div className="absolute left-[25px] top-7 bottom-7 hidden w-px bg-white/[0.07] md:block" />

            <div className="space-y-5">
              {journey.map((chapter) => {
                const completed =
                  chapter.status === "completed";

                const current =
                  chapter.status === "current";

                const locked =
                  chapter.status === "locked";

                return (
                  <button
                    key={chapter.number}
                    disabled={locked}
                    onClick={() => {
                      if (chapter.href) {
                        goTo(chapter.href);
                      }
                    }}
                    className={`group relative flex w-full gap-5 text-left ${
                      locked
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {/* NUMBER */}

                    <div
                      className={`relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border text-[10px] font-black transition ${
                        completed
                          ? "border-purple-500/30 bg-purple-500/15 text-purple-300"
                          : current
                          ? "border-purple-400 bg-purple-600 text-white shadow-[0_0_35px_rgba(168,85,247,0.25)]"
                          : "border-white/[0.07] bg-[#07080d] text-zinc-700"
                      }`}
                    >
                      {completed ? (
                        <Check size={18} />
                      ) : locked ? (
                        <Lock size={16} />
                      ) : (
                        chapter.number
                      )}
                    </div>

                    {/* CARD */}

                    <div
                      className={`min-w-0 flex-1 rounded-[25px] border p-5 transition md:p-6 ${
                        current
                          ? "border-purple-500/25 bg-gradient-to-r from-purple-500/[0.08] to-transparent"
                          : "border-white/[0.07] bg-[#07080d]"
                      } ${
                        !locked
                          ? "group-hover:border-purple-500/20 group-hover:bg-[#090910]"
                          : "opacity-50"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {current && (
                              <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-purple-300">
                                Currently Learning
                              </span>
                            )}

                            {completed && (
                              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-green-400">
                                Completed
                              </span>
                            )}

                            {locked && (
                              <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-zinc-600">
                                Locked
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 text-xl font-black md:text-2xl">
                            {chapter.title}
                          </h3>

                          <p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-600">
                            {chapter.description}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600">
                              <BookOpen size={12} />
                              {chapter.lessons} Lessons
                            </span>

                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600">
                              <Zap size={12} />
                              {current ? "100 XP" : "Completed"}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 md:w-[150px]">
                          <div className="flex items-center justify-between text-[8px] font-bold">
                            <span className="text-zinc-600">
                              Progress
                            </span>

                            <span
                              className={
                                current
                                  ? "text-purple-400"
                                  : completed
                                  ? "text-green-400"
                                  : "text-zinc-700"
                              }
                            >
                              {chapter.progress}%
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className={`h-full rounded-full ${
                                completed
                                  ? "bg-green-500/70"
                                  : current
                                  ? "bg-gradient-to-r from-purple-700 to-fuchsia-400"
                                  : "bg-zinc-800"
                              }`}
                              style={{
                                width: `${chapter.progress}%`,
                              }}
                            />
                          </div>

                          {!locked && (
                            <div className="mt-5 flex items-center justify-end gap-1 text-[8px] font-black uppercase tracking-[0.12em] text-purple-400">
                              {completed ? "Review" : "Continue"}

                              {completed ? (
                                <ArrowRight size={12} />
                              ) : (
                                <Play size={11} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}

        <section className="mt-10 overflow-hidden rounded-[30px] border border-purple-500/20 bg-gradient-to-br from-[#180b25] via-[#0b0910] to-[#050609] p-7 md:p-9">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Zap size={19} />
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400">
                    Keep Learning
                  </p>

                  <p className="mt-1 text-[8px] text-zinc-600">
                    Your next lesson is waiting
                  </p>
                </div>
              </div>

              <h3 className="mt-5 text-2xl font-black">
                Continue Track Geometry
              </h3>

              <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
                Continue learning about railway curves,
                cant, and super-elevation.
              </p>
            </div>

            <button
              onClick={() =>
                goTo(
                  "/subjects/railway-engineering/lessons/track-geometry"
                )
              }
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-[9px] font-black shadow-[0_15px_45px_rgba(124,58,237,0.2)] transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500"
            >
              Continue Learning
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* FOOTER */}

        <div className="py-10 text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-700">
            RailLearn • Railway Academy
          </p>
        </div>
      </div>
    </main>
  );
}

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
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[7px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </div>
  );
}