"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useFloatingChat } from "@/lib/store/floating-chat-store";

interface CtaChatButtonProps {
    className?: string;
    children?: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    ariaLabel?: string;
}

export function CtaChatButton({ className, children, variant, size, ariaLabel }: CtaChatButtonProps) {
    const { setIsMenuOpen } = useFloatingChat();

    return (
        <Button
            onClick={() => setIsMenuOpen(true)}
            variant={variant}
            size={size}
            className={className}
            aria-label={ariaLabel}
        >
            {children}
        </Button>
    );
}
