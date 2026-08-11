"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Clock3,
  RotateCcw,
  Target,
  Trophy,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const QUIZ_ID = "7760ba9f-bfe2-448a-82f7-8a75f4dc29cc";
const QUIZ_TIME = 300;

const LESSON_URL =
  "/subjects/railway-engineering/lessons/track-geometry";

type Question = {
  id: string;
  quiz_id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_answer: string;
};

type ExistingResult = {
  id: string;
  score: number;
  total_questions: number;
};

type XPResult = {
  success?: boolean;
  already_awarded?: boolean;
  xp_earned?: number;
  xp?: number;
  level?: number;
  current_streak?: number;
  best_streak?: number;
  percentage?: number;
};

export default function TrackGeometryQuiz() {
  const router = useRouter();
  const supabase = createClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [alreadyCompleted, setAlreadyCompleted] =
    useState<ExistingResult | null>(null);

  const [xpResult, setXpResult] =
    useState<XPResult | null>(null);

  // =====================================================
  // LOAD QUIZ
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadQuiz() {
      try {
        setLoading(true);
        setLoadError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("USER ERROR:", userError);

          if (mounted) {
            setLoadError("Could not verify your login.");
          }

          return;
        }

        if (!user) {
          router.push("/login");
          return;
        }

        // =================================================
        // QUESTIONS
        // =================================================

        const { data, error } = await supabase
          .from("questions")
          .select(`
            id,
            quiz_id,
            question,
            option1,
            option2,
            option3,
            option4,
            correct_answer
          `)
          .eq("quiz_id", QUIZ_ID)
          .order("id");

        if (error) {
          console.error("QUESTIONS ERROR:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });

          if (mounted) {
            setLoadError(
              error.message ||
                "Unable to load quiz questions."
            );
          }

          return;
        }

        const loaded = (data ?? []) as Question[];

        if (loaded.length === 0) {
          if (mounted) {
            setLoadError(
              "No questions were found for this quiz."
            );
          }

          return;
        }

        if (mounted) {
          setQuestions(loaded);
          setAnswers(
            Array(loaded.length).fill(null)
          );
        }

        // =================================================
        // PREVIOUS RESULT
        // =================================================

        const {
          data: existingResult,
          error: existingError,
        } = await supabase
          .from("quiz_results")
          .select(
            "id, score, total_questions"
          )
          .eq("user_id", user.id)
          .eq("quiz_id", QUIZ_ID)
          .maybeSingle();

        if (existingError) {
          console.error(
            "EXISTING RESULT ERROR:",
            {
              message: existingError.message,
              details: existingError.details,
              hint: existingError.hint,
              code: existingError.code,
            }
          );
        }

        if (existingResult && mounted) {
          setAlreadyCompleted({
            id: String(existingResult.id),
            score: Number(
              existingResult.score ?? 0
            ),
            total_questions: Number(
              existingResult.total_questions ?? 0
            ),
          });

          setSaved(true);
        }
      } catch (error) {
        console.error(
          "QUIZ LOAD ERROR:",
          error
        );

        if (mounted) {
          setLoadError(
            "Something went wrong while loading the quiz."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const question = questions[current];

  const selected =
    answers[current] ?? null;

  const options = question
    ? [
        question.option1,
        question.option2,
        question.option3,
        question.option4,
      ]
    : [];

  // =====================================================
  // CORRECT ANSWER
  // =====================================================

  function getCorrectIndex(
    item: Question
  ): number {
    const answer = String(
      item.correct_answer ?? ""
    )
      .trim()
      .toLowerCase();

    const itemOptions = [
      item.option1,
      item.option2,
      item.option3,
      item.option4,
    ];

    // Answer is option text
    const directIndex =
      itemOptions.findIndex(
        (option) =>
          String(option ?? "")
            .trim()
            .toLowerCase() === answer
      );

    if (directIndex !== -1) {
      return directIndex;
    }

    // A / B / C / D
    // 1 / 2 / 3 / 4

    const normalized = answer
      .replace(/[.)]/g, "")
      .trim();

    if (
      normalized === "a" ||
      normalized === "1"
    ) {
      return 0;
    }

    if (
      normalized === "b" ||
      normalized === "2"
    ) {
      return 1;
    }

    if (
      normalized === "c" ||
      normalized === "3"
    ) {
      return 2;
    }

    if (
      normalized === "d" ||
      normalized === "4"
    ) {
      return 3;
    }

    return -1;
  }

  // =====================================================
  // SCORE
  // =====================================================

  const score = answers.reduce<number>(
    (total, answer, index) => {
      if (
        answer === null ||
        !questions[index]
      ) {
        return total;
      }

      return answer ===
        getCorrectIndex(
          questions[index]
        )
        ? total + 1
        : total;
    },
    0
  );

  const answeredCount =
    answers.filter(
      (answer) => answer !== null
    ).length;

  const percentage =
    questions.length > 0
      ? Math.round(
          (score / questions.length) * 100
        )
      : 0;

  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {
    if (
      !started ||
      finished ||
      loading ||
      alreadyCompleted ||
      saving
    ) {
      return;
    }

    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const timer =
      window.setInterval(() => {
        setTimeLeft((value) =>
          value > 0 ? value - 1 : 0
        );
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    started,
    finished,
    loading,
    alreadyCompleted,
    saving,
    timeLeft,
  ]);

  // =====================================================
  // CHOOSE ANSWER
  // =====================================================

  function chooseAnswer(index: number) {
    if (
      finished ||
      saving ||
      alreadyCompleted
    ) {
      return;
    }

    setAnswers((previous) => {
      const next = [...previous];

      next[current] = index;

      return next;
    });
  }

  // =====================================================
  // SAVE RESULT
  // =====================================================

  async function saveResult() {
    if (
      saving ||
      saved ||
      questions.length === 0
    ) {
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      // =================================================
      // USER
      // =================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "USER SESSION ERROR:",
          userError
        );

        setSaveMessage(
          "Could not verify your login."
        );

        return;
      }

      if (!user) {
        setSaveMessage(
          "Please login before saving your result."
        );

        router.push("/login");

        return;
      }

      // =================================================
      // CHECK DUPLICATE
      // =================================================

      const {
        data: existingResult,
        error: existingError,
      } = await supabase
        .from("quiz_results")
        .select(
          "id, score, total_questions"
        )
        .eq("user_id", user.id)
        .eq("quiz_id", QUIZ_ID)
        .maybeSingle();

      if (existingError) {
        console.error(
          "CHECK RESULT ERROR:",
          {
            message: existingError.message,
            details: existingError.details,
            hint: existingError.hint,
            code: existingError.code,
          }
        );

        setSaveMessage(
          "Could not check your previous result."
        );

        return;
      }

      if (existingResult) {
        setAlreadyCompleted({
          id: String(existingResult.id),
          score: Number(
            existingResult.score ?? 0
          ),
          total_questions: Number(
            existingResult.total_questions ?? 0
          ),
        });

        setSaved(true);

        setSaveMessage(
          "You have already completed this quiz."
        );

        return;
      }

      // =================================================
      // FINAL SCORE
      // =================================================

      const finalScore =
        answers.reduce<number>(
          (total, answer, index) => {
            if (
              answer !== null &&
              questions[index] &&
              answer ===
                getCorrectIndex(
                  questions[index]
                )
            ) {
              return total + 1;
            }

            return total;
          },
          0
        );

      const finalPercentage =
        questions.length > 0
          ? Math.round(
              (finalScore /
                questions.length) *
                100
            )
          : 0;

      // =================================================
      // SAVE QUIZ RESULT
      // =================================================

      const {
        data: insertedResult,
        error: resultError,
      } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          quiz_id: QUIZ_ID,
          score: finalScore,
          total_questions:
            questions.length,
          completed_at:
            new Date().toISOString(),
        })
        .select(
          "id, score, total_questions"
        )
        .single();

      if (resultError) {
        console.error(
          "QUIZ RESULT ERROR:",
          {
            message: resultError.message,
            details: resultError.details,
            hint: resultError.hint,
            code: resultError.code,
          }
        );

        // Duplicate
        if (
          resultError.code === "23505"
        ) {
          const {
            data: duplicateResult,
          } = await supabase
            .from("quiz_results")
            .select(
              "id, score, total_questions"
            )
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "quiz_id",
              QUIZ_ID
            )
            .maybeSingle();

          if (duplicateResult) {
            setAlreadyCompleted({
              id: String(
                duplicateResult.id
              ),
              score: Number(
                duplicateResult.score ?? 0
              ),
              total_questions: Number(
                duplicateResult.total_questions ??
                  0
              ),
            });

            setSaved(true);

            setSaveMessage(
              "You have already completed this quiz."
            );

            return;
          }
        }

        setSaveMessage(
          resultError.message ||
            "Could not save your quiz result."
        );

        return;
      }

      // =================================================
// XP + LEVEL + STREAK
// =================================================

const {
  data: xpData,
  error: xpError,
} = await supabase.rpc("award_quiz_xp", {
  p_user_id: user.id,
  p_quiz_id: QUIZ_ID,
  p_score: finalScore,
  p_total_questions: questions.length,
});

if (xpError) {
  console.error("XP SYSTEM ERROR:", {
    message: xpError.message,
    details: xpError.details,
    hint: xpError.hint,
    code: xpError.code,
  });

  setSaved(true);
  setSaveMessage(
    "Result saved successfully, but XP update failed."
  );

  return;
}

console.log("XP AWARDED:", xpData);

setSaved(true);
setSaveMessage(
  `Result saved successfully! +${xpData?.xp_earned ?? 0} XP`
);
      void finalPercentage;
    } catch (error) {
      console.error(
        "UNEXPECTED QUIZ SAVE ERROR:",
        error
      );

      setSaveMessage(
        "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // FINISH
  // =====================================================

  async function finishQuiz() {
    if (
      finished ||
      saving ||
      alreadyCompleted
    ) {
      return;
    }

    setFinished(true);

    await saveResult();
  }

  // =====================================================
  // NEXT
  // =====================================================

  function nextQuestion() {
    if (
      selected === null ||
      saving ||
      alreadyCompleted
    ) {
      return;
    }

    if (
      current <
      questions.length - 1
    ) {
      setCurrent(
        (value) => value + 1
      );
    } else {
      finishQuiz();
    }
  }

  // =====================================================
  // PREVIOUS
  // =====================================================

  function previousQuestion() {
    if (
      current > 0 &&
      !saving &&
      !alreadyCompleted
    ) {
      setCurrent(
        (value) => value - 1
      );
    }
  }

  // =====================================================
  // RESTART
  // =====================================================

  function restart() {
    if (
      alreadyCompleted ||
      saving
    ) {
      return;
    }

    setCurrent(0);

    setAnswers(
      Array(questions.length).fill(null)
    );

    setTimeLeft(QUIZ_TIME);

    setFinished(false);
    setSaving(false);
    setSaved(false);

    setSaveMessage("");
    setXpResult(null);
  }

  // =====================================================
  // FORMAT TIMER
  // =====================================================

  function formatTime(
    seconds: number
  ) {
    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remaining
    ).padStart(
      2,
      "0"
    )}`;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />

            <p className="mt-5 text-xs font-bold text-zinc-500">
              Loading quiz...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-white/[0.07] bg-[#07080d] p-7 text-center md:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <X size={34} />
            </div>

            <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.25em] text-red-400">
              Quiz Error
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Quiz Unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              {loadError}
            </p>

            <button
              onClick={() =>
                router.push(LESSON_URL)
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-[9px] font-black transition hover:bg-purple-500"
            >
              <ArrowLeft size={14} />
              Back to Lesson
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ALREADY COMPLETED
  // =====================================================

  if (alreadyCompleted) {
    const oldPercentage =
      alreadyCompleted.total_questions >
      0
        ? Math.round(
            (alreadyCompleted.score /
              alreadyCompleted.total_questions) *
              100
          )
        : 0;

    const passed =
      oldPercentage >= 60;

    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-white/[0.07] bg-[#07080d] p-7 text-center md:p-10">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                passed
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {passed ? (
                <Check size={34} />
              ) : (
                <X size={34} />
              )}
            </div>

            <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
              Already Submitted
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Quiz Already Completed
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
              You have already submitted
              this quiz. Another attempt
              cannot be submitted.
            </p>

            <div className="mt-8">
              <p
                className={`text-6xl font-black ${
                  passed
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {oldPercentage}%
              </p>

              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Previous Score
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Info
                value={`${alreadyCompleted.score}/${alreadyCompleted.total_questions}`}
                label="Correct"
              />

              <Info
                value={
                  passed
                    ? "PASSED"
                    : "FAILED"
                }
                label="Result"
              />
            </div>

            <button
              onClick={() =>
                router.push(LESSON_URL)
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-[9px] font-black transition hover:bg-purple-500"
            >
              <ArrowLeft size={14} />
              Back to Lesson
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // START SCREEN
  // =====================================================

  if (!started) {
    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-white/[0.07] bg-[#07080d] p-7 text-center md:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <Target size={34} />
            </div>

            <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
              Knowledge Check
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Track Geometry Quiz
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Test what you&apos;ve learned
              about cant, super elevation
              and railway track geometry.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Info
                value={String(
                  questions.length
                )}
                label="Questions"
              />

              <Info
                value="05:00"
                label="Time Limit"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Info
                value="100 XP"
                label="Pass Reward"
              />

              <Info
                value="60%"
                label="Pass Mark"
              />
            </div>

            <button
              onClick={() =>
                setStarted(true)
              }
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 py-4 text-[10px] font-black shadow-[0_15px_45px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
            >
              Start Quiz
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() =>
                router.push(LESSON_URL)
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] py-4 text-[9px] font-bold text-zinc-500 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Lesson
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // FINISHED
  // =====================================================

  if (finished) {
    const passed =
      percentage >= 60;

    const earnedXP = Number(
      xpResult?.xp_earned ?? 0
    );

    return (
      <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-white/[0.07] bg-[#07080d] p-7 text-center md:p-10">
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
                passed
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {passed ? (
                <Trophy size={38} />
              ) : (
                <RotateCcw size={34} />
              )}
            </div>

            <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
              Quiz Complete
            </p>

            <h1 className="mt-3 text-3xl font-black">
              {passed
                ? "Excellent Work!"
                : "Keep Practicing"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {passed
                ? "You've passed this knowledge check."
                : "Review the lesson and continue practicing."}
            </p>

            <div className="mt-8">
              <p
                className={`text-6xl font-black ${
                  passed
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {percentage}%
              </p>

              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Final Score
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Info
                value={`${score}/${questions.length}`}
                label="Correct"
              />

              <Info
                value={String(
                  answeredCount
                )}
                label="Answered"
              />

              <Info
                value={
                  saving
                    ? "..."
                    : `+${earnedXP}`
                }
                label="XP"
              />
            </div>

            {xpResult && (
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Info
                  value={String(
                    xpResult.xp ?? 0
                  )}
                  label="Total XP"
                />

                <Info
                  value={String(
                    xpResult.level ?? 1
                  )}
                  label="Level"
                />

                <Info
                  value={String(
                    xpResult.current_streak ?? 0
                  )}
                  label="Streak"
                />
              </div>
            )}

            {saving && (
              <div className="mt-7 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-purple-400">
                  Saving your result...
                </p>
              </div>
            )}

            {!saving && saveMessage && (
              <p
                className={`mt-7 text-[9px] font-bold uppercase tracking-[0.16em] ${
                  saved
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {saveMessage}
              </p>
            )}

            <button
              onClick={() =>
                router.push(LESSON_URL)
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] py-4 text-[9px] font-black text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Lesson
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // QUIZ SCREEN
  // =====================================================

  const questionProgress =
    ((current + 1) /
      questions.length) *
    100;

  return (
    <main className="min-h-screen bg-[#030305] px-5 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        {/* TOP BAR */}

        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              router.push(LESSON_URL)
            }
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 transition hover:text-purple-400"
          >
            <ChevronLeft size={14} />
            Exit Quiz
          </button>

          <div className="flex items-center gap-2">
            <Clock3
              size={14}
              className={
                timeLeft <= 30
                  ? "text-red-400"
                  : "text-purple-400"
              }
            />

            <span
              className={`text-xs font-black ${
                timeLeft <= 30
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* HEADER */}

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
                Track Geometry
              </p>

              <h1 className="mt-2 text-2xl font-black">
                Question{" "}
                {current + 1}{" "}
                <span className="text-zinc-700">
                  / {questions.length}
                </span>
              </h1>
            </div>

            <span className="text-[9px] font-black text-purple-400">
              {Math.round(
                questionProgress
              )}
              %
            </span>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-700 to-fuchsia-400 transition-all duration-500"
              style={{
                width: `${questionProgress}%`,
              }}
            />
          </div>
        </div>

        {/* QUESTION */}

        <section className="mt-8 rounded-[30px] border border-white/[0.07] bg-[#07080d] p-6 md:p-10">
          <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            <Target
              size={13}
              className="text-purple-400"
            />

            Question {current + 1}
          </div>

          <h2 className="mt-5 text-xl font-black leading-relaxed md:text-2xl">
            {question?.question}
          </h2>

          <div className="mt-8 space-y-3">
            {options.map(
              (
                option,
                index
              ) => {
                const isSelected =
                  selected === index;

                return (
                  <button
                    key={`${question?.id}-${index}`}
                    onClick={() =>
                      chooseAnswer(
                        index
                      )
                    }
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition md:p-5 ${
                      isSelected
                        ? "border-purple-500/40 bg-purple-500/[0.09]"
                        : "border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.025]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/[0.04] text-zinc-600 group-hover:text-zinc-300"
                      }`}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span
                      className={`flex-1 text-sm font-bold ${
                        isSelected
                          ? "text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {option}
                    </span>

                    {isSelected && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* NAVIGATION */}

        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <button
            onClick={
              previousQuestion
            }
            disabled={
              current === 0 ||
              saving
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-[#07080d] px-5 py-3.5 text-[9px] font-black text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          {/* QUESTION DOTS */}

          <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto px-2">
            {questions.map(
              (
                item,
                index
              ) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!saving) {
                      setCurrent(
                        index
                      );
                    }
                  }}
                  aria-label={`Go to question ${
                    index + 1
                  }`}
                  className={`h-1.5 shrink-0 rounded-full transition-all ${
                    index === current
                      ? "w-7 bg-purple-500"
                      : answers[
                            index
                          ] !== null
                      ? "w-3 bg-purple-500/40"
                      : "w-3 bg-white/10"
                  }`}
                />
              )
            )}
          </div>

          <button
            onClick={
              nextQuestion
            }
            disabled={
              selected === null ||
              saving
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 text-[9px] font-black transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {saving
              ? "Saving..."
              : current ===
                questions.length - 1
              ? "Finish Quiz"
              : "Next"}

            <ArrowRight
              size={14}
            />
          </button>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// INFO
// =====================================================

function Info({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-lg font-black">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>
    </div>
  );
}