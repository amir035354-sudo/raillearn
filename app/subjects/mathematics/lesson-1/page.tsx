
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LessonOnePage() {
  const [completed, setCompleted] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl p-6 md:p-10">

        {/* Back */}
        <Link
          href="/subjects/mathematics"
          className="text-sm text-purple-400 transition hover:text-purple-300"
        >
          ← Back to Engineering Mathematics
        </Link>

        {/* Header */}
        <div className="mt-10">
          <p className="text-sm font-semibold text-purple-400">
            MTH101 • Lesson 1
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Introduction to Engineering Mathematics
          </h1>

          <p className="mt-4 text-zinc-400">
            Learn the basic mathematical concepts you will need throughout
            your engineering studies.
          </p>
        </div>

        {/* Lesson Content */}
        <article className="mt-10 rounded-3xl bg-zinc-900 p-6 md:p-10">

          <h2 className="text-2xl font-bold">
            What is Engineering Mathematics?
          </h2>

          <p className="mt-5 leading-8 text-zinc-300">
            Engineering Mathematics is the application of mathematical
            concepts to engineering problems. It helps engineers analyze
            systems, model physical situations, calculate quantities, and
            understand relationships between different variables.
          </p>

          <h2 className="mt-10 text-2xl font-bold">
            Why is it important?
          </h2>

          <p className="mt-5 leading-8 text-zinc-300">
            Mathematics is used in almost every engineering field. In
            railway and transportation technology, mathematical methods
            can be used to study motion, forces, electrical systems,
            signals, measurements, and many other engineering applications.
          </p>

          {/* Key Concepts */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-zinc-800 p-5">
              <h3 className="font-bold text-purple-400">
                Algebra
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Working with equations, variables, expressions, and
                mathematical relationships.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-800 p-5">
              <h3 className="font-bold text-purple-400">
                Calculus
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Studying change, derivatives, integrals, and continuous
                processes.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-800 p-5">
              <h3 className="font-bold text-purple-400">
                Statistics
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Analyzing data, measurements, probability, and uncertainty.
              </p>
            </div>

          </div>

          {/* Important Note */}
          <div className="mt-10 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
            <h3 className="font-bold text-purple-400">
              Important
            </h3>

            <p className="mt-2 leading-7 text-zinc-300">
              This is the beginning of your Engineering Mathematics course.
              More detailed topics and examples will be added to the
              following lessons.
            </p>
          </div>

        </article>

        {/* Completion */}
        <div className="mt-8 rounded-3xl bg-zinc-900 p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Lesson Progress
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                {completed
                  ? "Great job! Lesson completed."
                  : "Finish the lesson and mark it as completed."}
              </p>
            </div>

            <button
              onClick={() => setCompleted(!completed)}
              className={`rounded-xl px-6 py-3 font-semibold transition ${
                completed
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {completed ? "✓ Completed" : "Mark as Completed"}
            </button>

          </div>

        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">

          <Link
            href="/subjects/mathematics"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold transition hover:bg-zinc-700"
          >
            ← Lessons
          </Link>

          <Link
            href="/subjects/mathematics/lesson-2"
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700"
          >
            Next Lesson →
          </Link>

        </div>

      </div>
    </main>
  );
}