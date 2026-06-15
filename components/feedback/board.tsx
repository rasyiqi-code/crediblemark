"use client"

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Send, Paperclip, X, File as FileIcon, Link2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FeedbackItem } from "@/lib/shared/types";
import { ReplyComposer } from "./reply-composer";

interface FeedbackBoardProps {
    projectId: string;
    feedbacks: FeedbackItem[];
}

export function FeedbackBoard({ projectId, feedbacks }: FeedbackBoardProps) {
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState(""); // Legacy/Manual URL support
    const [file, setFile] = useState<File | null>(null); // New File Support
    const [preview, setPreview] = useState<string | null>(null);
    const [showImageInput, setShowImageInput] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Helper to determine if file/url is an image
    const isImage = (fileOrUrl: File | string | null) => {
        if (!fileOrUrl) return false;
        if (typeof fileOrUrl === 'string') {
            return fileOrUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) != null;
        }
        return fileOrUrl.type.startsWith('image/');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
            setShowImageInput(false); // Hide manual URL input if file selected
        }
    };

    const clearFile = () => {
        setFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const formData = new FormData();
        formData.append('projectId', projectId); // Required for file path and revalidation
        formData.append('content', content);
        if (imageUrl) formData.append('imageUrl', imageUrl);
        if (file) formData.append('imageFile', file);

        startTransition(async () => {
            await fetch('/api/feedback', {
                method: 'POST',
                body: formData,
            });
            setContent("");
            setImageUrl("");
            clearFile();
            setShowImageInput(false);
            router.refresh();
        });
    };

    const handleToggle = async (id: string, status: string) => {
        startTransition(async () => {
            await fetch('/api/feedback', {
                method: 'PATCH',
                body: JSON.stringify({ id, status, projectId }),
                headers: { 'Content-Type': 'application/json' }
            });
            router.refresh();
        });
    }

    const openFeedbacks = feedbacks.filter(f => f.status === 'open');
    const resolvedFeedbacks = feedbacks.filter(f => f.status === 'resolved');

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Minimal Form */}
            <form onSubmit={handleSubmit} className="relative group">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all shadow-sm">

                    {/* File Preview Section */}
                    {preview && (
                        <div className="px-3 pt-3 pb-0">
                            <div className="relative inline-flex items-center gap-3 p-2 pr-8 rounded-lg border border-white/10 bg-zinc-800 group/preview">
                                {file && isImage(file) ? (
                                    <div className="relative w-10 h-10 rounded overflow-hidden border border-white/10 shrink-0">
                                        <Image src={preview} alt="Preview" fill className="object-cover" sizes="40px" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded border border-white/10 bg-zinc-900 flex items-center justify-center shrink-0">
                                        <FileIcon className="w-5 h-5 text-zinc-400" />
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0 max-w-[12rem]">
                                    <span className="text-[10px] font-medium text-zinc-300 truncate">
                                        {file?.name || "Attachment"}
                                    </span>
                                    <span className="text-[9px] text-zinc-500">
                                        {(file?.size ? (file.size / 1024).toFixed(0) + 'KB' : '')}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="absolute top-1 right-1 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Text Input */}
                    <Textarea
                        placeholder="Type a message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 bg-transparent resize-none text-xs text-zinc-200 placeholder:text-zinc-600 py-3 px-3 leading-relaxed"
                        disabled={isPending}
                    />

                    {/* Toolbar / Footer */}
                    <div className="flex items-center justify-between px-2 py-2 bg-zinc-900/30 border-t border-white/5">
                        <div className="flex items-center gap-1">
                            {/* File Inputs Group */}
                            {!showImageInput && !file && (
                                <>
                                    <input
                                        type="file"
                                        id="feedback-file-input"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        disabled={isPending}
                                    />
                                    <Button
                                        size="icon"
                                        type="button"
                                        onClick={() => document.getElementById('feedback-file-input')?.click()}
                                        className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
                                        title="Attach File"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        type="button"
                                        onClick={() => setShowImageInput(true)}
                                        className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
                                        title="Link URL"
                                    >
                                        <Link2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}

                            {/* Manual URL Input Mode */}
                            {showImageInput && !file && (
                                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <div className="relative">
                                        <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                        <Input
                                            placeholder="https://..."
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="h-7 w-[200px] pl-8 text-xs bg-zinc-950/50 border-zinc-800 text-zinc-300 focus-visible:ring-0 focus-visible:border-blue-500/50"
                                            autoFocus
                                        />
                                    </div>
                                    <Button
                                        size="icon"
                                        type="button"
                                        onClick={() => setShowImageInput(false)}
                                        className="h-7 w-7 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-[10px] text-zinc-600 hidden sm:block">
                                <span className="font-medium text-zinc-500">Enter</span> to send
                            </div>
                            <Button
                                size="sm"
                                type="submit"
                                disabled={isPending || !content.trim()}
                                className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 text-xs font-medium gap-1.5 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <span>Send</span>
                                <Send className="w-3 h-3 opacity-90" />
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Lists */}
            <div className="flex-1 space-y-4">
                {/* Open Issues */}
                {openFeedbacks.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Open Issues ({openFeedbacks.length})
                            </h3>
                        </div>
                        {openFeedbacks.map(f => (
                            <div key={f.id} className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg text-xs flex gap-3 group transition-colors">
                                <button
                                    className="h-4 w-4 shrink-0 text-red-500/50 hover:text-green-500 transition-colors mt-0.5"
                                    onClick={() => handleToggle(f.id, f.status)}
                                >
                                    <Circle className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1">
                                    <p className="text-zinc-300">{f.content}</p>
                                    {f.imageUrl && (
                                        <div className="mt-2 relative rounded-md overflow-hidden border border-white/5 max-w-[200px] bg-zinc-900 group/attachment">
                                            {f.imageUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                                                <div className="aspect-video relative">
                                                    <Image
                                                        src={f.imageUrl}
                                                        alt="Feedback attachment"
                                                        fill
                                                        className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                                                        sizes="(max-width: 768px) 100vw, 200px"
                                                    />
                                                    <a href={f.imageUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0" />
                                                </div>
                                            ) : (
                                                <a href={f.imageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 hover:bg-white/5 transition-colors">
                                                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                                                        <FileIcon className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[10px] text-zinc-300 truncate max-w-[150px] font-medium">
                                                            {f.imageUrl.split('/').pop()?.split('-').slice(1).join('-') || "Attachment"}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500 uppercase">Download</span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Bar */}
                                    <div className="mt-3 flex items-center gap-3">
                                        <button
                                            className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 group/reply"
                                            onClick={() => setReplyingTo(replyingTo === f.id ? null : f.id)}
                                        >
                                            <MessageSquare className="w-3 h-3 group-hover/reply:text-blue-400 transition-colors" />
                                            Reply
                                        </button>
                                        <span className="text-[10px] text-zinc-600">•</span>
                                        <span className="text-[10px] text-zinc-600 block">
                                            {new Date(f.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Comments Section */}
                                    {(f.comments && f.comments.length > 0) && (
                                        <div className="mt-3 pl-3 border-l border-white/10 space-y-3">
                                            {f.comments.map((comment) => (
                                                <div key={comment.id} className="relative">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] font-semibold ${comment.role === 'admin' ? 'text-blue-400' : 'text-zinc-400'}`}>
                                                                    {comment.role === 'admin' ? 'Admin' : 'Client'}
                                                                </span>
                                                                <span className="text-[9px] text-zinc-600">
                                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-zinc-300 leading-relaxed">{comment.content}</p>
                                                            {comment.imageUrl && (
                                                                <a
                                                                    href={comment.imageUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded border border-white/5 text-[10px] text-neutral-400 hover:text-white hover:border-white/10 transition-all"
                                                                >
                                                                    <Paperclip className="w-3 h-3" />
                                                                    Attachment
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Composer */}
                                    {replyingTo === f.id && (
                                        <ReplyComposer feedbackId={f.id} projectId={projectId} />
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resolved Issues */}
            {resolvedFeedbacks.length > 0 && (
                <div className="space-y-2 pt-2">
                    <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">
                        Resolved
                    </h3>
                    {resolvedFeedbacks.map(f => (
                        <div key={f.id} className="p-2 pl-3 bg-zinc-900/20 border border-white/5 rounded-lg text-xs flex gap-3 opacity-50 hover:opacity-100 transition-opacity">
                            <button
                                className="h-4 w-4 shrink-0 text-emerald-500 hover:text-red-500 transition-colors mt-0.5"
                                onClick={() => handleToggle(f.id, f.status)}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex-1">
                                <p className="text-zinc-500 line-through decoration-zinc-700">{f.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {feedbacks.length === 0 && (
                <div className="text-center py-8">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                    </div>
                    <p className="text-xs text-zinc-500">All systems operational.</p>
                </div>
            )}
        </div>
    );
}
