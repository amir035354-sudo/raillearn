"use client";

import {
    ArrowRight,
    Loader2,
    Lock,
    Mail,
    Phone,
    User,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleRegister(e: FormEvent) {
        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setError("");
        setSuccess("");

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        if (!cleanName) {
            setError("Please enter your name.");
            setLoading(false);
            return;
        }

        if (!cleanEmail) {
            setError("Please enter your email.");
            setLoading(false);
            return;
        }

        if (!cleanPhone) {
            setError("Please enter your phone number.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        /*
         * Create Supabase Auth account.
         *
         * The phone number is stored as user metadata.
         * We are NOT using Supabase Phone Auth here,
         * so no SMS provider is required.
         */
        const {
            data,
            error: registerError,
        } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    full_name: cleanName,
                    phone: cleanPhone,
                },
            },
        });

        if (registerError) {
            setError(
                registerError.message ===
                    "User already registered"
                    ? "This email is already registered."
                    : registerError.message
            );

            setLoading(false);
            return;
        }

        /*
         * If Supabase requires email confirmation,
         * user will need to confirm the email first.
         */
        if (data.user && !data.session) {
            setSuccess(
                "Account created successfully. Please check your email to confirm your account."
            );

            setLoading(false);
            return;
        }

        /*
         * If email confirmation is disabled,
         * the user can enter the dashboard immediately.
         */
        router.replace("/dashboard");
        router.refresh();
    }

    async function handleOAuth(
        provider: "google" | "facebook"
    ) {
        if (loading) return;

        setLoading(true);
        setError("");
        setSuccess("");

        const { error: oauthError } =
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

        if (oauthError) {
            setError(oauthError.message);
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#030305] px-5 py-10 text-white">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[-180px] top-[10%] h-96 w-96 rounded-full bg-purple-700/10 blur-[130px]" />

                <div className="absolute right-[-150px] top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

                <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/[0.07] blur-[130px]" />
            </div>

            <div className="relative mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
                <div className="w-full rounded-[30px] border border-white/[0.07] bg-[#07080d] p-7 md:p-10">

                    {/* Header */}
                    <div className="mb-8">
                        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400">
                            Railway Academy
                        </p>

                        <h1 className="mt-3 text-3xl font-black">
                            Create Account
                        </h1>

                        <p className="mt-2 text-sm text-zinc-600">
                            Create your RailLearn student account.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold leading-5 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-xs font-semibold leading-5 text-green-400">
                            {success}
                        </div>
                    )}

                    {/* Google / Facebook */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handleOAuth("google")}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] py-4 text-sm font-bold transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="flex h-5 w-5 items-center justify-center font-black">
                                G
                            </span>

                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOAuth("facebook")}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] py-4 text-sm font-bold transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="flex h-5 w-5 items-center justify-center text-lg font-black">
                                f
                            </span>

                            Continue with Facebook
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/[0.07]" />

                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                            or
                        </span>

                        <div className="h-px flex-1 bg-white/[0.07]" />
                    </div>

                    {/* Register Form */}
                    <form
                        onSubmit={handleRegister}
                        className="space-y-4"
                    >
                        {/* Name */}
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
                                        setName(e.target.value)
                                    }
                                    required
                                    autoComplete="name"
                                    placeholder="Amir Mohamed"
                                    className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Email */}
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
                                        setEmail(e.target.value)
                                    }
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                Phone Number
                            </label>

                            <div className="relative">
                                <Phone
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                />

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                    required
                                    autoComplete="tel"
                                    placeholder="+20 10xxxxxxxx"
                                    className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
                                />
                            </div>

                            <p className="mt-2 text-[9px] text-zinc-700">
                                Your phone number will be saved with your student account.
                            </p>
                        </div>

                        {/* Password */}
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
                                        setPassword(e.target.value)
                                    }
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                Confirm Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                />

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Submit */}
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

                                    Creating account...
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

                    {/* Login */}
                    <p className="mt-7 text-center text-xs text-zinc-600">
                        Already have an account?{" "}

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/login")
                            }
                            className="font-bold text-purple-400 hover:text-purple-300"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}