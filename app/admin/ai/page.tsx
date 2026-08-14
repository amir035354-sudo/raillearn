"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Bot,
    Sparkles,
} from "lucide-react";

export default function AdminAIPage() {
    return (
        <main className="min-h-screen bg-[#020203] px-5 py-8 text-white md:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/admin"
                        className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 text-[9px] font-black text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
                    >
                        <ArrowLeft
                            size={14}
                        />

                        Back to Admin
                    </Link>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/15 bg-purple-500/[0.05] text-purple-400">
                        <Bot
                            size={18}
                        />
                    </div>
                </div>

                <section className="mt-8 overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#07070b] p-8 md:p-10">
                    <div className="flex items-center gap-3">
                        <Sparkles
                            size={18}
                            className="text-purple-400"
                        />

                        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-purple-400">
                            RailLearn Admin AI
                        </p>
                    </div>

                    <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                        AI Management
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                        AI administration page is ready.
                        AI tools and settings can be connected
                        here later.
                    </p>
                </section>
            </div>
        </main>
    );
}