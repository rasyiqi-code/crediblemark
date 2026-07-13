"use client";

import React from "react";
import { useFloatingChat } from "@/lib/store/floating-chat-store";

interface ChatTriggerProps {
    className?: string;
    children: React.ReactNode;
    asButton?: boolean;
}

export function ChatTrigger({ className, children, asButton = false }: ChatTriggerProps) {
    const { setIsMenuOpen } = useFloatingChat();

    if (asButton) {
        return (
            <button
                onClick={() => setIsMenuOpen(true)}
                className={className}
                type="button"
            >
                {children}
            </button>
        );
    }

    return (
        <span
            onClick={() => setIsMenuOpen(true)}
            className={`${className} cursor-pointer`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    setIsMenuOpen(true);
                }
            }}
        >
            {children}
        </span>
    );
}
