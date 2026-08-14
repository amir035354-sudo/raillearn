"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "raillearn_admin_student_mode";

export default function StudentModeBanner() {
    const router = useRouter();
    const pathname = usePathname();

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (pathname.startsWith("/admin")) {
            setVisible(false);
            return;
        }

        const active =
            window.localStorage.getItem(
                STORAGE_KEY
            ) === "true";

        setVisible(active);
    }, [pathname]);

    function backToAdmin() {
        window.localStorage.removeItem(
            STORAGE_KEY
        );

        setVisible(false);

        router.push("/admin");
    }

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed left-0 right-0 top-0 z-[9999] border-b border-purple-500/20 bg-[#08050d]/95 px-4 py-2.5 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-300">
                        Student Mode
                    </p>

                    <p className="text-[7px] text-zinc-600">
                        You are viewing RailLearn as a student.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={backToAdmin}
                    className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-[7px] font-black text-purple-200"
                >
                    <ArrowLeft size={11} />
                    Back to Admin
                </button>
            </div>
        </div>
    );
}