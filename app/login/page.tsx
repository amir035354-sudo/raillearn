"use client";

import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    e: FormEvent
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    const {
      error: loginError,
    } =
      await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        }
      );

    if (loginError) {
      setError(
        loginError.message ===
          "Invalid login credentials"
          ? "Email or password is incorrect."
          : loginError.message
      );

      setLoading(false);
      return;
    }

    // Session is now stored by Supabase SSR.

    router.replace(
      "/dashboard"
    );

    router.refresh();
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
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Sign in to continue learning.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
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
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={15}
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-zinc-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/register"
                )
              }
              className="font-bold text-purple-400 hover:text-purple-300"
            >
              Create account
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}