"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAdminMode } from "./AdminModeProvider";

const STORAGE_KEY = "raillearn_admin_student_mode";

export default function StudentModeBanner() {
    const pathname = usePathname();
    const { disableStudentMode, isNavigating } = useAdminMode();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (pathname.startsWith("/admin")) {
            setVisible(false);
            return;
        }
        setVisible(window.localStorage.getItem(STORAGE_KEY) === "true");
    }, [pathname]);

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-[9999] border-b border-purple-500/20 bg-[#08050d]/95 px-3 py-2.5 backdrop-blur-xl sm:px-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-300">
                        Student Mode
                    </p>
                    <p className="hidden text-[7px] text-zinc-600 sm:block">
                        You are viewing RailLearn as a student.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={disableStudentMode}
                    disabled={isNavigating}
                    aria-label="Back to admin mode"
                    className="flex min-h-10 shrink-0 touch-manipulation items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-[7px] font-black text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-wait disabled:opacity-60"
                >
                    {isNavigating ? <LoaderCircle size={11} className="animate-spin" /> : <ArrowLeft size={11} />}
                    {isNavigating ? "Opening Admin..." : "Back to Admin"}
                </button>
            </div>
        </div>
    );
}
