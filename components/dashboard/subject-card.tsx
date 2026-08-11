"use client";

import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Play,
} from "lucide-react";

interface SubjectCardProps {
  title: string;
  code: string;
  lessons: number;
  progress: number;
}

export default function SubjectCard({
  title,
  code,
  lessons,
  progress,
}: SubjectCardProps) {
  const remaining = Math.max(
    0,
    Math.round(lessons * (1 - progress / 100))
  );

  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/[0.07] bg-[#0c0913] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/25 hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)]">

      {/* ================= GLOW ================= */}

      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-purple-600/[0.07] blur-[70px] transition-all duration-500 group-hover:bg-purple-600/[0.16]" />

      {/* ================= TOP ================= */}

      <div className="relative flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/15 to-purple-900/10 text-purple-400">
            <BookOpen size={21} />
          </div>

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-purple-400">
              {code}
            </p>

            <p className="mt-1 text-[11px] text-zinc-600">
              Railway Technology
            </p>

          </div>

        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-600 transition hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-400">
          <ArrowUpRight size={17} />
        </button>

      </div>

      {/* ================= TITLE ================= */}

      <div className="relative mt-6">

        <h3 className="min-h-[56px] text-xl font-bold leading-7 tracking-tight text-white">
          {title}
        </h3>

        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-600">

          <div className="flex items-center gap-1.5">
            <BookOpen size={14} />
            <span>{lessons} Lessons</span>
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-1.5">
            <Clock3 size={14} />
            <span>~6h</span>
          </div>

        </div>

      </div>

      {/* ================= PROGRESS ================= */}

      <div className="relative mt-7">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Course Progress
          </span>

          <span className="text-sm font-bold text-purple-400">
            {progress}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">

          <div
            className="relative h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          >

            <div className="absolute right-0 top-0 h-full w-8 bg-white/20 blur-sm" />

          </div>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="relative mt-6 flex items-center justify-between">

        <div className="flex items-center gap-2">

          {progress >= 80 ? (
            <>
              <CheckCircle2
                size={16}
                className="text-green-400"
              />

              <span className="text-xs text-green-400">
                Almost complete
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-zinc-600">
                {remaining} lessons remaining
              </span>
            </>
          )}

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-purple-600 hover:text-white">

          <Play
            size={13}
            fill="currentColor"
          />

          Continue

        </button>

      </div>

    </div>
  );
}