"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  GraduationCap,
  Search,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  semester: number | null;
  description: string | null;
};

type FilterType = "all" | "active";

export default function SubjectsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code, semester, description")
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setSubjects([]);
      } else {
        setSubjects(data ?? []);
      }

      setLoading(false);
    }

    loadSubjects();
  }, [supabase]);

  const filteredSubjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return subjects.filter((subject) => {
      if (!query) return true;

      return (
        subject.name.toLowerCase().includes(query) ||
        (subject.code ?? "").toLowerCase().includes(query) ||
        String(subject.semester ?? "").includes(query) ||
        (subject.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [subjects, search]);

  function goTo(path: string) {
    setMobileMenu(false);
    router.push(path);
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="relative flex min-h-screen">
        {mobileMenu && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => setMobileMenu(false)}
            />

            <aside className="relative h-full w-[285px] border-r border-white/10 bg-[#060609] p-5">
              <div className="mb-10 flex items-center justify-between">
                <Logo />

                <button
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl border border-white/10 p-2 text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>

              <Navigation goTo={goTo} />
            </aside>
          </div>
        )}

        <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="px-6 py-7">
              <Logo />
            </div>

            <div className="flex-1 px-4">
              <Navigation goTo={goTo} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/90 backdrop-blur-xl">
            <div className="flex h-[76px] items-center justify-between px-5 md:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenu(true)}
                  className="rounded-xl border border-white/10 p-2 lg:hidden"
                >
                  ☰
                </button>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                    Railway Academy
                  </p>

                  <h1 className="mt-1 text-sm font-bold">
                    Subjects
                  </h1>
                </div>
              </div>

              <button
                onClick={() => goTo("/dashboard")}
                className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs text-zinc-400"
              >
                <ArrowLeft size={14} />
                Dashboard
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">
            <section className="mb-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
                Your curriculum
              </p>

              <h2 className="mt-3 text-3xl font-black md:text-5xl">
                My Subjects
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Explore your engineering subjects and continue learning.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subjects..."
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#07080d] pl-11 pr-4 text-xs outline-none focus:border-purple-500/40"
                  />
                </div>

                <div className="flex gap-2">
                  <FilterButton
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </FilterButton>

                  <FilterButton
                    active={filter === "active"}
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </FilterButton>
                </div>
              </div>
            </section>

            {loading ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900 p-12 text-center">
                <p className="text-zinc-500">
                  Loading subjects...
                </p>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900 p-12 text-center">
                <BookOpen
                  size={35}
                  className="mx-auto text-zinc-700"
                />

                <h3 className="mt-4 text-xl font-bold">
                  No subjects found
                </h3>
              </div>
            ) : (
              <section>
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                      All Courses
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      Engineering Curriculum
                    </h3>
                  </div>

                  <span className="text-xs text-zinc-700">
                    {filteredSubjects.length} subjects
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredSubjects.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onClick={() =>
                        goTo(
                          `/subjects/${subject.code}`
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <button
      onClick={() => {
        window.location.href = "/dashboard";
      }}
      className="text-left"
    >
      <div className="text-xl font-black text-white">
        Rail<span className="text-purple-500">Learn</span>
      </div>

      <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
        Railway Academy
      </p>
    </button>
  );
}

function Navigation({
  goTo,
}: {
  goTo: (path: string) => void;
}) {
  return (
    <nav className="space-y-1">
      <NavItem
        icon={<GraduationCap size={17} />}
        label="Dashboard"
        onClick={() => goTo("/dashboard")}
      />

      <NavItem
        icon={<BookOpen size={17} />}
        label="Subjects"
        active
        onClick={() => goTo("/subjects")}
      />

      <NavItem
        icon={<BrainCircuit size={17} />}
        label="AI Tutor"
        onClick={() => goTo("/ai")}
      />

      <NavItem
        icon={<Target size={17} />}
        label="Quizzes"
        onClick={() => goTo("/quizzes")}
      />

      <NavItem
        icon={<Zap size={17} />}
        label="Achievements"
        onClick={() => goTo("/achievements")}
      />

      <NavItem
        icon={<TrendingUp size={17} />}
        label="Progress"
        onClick={() => goTo("/progress")}
      />
    </nav>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-semibold transition ${
        active
          ? "bg-purple-500/10 text-purple-300"
          : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-300"
      }`}
    >
      <span
        className={
          active ? "text-purple-400" : "text-zinc-600"
        }
      >
        {icon}
      </span>

      {label}
    </button>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-[9px] font-bold transition ${
        active
          ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
          : "border-white/[0.07] bg-[#07080d] text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

function SubjectCard({
  subject,
  onClick,
}: {
  subject: Subject;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 text-left transition hover:-translate-y-1 hover:border-purple-500/30"
    >
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
            <BookOpen size={22} />
          </div>

          <ChevronRight
            size={18}
            className="text-zinc-700 transition group-hover:text-purple-400"
          />
        </div>

        <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">
          {subject.code ?? "SUBJECT"}
        </p>

        <h4 className="mt-2 text-xl font-black">
          {subject.name}
        </h4>

        {subject.semester !== null && (
          <p className="mt-2 text-xs text-zinc-600">
            Semester {subject.semester}
          </p>
        )}

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
          {subject.description ?? "No description available."}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-zinc-600">
            Open subject
          </span>

          <span className="flex items-center gap-1 text-xs font-bold text-purple-400">
            Open
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}