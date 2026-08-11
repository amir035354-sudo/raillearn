"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  LogOut,
  Moon,
  Shield,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#08080b] text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-purple-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 p-8 md:p-10">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative flex items-center gap-5">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400">
              <SettingsIcon size={27} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
                RailLearn
              </p>

              <h1 className="mt-1 text-3xl font-bold md:text-4xl">
                Settings
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Manage your account and preferences.
              </p>
            </div>

          </div>

        </section>

        {/* Account */}
        <section className="mt-6 rounded-3xl border border-white/5 bg-zinc-900/70 p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400">
              <User size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Account
              </h2>

              <p className="text-sm text-zinc-500">
                Manage your RailLearn account.
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-2xl bg-zinc-950 p-5">

            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Profile
            </p>

            <Link
              href="/profile"
              className="mt-3 flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-4 transition hover:bg-zinc-800"
            >
              <span className="font-semibold">
                View Profile
              </span>

              <span className="text-zinc-600">
                →
              </span>
            </Link>

          </div>

        </section>

        {/* Preferences */}
        <section className="mt-6 rounded-3xl border border-white/5 bg-zinc-900/70 p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Bell size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Preferences
              </h2>

              <p className="text-sm text-zinc-500">
                Customize your learning experience.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-3">

            {/* Notifications */}
            <div className="flex items-center justify-between rounded-2xl bg-zinc-950 p-5">

              <div className="flex items-center gap-4">

                <Bell
                  size={20}
                  className="text-zinc-500"
                />

                <div>
                  <p className="font-semibold">
                    Notifications
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    Receive learning reminders.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setNotifications(!notifications)
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  notifications
                    ? "bg-purple-600"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    notifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            {/* Theme */}
            <div className="flex items-center justify-between rounded-2xl bg-zinc-950 p-5">

              <div className="flex items-center gap-4">

                <Moon
                  size={20}
                  className="text-zinc-500"
                />

                <div>
                  <p className="font-semibold">
                    Appearance
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    RailLearn uses dark mode.
                  </p>
                </div>

              </div>

              <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-400">
                Dark
              </span>

            </div>

          </div>

        </section>

        {/* Security */}
        <section className="mt-6 rounded-3xl border border-white/5 bg-zinc-900/70 p-7">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <Shield size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Security
              </h2>

              <p className="text-sm text-zinc-500">
                Keep your account secure.
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-2xl border border-green-500/10 bg-green-500/5 p-5">

            <div className="flex items-center gap-3">

              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <p className="font-semibold text-green-400">
                Account is active
              </p>

            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Your account is currently signed in securely.
            </p>

          </div>

        </section>

        {/* Logout */}
        <section className="mt-6 rounded-3xl border border-red-500/10 bg-red-500/[0.03] p-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Sign out
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Sign out of your RailLearn account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              <LogOut size={18} />

              {loading
                ? "Signing out..."
                : "Sign Out"}
            </button>

          </div>

        </section>

        <p className="py-8 text-center text-xs text-zinc-700">
          RailLearn • Railway & Modern Transportation Technology
        </p>

      </div>
    </main>
  );
}