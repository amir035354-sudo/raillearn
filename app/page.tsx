"use client";

import Image from "next/image";
import {
  ArrowRight,
  BrainCircuit,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Menu,
  Sparkles,
  Target,
  TrainFront,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  name: string;
  full_name: string | null;
  avatar_url: string | null;
};

const STUDENT_MODE_KEY =
  "raillearn_admin_student_mode";

export default function HomePage() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [student, setStudent] =
    useState<Student | null>(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadStudent() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        setStudent(null);
        return;
      }

      const { data: profile } =
        await supabase
          .from("users")
          .select(
            "name, full_name, avatar_url"
          )
          .eq("id", user.id)
          .maybeSingle();

      if (!mounted) {
        return;
      }

      setStudent({
        name:
          profile?.name ??
          user.user_metadata?.name ??
          user.user_metadata?.full_name ??
          "Student",

        full_name:
          profile?.full_name ??
          user.user_metadata?.full_name ??
          null,

        avatar_url:
          profile?.avatar_url ??
          user.user_metadata?.avatar_url ??
          user.user_metadata?.picture ??
          null,
      });
    }

    void loadStudent();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const studentName =
    student?.full_name ||
    student?.name ||
    "Student";

  const initials = studentName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part[0]?.toUpperCase()
    )
    .join("");

  function openDashboard() {
    if (student) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }

  function enableStudentMode() {
    try {
      window.localStorage.setItem(
        STUDENT_MODE_KEY,
        "true"
      );
    } catch {
      // Ignore storage errors.
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020203] text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <Image
          src="/railearn-hero.png"
          alt="RailLearn futuristic railway technology"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020203] via-[#020203]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-[#020203]/30" />

        <div className="absolute -left-40 top-1/3 h-[450px] w-[450px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-700/10 blur-[140px]" />

        <header className="absolute left-0 right-0 top-0 z-30">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-black/30 text-purple-300 backdrop-blur-xl">
                <TrainFront size={19} />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-black">
                  RailLearn
                </p>

                <p className="text-[7px] font-black uppercase tracking-[0.28em] text-white/40">
                  Railway Academy
                </p>
              </div>
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {student ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/dashboard"
                      )
                    }
                    className="rounded-xl border border-white/10 bg-black/25 px-5 py-3 text-[8px] font-black uppercase tracking-[0.15em] text-white/70 backdrop-blur-xl transition hover:border-purple-400/30 hover:text-white"
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/subjects"
                      )
                    }
                    className="rounded-xl border border-white/10 bg-black/25 px-5 py-3 text-[8px] font-black uppercase tracking-[0.15em] text-white/70 backdrop-blur-xl transition hover:border-purple-400/30 hover:text-white"
                  >
                    Subjects
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/profile"
                      )
                    }
                    className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 py-1.5 pl-1.5 pr-3 backdrop-blur-xl transition hover:border-purple-400/30"
                  >
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-purple-400/20 bg-purple-500/10 text-[9px] font-black text-purple-200">
                      {student.avatar_url ? (
                        <img
                          src={
                            student.avatar_url
                          }
                          alt={
                            studentName
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials || "S"
                      )}
                    </div>

                    <div className="hidden max-w-[140px] text-left lg:block">
                      <p className="truncate text-[8px] font-black">
                        {studentName}
                      </p>

                      <p className="text-[6px] uppercase tracking-[0.12em] text-white/35">
                        View Profile
                      </p>
                    </div>

                    <ChevronRight
                      size={12}
                      className="text-white/30"
                    />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/login"
                      )
                    }
                    className="rounded-xl px-5 py-3 text-[8px] font-black uppercase tracking-[0.15em] text-white/60 hover:text-white"
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/register"
                      )
                    }
                    className="rounded-xl border border-purple-400/20 bg-purple-500/15 px-5 py-3 text-[8px] font-black uppercase tracking-[0.15em] text-purple-200 backdrop-blur-xl transition hover:bg-purple-500/20"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/80 backdrop-blur-xl md:hidden"
            >
              {menuOpen ? (
                <X size={18} />
              ) : (
                <Menu size={18} />
              )}
            </button>
          </div>

          {menuOpen && (
            <div className="mx-5 rounded-3xl border border-white/10 bg-[#08070d]/95 p-3 backdrop-blur-2xl md:hidden">
              {student ? (
                <>
                  <MobileButton
                    label="Dashboard"
                    onClick={() =>
                      router.push(
                        "/dashboard"
                      )
                    }
                  />

                  <MobileButton
                    label="Subjects"
                    onClick={() =>
                      router.push(
                        "/subjects"
                      )
                    }
                  />

                  <MobileButton
                    label="Journey"
                    onClick={() =>
                      router.push(
                        "/journey"
                      )
                    }
                  />

                  <MobileButton
                    label="AI Tutor"
                    onClick={() =>
                      router.push(
                        "/ai"
                      )
                    }
                  />

                  <MobileButton
                    label="Profile"
                    onClick={() =>
                      router.push(
                        "/profile"
                      )
                    }
                  />
                </>
              ) : (
                <>
                  <MobileButton
                    label="Sign In"
                    onClick={() =>
                      router.push(
                        "/login"
                      )
                    }
                  />

                  <MobileButton
                    label="Create Account"
                    onClick={() =>
                      router.push(
                        "/register"
                      )
                    }
                  />
                </>
              )}
            </div>
          )}
        </header>

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 py-28 sm:px-8 lg:px-12">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-black/30 px-3 py-1.5 backdrop-blur-xl">
              <Sparkles
                size={11}
                className="text-purple-300"
              />

              <span className="text-[7px] font-black uppercase tracking-[0.28em] text-purple-200">
                Railway Learning Platform
              </span>
            </div>

            <p className="mt-7 text-[9px] font-black uppercase tracking-[0.35em] text-white/40">
              Track • Learn • Master • Succeed
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl lg:text-7xl xl:text-[92px]">
              Your journey
              <span className="block bg-gradient-to-r from-purple-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                starts here.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              A smarter way to learn railway and
              modern transportation technology —
              with lessons, quizzes, progress,
              XP and AI support in one place.
            </p>

            <button
              type="button"
              onClick={openDashboard}
              className="group mt-9 flex min-h-[72px] w-full max-w-[440px] items-center justify-between rounded-[22px] border border-purple-300/20 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-6 shadow-[0_25px_70px_rgba(124,58,237,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(124,58,237,0.45)] sm:px-7"
            >
              <div className="text-left">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60">
                  {student
                    ? `Welcome back, ${studentName}`
                    : "Start your journey"}
                </p>

                <p className="mt-1 text-base font-black sm:text-lg">
                  {student
                    ? "Open Dashboard"
                    : "Enter RailLearn"}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </button>

            <div className="mt-7 flex flex-wrap gap-2">
              <Badge
                icon={
                  <CheckCircle2 size={10} />
                }
                text="Student Dashboard"
              />

              <Badge
                icon={
                  <CheckCircle2 size={10} />
                }
                text="Learning Journey"
              />

              <Badge
                icon={
                  <CheckCircle2 size={10} />
                }
                text="AI Tutor"
              />
            </div>

            {student && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile"
                  )
                }
                className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 backdrop-blur-xl transition hover:border-purple-400/25"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-purple-400/20 bg-purple-500/10 text-[9px] font-black text-purple-200">
                  {student.avatar_url ? (
                    <img
                      src={
                        student.avatar_url
                      }
                      alt={
                        studentName
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "S"
                  )}
                </div>

                <div className="text-left">
                  <p className="text-[7px] font-black uppercase tracking-[0.18em] text-white/35">
                    Signed in as
                  </p>

                  <p className="mt-0.5 max-w-[220px] truncate text-xs font-black">
                    {studentName}
                  </p>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={enableStudentMode}
              className="mt-6 hidden"
            >
              Student Mode
            </button>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 z-10 sm:left-8 sm:right-8 lg:left-12 lg:right-12">
          <div className="grid grid-cols-2 overflow-hidden rounded-[22px] border border-white/10 bg-black/35 backdrop-blur-xl sm:grid-cols-4">
            <HeroStat
              icon={
                <GraduationCap size={14} />
              }
              label="Learning"
              value="Structured"
            />

            <HeroStat
              icon={
                <Target size={14} />
              }
              label="Progress"
              value="Tracked"
            />

            <HeroStat
              icon={
                <Zap size={14} />
              }
              label="XP"
              value="Earn"
            />

            <HeroStat
              icon={
                <BrainCircuit size={14} />
              }
              label="AI"
              value="Ready"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            icon={<BookOpen size={19} />}
            title="Structured Learning"
            text="Subjects and lessons stay organized so you always know where to go next."
          />

          <FeatureCard
            icon={<Target size={19} />}
            title="Track Progress"
            text="Follow your progress, completed lessons, quizzes and milestones."
          />

          <FeatureCard
            icon={
              <BrainCircuit size={19} />
            }
            title="AI Tutor"
            text="Get help understanding topics and preparing for quizzes."
          />

          <FeatureCard
            icon={<Trophy size={19} />}
            title="XP & Streaks"
            text="Build consistency and keep your learning momentum alive."
          />
        </div>
      </section>

      <footer className="border-t border-white/[0.05]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-8 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <TrainFront
              size={14}
              className="text-purple-400"
            />

            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">
              RailLearn
            </span>
          </div>

          <p className="text-[7px] text-zinc-800">
            Railway Learning Platform
          </p>
        </div>
      </footer>
    </main>
  );
}

function MobileButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[9px] font-black text-zinc-400 transition hover:bg-purple-500/[0.06] hover:text-white"
    >
      {label}

      <ChevronRight
        size={13}
        className="text-zinc-700"
      />
    </button>
  );
}

function Badge({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[7px] font-bold text-white/50 backdrop-blur-xl">
      <span className="text-green-400">
        {icon}
      </span>

      {text}
    </span>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-r border-white/[0.06] px-4 py-3 last:border-r-0 sm:px-5">
      <div className="text-purple-300">
        {icon}
      </div>

      <div>
        <p className="text-[6px] font-black uppercase tracking-[0.15em] text-white/30">
          {label}
        </p>

        <p className="mt-0.5 text-[8px] font-black text-white/80">
          {value}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-[28px] border border-white/[0.06] bg-[#07070b] p-6 transition hover:-translate-y-1 hover:border-purple-500/20 hover:bg-[#09090e]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-black">
        {title}
      </h3>

      <p className="mt-2 text-[8px] leading-6 text-zinc-700">
        {text}
      </p>
    </div>
  );
}