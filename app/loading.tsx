"use client";

import { useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

export default function Loading() {
    useEffect(() => {
        // Kirim event untuk memberitahu global loader agar tetap menampilkan overlay loading
        window.dispatchEvent(new CustomEvent("crediblemark-loading-start"));
        
        return () => {
            // Kirim event selesai loading untuk memulai transisi fade out global loader
            window.dispatchEvent(new CustomEvent("crediblemark-loading-stop"));
        };
    }, []);

    return <LoadingScreen />;
}
