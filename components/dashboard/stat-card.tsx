"use client";

import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  Target,
  TrendingUp,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

export default function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  const getIcon = () => {
    if (title.toLowerCase().includes("subject")) {
      return <BookOpen size={20} />;
    }

    if (
      title.toLowerCase().includes("lesson") ||
      title.toLowerCase().includes("hour")
    ) {
      return <Clock3 size={20} />;
    }

    if (
      title.toLowerCase().includes("progress") ||
      title.toLowerCase().includes("score")
    ) {
      return <Target size={20} />;
    }

    return <TrendingUp size={20} />;
  };

  return (
    <div className="group relative overflow-hidden rounded-[1.7rem] border border-white/[0.07] bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/20 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]">

      {/* Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-600/[0.08] blur-3xl transition duration-500 group-hover:bg-purple-600/[0.15]" />

      {/* Top */}
      <div className="relative flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] ${color}`}
        >
          {getIcon()}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-green-500/10 bg-green-500/[0.06] px-2 py-1 text-[10px] font-semibold text-green-400">
          <ArrowUpRight size={12} />
          +12%
        </div>

      </div>

      {/* Content */}
      <div className="relative mt-7">

        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
          {title}
        </p>

        <div className="mt-2 flex items-end justify-between">

          <h2 className={`text-4xl font-black tracking-tight ${color}`}>
            {value}
          </h2>

          <TrendingUp
            size={18}
            className="mb-1 text-zinc-700 transition group-hover:text-purple-500"
          />

        </div>

      </div>

      {/* Bottom line */}
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.04]">

        <div
          className={`h-full rounded-full ${color.replace(
            "text-",
            "bg-"
          )} opacity-60 transition-all duration-700 group-hover:w-[85%]`}
          style={{
            width:
              title === "Subjects"
                ? "60%"
                : title.includes("Lessons")
                ? "72%"
                : title.includes("Hours")
                ? "48%"
                : "87%",
          }}
        />

      </div>

      <p className="mt-3 text-[10px] text-zinc-700">
        Compared with last week
      </p>

    </div>
  );
}