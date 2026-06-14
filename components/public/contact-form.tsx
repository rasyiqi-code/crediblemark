"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

interface ContactState {
    success?: boolean;
    error?: string;
    fieldErrors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
    };
}

export function ContactForm() {
    const t = useTranslations("ContactForm");
    const tc = useTranslations("Common");
    const searchParams = useSearchParams();
    const defaultSubject = searchParams.get("subject") || "";
    const defaultMessage = searchParams.get("message") || "";
    const [state, setState] = useState<ContactState>({ success: false, error: "", fieldErrors: {} });
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setState({ success: false, error: "", fieldErrors: {} });

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                setState({
                    success: false,
                    error: result.error || tc("error"),
                    fieldErrors: result.fieldErrors || {},
                });
            } else {
                setState({ success: true });
            }
        } catch {
            setState({ success: false, error: t("networkError") });
        } finally {
            setIsPending(false);
        }
    };

    if (state.success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">{t("messageSent")}</h3>
                <p className="text-zinc-400 max-w-xs">
                    {t("thankYou")}
                </p>
                <Button
                    className="mt-4 bg-white text-black hover:bg-zinc-200 font-medium"
                    onClick={() => window.location.reload()}
                >
                    {t("sendAnother")}
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {state.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-zinc-400">{t("firstName")}</Label>
                    <Input
                        name="firstName"
                        id="firstName"
                        required
                        placeholder={t("placeholderFirstName")}
                        className="bg-zinc-900/50 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-zinc-600"
                    />
                    {state.fieldErrors?.firstName?.[0] && <span className="text-xs text-red-400">{state.fieldErrors?.firstName?.[0]}</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-zinc-400">{t("lastName")}</Label>
                    <Input
                        name="lastName"
                        id="lastName"
                        required
                        placeholder={t("placeholderLastName")}
                        className="bg-zinc-900/50 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-zinc-600"
                    />
                    {state.fieldErrors?.lastName?.[0] && <span className="text-xs text-red-400">{state.fieldErrors?.lastName?.[0]}</span>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400">{t("email")}</Label>
                <Input
                    name="email"
                    id="email"
                    type="email"
                    required
                    placeholder={t("placeholderEmail")}
                    className="bg-zinc-900/50 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-zinc-600"
                />
                {state.fieldErrors?.email?.[0] && <span className="text-xs text-red-400">{state.fieldErrors?.email?.[0]}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject" className="text-zinc-400">{t("subject")}</Label>
                <Input
                    name="subject"
                    id="subject"
                    required
                    defaultValue={defaultSubject}
                    placeholder={t("placeholderSubject")}
                    className="bg-zinc-900/50 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-zinc-600"
                />
                {state.fieldErrors?.subject?.[0] && <span className="text-xs text-red-400">{state.fieldErrors?.subject?.[0]}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-400">{t("message")}</Label>
                <Textarea
                    name="message"
                    id="message"
                    required
                    defaultValue={defaultMessage}
                    placeholder={t("placeholderMessage")}
                    className="min-h-[120px] bg-zinc-900/50 border-white/10 focus-visible:ring-blue-500 text-white placeholder:text-zinc-600 resize-none"
                />
                {state.fieldErrors?.message?.[0] && <span className="text-xs text-red-400">{state.fieldErrors?.message?.[0]}</span>}
            </div>

            <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-11"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("sending")}
                    </>
                ) : (
                    <>
                        {t("sendMessage")}
                        <Send className="w-4 h-4 ml-2" />
                    </>
                )}
            </Button>
        </form>
    );
}
