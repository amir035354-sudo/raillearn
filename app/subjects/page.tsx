"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Gauge,
  GraduationCap,
  Search,
  Settings,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Subject = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  icon: React.ElementType;
  image: string;
  href: string;
  status: "active" | "coming";
  color: string;
};

const subjects: Subject[] = [
  {
    id: "railway-engineering",
    name: "Railway Engineering",
    shortName: "Railway",
    description:
      "Learn railway track design, geometry, alignment, cant, curves, rails, sleepers and railway infrastructure.",
    progress: 72,
    lessons: 21,
    completedLessons: 15,
    icon: TrainFront,
    image: "/images/train-hero.jfif",
    href: "/subjects/railway-engineering",
    status: "active",
    color: "purple",
  },

  {
    id: "engineering-mathematics",
    name: "Engineering Mathematics",
    shortName: "Mathematics",
    description:
      "Build the mathematical foundation required for engineering calculations, analysis and problem solving.",
    progress: 80,
    lessons: 24,
    completedLessons: 19,
    icon: Gauge,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
    href: "/subjects/engineering-mathematics",
    status: "coming",
    color: "blue",
  },

  {
    id: "mechanics",
    name: "Engineering Mechanics",
    shortName: "Mechanics",
    description:
      "Understand forces, motion, equilibrium, friction, moments and the mechanical principles used in engineering.",
    progress: 65,
    lessons: 20,
    completedLessons: 13,
    icon: Settings,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    href: "/subjects/mechanics",
    status: "coming",
    color: "orange",
  },

  {
    id: "electrical-engineering",
    name: "Electrical Engineering",
    shortName: "Electrical",
    description:
      "Study electrical circuits, current, voltage, resistance, power, machines and railway electrical systems.",
    progress: 48,
    lessons: 22,
    completedLessons: 10,
    icon: Zap,
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
    href: "/subjects/electrical-engineering",
    status: "coming",
    color: "yellow",
  },

  {
    id: "railway-signaling",
    name: "Railway Signaling",
    shortName: "Signaling",
    description:
      "Explore railway signaling systems, safety principles, signals, interlocking and train control.",
    progress: 35,
    lessons: 18,
    completedLessons: 6,
    icon: Target,
    image:
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1200&auto=format&fit=crop",
    href: "/subjects/railway-signaling",
    status: "coming",
    color: "red",
  },

  {
    id: "programming",
    name: "Programming",
    shortName: "Programming",
    description:
      "Learn programming fundamentals, algorithms, problem solving and the technologies used in modern systems.",
    progress: 91,
    lessons: 26,
    completedLessons: 24,
    icon: Code2,
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    href: "/subjects/programming",
    status: "coming",
    color: "cyan",
  },
];

type FilterType = "all" | "active" | "coming";

