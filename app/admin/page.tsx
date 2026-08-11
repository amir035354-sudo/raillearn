import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Settings,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Subject = {
  id: string;
  name: string | null;
  code: string | null;
  semester: number | null;
  description: string | null;
};

type Lesson = {
  id: string;
  title: string | null;
};

type Quiz = {
  id: string;
  title: string | null;
};

type Student = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    subjectsResult,
    lessonsResult,
    quizzesResult,
    studentsResult,
  ] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, name, code, semester, description")
      .order("created_at", { ascending: true }),

    supabase
      .from("lessons")
      .select("id, title")
      .order("created_at", { ascending: true }),

    supabase
      .from("quizzes")
      .select("id, title")
      .order("created_at", { ascending: true }),

    supabase
      .from("users")
      .select("id, full_name, email, role")
      .order("created_at", { ascending: false }),
  ]);

  const subjects = (subjectsResult.data ?? []) as Subject[];
  const lessons = (lessonsResult.data ?? []) as Lesson[];
  const quizzes = (quizzesResult.data ?? []) as Quiz[];
  const students = (studentsResult.data ?? []) as Student[];

  const studentCount = students.filter(
    (user) => user.role !== "admin"
  ).length;

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="relative flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">

            {/* LOGO */}
            <div className="border-b border-white/[0.06] px-6 py-7">
              <Link href="/admin" className="block">
                <p className="text-xl font-black tracking-tight">
                  Rail<span className="text-purple-500">Learn</span>
                </p>

                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                  Administration
                </p>
              </Link>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 space-y-1 px-4 py-6">

              <AdminNavItem
                href="/admin"
                icon={<LayoutDashboard size={17} />}
                label="Dashboard"
                active
              />

              <AdminNavItem
                href="/admin/subjects"
                icon={<BookOpen size={17} />}
                label="Subjects"
              />

              <AdminNavItem
                href="/admin/lessons"
                icon={<GraduationCap size={17} />}
                label="Lessons"
              />

              <AdminNavItem
                href="/admin/quizzes"
                icon={<Target size={17} />}
                label="Quizzes"
              />

              <AdminNavItem
                href="/admin/students"
                icon={<Users size={17} />}
                label="Students"
              />

              <AdminNavItem
                href="/admin/progress"
                icon={<TrendingUp size={17} />}
                label="Progress"
              />

              <AdminNavItem
                href="/admin/achievements"
                icon={<Zap size={17} />}
                label="Achievements"
              />

              <AdminNavItem
                href="/admin/ai"
                icon={<BrainCircuit size={17} />}
                label="AI"
              />

              <div className="my-5 h-px bg-white/[0.05]" />

              <AdminNavItem
                href="/admin/settings"
                icon={<Settings size={17} />}
                label="Settings"
              />
            </nav>

            {/* BACK */}
            <div className="border-t border-white/[0.06] p-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[10px] font-bold text-zinc-600 transition hover:bg-white/[0.03] hover:text-white"
              >
                <ArrowLeft size={15} />
                Back to website
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/80 backdrop-blur-2xl">
            <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                  Administration
                </p>

                <h1 className="mt-1 text-sm font-black">
                  RailLearn Control Center
                </h1>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/30 hover:text-white"
              >
                <ArrowLeft size={13} />

                <span className="hidden sm:block">
                  Website
                </span>
              </Link>
            </div>
          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">

            {/* INTRO */}
            <section className="mb-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
                Control Center
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                Welcome, Admin.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Everything on RailLearn starts here. Create your
                curriculum, manage students and control the
                learning experience.
              </p>
            </section>

            {/* STATS */}
            <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">

              <AdminStat
                icon={<BookOpen size={17} />}
                label="Subjects"
                value={subjects.length}
              />

              <AdminStat
                icon={<GraduationCap size={17} />}
                label="Lessons"
                value={lessons.length}
              />

              <AdminStat
                icon={<Target size={17} />}
                label="Quizzes"
                value={quizzes.length}
              />

              <AdminStat
                icon={<Users size={17} />}
                label="Students"
                value={studentCount}
              />

            </section>

            {/* QUICK ACTIONS */}
            <section className="mb-10">

              <div className="mb-5">
                <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                  Start here
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Quick Actions
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <QuickAction
                  href="/admin/subjects/new"
                  icon={<BookOpen size={19} />}
                  title="Add Subject"
                  description="Create a new subject."
                />

                <QuickAction
                  href="/admin/lessons/new"
                  icon={<GraduationCap size={19} />}
                  title="Add Lesson"
                  description="Add learning content."
                />

                <QuickAction
                  href="/admin/quizzes/new"
                  icon={<Target size={19} />}
                  title="Create Quiz"
                  description="Build a new quiz."
                />

                <QuickAction
                  href="/admin/students"
                  icon={<Users size={19} />}
                  title="Manage Students"
                  description="View registered students."
                />

              </div>
            </section>

            {/* SUBJECTS */}
            <section className="mb-10">

              <div className="mb-5 flex items-end justify-between">

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                    Curriculum
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    Subjects
                  </h3>
                </div>

                <Link
                  href="/admin/subjects"
                  className="flex items-center gap-1 text-[9px] font-bold text-zinc-600 transition hover:text-purple-400"
                >
                  Manage
                  <ChevronRight size={13} />
                </Link>

              </div>

              {subjects.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={28} />}
                  title="No subjects yet"
                  description="Your curriculum is empty. Create the first subject from the admin panel."
                  href="/admin/subjects/new"
                  action="Create first subject"
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {subjects.slice(0, 6).map((subject) => (
                    <Link
                      key={subject.id}
                      href={`/admin/subjects/${subject.id}`}
                      className="group rounded-[22px] border border-white/[0.07] bg-[#07080d] p-5 transition hover:border-purple-500/25 hover:bg-[#0a0a10]"
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                          <BookOpen size={18} />
                        </div>

                        <ChevronRight
                          size={16}
                          className="text-zinc-700 transition group-hover:text-purple-400"
                        />

                      </div>

                      <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
                        {subject.code || "NO CODE"}
                      </p>

                      <h4 className="mt-2 text-lg font-black">
                        {subject.name || "Untitled subject"}
                      </h4>

                      {subject.semester !== null && (
                        <p className="mt-2 text-[9px] text-zinc-600">
                          Semester {subject.semester}
                        </p>
                      )}

                      <p className="mt-3 line-clamp-2 text-[10px] leading-5 text-zinc-600">
                        {subject.description ||
                          "No description yet."}
                      </p>

                    </Link>
                  ))}

                </div>
              )}

            </section>

            {/* CONTENT STATUS */}
            <section className="grid gap-5 xl:grid-cols-2">

              <ContentStatus
                title="Lessons"
                value={lessons.length}
                description={
                  lessons.length === 0
                    ? "No lessons have been created yet."
                    : `${lessons.length} lessons are currently available.`
                }
                href="/admin/lessons"
                icon={<GraduationCap size={20} />}
              />

              <ContentStatus
                title="Quizzes"
                value={quizzes.length}
                description={
                  quizzes.length === 0
                    ? "No quizzes have been created yet."
                    : `${quizzes.length} quizzes are currently available.`
                }
                href="/admin/quizzes"
                icon={<Target size={20} />}
              />

            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   ADMIN NAV ITEM
