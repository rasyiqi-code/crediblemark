"use client";

import { useEffect, useState, useRef } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

export function GlobalLoader() {
    const [visible, setVisible] = useState(false);
    const [fading, setFading] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const failsafeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleStop = () => {
            if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
            if (!startTimeRef.current) return;
            
            const elapsed = Date.now() - startTimeRef.current;
            const minDuration = 2000; // Durasi minimum dikurangi sedikit ke 2 detik agar lebih responsif
            const remaining = Math.max(0, minDuration - elapsed);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
                setFading(true);
                
                if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
                // Menunggu transisi fade-out selama 300ms selesai sebelum menyembunyikan komponen sepenuhnya
                fadeTimeoutRef.current = setTimeout(() => {
                    setVisible(false);
                    setFading(false);
                    startTimeRef.current = null;
                }, 300);
            }, remaining);
        };

        const handleStart = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
            if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
            
            startTimeRef.current = Date.now();
            setFading(false);
            setVisible(true);

            // Failsafe: Tutup loading screen jika stuck lebih dari 5 detik
            failsafeTimeoutRef.current = setTimeout(() => {
                handleStop();
            }, 5000);
        };

        // Daftarkan event listener global
        window.addEventListener("crediblemark-loading-start", handleStart);
        window.addEventListener("crediblemark-loading-stop", handleStop);

        // Periksa apakah layar loading bawaan Next.js sedang aktif di DOM saat inisialisasi awal
        const isInitialLoading = document.getElementById("native-loading-marker") !== null;
        if (isInitialLoading) {
            handleStart();
            // Khusus loading awal, jika sudah terpasang di client, picu stop dengan durasi minimum
            // karena proses render halaman utama sebenarnya sudah hampir/selesai dilakukan
            setTimeout(() => {
                handleStop();
            }, 100);
        }

        return () => {
            window.removeEventListener("crediblemark-loading-start", handleStart);
            window.removeEventListener("crediblemark-loading-stop", handleStop);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
            if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
                fading ? "opacity-0 pointer-events-none" : "opacity-100 bg-black pointer-events-auto"
            }`}
        >
            <LoadingScreen />
        </div>
    );
}
