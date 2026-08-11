import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Target,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Quiz = {
  id: string;
  title: string | null;
  description: string | null;
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

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  const supabase = await createClient();

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =====================================================
  // CHECK ADMIN
  // =====================================================

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/[0.07] bg-[#07080d] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Target size={25} />
          </div>

          <h1 className="mt-5 text-xl font-black">
            Admin access required.
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            You do not have permission to access this page.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-xs font-bold transition hover:bg-purple-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // GET QUIZZES
  // =====================================================

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      id,
      title,
      description,
      subject_id,
      created_at,
      subjects (
        id,
        name,
        code
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-red-500/20 bg-red-500/[0.04] p-10">
          <h1 className="text-xl font-black">
            Failed to load quizzes
          </h1>

          <p className="mt-3 text-sm text-red-400">
            {error.message}
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Admin
          </Link>
        </div>
      </main>
    );
  }

  const quizzes = (data ?? []) as unknown as Quiz[];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#030305] px-5 py-8 text-white md:px-8 md:py-10 xl:px-10">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Admin Dashboard
            </Link>

            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
              Assessment
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
              Quizzes
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              Create and manage quizzes for RailLearn students.
            </p>
          </div>

          <Link
            href="/admin/quizzes/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
          >
            <Plus size={15} />
            Create Quiz
          </Link>
        </div>

        {/* STATS */}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] border border-white/[0.07] bg-[#07080d] p-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Total Quizzes
            </p>

            <p className="mt-3 text-3xl font-black">
              {quizzes.length}
            </p>
          </div>

          <div className="rounded-[20px] border border-white/[0.07] bg-[#07080d] p-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Subjects
            </p>

            <p className="mt-3 text-3xl font-black">
              {
                new Set(
                  quizzes
                    .map((quiz) => quiz.subject_id)
                    .filter(Boolean)
                ).size
              }
            </p>
          </div>

          <div className="col-span-2 rounded-[20px] border border-white/[0.07] bg-[#07080d] p-5 sm:col-span-1">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Status
            </p>

            <p className="mt-3 text-sm font-black text-purple-400">
              Active
            </p>
          </div>
        </div>

        {/* EMPTY */}

        {quizzes.length === 0 ? (
          <div className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <Target size={28} />
            </div>

            <h2 className="mt-6 text-xl font-black">
              No quizzes yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
              You haven't created any quizzes yet. Create your
              first quiz to start testing your students.
            </p>

            <Link
              href="/admin/quizzes/new"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
            >
              <Plus size={14} />
              Create First Quiz
            </Link>
          </div>
        ) : (
          // =================================================
          // QUIZZES
          // =================================================

          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/admin/quizzes/${quiz.id}`}
                className="group rounded-[24px] border border-white/[0.07] bg-[#07080d] p-5 transition hover:border-purple-500/25 hover:bg-[#090a10]"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  {/* LEFT */}

                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <Target size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                        <BookOpen size={11} />

                        {quiz.subjects?.code ||
                          "NO SUBJECT"}
                      </p>

                      <h2 className="mt-2 truncate text-base font-black md:text-lg">
                        {quiz.title ||
                          "Untitled Quiz"}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                        {quiz.description ||
                          "No description yet."}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div className="flex shrink-0 items-center gap-6">
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-700">
                        Subject
                      </p>

                      <p className="mt-1 max-w-[180px] truncate text-xs font-bold text-zinc-500">
                        {quiz.subjects?.name ||
                          "Unknown"}
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