"use client";

import { useState } from "react";
import { submitToWaitlist } from "@/lib/waitlist";

let bannerDismissed = false;

export default function ProNotifyBanner() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [visible, setVisible] = useState(!bannerDismissed);
    const [shake, setShake] = useState(false);
    const [active, setActive] = useState(false);

    if (!visible) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (status === "loading" || status === "success") return;
        
        setStatus("loading");
        const result = await submitToWaitlist(email, "tool-banner");
        
        if (result.success) {
            setStatus("success");
        } else {
            setStatus("error");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            setTimeout(() => setStatus("idle"), 2000); // Clear error eventually to allow typing again normally
        }
    }

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <div style={{
                height: "44px",
                background: "var(--surface-el)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                gap: "12px"
            }}>
                {/* Left text */}
                <div style={{
                    fontSize: "12px",
                    color: "var(--text-3)",
                    fontFamily: "var(--mono)",
                    whiteSpace: "nowrap",
                    flexShrink: 0
                }}>
                    ⚡ Pro coming soon —
                </div>

                {/* Center / Form */}
                {status === "success" ? (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        maxWidth: "320px",
                        animation: "fadeIn 0.2s ease",
                        fontSize: "12px",
                        color: "var(--green)",
                        fontFamily: "var(--mono)",
                        fontWeight: 500
                    }}>
                        ✓ You're on the list.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        maxWidth: "320px"
                    }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            disabled={status === "loading"}
                            style={{
                                flex: 1,
                                height: "28px",
                                background: "var(--surface)",
                                border: `1px solid ${status === "error" ? "var(--red)" : "var(--border)"}`,
                                borderRadius: "5px",
                                padding: "0 10px",
                                fontSize: "12px",
                                color: "var(--text-1)",
                                outline: "none",
                                animation: shake ? "shake 0.4s ease-in-out" : "none",
                                transition: "border-color 0.15s ease"
                            }}
                            onFocus={(e) => {
                                if (status !== "error") e.target.style.borderColor = "var(--border-focus)";
                            }}
                            onBlur={(e) => {
                                if (status !== "error") e.target.style.borderColor = "var(--border)";
                            }}
                        />
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            onMouseDown={() => setActive(true)}
                            onMouseUp={() => setActive(false)}
                            onMouseLeave={() => setActive(false)}
                            style={{
                                height: "28px",
                                padding: "0 12px",
                                background: "var(--green)",
                                color: "#0a0a0a",
                                border: "none",
                                borderRadius: "5px",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                flexShrink: 0,
                                opacity: status === "loading" ? 0.6 : 1,
                                transition: "opacity 0.15s ease, transform 0.05s ease",
                                transform: active ? "scale(0.97)" : "none",
                            }}
                        >
                            Get notified
                        </button>
                    </form>
                )}

                {/* Right dismiss */}
                <button
                    onClick={() => {
                        bannerDismissed = true;
                        setVisible(false);
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-4)",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "4px",
                        lineHeight: 1,
                        transition: "color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-4)"}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
