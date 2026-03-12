"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error";

interface ToastProps {
    message: string;
    type: ToastType;
    onDone: () => void;
}

export function Toast({ message, type, onDone }: ToastProps) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), 1800);
        const doneTimer = setTimeout(() => onDone(), 2100);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isSuccess = type === "success";

    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                background: "var(--surface-el)",
                border: `1px solid ${isSuccess ? "var(--green-border)" : "var(--red-border)"}`,
                borderRadius: "var(--radius)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                color: "var(--text-1)",
                fontSize: "13px",
                fontFamily: "var(--font, sans-serif)",
                whiteSpace: "nowrap",
                animation: exiting
                    ? "toastOut 0.3s ease forwards"
                    : "toastIn 0.3s ease forwards",
                pointerEvents: "none",
            }}
            role="status"
            aria-live="polite"
        >
            {/* Icon */}
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: isSuccess ? "var(--green-dim)" : "var(--red-dim)",
                    border: `1px solid ${isSuccess ? "var(--green-border)" : "var(--red-border)"}`,
                    flexShrink: 0,
                }}
            >
                {isSuccess ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                            d="M2 5.5L4 7.5L8 3"
                            stroke="var(--green)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                            d="M3 3L7 7M7 3L3 7"
                            stroke="var(--red)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </span>

            {/* Message */}
            <span style={{ color: "var(--text-2)" }}>{message}</span>
        </div>
    );
}
