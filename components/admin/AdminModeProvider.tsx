"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "raillearn_admin_student_mode";

type AdminModeContextType = {
    studentMode: boolean;
    isNavigating: boolean;
    enableStudentMode: () => void;
    disableStudentMode: () => void;
};

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [studentMode, setStudentMode] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setStudentMode(window.localStorage.getItem(STORAGE_KEY) === "true");
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        setStudentMode(window.localStorage.getItem(STORAGE_KEY) === "true");
        setIsNavigating(false);
    }, [pathname, hydrated]);

    function changeMode(nextMode: boolean, destination: string) {
        if (isNavigating) return;

        if (nextMode) {
            window.localStorage.setItem(STORAGE_KEY, "true");
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }

        setStudentMode(nextMode);
        setIsNavigating(true);
        router.replace(destination);
    }

    function enableStudentMode() {
        changeMode(true, "/dashboard");
    }

    function disableStudentMode() {
        changeMode(false, "/admin");
    }

    return (
        <AdminModeContext.Provider
            value={{ studentMode, isNavigating, enableStudentMode, disableStudentMode }}
        >
            {children}
        </AdminModeContext.Provider>
    );
}

export function useAdminMode() {
    const context = useContext(AdminModeContext);
    if (!context) {
        throw new Error("useAdminMode must be used inside AdminModeProvider");
    }
    return context;
}
