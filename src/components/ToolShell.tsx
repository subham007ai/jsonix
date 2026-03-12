"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorPanel } from "./EditorPanel";
import { Toast } from "./Toast";
import { Tool } from "./tools-data";
import ProNotifyBanner from "./ProNotifyBanner";

/* ─── Module-level session state (not localStorage) ─────── */
let hintDismissed = false;

/* ─── Props ─────────────────────────────────────────────── */
interface ToolShellProps {
    tool: Tool;
    input: string;
    setInput: (val: string) => void;
    output: string;
    error: string | null;
    indent: string;
    setIndent: (val: string) => void;
    isProcessing: boolean;
    hasRun: boolean;
    onRun: () => void;
    onCopy: () => void;
    onClear: () => void;
    onShare: () => void;
    onExample: () => void;
    inputFooter?: React.ReactNode;
    outputFooter?: React.ReactNode;
}

export function ToolShell({
    tool, input, setInput, output, error,
    indent, setIndent, isProcessing, hasRun,
    onRun, onCopy, onClear, onShare, onExample,
    inputFooter, outputFooter
}: ToolShellProps) {
    const router = useRouter();
    const [showHint, setShowHint] = useState(!hintDismissed);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [activeTab, setActiveTab] = useState<"input" | "output">("input");
    const [splitPercent, setSplitPercent] = useState(50);
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    /* ── Auto-dismiss hint ── */
    useEffect(() => {
        if (hintDismissed) return;
        const t = setTimeout(() => { setShowHint(false); hintDismissed = true; }, 5000);
        return () => clearTimeout(t);
    }, []);

    /* ── Auto-switch to output tab on run ── */
    useEffect(() => {
        if (hasRun) setActiveTab("output");
    }, [hasRun]);

    /* ── Toast helper ── */
    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg); setToastType(type);
    }, []);

    /* ── Wrapped handlers that show toasts ── */
    const handleCopy = useCallback(() => {
        onCopy(); showToast("Output copied to clipboard");
    }, [onCopy, showToast]);

    const handleShare = useCallback(() => {
        onShare(); showToast("Shareable link copied");
    }, [onShare, showToast]);

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onRun(); }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") { e.preventDefault(); handleCopy(); }
            if (e.key === "Escape") { e.preventDefault(); onClear(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onRun, handleCopy, onClear]);

    /* ── Draggable divider ── */
    const dividerRef = useRef<HTMLDivElement>(null);

    const onDividerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onDividerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setSplitPercent(Math.min(Math.max(pct, 20), 80));
    };
    const onDividerUp = () => { isDragging.current = false; };

    const dismissHint = () => { setShowHint(false); hintDismissed = true; };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
            {/* ── Zone 1: Toolbar ── */}
            <div style={{
                marginTop: "52px", height: "56px", flexShrink: 0,
                background: "var(--surface-el)", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", padding: "0 20px", gap: "12px",
            }}>
                <BackBtn onClick={() => router.push("/")} />
                <div style={{ width: "1px", height: "20px", background: "var(--border)", flexShrink: 0 }} />
                <ToolInfo tool={tool} />
                <div style={{ flex: 1 }} />
                <IndentControl value={indent} onChange={setIndent} />
                <RunBtn label="Format" isProcessing={isProcessing} onClick={onRun} />
                <SecBtn onClick={handleCopy}>Copy</SecBtn>
                <SecBtn onClick={onClear}>Clear</SecBtn>
                <SecBtn onClick={handleShare}>Share ↗</SecBtn>
            </div>

            {/* ── Zone 2: Hint bar ── */}
            {showHint && (
                <div style={{
                    height: "30px", flexShrink: 0, display: "flex", alignItems: "center",
                    padding: "0 20px", gap: "6px",
                    background: "var(--blue-dim)", borderBottom: "1px solid var(--blue)",
                    animation: "slideDown 0.3s ease",
                }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-2)", fontWeight: 600 }}>Tip:</span>
                    {[["⌘↵", "Run"], ["⌘⇧C", "Copy"], ["Esc", "Clear"]].map(([key, lbl]) => (
                        <span key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <kbd style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "1px 5px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--text-2)" }}>{key}</kbd>
                            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>{lbl}</span>
                        </span>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button onClick={dismissHint} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", padding: 0 }}>dismiss ×</button>
                </div>
            )}

            {/* ── Zone 3: Mobile tabs (visible <768px) ── */}
            <div style={{ display: "flex", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }} className="mobile-tabs">
                {(["input", "output"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, height: "38px", border: "none", cursor: "pointer",
                        background: "transparent", fontFamily: "var(--mono)", fontSize: "12px",
                        color: activeTab === tab ? "var(--green)" : "var(--text-3)",
                        borderBottom: activeTab === tab ? "2px solid var(--green)" : "2px solid transparent",
                        transition: "all 0.15s",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{tab}</button>
                ))}
            </div>

            {/* ── Zone 4: Panels ── */}
            <div ref={containerRef} style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {/* Input panel */}
                <div style={{ flex: "none", width: `${splitPercent}%`, overflow: "hidden", display: "flex", flexDirection: "column" }} className={`panel-side panel-input tab-${activeTab}`}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <EditorPanel
                            label="INPUT" value={input} onChange={setInput}
                            hasError={!!error} errorMsg={error ?? undefined}
                            hasSuccess={hasRun && !error}
                            showExample onExample={onExample}
                        />
                    </div>
                    {inputFooter}
                </div>

                {/* Draggable divider */}
                <div
                    ref={dividerRef}
                    onMouseDown={e => e.preventDefault()}
                    onPointerDown={onDividerDown}
                    onPointerMove={onDividerMove}
                    onPointerUp={onDividerUp}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--blue)")}
                    onMouseLeave={e => { if (!isDragging.current) e.currentTarget.style.background = "var(--border)"; }}
                    className="desktop-divider"
                    style={{ width: "4px", flexShrink: 0, cursor: "col-resize", background: "var(--border)", transition: "background 0.15s", userSelect: "none" }}
                />

                {/* Output panel */}
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }} className={`panel-side panel-output tab-${activeTab}`}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <EditorPanel
                            label="OUTPUT" value={output} readonly
                            hasError={!!error && hasRun} hasSuccess={hasRun && !error}
                            placeholder="Output will appear here…"
                        />
                    </div>
                    {outputFooter}
                </div>
            </div>

            {/* Toast */}
            {toastMsg && (
                <Toast message={toastMsg} type={toastType} onDone={() => setToastMsg(null)} />
            )}

            {/* Responsive styles */}
            <style>{`
        .mobile-tabs { display: none; }
        .desktop-divider { display: flex; }
        @media (max-width: 768px) {
          .mobile-tabs { display: flex !important; }
          .desktop-divider { display: none !important; }
          .panel-side { width: 100% !important; flex: 1 !important; }
          .panel-input.tab-output { display: none; }
          .panel-output.tab-input { display: none; }
        }
        @media (max-width: 639px) {
          .indent-control { display: none !important; }
        }
      `}</style>
            
            <ProNotifyBanner />
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────── */
function BackBtn({ onClick }: { onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: "5px 10px", background: "transparent",
            border: `1px solid ${hov ? "var(--border-hover)" : "var(--border)"}`,
            borderRadius: "6px", fontSize: "12px", color: hov ? "var(--text-2)" : "var(--text-3)",
            cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
        }}>← Back</button>
    );
}

