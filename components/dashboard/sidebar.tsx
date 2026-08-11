"use client";

import {
  Home,
  BookOpen,
  BrainCircuit,
  User,
  Settings,
  Trophy,
  FileText,
  CalendarDays,
  LogOut,
  Sparkles,
  ChevronRight,
  TrainFront,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[280px] shrink-0 border-r border-white/[0.07] bg-[#07050d] lg:block">

      {/* Glow */}
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-600/[0.08] blur-[100px]" />

      <div className="relative flex min-h-screen flex-col">

        {/* ================= LOGO ================= */}

        <div className="flex h-[105px] items-center border-b border-white/[0.06] px-7">

          <div className="relative">

            <div className="absolute inset-0 rounded-2xl bg-purple-600/30 blur-xl" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/20 to-purple-900/20 text-purple-400">
              <TrainFront size={25} />
            </div>

          </div>

          <div className="ml-4">

            <h1 className="text-xl font-black tracking-tight">
              Rail
              <span className="text-purple-500">
                Learn
              </span>
            </h1>

            <div className="mt-1 flex items-center gap-1.5">
              <Sparkles
                size={10}
                className="text-purple-400"
              />

              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                Smart Railway Education
              </p>
            </div>

          </div>

        </div>

        {/* ================= PROFILE ================= */}

        <div className="px-5 pt-6">

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-purple-500/20 hover:bg-white/[0.04]">

            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-purple-600/10 blur-2xl" />

            <div className="relative flex items-center gap-3">

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/30 to-purple-900/30 text-sm font-bold text-purple-300">
                  A
                </div>

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0b0812] bg-green-500" />

              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-bold">
                  Amir Mohamed
                </p>

                <p className="mt-0.5 text-[11px] text-zinc-600">
                  Railway Technology
                </p>

              </div>

              <ChevronRight
                size={16}
                className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-purple-400"
              />

            </div>

          </div>

        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="px-4 pt-7">

          <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700">
            Main Menu
          </p>

          <nav className="space-y-1">

            <SidebarItem
              icon={<Home size={18} />}
              label="Dashboard"
              active
            />

            <SidebarItem
              icon={<BookOpen size={18} />}
              label="My Subjects"
            />

            <SidebarItem
              icon={<BrainCircuit size={18} />}
              label="AI Assistant"
              badge="AI"
            />

          </nav>

        </div>

        {/* ================= LEARNING ================= */}

        <div className="px-4 pt-7">

          <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700">
            Learning
          </p>

          <nav className="space-y-1">

            <SidebarItem
              icon={<Trophy size={18} />}
              label="Quiz Center"
            />

            <SidebarItem
              icon={<FileText size={18} />}
              label="Study Files"
            />

            <SidebarItem
              icon={<CalendarDays size={18} />}
              label="My Schedule"
            />

            <SidebarItem
              icon={<Trophy size={18} />}
              label="Achievements"
            />

          </nav>

        </div>

        {/* ================= BOTTOM ================= */}

        <div className="mt-auto p-4">

          {/* XP CARD */}

          <div className="relative mb-3 overflow-hidden rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-900/20 to-transparent p-4">

            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-600/20 blur-2xl" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <Sparkles size={14} />
                  </div>

                  <span className="text-xs font-semibold">
                    Level 12
                  </span>

                </div>

                <span className="text-[10px] text-zinc-600">
                  840 XP
                </span>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">

                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-purple-700 to-purple-400" />

              </div>

              <p className="mt-2 text-[9px] text-zinc-600">
                160 XP until Level 13
              </p>

            </div>

          </div>

          <SidebarItem
            icon={<User size={18} />}
            label="Profile"
          />

          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
          />

          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-600 transition hover:bg-red-500/[0.06] hover:text-red-400">
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>

    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <button
      className={`
        group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm
        transition-all duration-200
        ${
          active
            ? "border border-purple-500/20 bg-gradient-to-r from-purple-600/20 to-purple-600/[0.04] text-white shadow-[0_8px_30px_rgba(124,58,237,0.08)]"
            : "text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200"
        }
      `}
    >

      {active && (
        <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
      )}

      <span
        className={`
          transition
          ${
            active
              ? "text-purple-400"
              : "text-zinc-600 group-hover:text-purple-400"
          }
        `}
      >
        {icon}
      </span>

      <span className="flex-1 text-left">
        {label}
      </span>

      {badge && (
        <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-bold text-purple-400">
          {badge}
        </span>
      )}

      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
      )}

    </button>
  );
}