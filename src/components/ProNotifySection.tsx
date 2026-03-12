"use client";

import { useState, useEffect } from "react";
import { submitToWaitlist, getWaitlistCount } from "@/lib/waitlist";

export default function ProNotifySection() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [count, setCount] = useState(0);
    const [active, setActive] = useState(false);

    useEffect(() => {
        getWaitlistCount().then(setCount);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (status === "loading" || status === "success") return;
        
        setStatus("loading");
        const result = await submitToWaitlist(email, "homepage-section");
        
        if (result.success) {
            setStatus("success");
        } else {
            setStatus("error");
            setErrorMsg(result.error);
        }
    }

    let socialProof = null;
    if (count > 0 && count <= 50) {
        socialProof = "Be among the first to know.";
    } else if (count > 50 && count <= 200) {
        socialProof = `${count} developers already on the list.`;
    } else if (count > 200) {
        socialProof = `${count} developers waiting. Don't miss it.`;
    }

    return (
        <section style={{
            width: "100%",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--green) 3%, var(--bg)), var(--bg), color-mix(in srgb, var(--blue) 3%, var(--bg)))",
            padding: "72px 32px"
        }}>
            <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
                
                {/* Eyebrow Badge */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "5px 14px",
                    marginBottom: "24px"
                }}>
                    <span style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--yellow)",
                        animation: "pulse 2s infinite"
                    }} />
                    <span style={{
                        fontSize: "11px",
                        fontFamily: "var(--mono)",
                        color: "var(--text-2)",
                        letterSpacing: "0.08em"
                    }}>PRO TIER — COMING SOON</span>
                </div>

                {/* Heading */}
                <h2 style={{
                    fontSize: "clamp(24px, 4vw, 36px)",
                    fontWeight: 600,
                    letterSpacing: "-0.5px",
                    color: "var(--text-1)",
                    marginBottom: "16px",
                    fontFamily: "var(--font-display)"
                }}>
                    Be first to know when Pro launches.
                </h2>

                {/* Subtext */}
                <p style={{
                    fontSize: "15px",
                    color: "var(--text-2)",
                    lineHeight: 1.75,
                    marginBottom: "12px",
                    marginTop: 0
                }}>
                    Pro will include saved collections, unlimited history, bulk processing, and a VS Code extension. No spam. One email when it's ready.
                </p>

                {/* Social Proof Line */}
                <div style={{
                    fontSize: "12px",
                    color: "var(--text-3)",
                    fontFamily: "var(--mono)",
                    marginBottom: "32px",
                    minHeight: "18px"
                }}>
                    {socialProof}
                </div>

                {/* Form or Success State */}
                {status === "success" ? (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        maxWidth: "440px",
                        margin: "0 auto",
                        background: "var(--green-dim)",
                        border: "1px solid var(--green-border)",
                        borderRadius: "8px",
                        padding: "16px 20px",
                        animation: "fadeUp 0.3s ease",
                        textAlign: "left"
                    }}>
                        <div style={{
                            width: "28px",
                            height: "28px",
                            flexShrink: 0,
                            borderRadius: "50%",
                            background: "var(--green-dim)",
                            border: "1px solid var(--green-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            color: "var(--green)"
                        }}>
                            ✓
                        </div>
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-1)" }}>
                                You're on the list.
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "3px" }}>
                                We'll send one email when Pro launches. That's it.
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} style={{
                            display: "flex",
                            gap: "8px",
                            maxWidth: "440px",
                            margin: "0 auto"
                        }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={status === "loading"}
                                style={{
                                    flex: 1,
                                    height: "44px",
                                    background: "var(--surface)",
                                    border: `1px solid ${status === "error" ? "var(--red)" : "var(--border)"}`,
                                    borderRadius: "8px",
                                    padding: "0 16px",
                                    color: "var(--text-1)",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.15s ease",
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
                                    height: "44px",
                                    padding: "0 20px",
                                    background: "var(--green)",
                                    color: "#0a0a0a",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: status === "loading" ? "default" : "pointer",
                                    flexShrink: 0,
                                    transition: "opacity 0.15s ease, transform 0.05s ease",
                                    transform: active ? "scale(0.97)" : "none",
                                    opacity: status === "loading" ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                {status === "loading" ? (
                                    <span style={{
                                        width: "16px",
                                        height: "16px",
                                        border: "2px solid #0a0a0a",
                                        borderTop: "2px solid transparent",
                                        borderRadius: "50%",
                                        animation: "spin 0.7s linear infinite",
                                        display: "inline-block"
                                    }} />
                                ) : (
                                    "Notify me"
                                )}
                            </button>
                        </form>
                        {status === "error" && (
                            <div style={{
                                marginTop: "8px",
                                textAlign: "left",
                                maxWidth: "440px",
                                margin: "8px auto 0",
                                fontSize: "12px",
                                color: "var(--red)",
                                fontFamily: "var(--mono)",
                                animation: "fadeIn 0.2s ease"
                            }}>
                                ✕ {errorMsg}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
