"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
  Video,
} from "lucide-react";

type Subject = {
  id: string;
  name: string | null;
  code: string | null;
  semester: number | null;
};

export default function NewLessonForm({
  subjects,
}: {
  subjects: Subject[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error("Lesson title is required.");
      }

      if (!subjectId) {
        throw new Error("Please select a subject.");
      }

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      formData.append("lessonOrder", lessonOrder);
      formData.append("subjectId", subjectId);

      if (image) {
        formData.append("image", image);
      }

      if (pdf) {
        formData.append("pdf", pdf);
      }

      if (video) {
        formData.append("video", video);
      }

      const response = await fetch(
        "/api/admin/lessons",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to create lesson."
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-[24px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
        <h2 className="text-lg font-black">
          Lesson Information
        </h2>

        <div className="mt-6 grid gap-5">
          <Field
            label="Lesson Title"
            value={title}
            onChange={setTitle}
            placeholder="Example: Introduction to Railway Systems"
          />

          <div>
            <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Subject
            </label>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.07] bg-[#0b0c12] px-4 py-3 text-xs text-white outline-none focus:border-purple-500/50"
            >
              <option value="">
                Select subject
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.code
                    ? `${subject.code} — `
                    : ""}
                  {subject.name || "Untitled subject"}
                  {subject.semester
                    ? ` — Semester ${subject.semester}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Lesson Order"
            value={lessonOrder}
            onChange={setLessonOrder}
            placeholder="1"
            type="number"
          />

          <div>
            <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={4}
              placeholder="Short description of this lesson..."
              className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#0b0c12] px-4 py-3 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Lesson Content
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              rows={10}
              placeholder="Write the lesson content here..."
              className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#0b0c12] px-4 py-3 text-xs leading-6 text-white outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8">
        <h2 className="text-lg font-black">
          Lesson Files
        </h2>

        <p className="mt-2 text-xs text-zinc-600">
          Upload files directly from your computer.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FileUpload
            label="Lesson Image"
            icon={<ImageIcon size={22} />}
            accept="image/*"
            file={image}
            onChange={setImage}
          />

          <FileUpload
            label="PDF"
            icon={<FileText size={22} />}
            accept=".pdf,application/pdf"
            file={pdf}
            onChange={setPdf}
          />

          <FileUpload
            label="Video"
            icon={<Video size={22} />}
            accept="video/*"
            file={video}
            onChange={setVideo}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-4 text-[10px] font-black transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2
              size={15}
              className="animate-spin"
            />
            Creating Lesson...
          </>
        ) : (
          <>
            <Upload size={15} />
            Create Lesson
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.07] bg-[#0b0c12] px-4 py-3 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-purple-500/50"
      />
    </div>
  );
}

function FileUpload({
  label,
  icon,
  accept,
  file,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="group cursor-pointer rounded-2xl border border-dashed border-white/[0.1] bg-[#0b0c12] p-6 transition hover:border-purple-500/40 hover:bg-purple-500/[0.03]">
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) =>
          onChange(e.target.files?.[0] ?? null)
        }
      />

      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          {icon}
        </div>

        <p className="mt-4 text-[10px] font-black">
          {label}
        </p>

        <p className="mt-2 max-w-[180px] truncate text-[9px] text-zinc-600">
          {file ? file.name : "Choose file from device"}
        </p>

        <span className="mt-4 rounded-lg bg-white/[0.04] px-3 py-2 text-[8px] font-bold text-zinc-500 transition group-hover:text-purple-400">
          Browse
        </span>
      </div>
    </label>
  );
}