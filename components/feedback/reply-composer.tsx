"use client";

import { useState, useTransition } from "react";
import { File as FileIcon, X, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface ReplyComposerProps {
    feedbackId: string;
    projectId: string;
}

/**
 * Komponen form balasan (reply) untuk sebuah feedback item.
 * Mendukung lampiran file dan pengiriman dengan Enter.
 * Diekstrak dari `board.tsx` agar mudah diuji dan dikelola secara mandiri.
 */
export function ReplyComposer({ feedbackId, projectId }: ReplyComposerProps) {
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("feedbackId", feedbackId);
        formData.append("content", content);
        if (file) formData.append("imageFile", file);

        startTransition(async () => {
            await fetch("/api/feedback", {
                method: "POST",
                body: formData,
            });
            setContent("");
            setFile(null);
            router.refresh();
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 pl-3 border-l border-white/10">
            {file && (
                <div className="mb-2 flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-md border border-white/5 w-fit">
                    <div className="p-1 bg-blue-500/10 rounded">
                        <FileIcon className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-zinc-300 max-w-[150px] truncate">{file.name}</span>
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-1 p-0.5 text-zinc-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div className="relative">
                <Input
                    id={`reply-${feedbackId}`}
                    placeholder="Write a reply..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isPending}
                    className="h-8 text-xs bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900 text-zinc-300 placeholder:text-zinc-600 rounded-md pr-16 transition-all"
                />
                <div className="absolute right-1 top-1 flex items-center gap-0.5">
                    {/* Tombol lampiran file */}
                    <input
                        type="file"
                        id={`reply-file-${feedbackId}`}
                        className="hidden"
                        onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    />
                    <button
                        type="button"
                        onClick={() => document.getElementById(`reply-file-${feedbackId}`)?.click()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${file ? "text-blue-400" : "text-zinc-600 hover:text-zinc-400"}`}
                        title={file ? file.name : "Attach File"}
                    >
                        <Paperclip className="w-3 h-3" />
                    </button>
                    {/* Tombol kirim */}
                    <Button
                        size="icon"
                        type="submit"
                        disabled={isPending || !content.trim()}
                        className="h-6 w-6 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40"
                    >
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
