"use client";

import { useEffect } from "react";

export default function PWARegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((error) => {
                console.error("RailLearn Service Worker registration failed:", error);
            });
        }
    }, []);

    return null;
}