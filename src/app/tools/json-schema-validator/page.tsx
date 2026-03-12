"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorPanel } from "@/components/EditorPanel";
import { Toast } from "@/components/Toast";
import { BackBtn, ToolInfo, RunBtnExport as RunBtn, SecBtn } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { validateSchema, SchemaResult } from "../../../../lib/json-utils";
import { getStateFromURL, setStateInURL } from "../../../../lib/url-state";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "schema")!;
let hintDismissed = false;

const DEFAULT_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "age"],
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "integer", "minimum": 0 }
  }
}`;

function formatSchemaPath(path: string): string {
    if (!path || path.trim() === '') {
        return '/root'
    }

    // instancePath: "/product/name" → "/name"
    // instancePath: "/product/price" → "/price"
    // instancePath: "/name" → "/name"

    const parts = path
        .split('/')
        .filter(Boolean)

    if (parts.length === 0) return '/root'

    // Always show last segment — the field name
    return '/' + parts[parts.length - 1]
}

function extractFieldValue(
    json: string,
    instancePath: string
): string {
    try {
        const parsed = JSON.parse(json)

        if (!instancePath || instancePath === '') {
            return typeof parsed === 'object'
                ? '{...}'
                : String(parsed)
        }

        // Traverse path segments
        // "/product/name" → ["product", "name"]
        const parts = instancePath
            .split('/')
            .filter(Boolean)

        let current: unknown = parsed

        for (const part of parts) {
            if (current === null ||
                current === undefined) {
                return 'missing'
            }
            if (Array.isArray(current)) {
                const index = parseInt(part)
                if (isNaN(index)) return 'unknown'
                current = current[index]
            } else if (
                typeof current === 'object' &&
                current !== null
            ) {
                current = (
                    current as Record<string, unknown>
                )[part]
            } else {
                return 'unknown'
            }
        }

        if (current === undefined) return 'missing'
        if (current === null) return 'null'

        if (typeof current === 'string') {
            return `"${current}"`
        }
        if (typeof current === 'object') {
            return Array.isArray(current)
                ? '[...]'
                : '{...}'
        }

        return String(current)

    } catch {
        return 'unknown'
    }
}

export default function JsonSchema() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [schema, setSchema] = useState(DEFAULT_SCHEMA);
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [result, setResult] = useState<SchemaResult | null>(null);
    const [showHint, setShowHint] = useState(!hintDismissed);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [split, setSplit] = useState(50);

    useEffect(() => {
        const state = getStateFromURL();
        if (state) { try { const p = JSON.parse(state); if (p.input) setInput(p.input); if (p.schema) setSchema(p.schema); } catch { setInput(state); } }
    }, []);

    useEffect(() => { setStateInURL(JSON.stringify({ input, schema })); }, [input, schema]);

    useEffect(() => {
        if (hintDismissed) return;
        const t = setTimeout(() => { setShowHint(false); hintDismissed = true; }, 5000);
        return () => clearTimeout(t);
    }, []);

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => { setToastMsg(msg); setToastType(type); }, []);

    const handleRun = () => {
        if (!input.trim()) { setError(new JSONToolError(new Error(""), input)); return; }
        setError(null); setIsProcessing(true);
        setTimeout(() => {
            try {
                setResult(validateSchema(input, schema));
                setHasRun(true);
            } catch (err) {
                setError(err instanceof JSONToolError ? err : new JSONToolError(err as Error, input));
                setResult(null);
            } finally { setIsProcessing(false); }
        }, 300);
    };

    const handleCopy = () => {
        if (result) { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); showToast("Result copied"); }
    };
    const handleClear = () => { setInput(""); setError(null); setResult(null); setHasRun(false); };
    const handleShare = () => { navigator.clipboard.writeText(window.location.href); showToast("Shareable link copied"); };
    const handleExample = () => {
        setInput('{\n  "name": "Subham",\n  "age": 25\n}');
        setSchema(DEFAULT_SCHEMA);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") { e.preventDefault(); handleCopy(); }
            if (e.key === "Escape") { e.preventDefault(); handleClear(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [input, schema, result]);

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
            {/* Toolbar */}
            <div style={{ marginTop: "52px", height: "56px", flexShrink: 0, background: "var(--surface-el)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px" }}>
                <BackBtn onClick={() => router.push("/")} />
                <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
                <ToolInfo tool={TOOL} />
                <div style={{ flex: 1 }} />
                <RunBtn label="Validate" isProcessing={isProcessing} onClick={handleRun} />
                <SecBtn onClick={handleCopy}>Copy</SecBtn>
                <SecBtn onClick={handleClear}>Clear</SecBtn>
                <SecBtn onClick={handleShare}>Share ↗</SecBtn>
            </div>

            {/* Hint */}
            {showHint && (
                <div style={{ height: "30px", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: "6px", background: "var(--blue-dim)", borderBottom: "1px solid var(--blue)", animation: "slideDown 0.3s ease" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-2)", fontWeight: 600 }}>Tip:</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>Paste JSON on the left, schema on the right, then ⌘↵</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => { setShowHint(false); hintDismissed = true; }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>dismiss ×</button>
                </div>
            )}

            {/* Top: two inputs */}
            <div style={{ display: "flex", flex: "0 0 50%", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: "none", width: `${split}%`, overflow: "hidden" }}>
                    <EditorPanel label="JSON" value={input} onChange={setInput} hasError={!!error} showExample onExample={handleExample} />
                </div>
                <div style={{ width: "4px", background: "var(--border)", cursor: "col-resize", flexShrink: 0 }}
                    onMouseDown={e => {
                        e.preventDefault();
                        const startX = e.clientX, startSplit = split;
                        const onMove = (ev: MouseEvent) => { setSplit(Math.min(Math.max(startSplit + ((ev.clientX - startX) / window.innerWidth) * 100, 20), 80)); };
                        const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                    }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <EditorPanel label="SCHEMA" value={schema} onChange={setSchema} />
                </div>
            </div>

            {/* Output */}
            <div style={{ flex: 1, overflow: "auto", background: "var(--bg)", borderTop: "1px solid var(--border)", marginTop: 0 }}>
                {!hasRun && !error && (
                    <div style={{ padding: "20px 16px", fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-3)" }}>
                        Validation result will appear here
                    </div>
                )}
                {error && (
                    <div style={{ padding: "16px", background: "var(--red-dim)", borderBottom: "1px solid var(--red-border)" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--red)" }}>✕ {error.message}</span>
                    </div>
                )}
                {result && !error && (
                    result.valid ? (
                        <div style={{
                            padding: "20px", display: "flex", alignItems: "center", gap: "14px",
                            borderTop: "1px solid var(--green-border)", background: "var(--green-dim)", animation: "fadeIn 0.2s ease"
                        }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: "rgba(34,197,94,0.12)", border: "1px solid var(--green-border)",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                color: "var(--green)", fontSize: "16px", fontWeight: 600
                            }}>✓</div>
                            <div>
                                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-1)" }}>Valid — JSON matches the schema</div>
                                <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px", fontFamily: "var(--mono)" }}>
                                    All rules checked, all passed
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {result.errors.map((e, index) => (
                                <div key={index} style={{
                                    padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: "14px",
                                    animation: `fadeUp 0.3s ease ${index * 0.06}s both`
                                }}>
                                    <div style={{
                                        flexShrink: 0, marginTop: "2px", background: "var(--red-dim)", border: "1px solid var(--red-border)",
                                        borderRadius: "5px", padding: "3px 9px", fontSize: "11px", color: "var(--red)",
                                        fontFamily: "var(--mono)", whiteSpace: "nowrap"
                                    }}>
                                        {formatSchemaPath(e.path)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "14px", color: "var(--text-1)", fontWeight: 500, lineHeight: 1.4, marginBottom: "6px" }}>
                                            {e.message}
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--text-3)" }}>
                                                expected: {e.expected}
                                            </span>
                                            <span style={{ color: "var(--text-4)", fontSize: "11px" }}>→</span>
                                            <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--yellow)" }}>
                                                received: {extractFieldValue(input, e.path)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {toastMsg && <Toast message={toastMsg} type={toastType} onDone={() => setToastMsg(null)} />}
        </div>
    );
}
