"use client";

import {
  Bell,
  Search,
  ChevronDown,
  Command,
  Moon,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-[88px] items-center border-b border-white/[0.06] bg-[#05030a]/80 px-5 backdrop-blur-2xl md:px-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/3 top-0 h-24 w-64 rounded-full bg-purple-600/[0.04] blur-3xl" />

      <div className="relative flex w-full items-center justify-between">

        {/* ================= SEARCH ================= */}

        <div className="group hidden w-[420px] items-center rounded-2xl border border-white/[0.07] bg-white/[0.025] transition hover:border-purple-500/20 md:flex">

          <div className="flex items-center px-4">

            <Search
              size={18}
              className="text-zinc-600 transition group-focus-within:text-purple-400"
            />

          </div>

          <input
            type="text"
            placeholder="Search anything..."
            className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
          />

          <div className="mr-2 flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-600">

            <Command size={11} />

            <span>K</span>

          </div>

        </div>

        {/* Mobile title */}

        <div className="flex items-center gap-2 md:hidden">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Sparkles size={17} />
          </div>

          <span className="font-bold">
            Rail<span className="text-purple-500">Learn</span>
          </span>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="ml-auto flex items-center gap-2 md:gap-4">

          {/* AI button */}

          <button className="hidden items-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/[0.06] px-3.5 py-2.5 text-xs font-semibold text-purple-300 transition hover:border-purple-500/30 hover:bg-purple-500/10 sm:flex">

            <Sparkles size={15} />

            AI Assistant

          </button>

          {/* Theme */}

          <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300 sm:flex">

            <Moon size={18} />

          </button>

          {/* Divider */}

          <div className="hidden h-8 w-px bg-white/[0.07] sm:block" />

          {/* Notification */}

          <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.04] hover:text-white">

            <Bell
              size={19}
              className="transition group-hover:scale-105"
            />

            <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#05030a] bg-purple-500 px-1 text-[8px] font-bold text-white">
              3
            </span>

          </button>

          {/* Divider */}

          <div className="h-8 w-px bg-white/[0.07]" />

          {/* ================= USER ================= */}

          <button className="group flex items-center gap-3 rounded-xl p-1.5 pr-2 transition hover:bg-white/[0.04]">

            <div className="relative">

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-purple-900/20 text-sm font-bold text-purple-300">

                A

              </div>

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#05030a] bg-green-500" />

            </div>

            <div className="hidden text-left lg:block">

              <p className="text-sm font-semibold">
                Amir Mohamed
              </p>

              <p className="text-[10px] text-zinc-600">
                Student • Level 12
              </p>

            </div>

            <ChevronDown
              size={15}
              className="hidden text-zinc-700 transition group-hover:text-zinc-400 lg:block"
            />

          </button>

        </div>

      </div>

    </header>
  );
}