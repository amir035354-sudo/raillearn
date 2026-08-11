"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Camera, Save, X } from "lucide-react";

type Props = {
  currentName: string;
  currentAvatar: string | null;
  userId: string;
};

export default function ProfileEditor({
  currentName,
  currentAvatar,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentAvatar
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function chooseImage(selected: File | undefined) {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select an image.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setFile(selected);

    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  }

  async function saveProfile() {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let avatarUrl = avatar;

      /*
       * Upload avatar
       */
      if (file) {
        const extension =
          file.name.split(".").pop() || "jpg";

        const filePath =
          `${userId}/avatar-${Date.now()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
              upsert: true,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        const { data } =
          supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        avatarUrl = data.publicUrl;
      }

      /*
       * Save user data
       */
      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: name.trim(),
            avatar_url: avatarUrl,
          },
        });

      if (updateError) {
        throw updateError;
      }

      setAvatar(avatarUrl);
      setPreview(avatarUrl);
      setFile(null);
      setOpen(false);

      router.refresh();
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while saving."
      );
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    setName(currentName);
    setAvatar(currentAvatar);
    setPreview(currentAvatar);
    setFile(null);
    setError("");
    setOpen(false);
  }

  return (
    <>
      {/* Avatar */}
      <div className="relative">

        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border border-purple-500/20 bg-purple-600/10 text-purple-400 shadow-2xl shadow-purple-950/30">

          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl font-bold">
              {name
                .charAt(0)
                .toUpperCase()}
            </span>
          )}

        </div>

        {/* Camera */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-xl border-4 border-zinc-950 bg-purple-600 text-white shadow-lg transition hover:bg-purple-700"
          title="Edit profile"
        >
          <Camera size={19} />
        </button>

      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-7 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                  RailLearn
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Edit Profile
                </h2>
              </div>

              <button
                type="button"
                onClick={cancel}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            {/* Image */}
            <div className="mt-7 flex flex-col items-center">

              <label className="group relative cursor-pointer">

                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-purple-600/10 text-purple-400 ring-1 ring-purple-500/20">

                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold">
                      {name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                </div>

                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <Camera size={26} />
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    chooseImage(
                      event.target.files?.[0]
                    )
                  }
                />

              </label>

              <p className="mt-3 text-xs text-zinc-600">
                JPG, PNG or WEBP • Maximum 5MB
              </p>

            </div>

            {/* Name */}
            <div className="mt-7">

              <label className="text-sm font-semibold text-zinc-400">
                Display Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-500"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              type="button"
              onClick={saveProfile}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3.5 font-bold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>
      )}
    </>
  );
}