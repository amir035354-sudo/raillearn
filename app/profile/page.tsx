"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  CircleCheck,
  Edit3,
  Flame,
  GraduationCap,
  Link2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrainFront,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

/* =====================================================
   TYPES
===================================================== */

type ProfileData = {
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
};

type Identity = {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

/* =====================================================
   XP SYSTEM
===================================================== */

const XP_PER_LESSON = 100;
const XP_PER_QUIZ = 50;
const XP_PER_ACHIEVEMENT = 250;
const XP_PER_LEVEL = 500;

function getLevelFromXP(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getLevelProgress(xp: number) {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}

function getXPToNextLevel(xp: number) {
  const remainder = xp % XP_PER_LEVEL;

  return remainder === 0
    ? XP_PER_LEVEL
    : XP_PER_LEVEL - remainder;
}

/* =====================================================
   PHONE HELPERS
===================================================== */

function normalizeEgyptPhone(value: string) {
  let phone = value.trim();

  // Remove spaces, dashes, parentheses
  phone = phone.replace(/[\s\-()]/g, "");

  // 01234567890 -> +201234567890
  if (/^01\d{9}$/.test(phone)) {
    return `+20${phone.slice(1)}`;
  }

  // 201234567890 -> +201234567890
  if (/^20\d{10}$/.test(phone)) {
    return `+${phone}`;
  }

  // +201234567890
  if (/^\+20\d{10}$/.test(phone)) {
    return phone;
  }

  return phone;
}

function isValidEgyptPhone(value: string) {
  return /^\+20(10|11|12|15)\d{8}$/.test(value);
}

/* =====================================================
   PAGE
===================================================== */

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /* ===================================================
     STATE
  =================================================== */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState("");

  const [profile, setProfile] =
    useState<ProfileData>({
      name: "",
      avatarUrl: "",
      email: "",
      phone: "",
    });

  const [nameInput, setNameInput] =
    useState("");

  const [phoneInput, setPhoneInput] =
    useState("");

  const [identities, setIdentities] =
    useState<Identity[]>([]);

  const [linking, setLinking] =
    useState("");

  const [xp, setXp] = useState(0);

  const [completedLessons, setCompletedLessons] =
    useState(0);

  const [totalLessons, setTotalLessons] =
    useState(0);

  const [showPhoneEditor, setShowPhoneEditor] =
    useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  /* ===================================================
     LOAD
  =================================================== */

  useEffect(() => {
    loadProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      /* ===============================================
         AUTH USER
      =============================================== */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      /* ===============================================
         USER METADATA
      =============================================== */

      const metadata =
        user.user_metadata || {};

      const name =
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        "";

      const avatar =
        metadata.avatar_url ||
        metadata.picture ||
        "";

      setProfile({
        name,
        avatarUrl: avatar,
        email: user.email || "",
        phone: user.phone || "",
      });

      setNameInput(name);
      setPhoneInput(user.phone || "");

      /* ===============================================
         IDENTITIES
      =============================================== */

      const {
        data: identityData,
        error: identityError,
      } =
        await supabase.auth.getUserIdentities();

      if (!identityError) {
        setIdentities(
          (identityData?.identities ||
            []) as Identity[]
        );
      }

      /* ===============================================
         COMPLETED LESSONS
      =============================================== */

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from("progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (!progressError) {
        const completed =
          progressData?.length || 0;

        setCompletedLessons(completed);

        setXp(
          completed * XP_PER_LESSON
        );
      }

      /* ===============================================
         TOTAL LESSONS
      =============================================== */

      const {
        count: lessonCount,
        error: lessonCountError,
      } = await supabase
        .from("lessons")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("is_published", true);

      if (!lessonCountError) {
        setTotalLessons(
          lessonCount || 0
        );
      }
    } catch (err) {
      console.error(
        "PROFILE LOAD ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     SAVE NAME
  ===================================================== */

  async function saveName() {
    try {
      const cleanName =
        nameInput.trim();

      if (!cleanName) {
        setError(
          "Name cannot be empty."
        );
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      const {
        data,
        error: updateError,
      } =
        await supabase.auth.updateUser({
          data: {
            ...profile,
            full_name: cleanName,
            name: cleanName,
            display_name: cleanName,
          },
        });

      if (updateError) {
        throw updateError;
      }

      const newUser =
        data.user;

      const newMetadata =
        newUser.user_metadata || {};

      setProfile((old) => ({
        ...old,
        name: cleanName,
        avatarUrl:
          newMetadata.avatar_url ||
          old.avatarUrl,
      }));

      setNameInput(cleanName);

      setSuccess(
        "Your name has been updated successfully."
      );
    } catch (err) {
      console.error(
        "NAME UPDATE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not update your name."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     UPDATE PHONE
  ===================================================== */

  async function savePhone() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const normalizedPhone = phoneInput
        .trim()
        .replace(/[^\d+]/g, "");

      if (!normalizedPhone) {
        throw new Error("اكتب رقم الموبايل الأول.");
      }

      // Egypt: 01xxxxxxxxx -> +201xxxxxxxxx
      let finalPhone = normalizedPhone;

      if (/^01\d{9}$/.test(finalPhone)) {
        finalPhone = `+2${finalPhone}`;
      }

      // Validate E.164
      if (!/^\+[1-9]\d{7,14}$/.test(finalPhone)) {
        throw new Error(
          "رقم الموبايل غير صحيح. مثال: +201012345678"
        );
      }

      /*
       * Save phone in YOUR users table.
       * This avoids the Supabase Auth updateUser()
       * retry problem.
       */

      const { error: dbError } = await supabase
        .from("users")
        .update({
          phone: finalPhone,
        })
        .eq("id", userId);

      if (dbError) {
        throw dbError;
      }

      setProfile((old) => ({
        ...old,
        phone: finalPhone,
      }));

      setPhoneInput(finalPhone);
      setShowPhoneEditor(false);

      setSuccess(
        "تم حفظ رقم الموبايل بنجاح."
      );
    } catch (err) {
      console.error(
        "PHONE SAVE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "حصل خطأ أثناء حفظ رقم الموبايل."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     UPLOAD AVATAR
  ===================================================== */

  async function uploadAvatar(
    file: File
  ) {
    try {
      if (!userId) {
        throw new Error(
          "User is not loaded yet."
        );
      }

      setUploading(true);
      setError("");
      setSuccess("");

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        throw new Error(
          "Please select an image file."
        );
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        throw new Error(
          "Image must be smaller than 5MB."
        );
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `${userId}/avatar-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            file,
            {
              upsert: true,
              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicData,
      } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(
            filePath
          );

      const avatarUrl =
        publicData.publicUrl;

      const {
        data,
        error: updateError,
      } =
        await supabase.auth.updateUser({
          data: {
            ...profile,
            avatar_url:
              avatarUrl,
            picture:
              avatarUrl,
          },
        });

      if (updateError) {
        throw updateError;
      }

      const updatedMetadata =
        data.user.user_metadata ||
        {};

      setProfile((old) => ({
        ...old,
        avatarUrl:
          updatedMetadata.avatar_url ||
          avatarUrl,
      }));

      setSuccess(
        "Profile picture updated successfully."
      );
    } catch (err) {
      console.error(
        "AVATAR ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  /* =====================================================
     LINK PROVIDER
  ===================================================== */

  async function linkProvider(
    provider:
      | "google"
      | "facebook"

  ) {
    try {
      setLinking(provider);
      setError("");
      setSuccess("");

      const {
        error: linkError,
      } =
        await supabase.auth.linkIdentity(
          {
            provider,
            options: {
              redirectTo:
                `${window.location.origin}/profile`,
            },
          }
        );

      if (linkError) {
        throw linkError;
      }

      /*
       * OAuth redirects away from the page.
       * After returning to /profile,
       * loadProfile() will refresh identities.
       */
    } catch (err) {
      console.error(
        `LINK ${provider.toUpperCase()} ERROR:`,
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : `Could not link ${provider}.`
      );

      setLinking("");
    }
  }

  /* =====================================================
     UNLINK PROVIDER
  ===================================================== */

  async function unlinkProvider(
    identity: Identity
  ) {
    try {
      setError("");
      setSuccess("");

      if (
        identities.length <= 1
      ) {
        setError(
          "You need at least one login method."
        );

        return;
      }

      const {
        error: unlinkError,
      } =
        await supabase.auth.unlinkIdentity(
          identity as any
        );

      if (unlinkError) {
        throw unlinkError;
      }

      setIdentities((old) =>
        old.filter(
          (item) =>
            item.id !==
            identity.id
        )
      );

      setSuccess(
        `${identity.provider} has been unlinked.`
      );
    } catch (err) {
      console.error(
        "UNLINK ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not unlink account."
      );
    }
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function logout() {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );
    }
  }

  /* =====================================================
     XP
  ===================================================== */

  const level =
    getLevelFromXP(xp);

  const levelProgress =
    getLevelProgress(xp);

  const xpToNext =
    getXPToNextLevel(xp);

  /* =====================================================
     PROVIDERS
  ===================================================== */

  const linkedProviders =
    useMemo(
      () =>
        new Set(
          identities.map(
            (identity) =>
              identity.provider
          )
        ),
      [identities]
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <ProfileLoading />;
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
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 top-[5%] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-40 top-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030305_75%)]" />

      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030305]/80 backdrop-blur-2xl">

        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 md:px-8">

          <motion.button
            whileHover={{
              x: -3,
            }}
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-800 shadow-[0_8px_30px_rgba(124,58,237,0.25)]">
              <TrainFront size={18} />
            </div>

            <div className="text-left">
              <p className="text-sm font-black">
                RailLearn
              </p>

              <p className="text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                Railway Academy
              </p>
            </div>

          </motion.button>

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-[9px] font-bold text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            Dashboard
          </button>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="relative z-10 mx-auto max-w-[1400px] p-5 md:p-8 xl:p-10">

        {/* =================================================
            ALERTS
        ================================================= */}

        <AnimatePresence mode="wait">

          {error && (
            <motion.div
              key="error-alert"
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
              className="mb-5 flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300"
            >
              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  setError("")
                }
                aria-label="Close error"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              key="success-alert"
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
              className="mb-5 flex items-center justify-between rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs text-green-300"
            >
              <span>
                {success}
              </span>

              <button
                onClick={() =>
                  setSuccess("")
                }
                aria-label="Close success"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* =================================================
            PROFILE HERO
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
            duration: 0.6,
          }}
          className="relative mb-6 overflow-hidden rounded-[32px] border border-purple-500/15 bg-gradient-to-br from-[#12091b] via-[#08070d] to-[#050507] p-6 md:p-10"
        >

          <div className="pointer-events-none absolute -right-20 -top-40 h-[420px] w-[420px] rounded-full bg-purple-600/15 blur-[120px]" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col items-center gap-6 sm:flex-row">

              {/* AVATAR */}

              <div className="relative">

                <div className="relative h-32 w-32 overflow-hidden rounded-[32px] border border-purple-400/20 bg-purple-500/10 shadow-[0_20px_70px_rgba(124,58,237,0.25)]">

                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-violet-800 text-4xl font-black">
                      {(
                        profile.name ||
                        profile.email ||
                        "A"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-purple-400" />
                    </div>
                  )}

                </div>

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploading}
                  aria-label="Change profile picture"
                  className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-xl border border-purple-300/20 bg-purple-600 text-white shadow-[0_10px_30px_rgba(124,58,237,0.35)] transition hover:bg-purple-500 disabled:opacity-50"
                >
                  <Camera size={17} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (file) {
                      uploadAvatar(file);
                    }

                    e.currentTarget.value =
                      "";
                  }}
                />

              </div>

              <div className="text-center sm:text-left">

                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                  Student Profile
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                  {profile.name ||
                    "Railway Student"}
                </h1>

                <p className="mt-2 text-xs text-zinc-500">
                  {profile.email}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">

                  <span className="flex items-center gap-1.5 rounded-full border border-purple-500/15 bg-purple-500/10 px-3 py-1.5 text-[8px] font-black text-purple-300">
                    <Sparkles size={11} />
                    Level {level}
                  </span>

                  <span className="flex items-center gap-1.5 rounded-full border border-orange-500/15 bg-orange-500/10 px-3 py-1.5 text-[8px] font-black text-orange-300">
                    <Zap size={11} />
                    {xp} XP
                  </span>

                </div>

              </div>

            </div>

            {/* LEVEL CARD */}

            <div className="w-full max-w-sm rounded-2xl border border-white/[0.07] bg-black/25 p-5 backdrop-blur-xl md:w-[330px]">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Current Level
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    Level {level}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Trophy size={21} />
                </div>

              </div>

              <div className="mt-5 flex items-center justify-between text-[8px]">

                <span className="text-zinc-600">
                  {xp % XP_PER_LEVEL} XP
                </span>

                <span className="text-purple-400">
                  {xpToNext} XP to next level
                </span>

              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width:
                      `${levelProgress}%`,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-400"
                />

              </div>

            </div>

          </div>

        </motion.section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">

          <StatCard
            icon={<Zap size={18} />}
            label="XP"
            value={`${xp}`}
          />

          <StatCard
            icon={<GraduationCap size={18} />}
            label="Level"
            value={`${level}`}
          />

          <StatCard
            icon={<CircleCheck size={18} />}
            label="Completed"
            value={`${completedLessons}`}
          />

          <StatCard
            icon={<Target size={18} />}
            label="Total Lessons"
            value={`${totalLessons}`}
          />

        </section>

        {/* =================================================
            GRID
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">

          {/* PERSONAL INFO */}

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
              delay: 0.1,
            }}
            className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <User size={19} />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  Personal Information
                </h2>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Manage your RailLearn account
                </p>
              </div>

            </div>

            {/* NAME */}

            <div className="mt-8">

              <label className="mb-2 block text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Full Name
              </label>

              <div className="flex gap-2">

                <div className="relative flex-1">

                  <User
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
                  />

                  <input
                    value={nameInput}
                    onChange={(e) =>
                      setNameInput(
                        e.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#050507] pl-11 pr-4 text-xs text-white outline-none transition focus:border-purple-500/40"
                  />

                </div>

                <button
                  disabled={
                    saving ||
                    nameInput.trim() ===
                    profile.name
                  }
                  onClick={saveName}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 text-[9px] font-black transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Save size={13} />
                  Save
                </button>

              </div>

            </div>

            {/* EMAIL */}

            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={
                profile.email ||
                "No email connected"
              }
              verified={!!profile.email}
            />

            {/* PHONE */}

            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#050507] p-4">

              <div className="flex items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                    <Phone size={16} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
                      Phone
                    </p>

                    <p className="mt-1 truncate text-xs font-bold">
                      {profile.phone ||
                        "No phone number"}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setShowPhoneEditor(
                      (old) => !old
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-500 transition hover:text-white"
                  aria-label="Edit phone"
                >
                  <Edit3 size={14} />
                </button>

              </div>

              <AnimatePresence>
                {showPhoneEditor && (
                  <motion.div
                    key="phone-editor"
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="overflow-hidden"
                  >

                    <div className="mt-4">

                      <p className="mb-2 text-[8px] text-zinc-600">
                        Egyptian number
                      </p>

                      <div className="flex gap-2">

                        <input
                          value={
                            phoneInput
                          }
                          onChange={(e) =>
                            setPhoneInput(
                              e.target.value
                            )
                          }
                          placeholder="01012345678"
                          inputMode="tel"
                          className="h-11 flex-1 rounded-xl border border-white/[0.07] bg-[#030305] px-4 text-xs outline-none focus:border-purple-500/40"
                        />

                        <button
                          onClick={
                            savePhone
                          }
                          disabled={saving}
                          className="rounded-xl bg-purple-600 px-4 text-[9px] font-black disabled:opacity-50"
                        >
                          {saving
                            ? "Saving..."
                            : "Save"}
                        </button>

                      </div>

                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </motion.section>

          {/* CONNECTED ACCOUNTS */}

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
            className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Link2 size={19} />
              </div>

              <div>

                <h2 className="text-lg font-black">
                  Connected Accounts
                </h2>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Link your other login methods
                </p>

              </div>

            </div>

            <div className="mt-7 space-y-3">

              <ProviderRow
                name="Google"
                provider="google"
                icon={
                  <span className="font-black text-sm">
                    G
                  </span>
                }
                linked={linkedProviders.has(
                  "google"
                )}
                linking={
                  linking === "google"
                }
                onLink={() =>
                  linkProvider(
                    "google"
                  )
                }
                onUnlink={() => {
                  const identity =
                    identities.find(
                      (item) =>
                        item.provider ===
                        "google"
                    );

                  if (identity) {
                    unlinkProvider(
                      identity
                    );
                  }
                }}
              />

              <ProviderRow
                name="Facebook"
                provider="facebook"
                icon={
                  <span className="font-black text-base">
                    f
                  </span>
                }
                linked={linkedProviders.has(
                  "facebook"
                )}
                linking={
                  linking === "facebook"
                }
                onLink={() =>
                  linkProvider(
                    "facebook"
                  )
                }
                onUnlink={() => {
                  const identity =
                    identities.find(
                      (item) =>
                        item.provider ===
                        "facebook"
                    );

                  if (identity) {
                    unlinkProvider(
                      identity
                    );
                  }
                }}
              />






            </div>

            <div className="mt-6 rounded-2xl border border-purple-500/10 bg-purple-500/[0.04] p-4">

              <div className="flex gap-3">

                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-purple-400"
                />

                <p className="text-[9px] leading-5 text-zinc-500">
                  Connecting multiple login
                  methods makes it easier to
                  access your RailLearn account.
                </p>

              </div>

            </div>

          </motion.section>

        </div>

        {/* =================================================
            XP GUIDE
        ================================================= */}

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
          className="mt-6 rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <Flame size={19} />
            </div>

            <div>

              <h2 className="text-lg font-black">
                Level & XP
              </h2>

              <p className="mt-1 text-[9px] text-zinc-600">
                Keep learning to level up.
              </p>

            </div>

          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">

            <XPItem
              icon={<Check size={16} />}
              title="Complete Lesson"
              xp={`+${XP_PER_LESSON} XP`}
            />

            <XPItem
              icon={<Target size={16} />}
              title="Complete Quiz"
              xp={`+${XP_PER_QUIZ} XP`}
            />

            <XPItem
              icon={<Trophy size={16} />}
              title="Achievement"
              xp={`+${XP_PER_ACHIEVEMENT} XP`}
            />

          </div>

        </motion.section>

        {/* =================================================
            SECURITY
        ================================================= */}

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
            delay: 0.25,
          }}
          className="mt-6 rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Lock size={18} />
            </div>

            <div>

              <h2 className="text-lg font-black">
                Security
              </h2>

              <p className="mt-1 text-[9px] text-zinc-600">
                Manage your account security.
              </p>

            </div>

          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

            <button
              onClick={() =>
                setError(
                  "Password change can be added here using Supabase updateUser()."
                )
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3.5 text-[9px] font-black text-zinc-400 transition hover:border-purple-500/20 hover:text-white"
            >
              <Lock size={14} />
              Change Password
            </button>

            <button
              onClick={() =>
                setShowLogoutConfirm(
                  true
                )
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/10 bg-red-500/[0.03] px-5 py-3.5 text-[9px] font-black text-red-400 transition hover:bg-red-500/10"
            >
              <LogOut size={14} />
              Sign Out
            </button>

          </div>

        </motion.section>

        {/* FOOTER */}

        <footer className="py-10 text-center">

          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-800">
            RailLearn • Railway Academy
          </p>

        </footer>

      </div>

      {/* =================================================
          LOGOUT MODAL
      ================================================= */}

      <AnimatePresence>

        {showLogoutConfirm && (
          <motion.div
            key="logout-modal"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-xl"
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#08080c] p-7 text-center shadow-2xl"
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <LogOut size={21} />
              </div>

              <h3 className="mt-5 text-xl font-black">
                Sign out?
              </h3>

              <p className="mt-2 text-xs leading-6 text-zinc-600">
                You can sign back in anytime.
              </p>

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() =>
                    setShowLogoutConfirm(
                      false
                    )
                  }
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-[9px] font-bold text-zinc-400"
                >
                  Cancel
                </button>

                <button
                  onClick={logout}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-[9px] font-black"
                >
                  Sign Out
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </main>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-2xl border border-white/[0.07] bg-[#07080d] p-5"
    >

      <div className="flex items-center gap-2 text-purple-400">

        {icon}

        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">
          {label}
        </span>

      </div>

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

    </motion.div>
  );
}

/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
  icon,
  label,
  value,
  verified,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#050507] p-4">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
            {label}
          </p>

          <p className="mt-1 truncate text-xs font-bold">
            {value}
          </p>

        </div>

      </div>

      {verified && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-[7px] font-black text-green-400">
          <Check size={9} />
          Connected
        </span>
      )}

    </div>
  );
}

/* =====================================================
   PROVIDER ROW
===================================================== */

function ProviderRow({
  name,
  provider,
  icon,
  linked,
  linking,
  onLink,
  onUnlink,
}: {
  name: string;
  provider: string;
  icon: React.ReactNode;
  linked: boolean;
  linking: boolean;
  onLink: () => void;
  onUnlink: () => void;
}) {
  return (
    <motion.div
      layout
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#050507] p-4"
    >

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
          {icon}
        </div>

        <div>

          <p className="text-xs font-black">
            {name}
          </p>

          <p className="mt-1 text-[8px] text-zinc-600">
            {linked
              ? "Connected"
              : "Not connected"}
          </p>

        </div>

      </div>

      {linked ? (
        <button
          onClick={onUnlink}
          className="rounded-xl border border-red-500/10 bg-red-500/[0.03] px-3 py-2 text-[8px] font-black text-red-400 transition hover:bg-red-500/10"
        >
          Unlink
        </button>
      ) : (
        <button
          disabled={linking}
          onClick={onLink}
          className="rounded-xl bg-purple-600 px-3.5 py-2 text-[8px] font-black transition hover:bg-purple-500 disabled:opacity-50"
        >
          {linking
            ? "Connecting..."
            : "Connect"}
        </button>
      )}

    </motion.div>
  );
}

/* =====================================================
   XP ITEM
===================================================== */

function XPItem({
  icon,
  title,
  xp,
}: {
  icon: React.ReactNode;
  title: string;
  xp: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#050507] p-4">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
        {icon}
      </div>

      <div>

        <p className="text-[10px] font-black">
          {title}
        </p>

        <p className="mt-1 text-[8px] font-bold text-orange-400">
          {xp}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function ProfileLoading() {
  return (
    <main className="min-h-screen bg-[#030305] p-5 md:p-10">

      <div className="mx-auto max-w-[1400px]">

        <div className="h-10 w-40 animate-pulse rounded-xl bg-white/[0.05]" />

        <div className="mt-8 h-[260px] animate-pulse rounded-[32px] bg-[#07080d]" />

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

          {Array.from({
            length: 4,
          }).map((_, i) => (
            <div
              key={`loading-stat-${i}`}
              className="h-28 animate-pulse rounded-2xl bg-[#07080d]"
            />
          ))}

        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <div className="h-[450px] animate-pulse rounded-[28px] bg-[#07080d]" />

          <div className="h-[450px] animate-pulse rounded-[28px] bg-[#07080d]" />

        </div>

      </div>

    </main>
  );
}