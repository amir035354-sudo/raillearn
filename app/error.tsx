"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("RAILLEARN PAGE ERROR:", error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#030305] px-5 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-white/[0.03] p-7 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-xl">
          !
        </div>
        <h1 className="mt-5 text-lg font-black">Page could not load</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          حصل خطأ أثناء تحميل الصفحة. جرّب تاني، ولو المشكلة استمرت ابعتلي
          الرسالة اللي تحت.
        </p>
        <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3 text-left">
          <summary className="cursor-pointer text-xs font-bold text-zinc-300">
            Technical details
          </summary>
          <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap break-words text-[11px] text-red-300">
            {error?.message || "Unknown client error"}
          </pre>
        </details>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 touch-manipulation rounded-xl bg-purple-600 px-5 text-xs font-black transition hover:bg-purple-500"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex min-h-11 items-center rounded-xl border border-white/10 px-5 text-xs font-black text-zinc-300 transition hover:bg-white/5"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
