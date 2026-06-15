"use client";

import { useState, useEffect } from "react";

interface UseProjectPaginationOptions<T> {
    initialData: T[];
    totalCount: number;
    query?: string;
    status?: string;
}

interface UseProjectPaginationResult<T> {
    data: T[];
    hasMore: boolean;
    isLoading: boolean;
    loadMore: () => Promise<void>;
}

/**
 * Hook untuk mengelola paginasi daftar proyek dengan fitur load-more.
 * Mengambil data tambahan dari endpoint `/api/projects` secara incremental.
 * Dipakai bersama oleh `ProjectAccordionList` dan `ProjectsDataTable`.
 */
export function useProjectPagination<T>({
    initialData,
    totalCount,
    query,
    status,
}: UseProjectPaginationOptions<T>): UseProjectPaginationResult<T> {
    const [data, setData] = useState<T[]>(initialData);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Sinkronisasi ulang data saat server props berubah (filter, pencarian, dll)
    useEffect(() => {
        setData(initialData);
        setPage(1);
    }, [initialData]);

    const hasMore = data.length < totalCount;

    /** Memuat halaman berikutnya dari proyek via API */
    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const nextPage = page + 1;
            const params = new URLSearchParams({
                page: nextPage.toString(),
                limit: "10",
            });
            if (query) params.append("query", query);
            if (status) params.append("status", status);

            const res = await fetch(`/api/projects?${params.toString()}`);
            if (!res.ok) throw new Error("Gagal mengambil data proyek");

            const newData = (await res.json()) as T[];
            setData((prev) => [...prev, ...newData]);
            setPage(nextPage);
        } catch (error) {
            console.error("Gagal memuat lebih banyak proyek:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, hasMore, isLoading, loadMore };
}
