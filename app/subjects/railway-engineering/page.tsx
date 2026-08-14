"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Lock,
  Play,
  Target,
  TrainFront,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

const chapters = [
  {
    id: 1,
    title: "Introduction to Railway Engineering",
    description:
      "Understand the railway system, its components and the role of railway engineering.",
    lessons: 4,
    duration: "42 min",
    progress: 100,
    unlocked: true,
  },
  {
    id: 2,
    title: "Railway Track Structure",
    description:
      "Rails, sleepers, ballast, formation and the complete track structure.",
    lessons: 5,
    duration: "58 min",
    progress: 100,
    unlocked: true,
  },
  {
    id: 3,
    title: "Track Geometry",
    description:
      "Study alignment, gradients, curves, cant and railway track geometry.",
    lessons: 6,
    duration: "1h 12m",
    progress: 72,
    unlocked: true,
  },
  {
    id: 4,
    title: "Railway Signaling",
    description:
      "Learn the fundamentals of railway signaling and train control systems.",
    lessons: 5,
    duration: "55 min",
    progress: 0,
    unlocked: true,
  },
  {
    id: 5,
    title: "Railway Stations",
    description:
      "Explore station layouts, platforms, yards and passenger facilities.",
    lessons: 4,
    duration: "48 min",
    progress: 0,
    unlocked: true,
  },
  {
    id: 6,
    title: "Railway Operations",
    description:
      "Understand train operations, scheduling and railway traffic management.",
    lessons: 6,
    duration: "1h 20m",
    progress: 0,
    unlocked: false,
  },
];

export default function RailwayEngineeringPage() {
  const router = useRouter();

  const [activeChapter, setActiveChapter] = useState(3);

  const currentChapter =
    chapters.find(
      (chapter) => chapter.id === activeChapter
    ) ?? chapters[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-700/10 blur-[120px]" />

        <div className="absolute right-[-120px] top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">
        {/* Back */}
        <button
          onClick={() => router.push("/subjects")}
          className="mb-8 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600 transition hover:text-purple-400"
        >
          <ArrowLeft size={14} />
          All Subjects
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#07080d]">
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/images/train-hero.jpg"
              alt="Railway Engineering"
              className="h-full w-full object-cover opacity-35"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/90 to-[#030305]/40" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent" />
          </div>

          <div className="relative grid min-h-[420px] items-end gap-10 p-7 md:p-10 lg:grid-cols-[1fr_330px]">
            <div>
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <TrainFront size={19} />
                </span>

                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-300">
                  Core Subject
                </span>
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
                Railway Academy
              </p>

              <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.05] md:text-6xl">
                Railway
                <br />
                <span className="text-purple-500">
                  Engineering
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-500">
                Master the fundamentals of railway systems,
                track engineering, geometry, signaling and
                railway operations.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3 backdrop-blur-xl">
                  <p className="text-lg font-black">21</p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Lessons
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3 backdrop-blur-xl">
                  <p className="text-lg font-black">4h 55m</p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Total Time
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3 backdrop-blur-xl">
                  <p className="text-lg font-black text-purple-400">
                    72%
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Progress
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-[25px] border border-white/[0.08] bg-black/35 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                  Course Progress
                </span>

                <span className="text-xl font-black text-purple-400">
                  72%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400" />
              </div>

              <p className="mt-4 text-[9px] leading-5 text-zinc-600">
                You've completed 15 of 21 lessons.
                Keep going — you're almost there.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/subjects/railway-engineering/lesson/track-geometry"
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-[9px] font-black shadow-[0_10px_35px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
              >
                Continue Learning
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Main */}
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_330px]">
          {/* Chapters */}
          <section>
            <div className="mb-5">
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                Course Content
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Chapters
              </h2>
            </div>

            <div className="space-y-3">
              {chapters.map((chapter) => {
                const active =
                  chapter.id === activeChapter;

                return (
                  <button
                    key={chapter.id}
                    disabled={!chapter.unlocked}
                    onClick={() =>
                      setActiveChapter(chapter.id)
                    }
                    className={`group w-full rounded-[22px] border p-5 text-left transition ${active
                      ? "border-purple-500/30 bg-purple-500/[0.06] shadow-[0_15px_50px_rgba(124,58,237,0.08)]"
                      : "border-white/[0.07] bg-[#07080d] hover:border-white/[0.12]"
                      } ${!chapter.unlocked
                        ? "cursor-not-allowed opacity-50"
                        : ""
                      }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${active
                          ? "bg-purple-500/15 text-purple-400"
                          : chapter.progress === 100
                            ? "bg-green-500/10 text-green-400"
                            : "bg-white/[0.03] text-zinc-600"
                          }`}
                      >
                        {chapter.progress === 100 ? (
                          <Check size={18} />
                        ) : !chapter.unlocked ? (
                          <Lock size={17} />
                        ) : (
                          <span className="text-sm font-black">
                            {chapter.id}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black md:text-base">
                              {chapter.title}
                            </h3>

                            <p className="mt-1 max-w-xl text-[9px] leading-5 text-zinc-600">
                              {chapter.description}
                            </p>
                          </div>

                          <ChevronRight
                            size={16}
                            className={`shrink-0 transition ${active
                              ? "text-purple-400"
                              : "text-zinc-700 group-hover:text-zinc-400"
                              }`}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1.5 text-[8px] text-zinc-600">
                            <BookOpen size={11} />
                            {chapter.lessons} lessons
                          </span>

                          <span className="flex items-center gap-1.5 text-[8px] text-zinc-600">
                            <Clock3 size={11} />
                            {chapter.duration}
                          </span>

                          <span className="text-[8px] font-bold text-purple-400">
                            {chapter.progress}%
                          </span>
                        </div>

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400"
                            style={{
                              width: `${chapter.progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Current Chapter */}
          <aside>
            <div className="sticky top-8 rounded-[25px] border border-white/[0.07] bg-[#07080d] p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <BookOpen size={19} />
              </div>

              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                Selected Chapter
              </p>

              <h3 className="mt-2 text-xl font-black">
                {currentChapter.title}
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-zinc-600">
                {currentChapter.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Info
                  value={String(currentChapter.lessons)}
                  label="Lessons"
                />

                <Info
                  value={currentChapter.duration}
                  label="Duration"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Progress
                  </span>

                  <span className="text-xs font-black text-purple-400">
                    {currentChapter.progress}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-400"
                    style={{
                      width: `${currentChapter.progress}%`,
                    }}
                  />
                </div>
              </div>

              <button
                disabled={!currentChapter.unlocked}
                onClick={() =>
                  router.push(
                    "/subjects/railway-engineering/lesson/track-geometry"
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3.5 text-[9px] font-black transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-zinc-800"
              >
                <Play size={13} />
                Start Chapter
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-sm font-black">{value}</p>

      <p className="mt-1 text-[7px] uppercase tracking-wider text-zinc-700">
        {label}
      </p>
    </div>
  );
}