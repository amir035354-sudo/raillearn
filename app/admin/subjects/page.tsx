import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Subject = {
  id: string;
  name: string | null;
  code: string | null;
  semester: number | null;
  description: string | null;
  image_url: string | null;
};

export default async function AdminSubjectsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select(
      "id, name, code, semester, description, image_url"
    )
    .order("created_at", {
      ascending: true,
    });

  const subjects = (data ?? []) as Subject[];

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="mx-auto max-w-[1500px] p-5 md:p-8 xl:p-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin"
              className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>

            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400">
              Curriculum
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Subjects
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
              Create and manage all subjects available on RailLearn.
            </p>
          </div>

          <Link
            href="/admin/subjects/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[10px] font-black transition hover:bg-purple-500"
          >
            <Plus size={15} />
            Add Subject
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-xs text-red-400">
            Failed to load subjects.
          </div>
        )}

        {/* EMPTY */}
        {subjects.length === 0 ? (
          <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[26px] border border-white/[0.06] bg-[#07080d] px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <BookOpen size={28} />
            </div>

            <h2 className="mt-6 text-xl font-black">
              No subjects yet
            </h2>

            <p className="mt-2 max-w-md text-xs leading-6 text-zinc-600">
              Your curriculum is empty. Start by creating your first subject.
            </p>

            <Link
              href="/admin/subjects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[10px] font-black transition hover:bg-purple-500"
            >
              <Plus size={14} />
              Create First Subject
            </Link>
          </div>
        ) : (
          <>
            {/* COUNT */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-600">
                {subjects.length}{" "}
                {subjects.length === 1 ? "subject" : "subjects"}
              </p>
            </div>

            {/* SUBJECTS */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="group overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#07080d] transition hover:border-purple-500/25"
                >

                  {/* IMAGE */}
                  <div className="relative h-44 overflow-hidden bg-[#0b0c12]">

                    {subject.image_url ? (
                      <img
                        src={subject.image_url}
                        alt={subject.name || "Subject"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen
                          size={40}
                          className="text-zinc-800"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent" />

                    {/* SEMESTER */}
                    {subject.semester !== null && (
                      <div className="absolute right-4 top-4 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-[8px] font-bold text-zinc-300 backdrop-blur-md">
                        Semester {subject.semester}
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                          {subject.code || "NO CODE"}
                        </p>

                        <h2 className="mt-2 truncate text-lg font-black">
                          {subject.name || "Untitled Subject"}
                        </h2>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                        <BookOpen size={17} />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-[40px] text-[10px] leading-5 text-zinc-600">
                      {subject.description ||
                        "No description available."}
                    </p>

                    {/* ACTIONS */}
                    <div className="mt-5 flex items-center gap-2">

                      <Link
                        href={`/admin/subjects/${subject.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] py-3 text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/30 hover:text-white"
                      >
                        Manage
                        <ChevronRight size={13} />
                      </Link>

                      <Link
                        href={`/admin/subjects/${subject.id}/edit`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-600 transition hover:border-purple-500/30 hover:text-purple-400"
                        title="Edit subject"
                      >
                        <Pencil size={14} />
                      </Link>

                      <form
                        action={`/api/admin/subjects/${subject.id}/delete`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.02] text-red-500/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete subject"
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          </>
        )}
      </div>
    </main>
  );
}