"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function CompleteButton({
  lessonId,
}: {
  lessonId: string;
}) {
  const supabase = createClient();

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * ملاحظة:
   * الجزء ده يفترض إن عندك جدول لتسجيل الدروس المكتملة.
   *
   * لو جدولك اسمه مختلف، قولّي اسمه ونعدله.
   */

  useEffect(() => {
    async function checkCompleted() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      setCompleted(!!data);
    }

    checkCompleted();
  }, [lessonId]);

  async function completeLesson() {
    if (loading || completed) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first.");
        return;
      }

      const { error } = await supabase
        .from("lesson_progress")
        .upsert(
          {
            lesson_id: lessonId,
            user_id: user.id,
            completed: true,
          },
          {
            onConflict: "user_id,lesson_id",
          }
        );

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setCompleted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={completeLesson}
      disabled={loading || completed}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
        completed
          ? "bg-green-500/10 text-green-400"
          : "bg-purple-600 text-white hover:bg-purple-700"
      }`}
    >
      <CheckCircle2 size={18} />

      {completed
        ? "Completed"
        : loading
        ? "Saving..."
        : "Mark as Complete"}
    </button>
  );
}