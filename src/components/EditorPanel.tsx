"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Syntax Highlighter ────────────────────────────────── */
function highlightLine(line: string): string {
    const e = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return e.replace(
        /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b)|(\bnull\b)|([-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (_m, str, colon, bool, nil, num) => {
            if (str && colon) return `<span style="color:var(--blue)">${str}</span>${colon}`;
            if (str) return `<span style="color:var(--green)">${str}</span>`;
            if (bool) return `<span style="color:var(--red)">${bool}</span>`;
            if (nil) return `<span style="color:var(--text-3)">${nil}</span>`;
            if (num) return `<span style="color:var(--yellow)">${num}</span>`;
            return _m;
        }
    );
}

/* ─── Props ─────────────────────────────────────────────── */
interface EditorPanelProps {
    label: string;
    value: string;
    onChange?: (val: string) => void;
    readonly?: boolean;
    hasError?: boolean;
    hasSuccess?: boolean;
    errorMsg?: string;
    onExample?: () => void;
    showExample?: boolean;
    placeholder?: string;
}

export function EditorPanel({
    label, value, onChange, readonly = false,
    hasError = false, hasSuccess = false,
    errorMsg, onExample, showExample = false, placeholder,
}: EditorPanelProps) {
    /* ── Shake on new error ── */
    const [shaking, setShaking] = useState(false);
    const prevError = useRef(false);

    useEffect(() => {
        if (hasError && !prevError.current) {
            setShaking(true);
            const t = setTimeout(() => setShaking(false), 400);
            return () => clearTimeout(t);
        }
        prevError.current = hasError ?? false;
    }, [hasError]);

    const lines = value ? value.split("\n") : [""];
    const lineCount = lines.length;

    /* ── Border color ── */
    const borderColor = hasError ? "var(--red)" : hasSuccess ? "var(--green)" : "transparent";

    const lineNumbersRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
            borderLeft: `2px solid ${borderColor}`, transition: "border-color 0.2s",
            animation: shaking ? "shake 0.4s ease" : "none",
        }}>
            {/* Header */}
            <div style={{
                height: "36px", minHeight: "36px", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "0 14px",
                background: "var(--surface-el)", borderBottom: "1px solid var(--border)", flexShrink: 0,
            }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {label}
                </span>
                {showExample && onExample && (
                    <ExampleBtn onClick={onExample} />
                )}
            </div>

            {/* Editor area */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Line numbers */}
                <div
                    ref={lineNumbersRef}
                    style={{
                        width: "44px", flexShrink: 0, background: "var(--surface)",
                        borderRight: "1px solid var(--border)", overflowY: "hidden",
                        paddingTop: "14px", paddingBottom: "14px", userSelect: "none",
                    }}>
                    {(value || "").split("\n").map((_, i) => (
                        <div key={i} style={{
                            fontFamily: "var(--mono)", fontSize: "12px", color: "var(--text-4)",
                            lineHeight: "21px", textAlign: "right", paddingRight: "10px",
                        }}>{i + 1}</div>
                    ))}
                    {!value && (
                        <div style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--text-4)", lineHeight: "21px", textAlign: "right", paddingRight: "10px" }}>1</div>
                    )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                    {!readonly ? (
                        <textarea
                            suppressHydrationWarning
                            data-gramm="false"
                            value={value}
                            onChange={e => onChange?.(e.target.value)}
                            onScroll={handleScroll}
                            placeholder={placeholder || "Paste JSON here…"}
                            spellCheck={false}
                            wrap="off"
                            style={{
                                width: "100%", height: "100%", border: "none", outline: "none", resize: "none",
                                background: "var(--surface)", color: "var(--text-1)",
                                fontFamily: "var(--mono)", fontSize: "13px", lineHeight: "21px",
                                caretColor: "var(--green)", padding: "14px 14px 14px 12px",
                                boxSizing: "border-box", overflowY: "auto", overflowX: "auto", whiteSpace: "nowrap",
                            }}
                        />
                    ) : (
                        <div
                            onScroll={handleScroll}
                            style={{
                                width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden",
                                background: "var(--surface)", fontFamily: "var(--mono)", fontSize: "13px",
                                lineHeight: "21px", padding: "14px 14px 14px 12px", boxSizing: "border-box",
                            }}>
                            {value ? (
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                                    {value.split("\n").map((line, i) => (
                                        <div key={i} dangerouslySetInnerHTML={{ __html: highlightLine(line) || "&ZeroWidthSpace;" }} />
                                    ))}
                                </pre>
                            ) : (
                                <span style={{ color: "var(--text-3)" }}>{placeholder || "Output will appear here…"}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Error bar */}
            {hasError && errorMsg && (
                <div style={{
                    background: "var(--red-dim)", borderTop: "1px solid var(--red-border)",
                    padding: "9px 14px", animation: "fadeIn 0.2s ease", flexShrink: 0,
                }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--red)" }}>✕ {errorMsg}</span>
                </div>
            )}

            {/* Stats bar */}
            <div style={{
                height: "28px", flexShrink: 0, display: "flex", alignItems: "center",
                justifyContent: "flex-end", padding: "0 14px",
                background: "var(--surface-el)", borderTop: "1px solid var(--border)",
            }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>
                    {value.length} chars · {lineCount} {lineCount === 1 ? "line" : "lines"}
                </span>
            </div>
        </div>
    );
}

/* ─── Example Button ────────────────────────────────────── */
function ExampleBtn({ onClick }: { onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "var(--mono)", fontSize: "11px",
                color: hov ? "var(--text-2)" : "var(--text-3)", transition: "color 0.15s",
                padding: "0",
            }}
        >
            Try an example →
        </button>
    );
}
