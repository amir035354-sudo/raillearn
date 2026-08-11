"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  Plus,
  Upload,
  X,
} from "lucide-react";

export default function NewSubjectPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImagePreview(null);

    const input = document.getElementById(
      "image"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* HEADER */}
      <header className="border-b border-white/[0.06] bg-[#060609]">
        <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-purple-400">
              Administration
            </p>

            <h1 className="mt-1 text-sm font-black">
              Create Subject
            </h1>
          </div>

          <Link
            href="/admin/subjects"
            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[9px] font-bold text-zinc-500 transition hover:border-purple-500/30 hover:text-white"
          >
            <ArrowLeft size={13} />
            Back
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-[900px] px-5 py-10 md:px-8 md:py-14">

        {/* TITLE */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
            <BookOpen size={22} />
          </div>

          <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.28em] text-purple-400">
            Curriculum
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            Add New Subject
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Create a subject and add its information and cover
            image.
          </p>
        </div>

        {/* FORM */}
        <form
          action="/api/admin/subjects"
          method="POST"
          encType="multipart/form-data"
          className="rounded-[28px] border border-white/[0.07] bg-[#07080d] p-6 md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">

            {/* NAME */}
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Subject Name
              </label>

              <input
                id="name"
                name="name"
                required
                placeholder="e.g. Railway Signaling"
                className="mt-2 w-full rounded-xl border border-white/[0.07] bg-[#030305] px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40"
              />
            </div>

            {/* CODE */}
            <div>
              <label
                htmlFor="code"
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Subject Code
              </label>

              <input
                id="code"
                name="code"
                placeholder="e.g. RST-101"
                className="mt-2 w-full rounded-xl border border-white/[0.07] bg-[#030305] px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40"
              />
            </div>

            {/* SEMESTER */}
            <div>
              <label
                htmlFor="semester"
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Semester
              </label>

              <input
                id="semester"
                name="semester"
                type="number"
                min="1"
                max="12"
                placeholder="e.g. 1"
                className="mt-2 w-full rounded-xl border border-white/[0.07] bg-[#030305] px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40"
              />
            </div>

            {/* IMAGE */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <ImageIcon size={12} />
                Subject Image
              </label>

              {!imagePreview ? (
                <label
                  htmlFor="image"
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-[#030305] px-6 py-12 text-center transition hover:border-purple-500/30 hover:bg-purple-500/[0.02]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                    <Upload size={22} />
                  </div>

                  <p className="mt-4 text-xs font-bold">
                    Choose subject image
                  </p>

                  <p className="mt-2 text-[9px] text-zinc-700">
                    PNG, JPG, WEBP — maximum 5MB
                  </p>

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#030305]">
                  <img
                    src={imagePreview}
                    alt="Subject preview"
                    className="h-[280px] w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/70 text-white backdrop-blur transition hover:bg-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Write a short description about this subject..."
                className="mt-2 w-full resize-none rounded-xl border border-white/[0.07] bg-[#030305] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-zinc-700 focus:border-purple-500/40"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/subjects"
              className="flex items-center justify-center rounded-xl border border-white/[0.07] px-5 py-3 text-[9px] font-black text-zinc-500 transition hover:bg-white/[0.03] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-[9px] font-black transition hover:bg-purple-500"
            >
              <Plus size={14} />
              Create Subject
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}