"use client";

import { useState, useEffect } from "react";
import { ToolShell } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { validateJSON, formatJSON } from "../../../../lib/json-utils";
import { getStateFromURL, setStateInURL } from "../../../../lib/url-state";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "validator")!;

export default function JsonValidator() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [rawErrors, setRawErrors] = useState<any[]>([]);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const state = getStateFromURL();
        if (state) setInput(state);
    }, []);

    useEffect(() => { setStateInURL(input); }, [input]);

    const handleRun = () => {
        if (!input.trim()) { setError(new JSONToolError(new Error(""), input)); setOutput(""); setRawErrors([]); setIsValid(false); return; }
        setError(null); setIsProcessing(true);
        setTimeout(() => {
            const result = validateJSON(input);
            if (result.valid) {
                try {
                    setOutput(formatJSON(input, 2));
                } catch {
                    setOutput(input);
                }
                setError(null);
                setRawErrors([]);
                setIsValid(true);
            } else {
                setOutput("");
                setError(new JSONToolError(new Error("Invalid JSON"), input));
                setRawErrors(result.errors);
                setIsValid(false);
            }
            setHasRun(true);
            setIsProcessing(false);
        }, 300);
    };

    const handleCopy = () => { if (output) navigator.clipboard.writeText(output); };
    const handleClear = () => { setInput(""); setOutput(""); setError(null); setHasRun(false); setRawErrors([]); setIsValid(false); };
    const handleShare = () => navigator.clipboard.writeText(window.location.href);
    const handleExample = () => setInput('{"name":"Alice","age":30,"tags":["dev","admin"]}');

    const inputFooter = hasRun && !isProcessing ? (
        isValid ? (
            <div style={{
                height: "36px", background: "var(--green-dim)", borderTop: "1px solid var(--green-border)",
                display: "flex", alignItems: "center", padding: "0 16px", gap: "8px", animation: "fadeIn 0.2s ease", flexShrink: 0
            }}>
                <span style={{ color: "var(--green)", fontSize: "13px", fontWeight: 500 }}>✓ Valid JSON</span>
                <span style={{ color: "var(--text-3)", margin: "0 4px" }}>·</span>
                <span style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: "12px" }}>
                    {input.split("\n").length} lines · {input.length} characters
                </span>
            </div>
        ) : rawErrors.length > 0 ? (
            <div style={{
                background: "var(--red-dim)", borderTop: "1px solid var(--red-border)",
                padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px",
                maxHeight: "160px", overflowY: "auto", animation: "fadeIn 0.2s ease", flexShrink: 0
            }}>
                {rawErrors.map((err, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <span style={{
                            flexShrink: 0, background: "var(--red-dim)", border: "1px solid var(--red-border)",
                            borderRadius: "4px", padding: "2px 7px", fontSize: "10px", color: "var(--red)",
                            fontFamily: "var(--mono)", whiteSpace: "nowrap"
                        }}>
                            Line {err.line} · Col {err.column}
                        </span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", color: "var(--text-1)", lineHeight: 1.5 }}>{err.message}</div>
                            {err.hint && <div style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--mono)", marginTop: "3px" }}>Hint: {err.hint}</div>}
                        </div>
                    </div>
                ))}
            </div>
        ) : null
    ) : null;

    return (
        <ToolShell
            tool={TOOL}
            input={input} setInput={v => { setInput(v); if (error) setError(null); }}
            output={output} error={error?.message ?? null}
            indent="2" setIndent={() => { }}
            isProcessing={isProcessing} hasRun={hasRun}
            onRun={handleRun} onCopy={handleCopy} onClear={handleClear}
            onShare={handleShare} onExample={handleExample}
            inputFooter={inputFooter}
        />
    );
}
