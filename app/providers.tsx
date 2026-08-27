"use client";

import type { ReactNode } from "react";
import { AdminModeProvider } from "@/components/admin/AdminModeProvider";
import StudentModeBanner from "@/components/admin/StudentModeBanner";

type ProvidersProps = {
    children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
    return (
        <AdminModeProvider>
            <StudentModeBanner />
            {children}
        </AdminModeProvider>
    );
}
