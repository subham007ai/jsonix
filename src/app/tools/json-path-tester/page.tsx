"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorPanel } from "@/components/EditorPanel";
import { Toast } from "@/components/Toast";
import { BackBtn, ToolInfo, RunBtnExport as RunBtn, SecBtn } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { testJSONPath, JSONPathResult } from "../../../../lib/json-utils";
import { getStateFromURL, setStateInURL } from "../../../../lib/url-state";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "path")!;
let hintDismissed = false;

export default function JsonPath() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [path, setPath] = useState("$.store.books[0].title");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pathResult, setPathResult] = useState<JSONPathResult | null>(null);
    const [showHint, setShowHint] = useState(!hintDismissed);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [focused, setFocused] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (input === '{"store":{"books":[{"title":"Moby Dick","price":8.99},{"title":"The Raven","price":12.99}]}}') {
            return;
        }
        const timer = setTimeout(() => {
            setPath("");
            setOutput("");
            setPathResult(null);
            setHasRun(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [input]);

    useEffect(() => {
        const state = getStateFromURL();
        if (state) { try { const p = JSON.parse(state); if (p.input) setInput(p.input); if (p.path) setPath(p.path); } catch { setInput(state); } }
    }, []);

    useEffect(() => { setStateInURL(JSON.stringify({ input, path })); }, [input, path]);

    useEffect(() => {
        if (hintDismissed) return;
        const t = setTimeout(() => { setShowHint(false); hintDismissed = true; }, 5000);
        return () => clearTimeout(t);
    }, []);


    /* Debounced auto-run */
    useEffect(() => {
        if (!input.trim() || !path.trim() || path.trim() === "$.") {
            setOutput(""); setPathResult(null); setError(null); setHasRun(false); return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setIsProcessing(true);
        debounceRef.current = setTimeout(() => {
            try {
                const result = testJSONPath(input, path);
                setPathResult(result);
                setHasRun(true);
                if (result.matches.length === 0) setOutput("");
                else if (result.matches.length === 1) setOutput(JSON.stringify(result.matches[0], null, 2));
                else setOutput(JSON.stringify(result.matches, null, 2));
                setError(null);
            } catch (err) {
                setError(err instanceof JSONToolError ? err : new JSONToolError(err as Error, input));
                setPathResult(null); setOutput(""); setHasRun(false);
            } finally { setIsProcessing(false); }
        }, 150);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [input, path]);

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => { setToastMsg(msg); setToastType(type); }, []);
    const handleCopy = () => { if (output) { navigator.clipboard.writeText(output); showToast("Output copied"); } };
    const handleClear = () => { setInput(""); setOutput(""); setPath(""); setError(null); setPathResult(null); setHasRun(false); };
    const handleShare = () => { navigator.clipboard.writeText(window.location.href); showToast("Shareable link copied"); };
    const handleExample = () => {
        setInput('{"store":{"books":[{"title":"Moby Dick","price":8.99},{"title":"The Raven","price":12.99}]}}');
        setPath("$.store.books[0].title");
    };

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
            {/* Toolbar */}
            <div style={{ marginTop: "52px", height: "56px", flexShrink: 0, background: "var(--surface-el)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px" }}>
                <BackBtn onClick={() => router.push("/")} />
                <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
                <ToolInfo tool={TOOL} />
                <div style={{ flex: 1 }} />
                <RunBtn label="Test Path" isProcessing={isProcessing} onClick={() => { }} />
                <SecBtn onClick={handleCopy}>Copy</SecBtn>
                <SecBtn onClick={handleClear}>Clear</SecBtn>
                <SecBtn onClick={handleShare}>Share ↗</SecBtn>
            </div>

            {/* Hint */}
            {showHint && (
                <div style={{ height: "30px", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: "6px", background: "var(--blue-dim)", borderBottom: "1px solid var(--blue)", animation: "slideDown 0.3s ease" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-2)", fontWeight: 600 }}>Tip:</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>Results update automatically as you type — 150ms debounce</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => { setShowHint(false); hintDismissed = true; }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>dismiss ×</button>
                </div>
            )}

            {/* Main: two columns */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {/* Left: JSON input */}
                <div style={{ flex: 1, overflow: "hidden", borderRight: "1px solid var(--border)" }}>
                    <EditorPanel label="JSON DATA" value={input} onChange={setInput} hasError={!!error && !String(error.message).includes("Path")} showExample onExample={handleExample} />
                </div>

                {/* Right: path bar + output */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Path input bar */}
                    <div style={{ height: "44px", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 14px", gap: "6px", background: "var(--surface-el)", borderBottom: `2px solid ${focused ? "var(--green)" : "var(--border)"}`, transition: "border-color 0.15s" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-3)", flexShrink: 0 }}>$.</span>
                        <input
                            value={path.startsWith("$.") ? path.slice(2) : path}
                            onChange={e => setPath("$." + e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="e.g. store.books[0].title"
                            spellCheck={false}
                            style={{ flex: 1, border: "none", background: "transparent", color: "var(--text-1)", fontFamily: "var(--mono)", fontSize: "13px", outline: "none" }}
                        />
                        {pathResult && (
                            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", flexShrink: 0 }}>
                                {pathResult.matches.length} {pathResult.matches.length === 1 ? "match" : "matches"}
                            </span>
                        )}
                    </div>

                    {/* Output */}
                    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                        <EditorPanel label="OUTPUT" value={output} readonly hasError={!!error} hasSuccess={!!pathResult && !error} errorMsg={error?.message} />
                        {hasRun && pathResult?.matches.length === 0 && (
                            <div style={{
                                position: "absolute", inset: 0, zIndex: 1, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--surface)",
                                pointerEvents: "none"
                            }}>
                                <div style={{ fontSize: "28px", fontFamily: "var(--mono)", fontWeight: 600, color: "var(--text-4)" }}>0 matches</div>
                                <div style={{ fontSize: "12px", fontFamily: "var(--mono)", color: "var(--text-3)" }}>No results for this path expression</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toastMsg && <Toast message={toastMsg} type={toastType} onDone={() => setToastMsg(null)} />}
        </div>
    );
}
