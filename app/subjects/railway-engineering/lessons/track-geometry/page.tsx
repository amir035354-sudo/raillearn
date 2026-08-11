"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Play,
  Target,
  TrainFront,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

const lessons = [
  {
    id: 1,
    title: "Introduction to Track Geometry",
    duration: "12 min",
    completed: true,
    slug: "introduction",
  },
  {
    id: 2,
    title: "Horizontal Alignment",
    duration: "15 min",
    completed: true,
    slug: "horizontal-alignment",
  },
  {
    id: 3,
    title: "Vertical Alignment",
    duration: "13 min",
    completed: true,
    slug: "vertical-alignment",
  },
  {
    id: 4,
    title: "Cant & Super Elevation",
    duration: "18 min",
    completed: false,
    current: true,
    slug: "cant-super-elevation",
  },
  {
    id: 5,
    title: "Transition Curves",
    duration: "16 min",
    completed: false,
    slug: "transition-curves",
  },
  {
    id: 6,
    title: "Track Geometry Review",
    duration: "10 min",
    completed: false,
    slug: "review",
  },
];

const lessonBasePath =
  "/subjects/railway-engineering/lessons/track-geometry";

export default function TrackGeometryLesson() {
  const router = useRouter();

  const [completed, setCompleted] = useState(false);

  function openLesson(slug: string) {
    if (slug === "cant-super-elevation") {
      return;
    }

    router.push(`${lessonBasePath}/${slug}`);
  }

  function goToQuiz() {
    router.push(`${lessonBasePath}/quiz`);
  }

  function goToCourse() {
    router.push("/subjects/railway-engineering");
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[10%] h-96 w-96 rounded-full bg-purple-700/10 blur-[130px]" />

        <div className="absolute right-[-120px] top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">
        {/* TOP */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={goToCourse}
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition hover:text-purple-400"
          >
            <ArrowLeft size={14} />
            Railway Engineering
          </button>

          <div className="flex items-center gap-2 text-[9px] text-zinc-600">
            <Clock3 size={13} />
            18 min
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LESSON */}

          <article>
            {/* HEADER */}

            <section className="rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-purple-300">
                  Chapter 03
                </span>

                <span className="text-[8px] text-zinc-700">
                  Lesson 04 of 06
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
                Cant &{" "}
                <span className="text-purple-500">
                  Super Elevation
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                Understand how railway tracks are
                designed to safely handle trains moving
                through curves.
              </p>

              {/* VIDEO */}

              <div className="group relative mt-8 aspect-video overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#030305]">
                <img
                  src="/images/train-hero.jfif"
                  alt="Railway lesson"
                  className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-black/70" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => {
                      alert(
                        "Video will be added here when the lesson content is ready."
                      );
                    }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_0_60px_rgba(168,85,247,0.35)] transition hover:scale-110 hover:bg-purple-500"
                  >
                    <Play
                      size={27}
                      fill="currentColor"
                    />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[35%] rounded-full bg-purple-500" />
                  </div>

                  <div className="mt-3 flex justify-between text-[8px] text-zinc-500">
                    <span>06:18</span>
                    <span>18:00</span>
                  </div>
                </div>
              </div>
            </section>

            {/* EXPLANATION */}

            <section className="mt-6 rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <BookOpen size={18} />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                    Lesson Notes
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Understanding Super Elevation
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-500">
                <p>
                  When a railway vehicle travels through
                  a curve, it experiences forces that
                  affect its stability and the comfort of
                  passengers.
                </p>

                <p>
                  Track geometry is therefore designed to
                  control these forces and maintain safe
                  railway operation.
                </p>

                <p>
                  One of the important solutions is{" "}
                  <strong className="text-white">
                    cant
                  </strong>
                  , also known as super elevation.
                  Cant is the difference in height between
                  the two rails of a railway track.
                </p>

                <div className="rounded-2xl border border-purple-500/15 bg-purple-500/[0.05] p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400">
                    Key Idea
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    The outer rail is raised relative to
                    the inner rail when a train passes
                    through a curve. This helps counteract
                    the effect of lateral forces.
                  </p>
                </div>

                <p>
                  Proper cant improves passenger comfort,
                  reduces lateral forces acting on the
                  rails, and helps reduce wear on railway
                  components.
                </p>
              </div>
            </section>

            {/* KEY POINTS */}

            <section className="mt-6 rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Target size={18} />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                    Remember
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Key Points
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-2">
                <KeyPoint>
                  Cant is the difference in rail
                  elevation.
                </KeyPoint>

                <KeyPoint>
                  The outer rail is raised on curves.
                </KeyPoint>

                <KeyPoint>
                  Cant improves passenger comfort.
                </KeyPoint>

                <KeyPoint>
                  Proper geometry reduces lateral forces.
                </KeyPoint>
              </div>
            </section>

            {/* ACTIONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setCompleted(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-[9px] font-black transition ${
                  completed
                    ? "border border-green-500/20 bg-green-500/10 text-green-400"
                    : "bg-gradient-to-r from-purple-600 to-violet-600 hover:-translate-y-0.5"
                }`}
              >
                <Check size={14} />

                {completed
                  ? "Lesson Completed"
                  : "Mark as Complete"}
              </button>

              <button
                onClick={goToQuiz}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-4 text-[9px] font-black text-zinc-300 transition hover:border-purple-500/30 hover:text-white"
              >
                Take Lesson Quiz
                <ArrowRight size={14} />
              </button>
            </div>
          </article>

          {/* SIDEBAR */}

          <aside>
            <div className="sticky top-8 rounded-[25px] border border-white/[0.07] bg-[#07080d] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <TrainFront size={18} />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-purple-400">
                    Course
                  </p>

                  <p className="mt-1 text-sm font-black">
                    Railway Engineering
                  </p>
                </div>
              </div>

              <div className="mt-6 h-px bg-white/[0.06]" />

              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                Lessons
              </p>

              <div className="mt-4 space-y-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() =>
                      openLesson(lesson.slug)
                    }
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      lesson.current
                        ? "border border-purple-500/20 bg-purple-500/[0.08]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        lesson.completed
                          ? "bg-green-500/10 text-green-400"
                          : lesson.current
                          ? "bg-purple-500/15 text-purple-400"
                          : "bg-white/[0.03] text-zinc-700"
                      }`}
                    >
                      {lesson.completed ? (
                        <Check size={13} />
                      ) : (
                        <span className="text-[8px] font-black">
                          {lesson.id}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-[9px] font-bold ${
                          lesson.current
                            ? "text-purple-300"
                            : "text-zinc-500"
                        }`}
                      >
                        {lesson.title}
                      </p>

                      <p className="mt-1 text-[7px] text-zinc-700">
                        {lesson.duration}
                      </p>
                    </div>

                    {!lesson.current && (
                      <ChevronRight
                        size={13}
                        className="shrink-0 text-zinc-700"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* RESOURCES */}

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2">
                  <FileText
                    size={14}
                    className="text-purple-400"
                  />

                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                    Resources
                  </span>
                </div>

                <button
                  onClick={() =>
                    alert(
                      "Lesson PDF will be added when the course content is ready."
                    )
                  }
                  className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-[8px] text-zinc-500 transition hover:text-white"
                >
                  Lesson PDF
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* NEXT LESSON */}

        <section className="mt-7 rounded-[25px] border border-white/[0.07] bg-[#07080d] p-5 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                Up Next
              </p>

              <h3 className="mt-2 text-xl font-black">
                Transition Curves
              </h3>

              <p className="mt-1 text-[9px] text-zinc-600">
                Continue learning about railway track
                geometry.
              </p>
            </div>

            <button
              onClick={() =>
                openLesson("transition-curves")
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-5 py-3.5 text-[9px] font-black transition hover:bg-purple-600"
            >
              Next Lesson
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function KeyPoint({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
          <Check size={12} />
        </div>

        <p className="text-[10px] leading-5 text-zinc-500">
          {children}
        </p>
      </div>
    </div>
  );
}