===================================================== */

function AdminNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${
        active
          ? "bg-purple-500/10 text-purple-300 shadow-[inset_2px_0_0_#a855f7]"
          : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-300"
      }`}
    >
      <span
        className={
          active
            ? "text-purple-400"
            : "text-zinc-600 transition group-hover:text-zinc-300"
        }
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

/* =====================================================
   ADMIN STAT
===================================================== */

function AdminStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#07080d] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>

        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-4 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   QUICK ACTION
===================================================== */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[20px] border border-white/[0.07] bg-[#07080d] p-5 transition hover:border-purple-500/25 hover:bg-[#0a0a10]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>

        <Plus
          size={16}
          className="text-zinc-700 transition group-hover:text-purple-400"
        />
      </div>

      <h4 className="mt-5 text-sm font-black">
        {title}
      </h4>

      <p className="mt-2 text-[10px] text-zinc-600">
        {description}
      </p>
    </Link>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/[0.08] bg-[#07080d] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
        {icon}
      </div>

      <h4 className="mt-5 text-lg font-black">
        {title}
      </h4>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-zinc-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black transition hover:bg-purple-500"
      >
        <Plus size={13} />
        {action}
      </Link>
    </div>
  );
}

/* =====================================================
   CONTENT STATUS
===================================================== */

function ContentStatus({
  title,
  value,
  description,
  href,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-white/[0.07] bg-[#07080d] p-6 transition hover:border-purple-500/25 hover:bg-[#0a0a10]"
    >
      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            {icon}
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
              Content
            </p>

            <h4 className="mt-1 text-lg font-black">
              {title}
            </h4>
          </div>

        </div>

        <ChevronRight
          size={18}
          className="text-zinc-700 transition group-hover:text-purple-400"
        />

      </div>

      <p className="mt-6 text-4xl font-black">
        {value}
      </p>

      <p className="mt-2 text-[10px] leading-5 text-zinc-600">
        {description}
      </p>
    </Link>
  );
}