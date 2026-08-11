"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Video,
} from "lucide-react";
import Link from "next/link";

type Subject = {
  id: string;
  name: string | null;
  code: string | null;
};

export default function NewLessonPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        const response = await fetch("/api/admin/subjects");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load subjects."
          );
        }

        setSubjects(data.subjects || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subjects."
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, []);

  function handleFile(
    file: File | undefined,
    type: "image" | "video" | "pdf"
  ) {
    if (!file) return;

    if (type === "image") {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB.");
        return;
      }

      setImage(file);
    }

    if (type === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video.");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        setError("Video must be smaller than 100MB.");
        return;
      }

      setVideo(file);
    }

    if (type === "pdf") {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file.");
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        setError("PDF must be smaller than 25MB.");
        return;
      }

      setPdf(file);
    }

    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("subject_id", subjectId);
      formData.append("description", description);
      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

      if (video) {
        formData.append("video", video);
      }

      if (pdf) {
        formData.append("pdf", pdf);
      }

      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create lesson."
        );
      }

      router.push("/admin/lessons");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">

        <Link
          href="/admin/lessons"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold text-zinc-600 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Lessons
        </Link>

        <div className="mb-8">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-purple-400">
            Curriculum
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Create Lesson
          </h1>

          <p className="mt-2 text-xs text-zinc-600">
            Add a complete learning lesson to RailLearn.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-white/[0.07] bg-[#07080d] p-5 md:p-8"
        >

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-6">

            {/* TITLE */}
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Lesson Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Railway Signaling"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
              />
            </div>

            {/* SUBJECT */}
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Subject
              </label>

              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={loadingSubjects}
                className="w-full rounded-xl border border-white/[0.08] bg-[#08090e] px-4 py-3 text-sm outline-none focus:border-purple-500/50"
              >
                <option value="">
                  {loadingSubjects
                    ? "Loading subjects..."
                    : "Select a subject"}
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.code
                      ? `${subject.code} — ${subject.name}`
                      : subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Short Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={3}
                placeholder="Short description of the lesson..."
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                Lesson Content
              </label>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                rows={12}
                placeholder="Write the lesson content here..."
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-black/30 px-4 py-4 text-sm leading-7 outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
              />
            </div>

            {/* FILES */}
            <div className="grid gap-4 md:grid-cols-3">

              {/* IMAGE */}
              <label className="cursor-pointer rounded-2xl border border-dashed border-white/[0.1] bg-black/20 p-5 transition hover:border-purple-500/40">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <ImagePlus size={18} />
                </div>

                <p className="mt-4 text-xs font-black">
                  Lesson Image
                </p>

                <p className="mt-1 text-[9px] text-zinc-600">
                  {image
                    ? image.name
                    : "Choose image from device"}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFile(
                      e.target.files?.[0],
                      "image"
                    )
                  }
                />
              </label>

              {/* VIDEO */}
              <label className="cursor-pointer rounded-2xl border border-dashed border-white/[0.1] bg-black/20 p-5 transition hover:border-purple-500/40">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Video size={18} />
                </div>

                <p className="mt-4 text-xs font-black">
                  Lesson Video
                </p>

                <p className="mt-1 line-clamp-2 text-[9px] text-zinc-600">
                  {video
                    ? video.name
                    : "Choose video from device"}
                </p>

                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFile(
                      e.target.files?.[0],
                      "video"
                    )
                  }
                />
              </label>

              {/* PDF */}
              <label className="cursor-pointer rounded-2xl border border-dashed border-white/[0.1] bg-black/20 p-5 transition hover:border-purple-500/40">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <FileText size={18} />
                </div>

                <p className="mt-4 text-xs font-black">
                  Lesson PDF
                </p>

                <p className="mt-1 line-clamp-2 text-[9px] text-zinc-600">
                  {pdf
                    ? pdf.name
                    : "Choose PDF from device"}
                </p>

                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFile(
                      e.target.files?.[0],
                      "pdf"
                    )
                  }
                />
              </label>

            </div>

          </div>

          {/* SUBMIT */}
          <div className="mt-8 flex justify-end">

            <button
              type="submit"
              disabled={loading || loadingSubjects}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-[10px] font-black transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create Lesson
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}