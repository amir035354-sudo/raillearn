"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useAdminMode } from "./AdminModeProvider";

export default function AdminModeSwitch() {
    const { enableStudentMode, isNavigating } = useAdminMode();

    return (
        <button
            type="button"
            onClick={enableStudentMode}
            disabled={isNavigating}
            aria-label="Switch to student mode"
            className="flex min-h-11 touch-manipulation items-center gap-3 rounded-2xl border border-purple-500/15 bg-purple-500/[0.05] px-4 py-3 transition hover:border-purple-500/30 hover:bg-purple-500/[0.10] disabled:cursor-wait disabled:opacity-60"
        >
            {isNavigating ? (
                <LoaderCircle size={14} className="animate-spin text-purple-400" />
            ) : (
                <ShieldCheck size={14} className="text-purple-400" />
            )}
            <span className="text-[8px] font-black text-white">
                {isNavigating ? "Opening Student Mode..." : "Student Mode"}
            </span>
        </button>
    );
}
