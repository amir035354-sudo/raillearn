"use client";

import {
    Activity,
    ArrowLeft,
    Award,
    Ban,
    BookOpen,
    CheckCircle2,
    Clock3,
    GraduationCap,
    KeyRound,
    Mail,
    Pencil,
    Phone,
    RefreshCw,
    Save,
    ShieldCheck,
    Target,
    User,
    Users,
    X,
    Zap,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

/* =========================================================
   TYPES
========================================================= */

type Student = {
    id: string;

    name: string | null;
    full_name: string | null;
    email: string | null;

    phone: string | null;
    university_id: string | null;

    faculty: string | null;
    department: string | null;

    level: number | null;
    role: string | null;

    avatar_url: string | null;
    bio: string | null;

    auth_provider: string | null;
    xp: number | null;

    created_at: string | null;
    updated_at: string | null;

    auth: {
        id: string;
        email: string | null;
        created_at: string | null;
        updated_at: string | null;
        last_sign_in_at: string | null;
        banned_until: string | null;
        confirmed_at: string | null;
        email_confirmed_at: string | null;
        phone_confirmed_at: string | null;
    };

    stats: {
        user_id: string;
        xp: number | null;
        level: number | null;
        current_streak: number | null;
        best_streak: number | null;
        last_activity_date: string | null;
    } | null;

    progress: {
        total: number;
        completed: number;
        lessons: Array<{
            id?: string;
            lesson_id: string;
            completed: boolean | null;
            completed_at?: string | null;
            updated_at?: string | null;
        }>;
    };

    quizzes: {
        attempts: number;
        average: number;
        results: Array<{
            id: string;
            quiz_id: string;
            score: number | null;
            total_questions: number | null;
            completed_at: string | null;
        }>;
    };
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminStudentPage() {
    const router =
        useRouter();

    const params =
        useParams();

    const studentId =
        typeof params?.id ===
            "string"
            ? params.id
            : "";

    /* =====================================================
       STATE
    ===================================================== */

    const [
        student,
        setStudent,
    ] =
        useState<Student | null>(
            null
        );

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        refreshing,
        setRefreshing,
    ] =
        useState(false);

    const [
        saving,
        setSaving,
    ] =
        useState(false);

    const [
        deleting,
        setDeleting,
    ] =
        useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] =
        useState("");

    const [
        editMode,
        setEditMode,
    ] =
        useState(false);

    const [
        showDelete,
        setShowDelete,
    ] =
        useState(false);

    const [
        showPassword,
        setShowPassword,
    ] =
        useState(false);

    /* =====================================================
       FORM
    ===================================================== */

    const [
        form,
        setForm,
    ] =
        useState({
            name: "",
            full_name: "",
            email: "",
            phone: "",
            university_id: "",
            faculty: "",
            department: "",
            avatar_url: "",
            bio: "",
            password: "",
        });

    /* =====================================================
       LOAD
    ===================================================== */

    useEffect(() => {
        if (!studentId) {
            return;
        }

        void loadStudent();
    }, [
        studentId,
    ]);

    async function loadStudent(
        isRefresh = false
    ) {
        try {
            if (isRefresh) {
                setRefreshing(
                    true
                );
            } else {
                setLoading(
                    true
                );
            }

            setErrorMessage("");
            setSuccessMessage("");

            const response =
                await fetch(
                    `/api/admin/students/${encodeURIComponent(
                        studentId
                    )}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to load student."
                );
            }

            const loaded =
                data?.student as Student;

            setStudent(
                loaded
            );

            setForm({
                name:
                    loaded.name ??
                    "",
                full_name:
                    loaded.full_name ??
                    "",
                email:
                    loaded.email ??
                    "",
                phone:
                    loaded.phone ??
                    "",
                university_id:
                    loaded.university_id ??
                    "",
                faculty:
                    loaded.faculty ??
                    "",
                department:
                    loaded.department ??
                    "",
                avatar_url:
                    loaded.avatar_url ??
                    "",
                bio:
                    loaded.bio ??
                    "",
                password:
                    "",
            });
        } catch (error) {
            console.error(
                "ADMIN STUDENT PAGE ERROR:",
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to load student."
            );
        } finally {
            setLoading(
                false
            );
            setRefreshing(
                false
            );
        }
    }

    /* =====================================================
       SAVE
    ===================================================== */

    async function saveStudent() {
        try {
            setSaving(
                true
            );

            setErrorMessage("");
            setSuccessMessage("");

            const body: Record<
                string,
                unknown
            > = {
                name:
                    form.name.trim(),
                full_name:
                    form.full_name.trim(),
                email:
                    form.email
                        .trim()
                        .toLowerCase(),
                phone:
                    form.phone.trim() ||
                    null,
                university_id:
                    form.university_id.trim() ||
                    null,
                faculty:
                    form.faculty.trim() ||
                    null,
                department:
                    form.department.trim() ||
                    null,
                avatar_url:
                    form.avatar_url.trim() ||
                    null,
                bio:
                    form.bio.trim() ||
                    null,
            };

            if (
                form.password.trim()
            ) {
                body.password =
                    form.password.trim();
            }

            const response =
                await fetch(
                    `/api/admin/students/${encodeURIComponent(
                        studentId
                    )}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            body
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to update student."
                );
            }

            setSuccessMessage(
                "Student information updated successfully."
            );

            setForm(
                (
                    current
                ) => ({
                    ...current,
                    password:
                        "",
                })
            );

            setEditMode(
                false
            );

            await loadStudent(
                true
            );
        } catch (error) {
            console.error(
                "ADMIN SAVE STUDENT ERROR:",
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to update student."
            );
        } finally {
            setSaving(
                false
            );
        }
    }

    /* =====================================================
       DELETE
    ===================================================== */

    async function deleteStudent() {
        try {
            setDeleting(
                true
            );

            setErrorMessage("");

            const response =
                await fetch(
                    `/api/admin/students/${encodeURIComponent(
                        studentId
                    )}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to delete student."
                );
            }

            router.replace(
                "/admin/students"
            );
        } catch (error) {
            console.error(
                "ADMIN DELETE STUDENT ERROR:",
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to delete student."
            );

            setDeleting(
                false
            );
        }
    }

    /* =====================================================
       FORMAT
    ===================================================== */

    function formatDate(
        value: string | null
    ) {
        if (!value) {
            return "Never";
        }

        try {
            return new Intl.DateTimeFormat(
                "en-GB",
                {
                    dateStyle:
                        "medium",
                    timeStyle:
                        "short",
                }
            ).format(
                new Date(value)
            );
        } catch {
            return "Unknown";
        }
    }

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <StudentPageLoading />
        );
    }

    /* =====================================================
       ERROR WITHOUT STUDENT
    ===================================================== */

    if (
        errorMessage &&
        !student
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020203] px-5 text-white">
                <div className="w-full max-w-lg rounded-[30px] border border-red-500/15 bg-red-500/[0.04] p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                        <X
                            size={26}
                        />
                    </div>

                    <h1 className="mt-5 text-xl font-black">
                        Could not load student
                    </h1>

                    <p className="mt-3 text-xs leading-6 text-zinc-500">
                        {errorMessage}
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-bold text-zinc-500 hover:text-white"
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                void loadStudent()
                            }
                            className="rounded-xl bg-purple-600 px-5 py-3 text-xs font-black hover:bg-purple-500"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!student) {
        return null;
    }

    /* =====================================================
       DERIVED
    ===================================================== */

    const xp =
        Number(
            student.stats?.xp ??
            student.xp ??
            0
        );

    const level =
        Number(
            student.stats?.level ??
            student.level ??
            1
        );

    const currentStreak =
        Number(
            student.stats
                ?.current_streak ??
            0
        );

    const bestStreak =
        Number(
            student.stats
                ?.best_streak ??
            0
        );

    const progressPercentage =
        student.progress.total >
            0
            ? Math.round(
                (student.progress.completed /
                    student.progress.total) *
                100
            )
            : 0;

    const isBanned =
        Boolean(
            student.auth
                ?.banned_until &&
            new Date(
                student.auth.banned_until
            ).getTime() >
            Date.now()
        );

    /* =====================================================
       MAIN
    ===================================================== */

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#020203] text-white">
            {/* BACKGROUND */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[-200px] top-[-180px] h-[600px] w-[600px] rounded-full bg-purple-700/[0.10] blur-[170px]" />

                <div className="absolute right-[-220px] top-[20%] h-[600px] w-[600px] rounded-full bg-violet-600/[0.08] blur-[170px]" />
            </div>

            <div className="relative mx-auto max-w-[1500px] px-5 py-6 md:px-8 xl:px-10">
                {/* =================================================
                   HEADER
                ================================================= */}

                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/admin/students"
                                )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-500 transition hover:border-purple-500/20 hover:text-white"
                        >
                            <ArrowLeft
                                size={16}
                            />
                        </button>

                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                                RailLearn Admin
                            </p>

                            <h1 className="mt-1 text-2xl font-black">
                                Student Details
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                void loadStudent(
                                    true
                                )
                            }
                            disabled={
                                refreshing ||
                                saving
                            }
                            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[9px] font-black text-zinc-500 hover:text-white disabled:opacity-50"
                        >
                            <RefreshCw
                                size={13}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                        {!editMode ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setEditMode(
                                        true
                                    )
                                }
                                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-[9px] font-black transition hover:bg-purple-500"
                            >
                                <Pencil
                                    size={13}
                                />

                                Edit Student
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditMode(
                                            false
                                        );

                                        setForm(
                                            {
                                                name:
                                                    student.name ??
                                                    "",
                                                full_name:
                                                    student.full_name ??
                                                    "",
                                                email:
                                                    student.email ??
                                                    "",
                                                phone:
                                                    student.phone ??
                                                    "",
                                                university_id:
                                                    student.university_id ??
                                                    "",
                                                faculty:
                                                    student.faculty ??
                                                    "",
                                                department:
                                                    student.department ??
                                                    "",
                                                avatar_url:
                                                    student.avatar_url ??
                                                    "",
                                                bio:
                                                    student.bio ??
                                                    "",
                                                password:
                                                    "",
                                            }
                                        );
                                    }}
                                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[9px] font-black text-zinc-500 hover:text-white"
                                >
                                    <X
                                        size={13}
                                    />

                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        void saveStudent()
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 text-[9px] font-black disabled:opacity-50"
                                >
                                    <Save
                                        size={13}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* =================================================
                   MESSAGES
                ================================================= */}

                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mt-6 rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4"
                        >
                            <p className="text-xs font-black text-red-400">
                                {errorMessage}
                            </p>
                        </motion.div>
                    )}

                    {successMessage && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mt-6 rounded-2xl border border-green-500/15 bg-green-500/[0.04] p-4"
                        >
                            <p className="text-xs font-black text-green-400">
                                {successMessage}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* =================================================
                   PROFILE HERO
                ================================================= */}

                <section className="relative mt-7 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-[#14091d] via-[#08070d] to-[#050507] p-6 md:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-600/15 blur-[110px]" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-5">
                            <StudentAvatar
                                student={
                                    student
                                }
                                large
                            />

                            <div className="min-w-0">
                                {editMode ? (
                                    <input
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    old
                                                ) => ({
                                                    ...old,
                                                    name:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="h-11 w-full max-w-md rounded-xl border border-purple-500/20 bg-black/20 px-4 text-xl font-black text-white outline-none"
                                    />
                                ) : (
                                    <h2 className="truncate text-2xl font-black md:text-3xl">
                                        {
                                            student.name
                                        }
                                    </h2>
                                )}

                                <p className="mt-2 truncate text-xs text-zinc-600">
                                    {
                                        student.email
                                    }
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[7px] font-black uppercase tracking-wider ${isBanned
                                            ? "border-red-500/15 bg-red-500/10 text-red-400"
                                            : "border-green-500/15 bg-green-500/10 text-green-400"
                                            }`}
                                    >
                                        {isBanned
                                            ? "Banned"
                                            : "Active"}
                                    </span>

                                    <span className="rounded-full border border-purple-500/15 bg-purple-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-wider text-purple-300">
                                        {
                                            student.role ??
                                            "student"
                                        }
                                    </span>

                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[7px] font-black uppercase tracking-wider text-zinc-600">
                                        ID:{" "}
                                        {
                                            student.id
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:w-[520px]">
                            <HeroStat
                                icon={
                                    <Zap
                                        size={
                                            15
                                        }
                                    />
                                }
                                label="XP"
                                value={String(
                                    xp
                                )}
                            />

                            <HeroStat
                                icon={
                                    <Award
                                        size={
                                            15
                                        }
                                    />
                                }
                                label="Level"
                                value={String(
                                    level
                                )}
                            />

                            <HeroStat
                                icon={
                                    <BookOpen
                                        size={
                                            15
                                        }
                                    />
                                }
                                label="Lessons"
                                value={String(
                                    student
                                        .progress
                                        .completed
                                )}
                            />

                            <HeroStat
                                icon={
                                    <Target
                                        size={
                                            15
                                        }
                                    />
                                }
                                label="Quiz Avg"
                                value={`${student.quizzes.average}%`}
                            />
                        </div>
                    </div>
                </section>

                {/* =================================================
                   DETAILS + STATS
                ================================================= */}

                <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_360px]">
                    {/* LEFT */}

                    <div className="space-y-7">
                        {/* ACCOUNT INFORMATION */}

                        <section className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-7">
                            <SectionTitle
                                icon={
                                    <User
                                        size={16}
                                    />
                                }
                                title="Account Information"
                                eyebrow="Profile"
                            />

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <AdminInput
                                    label="Full Name"
                                    value={
                                        form.full_name
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                full_name:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="Email"
                                    value={
                                        form.email
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                email:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="Phone"
                                    value={
                                        form.phone
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                phone:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="University ID"
                                    value={
                                        form.university_id
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                university_id:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="Faculty"
                                    value={
                                        form.faculty
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                faculty:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="Department"
                                    value={
                                        form.department
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                department:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="Avatar URL"
                                    value={
                                        form.avatar_url
                                    }
                                    editing={
                                        editMode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                avatar_url:
                                                    value,
                                            })
                                        )
                                    }
                                />

                                <AdminInput
                                    label="Auth Provider"
                                    value={
                                        student.auth_provider ??
                                        "Unknown"
                                    }
                                    editing={
                                        false
                                    }
                                    onChange={() => { }}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="text-[8px] font-black uppercase tracking-wider text-zinc-700">
                                    Bio
                                </label>

                                {editMode ? (
                                    <textarea
                                        value={
                                            form.bio
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    old
                                                ) => ({
                                                    ...old,
                                                    bio:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        rows={
                                            5
                                        }
                                        className="mt-2 w-full resize-none rounded-2xl border border-purple-500/15 bg-black/20 px-4 py-3 text-xs leading-6 text-zinc-300 outline-none"
                                    />
                                ) : (
                                    <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-xs leading-6 text-zinc-500">
                                        {student.bio ||
                                            "No bio provided."}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* PASSWORD */}

                        {editMode && (
                            <section className="rounded-[28px] border border-yellow-500/10 bg-yellow-500/[0.025] p-6 md:p-7">
                                <SectionTitle
                                    icon={
                                        <KeyRound
                                            size={
                                                16
                                            }
                                        />
                                    }
                                    title="Security"
                                    eyebrow="Account Access"
                                />

                                <div className="mt-6">
                                    <label className="text-[8px] font-black uppercase tracking-wider text-zinc-700">
                                        New Password
                                    </label>

                                    <div className="relative mt-2">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                form.password
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setForm(
                                                    (
                                                        old
                                                    ) => ({
                                                        ...old,
                                                        password:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            placeholder="Leave empty to keep current password"
                                            className="h-12 w-full rounded-xl border border-white/[0.07] bg-black/20 px-4 pr-12 text-xs text-white outline-none placeholder:text-zinc-800 focus:border-purple-500/25"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (
                                                        old
                                                    ) =>
                                                        !old
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 hover:text-white"
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ACTIVITY */}

                        <section className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-7">
                            <SectionTitle
                                icon={
                                    <Activity
                                        size={
                                            16
                                        }
                                    />
                                }
                                title="Account Activity"
                                eyebrow="Timeline"
                            />

                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                <ActivityCard
                                    icon={
                                        <Clock3
                                            size={
                                                16
                                            }
                                        />
                                    }
                                    label="Created"
                                    value={formatDate(
                                        student
                                            .auth
                                            .created_at
                                    )}
                                />

                                <ActivityCard
                                    icon={
                                        <Activity
                                            size={
                                                16
                                            }
                                        />
                                    }
                                    label="Last Sign In"
                                    value={formatDate(
                                        student
                                            .auth
                                            .last_sign_in_at
                                    )}
                                />

                                <ActivityCard
                                    icon={
                                        <CheckCircle2
                                            size={
                                                16
                                            }
                                        />
                                    }
                                    label="Email Confirmed"
                                    value={
                                        student
                                            .auth
                                            .email_confirmed_at
                                            ? "Yes"
                                            : "No"
                                    }
                                />

                                <ActivityCard
                                    icon={
                                        <Phone
                                            size={
                                                16
                                            }
                                        />
                                    }
                                    label="Phone Confirmed"
                                    value={
                                        student
                                            .auth
                                            .phone_confirmed_at
                                            ? "Yes"
                                            : "No"
                                    }
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}

                    <aside className="space-y-5">
                        {/* GAMIFICATION */}

                        <section className="rounded-[28px] border border-purple-500/10 bg-purple-500/[0.03] p-6">
                            <SectionTitle
                                icon={
                                    <Zap
                                        size={
                                            16
                                        }
                                    />
                                }
                                title="Performance"
                                eyebrow="Gamification"
                            />

                            <div className="mt-5 space-y-3">
                                <PerformanceRow
                                    label="XP"
                                    value={`${xp} XP`}
                                />

                                <PerformanceRow
                                    label="Level"
                                    value={`Level ${level}`}
                                />

                                <PerformanceRow
                                    label="Current Streak"
                                    value={`${currentStreak} days`}
                                />

                                <PerformanceRow
                                    label="Best Streak"
                                    value={`${bestStreak} days`}
                                />
                            </div>
                        </section>

                        {/* LESSON PROGRESS */}

                        <section className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6">
                            <SectionTitle
                                icon={
                                    <BookOpen
                                        size={
                                            16
                                        }
                                    />
                                }
                                title="Lesson Progress"
                                eyebrow="Learning"
                            />

                            <div className="mt-5">
                                <div className="flex items-end justify-between">
                                    <p className="text-3xl font-black">
                                        {
                                            student
                                                .progress
                                                .completed
                                        }
                                        <span className="text-zinc-800">
                                            /
                                            {
                                                student
                                                    .progress
                                                    .total
                                            }
                                        </span>
                                    </p>

                                    <p className="text-xs font-black text-purple-400">
                                        {
                                            progressPercentage
                                        }%
                                    </p>
                                </div>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-400"
                                        style={{
                                            width: `${progressPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* QUIZZES */}

                        <section className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6">
                            <SectionTitle
                                icon={
                                    <Target
                                        size={
                                            16
                                        }
                                    />
                                }
                                title="Quiz Performance"
                                eyebrow="Assessments"
                            />

                            <div className="mt-5 space-y-3">
                                <PerformanceRow
                                    label="Attempts"
                                    value={String(
                                        student
                                            .quizzes
                                            .attempts
                                    )}
                                />

                                <PerformanceRow
                                    label="Average"
                                    value={`${student.quizzes.average}%`}
                                />
                            </div>
                        </section>

                        {/* DELETE */}

                        <section className="rounded-[28px] border border-red-500/10 bg-red-500/[0.025] p-6">
                            <div className="flex items-center gap-3 text-red-400">
                                <Ban
                                    size={
                                        17
                                    }
                                />

                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em]">
                                        Danger Zone
                                    </p>

                                    <p className="mt-1 text-sm font-black text-white">
                                        Delete Student
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-[9px] leading-5 text-zinc-700">
                                This permanently removes the student's authentication account and profile.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDelete(
                                        true
                                    )
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-[9px] font-black text-red-400 transition hover:bg-red-500/[0.10]"
                            >
                                <Ban
                                    size={
                                        13
                                    }
                                />
                                Delete Student
                            </button>
                        </section>
                    </aside>
                </div>
            </div>

            {/* =====================================================
               DELETE MODAL
            ===================================================== */}

            <AnimatePresence>
                {showDelete && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close delete dialog"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            onClick={() =>
                                setShowDelete(
                                    false
                                )
                            }
                            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.96,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.96,
                                y: 20,
                            }}
                            className="fixed left-1/2 top-1/2 z-[110] w-[calc(100%-30px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-red-500/15 bg-[#080709] p-7 shadow-2xl"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                                <Ban
                                    size={
                                        24
                                    }
                                />
                            </div>

                            <h2 className="mt-5 text-xl font-black">
                                Delete this student?
                            </h2>

                            <p className="mt-3 text-xs leading-6 text-zinc-600">
                                This action will permanently delete{" "}
                                <span className="font-bold text-zinc-300">
                                    {
                                        student.name
                                    }
                                </span>{" "}
                                and their authentication account.
                            </p>

                            <div className="mt-7 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDelete(
                                            false
                                        )
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.02] py-3 text-[9px] font-black text-zinc-500 hover:text-white disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        void deleteStudent()
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="flex-1 rounded-xl bg-red-600 py-3 text-[9px] font-black text-white hover:bg-red-500 disabled:opacity-50"
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Permanently"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}

/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <div className="flex items-center gap-2 text-purple-400">
                {icon}

                <span className="text-[7px] font-black uppercase tracking-wider text-zinc-700">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-lg font-black">
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
    title,
    eyebrow,
}: {
    icon: React.ReactNode;
    title: string;
    eyebrow: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                {icon}
            </div>

            <div>
                <p className="text-[7px] font-black uppercase tracking-[0.22em] text-purple-400">
                    {eyebrow}
                </p>

                <h2 className="mt-1 text-sm font-black">
                    {title}
                </h2>
            </div>
        </div>
    );
}

/* =========================================================
   INPUT
========================================================= */

function AdminInput({
    label,
    value,
    editing,
    onChange,
}: {
    label: string;
    value: string;
    editing: boolean;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <div>
            <label className="text-[8px] font-black uppercase tracking-wider text-zinc-700">
                {label}
            </label>

            {editing ? (
                <input
                    value={
                        value
                    }
                    onChange={(
                        event
                    ) =>
                        onChange(
                            event
                                .target
                                .value
                        )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-black/20 px-4 text-xs text-zinc-300 outline-none transition focus:border-purple-500/25"
                />
            ) : (
                <div className="mt-2 min-h-[44px] rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-xs text-zinc-500">
                    {value ||
                        "Not provided"}
                </div>
            )}
        </div>
    );
}

/* =========================================================
   ACTIVITY CARD
========================================================= */

function ActivityCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-purple-400">
                {icon}

                <span className="text-[7px] font-black uppercase tracking-wider text-zinc-700">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-xs font-bold text-zinc-400">
                {value}
            </p>
        </div>
    );
}

/* =========================================================
   PERFORMANCE ROW
========================================================= */

function PerformanceRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
            <span className="text-[8px] font-bold text-zinc-600">
                {label}
            </span>

            <span className="text-xs font-black text-zinc-300">
                {value}
            </span>
        </div>
    );
}

/* =========================================================
   AVATAR
========================================================= */

function StudentAvatar({
    student,
    large = false,
}: {
    student: Student;
    large?: boolean;
}) {
    const name =
        student.name ??
        student.full_name ??
        "Student";

    const letter =
        name
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "S";

    if (
        student.avatar_url
    ) {
        return (
            <img
                src={
                    student.avatar_url
                }
                alt={
                    name
                }
                className={`shrink-0 rounded-[20px] border border-white/[0.07] object-cover ${large
                    ? "h-24 w-24 md:h-28 md:w-28"
                    : "h-12 w-12"
                    }`}
            />
        );
    }

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-purple-500 to-violet-800 font-black text-white ${large
                ? "h-24 w-24 text-3xl md:h-28 md:w-28"
                : "h-12 w-12 text-sm"
                }`}
        >
            {letter}
        </div>
    );
}

/* =========================================================
   LOADING
========================================================= */

function StudentPageLoading() {
    return (
        <main className="min-h-screen bg-[#020203] text-white">
            <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 xl:px-10">
                <div className="h-11 w-72 animate-pulse rounded-2xl bg-white/[0.05]" />

                <div className="mt-7 h-48 animate-pulse rounded-[32px] bg-[#07080d]" />

                <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_360px]">
                    <div className="space-y-7">
                        <div className="h-[400px] animate-pulse rounded-[28px] bg-[#07080d]" />

                        <div className="h-[250px] animate-pulse rounded-[28px] bg-[#07080d]" />
                    </div>

                    <div className="space-y-5">
                        <div className="h-56 animate-pulse rounded-[28px] bg-[#07080d]" />

                        <div className="h-48 animate-pulse rounded-[28px] bg-[#07080d]" />

                        <div className="h-40 animate-pulse rounded-[28px] bg-[#07080d]" />
                    </div>
                </div>
            </div>
        </main>
    );
}