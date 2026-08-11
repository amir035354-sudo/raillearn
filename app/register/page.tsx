"use client";

import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleRegister(
    e: FormEvent
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );

      setLoading(false);
      return;
    }

    const {
      data,
      error: signUpError,
    } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name:
              name.trim(),
            name: name.trim(),
          },
        },
      });

    if (signUpError) {
      setError(
        signUpError.message
      );

      setLoading(false);
      return;
    }

    // =====================================
    // CREATE STUDENT STATS
    // =====================================

    if (data.user) {
      const {
        error: statsError,
      } = await supabase
        .from("student_stats")
        .upsert(
          {
            user_id:
              data.user.id,
            xp: 0,
            level: 1,
            current_streak: 0,
            best_streak: 0,
          },
          {
            onConflict:
              "user_id",
          }
        );

      if (statsError) {
        console.log(
          "STUDENT STATS CREATE ERROR:",
          statsError
        );
      }
    }

    // =====================================
    // SESSION CREATED
    // =====================================

    if (data.session) {
      router.replace(
        "/dashboard"
      );

      router.refresh();

      return;
    }

    // If email confirmation is enabled.
    setSuccess(
      "Account created! Please check your email to confirm your account."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[30px] border border-white/[0.07] bg-[#07080d] p-7 md:p-10">

          <div className="mb-8">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400">
              Railway Academy
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Start your Railway Academy journey.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-xs font-semibold text-green-400">
              {success}
            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-4 text-[10px] font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight
                    size={15}
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/login"
                )
              }
              className="font-bold text-purple-400 hover:text-purple-300"
            >
              Sign In
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}