import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import CompleteButton from "@/components/lesson/complete-button";

export default async function LessonPage({
  params,
}: {
  params: Promise<{
    code: string;
    lessonId: string;
  }>;
}) {
  const { code, lessonId } = await params;

  const supabase = await createClient();

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .single();

  if (!subject) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("subject_id", subject.id)
    .single();

  if (!lesson) notFound();

  const { data: nextLesson } = await supabase
    .from("lessons")
    .select("id, title, lesson_order")
    .eq("subject_id", subject.id)
    .gt("lesson_order", lesson.lesson_order ?? 0)
    .order("lesson_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: previousLesson } = await supabase
    .from("lessons")
    .select("id, title, lesson_order")
    .eq("subject_id", subject.id)
    .lt("lesson_order", lesson.lesson_order ?? 0)
    .order("lesson_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-10">
        <Link
          href={`/subjects/${code}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-400"
        >
          <ArrowLeft size={16} />
          Back to {subject.name}
        </Link>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 p-8 md:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400">
                <GraduationCap size={24} />
              </div>

              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                {subject.code}
              </span>

              <span className="rounded-full border border-white/5 bg-zinc-900 px-3 py-1 text-xs text-zinc-500">
                Lesson {lesson.lesson_order}
              </span>
            </div>

            <h1 className="mt-7 text-4xl font-bold md:text-5xl">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
                {lesson.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                {subject.name}
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                Self-paced lesson
              </div>
            </div>
          </div>
        </section>

        <article className="mt-6 overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/70">
          <div className="border-b border-white/5 px-8 py-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-purple-400" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                  Learning Material
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Lesson Content
                </h2>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 md:px-10 md:py-10">
            <div className="whitespace-pre-line text-[17px] leading-8 text-zinc-300">
              {lesson.content || "No content available."}
            </div>

            {lesson.video && (
              <div className="mt-8">
                <a
                  href={lesson.video}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold hover:bg-purple-700"
                >
                  Watch Video
                </a>
              </div>
            )}

            {lesson.pdf && (
              <div className="mt-4">
                <a
                  href={lesson.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-zinc-800 px-5 py-3 text-sm font-bold hover:bg-zinc-700"
                >
                  Open PDF
                </a>
              </div>
            )}
          </div>
        </article>

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-purple-500/10 bg-purple-500/5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Finished this lesson?
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Mark it as completed to update your progress.
                  </p>
                </div>
              </div>

              <CompleteButton lessonId={lesson.id} />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
              {previousLesson ? (
                <Link
                  href={`/subjects/${code}/lesson/${previousLesson.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-5 py-3 text-sm font-semibold hover:bg-zinc-700"
                >
                  <ArrowLeft size={17} />
                  Previous
                </Link>
              ) : (
                <Link
                  href={`/subjects/${code}`}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm text-zinc-500 hover:text-white"
                >
                  <ArrowLeft size={17} />
                  Subject
                </Link>
              )}

              <span className="text-xs text-zinc-600">
                Lesson {lesson.lesson_order}
              </span>

              {nextLesson ? (
                <Link
                  href={`/subjects/${code}/lesson/${nextLesson.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-700"
                >
                  Next Lesson
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <Link
                  href={`/subjects/${code}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold hover:bg-green-700"
                >
                  Finish
                  <CheckCircle2 size={17} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}