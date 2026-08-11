import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Lesson = {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  video: string | null;
  pdf: string | null;
  image: string | null;
  lesson_order: number | null;
  subject_id: string | null;
  created_at: string | null;
  subjects:
    | {
        id: string;
        name: string | null;
        code: string | null;
      }
    | null;
};

export default async function AdminLessonsPage() {
  const supabase = await createClient();

  /*
   * =====================================================
   * GET LESSONS
   * =====================================================
   *
   * We don't check the users table here.
   * The admin API/auth layer is already responsible
   * for protecting admin operations.
   */

  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      description,
      content,
      video,
      pdf,
      image,
      lesson_order,
      subject_id,
      created_at,
      subjects (
        id,
        name,
        code
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white md:px-8 xl:px-10">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/admin"
            className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Admin Dashboard
          </Link>

          <div className="rounded-[26px] border border-red-500/20 bg-red-500/5 p-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-400">
              Error
            </p>

            <h1 className="mt-2 text-2xl font-black">
              Failed to load lessons
            </h1>

            <p className="mt-3 text-sm leading-6 text-red-300/70">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const lessons = (data ?? []) as unknown as Lesson[];

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">

        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin"
              className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Admin Dashboard
            </Link>

            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
              Curriculum
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
              Lessons
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              Manage all lessons available on RailLearn.
            </p>
          </div>

          <Link
            href="/admin/lessons/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
          >
            <Plus size={15} />
            Add Lesson
          </Link>
        </div>

        {/* EMPTY STATE */}
        {lessons.length === 0 ? (
          <div className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <BookOpen size={28} />
            </div>

            <h2 className="mt-6 text-xl font-black">
              No lessons yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
              Your curriculum doesn't have any lessons yet.
              Create your first lesson to start building RailLearn.
            </p>

            <Link
              href="/admin/lessons/new"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
            >
              <Plus size={14} />
              Create First Lesson
            </Link>
          </div>
        ) : (

          /* LESSONS */
          <div className="grid gap-4">

            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/admin/lessons/${lesson.id}`}
                className="group rounded-[24px] border border-white/[0.07] bg-[#07080d] p-5 transition hover:border-purple-500/25 hover:bg-[#090a10]"
              >

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  {/* LEFT */}
                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <BookOpen size={19} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                        {lesson.subjects?.code || "NO SUBJECT"}
                      </p>

                      <h2 className="mt-1 truncate text-base font-black md:text-lg">
                        {lesson.title || "Untitled Lesson"}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                        {lesson.description || "No description yet."}
                      </p>

                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex shrink-0 items-center gap-5">

                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-700">
                        Subject
                      </p>

                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        {lesson.subjects?.name || "Unknown"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-700">
                        Order
                      </p>

                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        {lesson.lesson_order ?? "-"}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-zinc-700 transition group-hover:text-purple-400"
                    />

                  </div>

                </div>

              </Link>
            ))}

          </div>
        )}
      </div>
    </main>
  );
}