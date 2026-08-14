"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "raillearn_admin_student_mode";

export default function AdminModeSwitch() {
    const router = useRouter();

    function handleClick() {
        window.localStorage.setItem(
            STORAGE_KEY,
            "true"
        );

        router.push("/dashboard");
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-3 rounded-2xl border border-purple-500/15 bg-purple-500/[0.05] px-4 py-3 transition hover:border-purple-500/30 hover:bg-purple-500/[0.10]"
        >
            <ShieldCheck
                size={14}
                className="text-purple-400"
            />

            <span className="text-[8px] font-black text-white">
                Student Mode
            </span>
        </button>
    );
}