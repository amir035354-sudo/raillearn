"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock3,
  ExternalLink,
  FileText,
  Flame,
  Home,
  Loader2,
  Lock,
  Target,
  TrainFront,
  Trophy,
  Video,
  X,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type LessonRow = {
  id: string;
  subject_id: string | null;

  title: string | null;
  description: string | null;
  content: string | null;

  video: string | null;
  video_url: string | null;

  pdf: string | null;
  pdf_url: string | null;

  image: string | null;
  thumbnail_url: string | null;

  slug: string | null;

  order_number: number | null;
  lesson_order: number | null;

  duration_minutes: number | null;
  estimated_minutes: number | null;

  difficulty: string | null;

  is_published: boolean | null;
  is_free: boolean | null;

  objectives: string | null;
  prerequisites: string | null;
  resources: string | null;

  views_count: number | null;

  created_at: string | null;
  updated_at: string | null;
};

type SubjectRow = {
  id: string;
  name: string | null;
  code: string | null;
  description: string | null;
  image_url: string | null;
};

type ProgressState = {
  completed: boolean;
  completedAt: string | null;
};

/* =========================================================
   FALLBACKS
========================================================= */

const fallbackThumbnail =
  "/images/train-hero.jpg";

/* =========================================================
   PAGE
========================================================= */

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();

  const supabase = createClient();

  /* =====================================================
     CORRECT ROUTE PARAMS
  ===================================================== */

  const subjectId =
    typeof params?.subjectId === "string"
      ? params.subjectId
      : Array.isArray(params?.subjectId)
        ? params.subjectId[0]
        : "";

  const lessonId =
    typeof params?.lessonId === "string"
      ? params.lessonId
      : Array.isArray(params?.lessonId)
        ? params.lessonId[0]
        : "";

  /* =====================================================
     STATE
  ===================================================== */

  const [lesson, setLesson] =
    useState<LessonRow | null>(null);

  const [subject, setSubject] =
    useState<SubjectRow | null>(null);

  const [completed, setCompleted] =
    useState(false);

  const [completedAt, setCompletedAt] =
    useState<string | null>(null);

  const [previousLesson, setPreviousLesson] =
    useState<LessonRow | null>(null);

  const [nextLesson, setNextLesson] =
    useState<LessonRow | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [completing, setCompleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showComplete, setShowComplete] =
    useState(false);

  const [xpAdded, setXpAdded] =
    useState<number | null>(null);

  const [achievementMessages, setAchievementMessages] =
    useState<
      Array<{
        title: string;
        icon: string;
        xp_reward: number;
      }>
    >([]);

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {
    if (!lessonId) {
      return;
    }

    void loadLesson();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  async function loadLesson() {
    try {
      setLoading(true);
      setErrorMessage("");

      /* ===============================================
         AUTH
      =============================================== */

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError) {
        console.error(
          "AUTH ERROR:",
          authError
        );

        throw new Error(
          "Unable to verify your account."
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /* ===============================================
         LESSON
      =============================================== */

      const {
        data: lessonData,
        error: lessonError,
      } = await supabase
        .from("lessons")
        .select(`
          id,
          subject_id,
          title,
          description,
          content,
          video,
          video_url,
          pdf,
          pdf_url,
          image,
          thumbnail_url,
          slug,
          order_number,
          lesson_order,
          duration_minutes,
          estimated_minutes,
          difficulty,
          is_published,
          is_free,
          objectives,
          prerequisites,
          resources,
          views_count,
          created_at,
          updated_at
        `)
        .eq("id", lessonId)
        .single();

      if (lessonError) {
        console.error(
          "LESSON ERROR:",
          lessonError
        );

        throw new Error(
          lessonError.message
        );
      }

      if (!lessonData) {
        throw new Error(
          "Lesson was not found."
        );
      }

      const loadedLesson =
        lessonData as LessonRow;

      /*
       * Make sure the lesson really belongs
       * to the current route's subject.
       */
      if (
        subjectId &&
        loadedLesson.subject_id &&
        loadedLesson.subject_id !==
        subjectId
      ) {
        throw new Error(
          "This lesson does not belong to the selected subject."
        );
      }

      setLesson(loadedLesson);

      /* ===============================================
         SUBJECT
      =============================================== */

      if (loadedLesson.subject_id) {
        const {
          data: subjectData,
          error: subjectError,
        } =
          await supabase
            .from("subjects")
            .select(`
              id,
              name,
              code,
              description,
              image_url
            `)
            .eq(
              "id",
              loadedLesson.subject_id
            )
            .maybeSingle();

        if (subjectError) {
          console.warn(
            "SUBJECT LOAD WARNING:",
            subjectError
          );
        }

        if (subjectData) {
          setSubject(
            subjectData as SubjectRow
          );
        }
      }

      /* ===============================================
         PROGRESS
      =============================================== */

      const progressResults =
        await Promise.all([
          supabase
            .from("lesson_progress")
            .select(`
              completed,
              completed_at,
              updated_at
            `)
            .eq(
              "lesson_id",
              lessonId
            )
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle(),

          supabase
            .from("progress")
            .select(`
              completed,
              created_at
            `)
            .eq(
              "lesson_id",
              lessonId
            )
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle(),
        ]);

      const lessonProgress =
        progressResults[0].data;

      const legacyProgress =
        progressResults[1].data;

      const resolvedCompleted =
        lessonProgress?.completed ===
        true ||
        legacyProgress?.completed ===
        true;

      const resolvedCompletedAt =
        lessonProgress?.completed_at ??
        null;

      const progressState: ProgressState =
      {
        completed:
          resolvedCompleted,
        completedAt:
          resolvedCompletedAt,
      };

      setCompleted(
        progressState.completed
      );

      setCompletedAt(
        progressState.completedAt
      );

      /* ===============================================
         PREVIOUS + NEXT
      =============================================== */

      if (
        loadedLesson.subject_id
      ) {
        const {
          data: navigationLessons,
          error: navigationError,
        } =
          await supabase
            .from("lessons")
            .select(`
              id,
              subject_id,
              title,
              description,
              content,
              video,
              video_url,
              pdf,
              pdf_url,
              image,
              thumbnail_url,
              slug,
              order_number,
              lesson_order,
              duration_minutes,
              estimated_minutes,
              difficulty,
              is_published,
              is_free,
              objectives,
              prerequisites,
              resources,
              views_count,
              created_at,
              updated_at
            `)
            .eq(
              "subject_id",
              loadedLesson.subject_id
            )
            .eq(
              "is_published",
              true
            )
            .order(
              "lesson_order",
              {
                ascending: true,
                nullsFirst: false,
              }
            )
            .order(
              "order_number",
              {
                ascending: true,
                nullsFirst: false,
              }
            );

        if (!navigationError) {
          const list =
            (navigationLessons ??
              []) as LessonRow[];

          const currentIndex =
            list.findIndex(
              (item) =>
                item.id ===
                lessonId
            );

          if (currentIndex > 0) {
            setPreviousLesson(
              list[currentIndex - 1]
            );
          } else {
            setPreviousLesson(null);
          }

          if (
            currentIndex >= 0 &&
            currentIndex <
            list.length - 1
          ) {
            setNextLesson(
              list[currentIndex + 1]
            );
          } else {
            setNextLesson(null);
          }
        } else {
          console.warn(
            "NAVIGATION LOAD WARNING:",
            navigationError
          );
        }
      }

      /* ===============================================
         INCREMENT VIEWS
      =============================================== */

      /*
       * Views are non-critical.
       *
       * We intentionally leave this separate
       * from progress / XP logic.
       */

      try {
        await supabase
          .from("lessons")
          .update({
            views_count:
              (loadedLesson.views_count ??
                0) + 1,
          })
          .eq(
            "id",
            lessonId
          );
      } catch {
        // Views are not critical.
      }
    } catch (error) {
      console.error(
        "LOAD LESSON ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     COMPLETE LESSON
  ===================================================== */

  async function completeLesson() {
    if (
      !lesson ||
      completed ||
      completing
    ) {
      return;
    }

    try {
      setCompleting(true);
      setErrorMessage("");

      /* ===============================================
         AUTH
      =============================================== */

      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          authError.message
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /* ===============================================
         CENTRAL ACTIVITY API
      =============================================== */

      const response =
        await fetch(
          "/api/student/lesson-complete",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              lessonId:
                lesson.id,
            }),
          }
        );

      let data: any = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Could not save lesson progress."
        );
      }

      /* ===============================================
         UPDATE UI
      =============================================== */

      setCompleted(true);

      setCompletedAt(
        new Date().toISOString()
      );

      setXpAdded(
        Number(data?.xpAdded ?? 0)
      );

      const achievements =
        Array.isArray(
          data?.achievementsUnlocked
        )
          ? data.achievementsUnlocked
          : [];

      setAchievementMessages(
        achievements
      );

      setShowComplete(true);

      window.setTimeout(() => {
        setShowComplete(false);
      }, 4500);

      /*
       * Refresh server/client state.
       */
      router.refresh();
    } catch (error) {
      console.error(
        "COMPLETE LESSON ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save lesson progress."
      );
    } finally {
      setCompleting(false);
    }
  }

  /* =====================================================
     OPEN LESSON
  ===================================================== */

  function openLesson(
    id: string
  ) {
    if (!subjectId) {
      return;
    }

    router.push(
      `/subjects/${subjectId}/lessons/${id}`
    );
  }

  /* =====================================================
     BACK
  ===================================================== */

  function backToSubject() {
    if (subjectId) {
      router.push(
        `/subjects/${subjectId}`
      );
    } else {
      router.push(
        "/subjects"
      );
    }
  }

  /* =====================================================
     OPEN AI WITH CONTEXT
  ===================================================== */

  function openAI() {
    const query =
      new URLSearchParams();

    if (subjectId) {
      query.set(
        "subjectId",
        subjectId
      );
    }

    if (lessonId) {
      query.set(
        "lessonId",
        lessonId
      );
    }

    router.push(
      `/ai?${query.toString()}`
    );
  }

  /* =====================================================
     CONTENT PARSING
  ===================================================== */

  const objectives =
    useMemo(() => {
      if (!lesson?.objectives) {
        return [];
      }

      return lesson.objectives
        .split(/\r?\n|•|,/)
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);
    }, [lesson?.objectives]);

  const resources =
    useMemo(() => {
      if (!lesson?.resources) {
        return [];
      }

      return lesson.resources
        .split(/\r?\n/)
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);
    }, [lesson?.resources]);

  const lessonDuration =
    lesson?.duration_minutes ??
    lesson?.estimated_minutes ??
    0;

  const difficulty =
    lesson?.difficulty?.trim() ||
    "Beginner";

  const videoUrl =
    lesson?.video_url?.trim() ||
    lesson?.video?.trim() ||
    "";

  const thumbnail =
    lesson?.thumbnail_url?.trim() ||
    lesson?.image?.trim() ||
    fallbackThumbnail;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030305] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="text-center"
          >
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 rounded-full border border-purple-500/10" />

              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-500" />

              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                <TrainFront
                  size={20}
                />
              </div>
            </div>

            <p className="mt-6 text-sm font-black">
              Loading lesson
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Preparing your learning experience...
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030305] px-5 text-white">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-lg rounded-[30px] border border-red-500/20 bg-red-500/[0.04] p-8 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <X size={25} />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Could not load lesson
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {errorMessage}
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <button
              type="button"
              onClick={backToSubject}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold text-zinc-400 transition hover:text-white"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() =>
                void loadLesson()
              }
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black transition hover:bg-purple-500"
            >
              <Zap size={14} />
              Try Again
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030305] text-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
            <BookOpen
              size={26}
            />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Lesson not found
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            This lesson does not exist.
          </p>

          <button
            type="button"
            onClick={backToSubject}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-xs font-black hover:bg-purple-500"
          >
            Back to Subject
          </button>
        </div>
      </main>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main className="min-h-screen overflow-hidden bg-[#030305] text-white">
      {/* =================================================
         BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 70, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-180px] top-[10%] h-[550px] w-[550px] rounded-full bg-purple-700/10 blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 60, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-220px] top-[35%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/10 blur-[160px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_72%)]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      {/* =================================================
         HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={backToSubject}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
            >
              <ArrowLeft
                size={17}
                className="transition group-hover:-translate-x-0.5"
              />
            </button>

            <div className="hidden sm:block">
              <p className="text-[7px] font-black uppercase tracking-[0.28em] text-purple-400">
                RailLearn
              </p>

              <p className="mt-1 max-w-[300px] truncate text-xs font-bold text-zinc-400">
                {subject?.name ||
                  "Railway Academy"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-[9px] font-bold text-zinc-500 transition hover:text-white md:flex"
            >
              <Home size={13} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={openAI}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/15 bg-purple-500/[0.06] text-purple-400 transition hover:bg-purple-500/15"
              title="Ask Miro about this lesson"
            >
              <BrainCircuit
                size={16}
              />
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
         CONTENT
      ================================================= */}

      <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-10">
        {/* Breadcrumb */}

        <motion.div
          initial={{
            opacity: 0,
            x: -15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-7 flex items-center gap-2 overflow-hidden text-[8px] font-bold text-zinc-600"
        >
          <button
            type="button"
            onClick={backToSubject}
            className="shrink-0 transition hover:text-purple-400"
          >
            Subjects
          </button>

          <ChevronRight
            size={12}
          />

          <span className="shrink-0 max-w-[150px] truncate">
            {subject?.name ||
              "Subject"}
          </span>

          <ChevronRight
            size={12}
          />

          <span className="truncate text-zinc-400">
            {lesson.title}
          </span>
        </motion.div>

        {/* =================================================
           HERO
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
          className="relative overflow-hidden rounded-[32px] border border-purple-500/15 bg-[#07080d] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        >
          <div className="pointer-events-none absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full bg-purple-600/15 blur-[110px]" />

          <div className="grid lg:grid-cols-[1.55fr_0.45fr]">
            {/* VIDEO */}

            <div className="relative min-h-[320px] overflow-hidden bg-black lg:min-h-[570px]">
              {videoUrl ? (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  poster={thumbnail}
                  controls
                  playsInline
                  className="h-full min-h-[320px] w-full object-cover lg:min-h-[570px]"
                />
              ) : (
                <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden lg:min-h-[570px]">
                  <img
                    src={thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-25"
                  />

                  <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-black/80 to-black" />

                  <div className="relative text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/10 text-purple-300 shadow-[0_0_70px_rgba(168,85,247,0.18)]">
                      <Video
                        size={30}
                      />
                    </div>

                    <p className="mt-5 text-sm font-black">
                      Video coming soon
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      This lesson does not have a video yet.
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[7px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />

                Lesson{" "}
                {lesson.lesson_order ??
                  lesson.order_number ??
                  1}
              </div>
            </div>

            {/* INFO */}

            <div className="relative flex flex-col justify-between border-t border-white/[0.06] p-6 lg:border-l lg:border-t-0 lg:p-8">
              <div>
                <div className="flex flex-wrap gap-2">
                  {subject?.code && (
                    <span className="rounded-full border border-purple-400/15 bg-purple-500/10 px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.18em] text-purple-300">
                      {subject.code}
                    </span>
                  )}

                  {lesson.is_free && (
                    <span className="rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.18em] text-green-400">
                      Free
                    </span>
                  )}
                </div>

                <h1 className="mt-6 text-2xl font-black leading-tight tracking-tight md:text-3xl">
                  {lesson.title}
                </h1>

                <p className="mt-4 text-xs leading-6 text-zinc-500">
                  {lesson.description ||
                    "Continue your learning journey with this lesson."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <InfoBox
                    icon={
                      <Clock3
                        size={14}
                      />
                    }
                    label="Duration"
                    value={`${lessonDuration} min`}
                  />

                  <InfoBox
                    icon={
                      <Target
                        size={14}
                      />
                    }
                    label="Difficulty"
                    value={difficulty}
                  />
                </div>
              </div>

              {/* COMPLETE */}

              <div className="mt-8">
                <motion.button
                  type="button"
                  whileHover={
                    completed
                      ? undefined
                      : {
                        scale: 1.015,
                      }
                  }
                  whileTap={
                    completed
                      ? undefined
                      : {
                        scale: 0.98,
                      }
                  }
                  disabled={
                    completed ||
                    completing
                  }
                  onClick={
                    completeLesson
                  }
                  className={`group flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-[10px] font-black transition ${completed
                      ? "border border-green-500/20 bg-green-500/10 text-green-400"
                      : "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-[0_15px_45px_rgba(124,58,237,0.25)] hover:shadow-[0_20px_60px_rgba(124,58,237,0.4)]"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {completing ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : completed ? (
                    <>
                      <Check
                        size={15}
                      />
                      Lesson Completed
                    </>
                  ) : (
                    <>
                      <Check
                        size={15}
                      />
                      Mark as Complete
                    </>
                  )}
                </motion.button>

                {completed && (
                  <p className="mt-3 text-center text-[8px] text-green-500/60">
                    Great job! Your progress has been saved.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================
           MAIN GRID
        ================================================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* LEFT */}

          <div className="min-w-0">
            {lesson.content && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="rounded-[28px] border border-white/[0.07] bg-[#07080d]/90 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)] md:p-9"
              >
                <SectionTitle
                  icon={
                    <BookOpen
                      size={17}
                    />
                  }
                  eyebrow="Lesson Material"
                  title="What you'll learn"
                />

                <div className="mt-7 whitespace-pre-wrap text-sm leading-8 text-zinc-400">
                  {lesson.content}
                </div>
              </motion.section>
            )}

            {objectives.length > 0 && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="mt-6 rounded-[28px] border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.06] to-transparent p-6 md:p-9"
              >
                <SectionTitle
                  icon={
                    <Target
                      size={17}
                    />
                  }
                  eyebrow="Learning Goals"
                  title="Objectives"
                />

                <div className="mt-6 space-y-3">
                  {objectives.map(
                    (
                      objective,
                      index
                    ) => (
                      <motion.div
                        key={`${objective}-${index}`}
                        initial={{
                          opacity: 0,
                          x: -10,
                        }}
                        whileInView={{
                          opacity: 1,
                          x: 0,
                        }}
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          delay:
                            index *
                            0.05,
                        }}
                        className="flex gap-3 rounded-2xl border border-white/[0.05] bg-black/20 p-4"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                          <Check
                            size={13}
                          />
                        </div>

                        <p className="text-xs leading-6 text-zinc-400">
                          {
                            objective
                          }
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              </motion.section>
            )}

            {lesson.prerequisites && (
              <section className="mt-6 rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-9">
                <SectionTitle
                  icon={
                    <Lock
                      size={17}
                    />
                  }
                  eyebrow="Before You Start"
                  title="Prerequisites"
                />

                <p className="mt-6 whitespace-pre-wrap text-xs leading-7 text-zinc-500">
                  {
                    lesson.prerequisites
                  }
                </p>
              </section>
            )}
          </div>

          {/* RIGHT */}

          <aside className="space-y-5">
            {/* PROGRESS */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="sticky top-[92px] rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[7px] font-black uppercase tracking-[0.22em] text-purple-400">
                    Your Progress
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {completed
                      ? "100%"
                      : "In progress"}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  {completed ? (
                    <Trophy
                      size={19}
                    />
                  ) : (
                    <Flame
                      size={19}
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: completed
                      ? "100%"
                      : "35%",
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                />
              </div>

              <p className="mt-3 text-[8px] leading-5 text-zinc-600">
                {completed
                  ? "Excellent. You completed this lesson."
                  : "Finish the lesson and mark it complete to save your progress."}
              </p>

              {completedAt && (
                <p className="mt-2 text-[8px] text-zinc-700">
                  Completed{" "}
                  {new Date(
                    completedAt
                  ).toLocaleDateString()}
                </p>
              )}
            </motion.div>

            {/* XP */}

            <AnimatePresence>
              {xpAdded !== null &&
                completed && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="rounded-[28px] border border-purple-500/15 bg-purple-500/[0.05] p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                        <Zap
                          size={18}
                        />
                      </div>

                      <div>
                        <p className="text-[7px] font-black uppercase tracking-[0.22em] text-purple-400">
                          Reward
                        </p>

                        <p className="mt-1 text-sm font-black">
                          +{xpAdded} XP earned
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* NEW ACHIEVEMENTS */}

            <AnimatePresence>
              {achievementMessages.length >
                0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="rounded-[28px] border border-yellow-500/15 bg-yellow-500/[0.04] p-6"
                  >
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Trophy
                        size={16}
                      />

                      <p className="text-[7px] font-black uppercase tracking-[0.22em]">
                        New Achievement
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {achievementMessages.map(
                        (
                          achievement,
                          index
                        ) => (
                          <div
                            key={`${achievement.title}-${index}`}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-lg">
                              {achievement.icon ||
                                "🏆"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-black">
                                {
                                  achievement.title
                                }
                              </p>

                              <p className="mt-1 text-[8px] text-purple-400">
                                +
                                {
                                  achievement.xp_reward
                                }{" "}
                                XP
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* RESOURCES */}

            {(lesson.pdf_url ||
              lesson.pdf ||
              resources.length >
              0) && (
                <div className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6">
                  <SectionTitle
                    icon={
                      <FileText
                        size={17}
                      />
                    }
                    eyebrow="Materials"
                    title="Resources"
                  />

                  <div className="mt-5 space-y-2">
                    {(lesson.pdf_url ||
                      lesson.pdf) && (
                        <ResourceButton
                          href={
                            lesson.pdf_url ||
                            lesson.pdf ||
                            ""
                          }
                          icon={
                            <FileText
                              size={15}
                            />
                          }
                          label="Lesson PDF"
                        />
                      )}

                    {resources.map(
                      (
                        resource,
                        index
                      ) => (
                        <ResourceButton
                          key={`${resource}-${index}`}
                          href={
                            resource.startsWith(
                              "http"
                            )
                              ? resource
                              : undefined
                          }
                          icon={
                            <ExternalLink
                              size={14}
                            />
                          }
                          label={
                            resource
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )}

            {/* NAVIGATION */}

            <div className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6">
              <p className="text-[7px] font-black uppercase tracking-[0.22em] text-purple-400">
                Course Navigation
              </p>

              <div className="mt-5 space-y-2">
                <NavigationLesson
                  lesson={
                    previousLesson
                  }
                  direction="previous"
                  onClick={() => {
                    if (
                      previousLesson
                    ) {
                      openLesson(
                        previousLesson.id
                      );
                    }
                  }}
                />

                <NavigationLesson
                  lesson={
                    nextLesson
                  }
                  direction="next"
                  onClick={() => {
                    if (
                      nextLesson
                    ) {
                      openLesson(
                        nextLesson.id
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* AI */}

            <motion.button
              type="button"
              whileHover={{
                y: -3,
              }}
              onClick={openAI}
              className="group relative w-full overflow-hidden rounded-[28px] border border-purple-500/15 bg-gradient-to-br from-purple-600/[0.13] via-[#08080d] to-[#050507] p-6 text-left"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl transition group-hover:bg-purple-500/20" />

              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <BrainCircuit
                    size={19}
                  />
                </div>

                <p className="mt-5 text-[7px] font-black uppercase tracking-[0.2em] text-purple-400">
                  AI Tutor
                </p>

                <h3 className="mt-2 text-sm font-black">
                  Ask Miro about this lesson
                </h3>

                <p className="mt-2 text-[9px] leading-5 text-zinc-600">
                  ميرو هيدخل معاه سياق المادة والدرس عشان يساعدك بشكل أدق.
                </p>

                <div className="mt-5 flex items-center gap-2 text-[8px] font-black text-purple-400">
                  Open AI Tutor
                  <ArrowRight
                    size={12}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </div>
            </motion.button>
          </aside>
        </div>

        {/* =================================================
           BOTTOM NAV
        ================================================= */}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={
              !previousLesson
            }
            onClick={() => {
              if (
                previousLesson
              ) {
                openLesson(
                  previousLesson.id
                );
              }
            }}
            className="group flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-[#07080d] px-6 py-4 text-xs font-bold text-zinc-500 transition hover:border-purple-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft
              size={17}
            />

            <span>
              Previous Lesson
            </span>
          </button>

          <button
            type="button"
            disabled={
              !nextLesson
            }
            onClick={() => {
              if (
                nextLesson
              ) {
                openLesson(
                  nextLesson.id
                );
              }
            }}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-xs font-black transition hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span>
              Next Lesson
            </span>

            <ChevronRight
              size={17}
              className="transition group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* =================================================
         COMPLETION POPUP
      ================================================= */}

      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-30px)] max-w-sm -translate-x-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl border border-green-400/20 bg-[#080b0a]/95 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <motion.div
                initial={{
                  x: "-100%",
                }}
                animate={{
                  x: "100%",
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
              />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <Trophy
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-xs font-black">
                    Lesson Completed! 🎉
                  </p>

                  <p className="mt-1 text-[9px] text-zinc-500">
                    {xpAdded &&
                      xpAdded > 0
                      ? `+${xpAdded} XP added to your account.`
                      : "Your progress has been saved successfully."}
                  </p>

                  {achievementMessages.length >
                    0 && (
                      <p className="mt-1 text-[8px] font-bold text-yellow-400">
                        🏆 New achievement unlocked!
                      </p>
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[7px] font-black uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-xs font-black text-zinc-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-purple-400">
        {icon}

        <span className="text-[7px] font-black uppercase tracking-[0.24em]">
          {eyebrow}
        </span>
      </div>

      <h2 className="mt-2 text-xl font-black">
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   RESOURCE
========================================================= */

function ResourceButton({
  href,
  icon,
  label,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
}) {
  const content = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
        {icon}
      </span>

      <span className="min-w-0 flex-1 truncate text-[9px] font-bold text-zinc-400">
        {label}
      </span>

      <ArrowRight
        size={12}
        className="text-zinc-700"
      />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 transition hover:border-purple-500/20 hover:bg-purple-500/[0.04]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
      {content}
    </div>
  );
}

/* =========================================================
   NAVIGATION LESSON
========================================================= */

function NavigationLesson({
  lesson,
  direction,
  onClick,
}: {
  lesson: LessonRow | null;
  direction:
  | "previous"
  | "next";
  onClick: () => void;
}) {
  const isPrevious =
    direction === "previous";

  if (!lesson) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 opacity-30">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03]">
          {isPrevious ? (
            <ChevronLeft
              size={14}
            />
          ) : (
            <ChevronRight
              size={14}
            />
          )}
        </div>

        <div>
          <p className="text-[7px] uppercase tracking-wider text-zinc-700">
            {isPrevious
              ? "Previous"
              : "Next"}
          </p>

          <p className="mt-1 text-[9px] text-zinc-700">
            No lesson
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{
        x: isPrevious
          ? -3
          : 3,
      }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-purple-500/20 hover:bg-purple-500/[0.04]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
        {isPrevious ? (
          <ChevronLeft
            size={14}
          />
        ) : (
          <ChevronRight
            size={14}
          />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[7px] uppercase tracking-wider text-zinc-700">
          {isPrevious
            ? "Previous"
            : "Next"}
        </p>

        <p className="mt-1 truncate text-[9px] font-bold text-zinc-400">
          {lesson.title ||
            "Lesson"}
        </p>
      </div>
    </motion.button>
  );
}