export default function SubjectsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredSubjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return subjects.filter((subject) => {
      const matchesSearch =
        !query ||
        subject.name.toLowerCase().includes(query) ||
        subject.shortName.toLowerCase().includes(query) ||
        subject.description.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || subject.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  function goTo(path: string) {
    setMobileMenu(false);
    router.push(path);
  }

  const totalProgress = Math.round(
    subjects.reduce((sum, subject) => sum + subject.progress, 0) /
      subjects.length
  );

  const completedSubjects = subjects.filter(
    (subject) => subject.progress >= 100
  ).length;

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[5%] h-96 w-96 rounded-full bg-purple-700/10 blur-[130px]" />

        <div className="absolute right-[-120px] top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/[0.07] blur-[130px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setMobileMenu(false)}
            />

            <aside className="relative h-full w-[285px] border-r border-white/10 bg-[#060609] p-5 shadow-2xl">
              <div className="mb-10 flex items-center justify-between">
                <Logo />

                <button
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>

              <Navigation goTo={goTo} />
            </aside>
          </div>
        )}

        {/* Sidebar */}
        <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.06] bg-[#060609] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="px-6 py-7">
              <Logo />
            </div>

            <div className="flex-1 px-4">
              <Navigation goTo={goTo} />
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-violet-800 text-sm font-black">
                    A
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      Amir
                    </p>

                    <p className="mt-1 text-[9px] text-purple-400">
                      Railway Student
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/80 backdrop-blur-2xl">
            <div className="flex h-[76px] items-center justify-between px-5 md:px-8 xl:px-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenu(true)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-zinc-400 lg:hidden"
                >
                  <span className="text-lg">☰</span>
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

              <div className="flex items-center gap-3">
                <button
                  onClick={() => goTo("/ai")}
                  className="hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-zinc-500 transition hover:text-white sm:block"
                >
                  <BrainCircuit size={17} />
                </button>

                <button
                  onClick={() => goTo("/dashboard")}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[9px] font-bold text-zinc-400 transition hover:border-purple-500/30 hover:text-white"
                >
                  <ArrowLeft size={13} />
                  <span className="hidden sm:block">
                    Dashboard
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">
            {/* Page Heading */}
            <section className="mb-8">
              <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-purple-400">
                    Your curriculum
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                    My Subjects
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                    Explore your engineering subjects,
                    track your progress and continue
                    learning from where you stopped.
                  </p>
                </div>

                {/* Overall Progress */}
                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <TrendingUp size={20} />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                      Overall Progress
                    </p>

                    <p className="mt-1 text-xl font-black">
                      {totalProgress}%
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat
                icon={<BookOpen size={16} />}
                value={String(subjects.length)}
                label="Subjects"
              />

              <MiniStat
                icon={<GraduationCap size={16} />}
                value={String(
                  subjects.reduce(
                    (sum, subject) => sum + subject.lessons,
                    0
                  )
                )}
                label="Total Lessons"
              />

              <MiniStat
                icon={<Check size={16} />}
                value={String(
                  subjects.reduce(
                    (sum, subject) =>
                      sum + subject.completedLessons,
                    0
                  )
                )}
                label="Completed"
              />

              <MiniStat
                icon={<Sparkles size={16} />}
                value={`${completedSubjects}/${subjects.length}`}
                label="Finished"
              />
            </section>

            {/* Search + Filter */}
            <section className="mb-8">
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search subjects..."
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#07080d] pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40"
                  />
                </div>

                {/* Filters */}
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

                  <FilterButton
                    active={filter === "coming"}
                    onClick={() => setFilter("coming")}
                  >
                    Coming Soon
                  </FilterButton>
                </div>
              </div>
            </section>

            {/* Featured */}
            {filter === "all" &&
              !search &&
              subjects.length > 0 && (
                <section className="mb-10">
                  <div className="mb-5">
                    <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
                      Continue Learning
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      Pick up where you left off
                    </h3>
                  </div>

                  <div
                    onClick={() =>
                      goTo(
                        "/subjects/railway-engineering"
                      )
                    }
                    className="group relative min-h-[280px] cursor-pointer overflow-hidden rounded-[30px] border border-purple-500/20 bg-[#08070d]"
                  >
                    <img
                      src="/images/train-hero.jfif"
                      alt="Railway Engineering"
                      className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-1000 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/80 to-transparent" />

                    <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-6 md:p-9">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-purple-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                            Currently Learning
                          </span>

                          <h3 className="mt-5 text-3xl font-black md:text-4xl">
                            Railway{" "}
                            <span className="text-purple-500">
                              Engineering
                            </span>
                          </h3>

                          <p className="mt-3 max-w-xl text-xs leading-6 text-zinc-500">
                            Continue your current chapter
                            and complete Track Geometry.
                          </p>
                        </div>

                        <div className="hidden rounded-2xl border border-white/10 bg-black/30 p-3 text-purple-400 backdrop-blur-md md:block">
                          <TrainFront size={24} />
                        </div>
                      </div>

                      <div className="mt-8 max-w-[650px]">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-4xl font-black">
                              72%
                            </p>

                            <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                              Course Progress
                            </p>
                          </div>

                          <span className="text-[9px] text-zinc-600">
                            15 / 21 lessons
                          </span>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400" />
                        </div>

                        <button className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-[9px] font-black transition group-hover:-translate-y-0.5">
                          Continue Learning
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

            {/* Subjects */}
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

                <span className="text-[9px] text-zinc-700">
                  {filteredSubjects.length} subjects
                </span>
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="rounded-[25px] border border-white/[0.07] bg-[#07080d] p-12 text-center">
                  <Search
                    size={30}
                    className="mx-auto text-zinc-700"
                  />

                  <h3 className="mt-4 text-lg font-black">
                    No subjects found
                  </h3>

                  <p className="mt-2 text-xs text-zinc-600">
                    Try another search or filter.
                  </p>

                  <button
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                    className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-[9px] font-black"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredSubjects.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onClick={() => goTo(subject.href)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Bottom CTA */}
            <section className="mt-10 overflow-hidden rounded-[30px] border border-purple-500/15 bg-gradient-to-br from-[#150b20] via-[#08080d] to-[#050507] p-6 md:p-9">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <BrainCircuit size={19} />
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400">
                        AI Tutor
                      </p>

                      <p className="mt-1 text-[8px] text-zinc-600">
                        RailLearn Intelligence
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-black md:text-2xl">
                    Not sure what to study?
                  </h3>

                  <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-600">
                    Ask your AI Tutor to explain a topic,
                    generate practice questions or help
                    you decide what to study next.
                  </p>
                </div>

                <button
                  onClick={() => goTo("/ai")}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3.5 text-[9px] font-black transition hover:-translate-y-0.5"
                >
                  <Sparkles size={13} />
                  Open AI Tutor
                  <ArrowRight size={13} />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   LOGO
===================================================== */

function Logo() {
  return (
    <button
      onClick={() => {
        window.location.href = "/dashboard";
      }}
      className="text-left"
    >
      <p className="text-sm font-black tracking-tight">
        RailLearn
      </p>

      <p className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
        Railway Academy
      </p>
    </button>
  );
}

/* =====================================================
   NAVIGATION
===================================================== */

function Navigation({
  goTo,
}: {
  goTo: (path: string) => void;
}) {
  return (
    <nav className="space-y-1">
      <NavItem
        icon={<TrendingUp size={17} />}
        label="Dashboard"
        onClick={() => goTo("/dashboard")}
      />

      <NavItem
        icon={<GraduationCap size={17} />}
        label="My Journey"
        onClick={() => goTo("/journey")}
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

      <NavItem
        icon={<Settings size={17} />}
        label="Settings"
        onClick={() => goTo("/settings")}
      />
    </nav>
  );
}

/* =====================================================
   NAV ITEM
===================================================== */

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
    </button>
  );
}

/* =====================================================
   MINI STAT
===================================================== */

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#07080d] p-4">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   FILTER BUTTON
===================================================== */

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

/* =====================================================
   SUBJECT CARD
===================================================== */

function SubjectCard({
  subject,
  onClick,
}: {
  subject: Subject;
  onClick: () => void;
}) {
  const Icon = subject.icon;

  const isComing = subject.status === "coming";

  return (
    <button
      onClick={onClick}
      className="group relative min-h-[330px] overflow-hidden rounded-[27px] border border-white/[0.07] bg-[#07080d] text-left transition duration-500 hover:-translate-y-1 hover:border-purple-500/25 hover:shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
    >
      {/* Image */}
      <img
        src={subject.image}
        alt={subject.name}
        className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-110 group-hover:opacity-45"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/75 to-[#030305]/20" />

      {/* Coming Soon Overlay */}
      {isComing && (
        <div className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[7px] font-black uppercase tracking-wider text-zinc-400 backdrop-blur-md">
          Coming Soon
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-[330px] flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-purple-400 backdrop-blur-md transition group-hover:border-purple-400/20 group-hover:bg-purple-500/10">
            <Icon size={19} />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-2 backdrop-blur-md transition group-hover:border-purple-400/20">
            <ChevronRight
              size={15}
              className="text-zinc-600 group-hover:text-purple-400"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[7px] font-bold uppercase tracking-[0.2em] text-purple-400">
            {subject.shortName}
          </p>

          <h4 className="text-xl font-black leading-tight">
            {subject.name}
          </h4>

          <p className="mt-3 line-clamp-3 text-[10px] leading-5 text-zinc-500">
            {subject.description}
          </p>

          {/* Lessons */}
          <div className="mt-5 flex items-center justify-between text-[8px]">
            <span className="text-zinc-600">
              {subject.completedLessons} /{" "}
              {subject.lessons} lessons
            </span>

            <span className="font-black text-purple-400">
              {subject.progress}%
            </span>
          </div>

          {/* Progress */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400 transition-all duration-700"
              style={{
                width: `${subject.progress}%`,
              }}
            />
          </div>

          {/* Action */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[8px] font-bold text-zinc-500 group-hover:text-zinc-300">
              {isComing
                ? "View subject"
                : "Continue learning"}
            </span>

            <span className="flex items-center gap-1 text-[8px] font-black text-purple-400">
              Open
              <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}