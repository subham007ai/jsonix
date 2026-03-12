"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorPanel } from "@/components/EditorPanel";
import { Toast } from "@/components/Toast";
import { BackBtn, ToolInfo, RunBtnExport as RunBtn, SecBtn } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { diffJSON, DiffResult } from "../../../../lib/json-utils";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "diff")!;
let hintDismissed = false;

export default function JsonDiff() {
    const router = useRouter();
    const [input1, setInput1] = useState("");
    const [input2, setInput2] = useState("");
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
    const [showHint, setShowHint] = useState(!hintDismissed);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [split, setSplit] = useState(50);

    useEffect(() => {
        if (hintDismissed) return;
        const t = setTimeout(() => { setShowHint(false); hintDismissed = true; }, 5000);
        return () => clearTimeout(t);
    }, []);

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg); setToastType(type);
    }, []);

    const handleRun = () => {
        if (!input1.trim() || !input2.trim()) {
            setError(new JSONToolError(new Error(""), "")); setDiffResult(null); return;
        }
        setError(null); setIsProcessing(true);
        setTimeout(() => {
            try {
                setDiffResult(diffJSON(input1, input2));
                setHasRun(true);
            } catch (err) {
                setError(err instanceof JSONToolError ? err : new JSONToolError(err as Error, input1));
                setDiffResult(null);
            } finally { setIsProcessing(false); }
        }, 300);
    };

    const handleCopy = () => {
        if (diffResult) { navigator.clipboard.writeText(JSON.stringify(diffResult, null, 2)); showToast("Diff copied"); }
    };
    const handleClear = () => { setInput1(""); setInput2(""); setError(null); setDiffResult(null); setHasRun(false); };
    const handleShare = () => { navigator.clipboard.writeText(window.location.href); showToast("Shareable link copied"); };
    const handleExample = () => {
        setInput1(JSON.stringify({
            app: {
                version: "1.0.0",
                host: "localhost",
                cache: false
            }
        }, null, 2));
        setInput2(JSON.stringify({
            app: {
                version: "2.0.0",
                host: "api.example.com",
                cache: true,
                logging: {
                    level: "info",
                    format: "json"
                },
                analytics: true
            }
        }, null, 2));
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") { e.preventDefault(); handleCopy(); }
            if (e.key === "Escape") { e.preventDefault(); handleClear(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [input1, input2, diffResult]);

    const BADGE: Record<string, { bg: string; border: string; color: string }> = {
        added: { bg: "var(--green-dim)", border: "var(--green-border)", color: "var(--green)" },
        removed: { bg: "var(--red-dim)", border: "var(--red-border)", color: "var(--red)" },
        modified: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)", color: "var(--yellow)" },
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
            {/* Toolbar */}
            <div style={{ marginTop: "52px", height: "56px", flexShrink: 0, background: "var(--surface-el)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px" }}>
                <BackBtn onClick={() => router.push("/")} />
                <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
                <ToolInfo tool={TOOL} />
                <div style={{ flex: 1 }} />
                <RunBtn label="Run Diff" isProcessing={isProcessing} onClick={handleRun} />
                <SecBtn onClick={handleCopy}>Copy</SecBtn>
                <SecBtn onClick={handleClear}>Clear</SecBtn>
                <SecBtn onClick={handleShare}>Share ↗</SecBtn>
            </div>

            {/* Hint */}
            {showHint && (
                <div style={{ height: "30px", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: "6px", background: "var(--blue-dim)", borderBottom: "1px solid var(--blue)", animation: "slideDown 0.3s ease" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-2)", fontWeight: 600 }}>Tip:</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>Paste both versions, then ⌘↵ to compare</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => { setShowHint(false); hintDismissed = true; }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>dismiss ×</button>
                </div>
            )}

            {/* Top: two input panels */}
            <div style={{ display: "flex", flex: "0 0 45%", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: "none", width: `${split}%`, overflow: "hidden" }}>
                    <EditorPanel label="ORIGINAL" value={input1} onChange={setInput1} hasError={!!error} showExample onExample={handleExample} />
                </div>
                <div style={{ width: "4px", background: "var(--border)", cursor: "col-resize", flexShrink: 0 }}
                    onMouseDown={e => {
                        e.preventDefault();
                        const startX = e.clientX, startSplit = split;
                        const onMove = (ev: MouseEvent) => {
                            const delta = ((ev.clientX - startX) / window.innerWidth) * 100;
                            setSplit(Math.min(Math.max(startSplit + delta, 20), 80));
                        };
                        const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                    }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <EditorPanel label="MODIFIED" value={input2} onChange={setInput2} />
                </div>
            </div>

            {/* Bottom: diff output */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface)" }}>
                {!hasRun && !error && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-3)" }}>
                        Diff will appear here
                    </div>
                )}
                {error && (
                    <div style={{ padding: "16px", background: "var(--red-dim)", borderBottom: "1px solid var(--red-border)" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--red)" }}>✕ {error.message}</span>
                    </div>
                )}
                {diffResult && !error && (
                    <>
                        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: "12px", color: "var(--text-2)", flexShrink: 0 }}>
                            <span style={{ color: "var(--green)" }}>{diffResult.additions} additions</span>
                            {" · "}
                            <span style={{ color: "var(--red)" }}>{diffResult.deletions} deletions</span>
                            {" · "}
                            <span style={{ color: "var(--yellow)" }}>{diffResult.modifications} modified</span>
                            {" · "}
                            <span style={{ color: "var(--text-1)" }}>{diffResult.additions + diffResult.deletions + diffResult.modifications} total</span>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto" }}>
                            {diffResult.changes.length === 0 ? (
                                <div style={{ padding: "20px 16px", fontFamily: "var(--mono)", fontSize: "13px", color: "var(--green)" }}>✓ Objects are identical</div>
                            ) : diffResult.changes.map((ch, i) => {
                                const b = BADGE[ch.type];
                                return (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                                        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--text-3)", minWidth: "120px" }}>{ch.path}</span>
                                        <span style={{ padding: "2px 8px", borderRadius: "20px", background: b.bg, border: `1px solid ${b.border}`, color: b.color, fontFamily: "var(--mono)", fontSize: "10px", flexShrink: 0 }}>{ch.type}</span>
                                        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {ch.type === "modified" ? `${JSON.stringify(ch.leftValue)} → ${JSON.stringify(ch.rightValue)}` : JSON.stringify(ch.type === "added" ? ch.rightValue : ch.leftValue)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {toastMsg && <Toast message={toastMsg} type={toastType} onDone={() => setToastMsg(null)} />}
        </div>
    );
}