function ToolInfo({ tool }: { tool: Tool }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div style={{
                width: "24px", height: "24px", borderRadius: "5px", flexShrink: 0,
                background: `color-mix(in srgb, var(${tool.color}) 12%, transparent)`,
                border: `1px solid color-mix(in srgb, var(${tool.color}) 25%, transparent)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: "11px", color: `var(${tool.color})`,
            }}>{tool.icon}</div>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-1)", whiteSpace: "nowrap" }}>{tool.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tool.desc}</div>
            </div>
        </div>
    );
}

function IndentControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const segments = [{ label: "2sp", val: "2" }, { label: "4sp", val: "4" }, { label: "tab", val: "tab" }];
    return (
        <div className="indent-control" style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
            {segments.map((s, i) => (
                <button key={s.val} onClick={() => onChange(s.val)} style={{
                    padding: "4px 8px", border: "none", borderRight: i < 2 ? "1px solid var(--border)" : "none",
                    cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px",
                    background: value === s.val ? "var(--surface-el)" : "transparent",
                    color: value === s.val ? "var(--text-1)" : "var(--text-3)",
                    transition: "all 0.15s",
                }}>{s.label}</button>
            ))}
        </div>
    );
}

function RunBtn({ label, isProcessing, onClick }: { label: string; isProcessing: boolean; onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: "5px 14px", background: "var(--green)", color: "#0a0a0a", fontWeight: 600,
            border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
            opacity: hov ? 0.88 : 1, transition: "opacity 0.15s",
        }}>
            {isProcessing ? <Spinner /> : null}
            {label}
            <kbd style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "1px 4px", background: "rgba(0,0,0,0.15)", borderRadius: "3px" }}>⌘↵</kbd>
        </button>
    );
}

export function SecBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: "5px 11px", background: "transparent",
            border: `1px solid ${hov ? "var(--border-hover)" : "var(--border)"}`,
            borderRadius: "6px", fontSize: "12px", color: hov ? "var(--text-1)" : "var(--text-2)",
            cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
        }}>{children}</button>
    );
}

export function RunBtnExport({ label, isProcessing, onClick }: { label: string; isProcessing: boolean; onClick: () => void }) {
    return <RunBtn label={label} isProcessing={isProcessing} onClick={onClick} />;
}

export { ToolInfo, BackBtn, IndentControl };

function Spinner() {
    return (
        <span style={{
            width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.3)",
            borderTopColor: "#0a0a0a", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite",
        }} />
    );
}
