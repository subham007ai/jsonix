"use client";

import { useState, useEffect } from "react";
import { ToolShell } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { minifyJSON } from "../../../../lib/json-utils";
import { getStateFromURL, setStateInURL } from "../../../../lib/url-state";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "minifier")!;

export default function JsonMinifier() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [savedPercent, setSavedPercent] = useState(0);
    const [origLen, setOrigLen] = useState(0);
    const [minLen, setMinLen] = useState(0);

    useEffect(() => {
        const state = getStateFromURL();
        if (state) setInput(state);
    }, []);

    useEffect(() => { setStateInURL(input); }, [input]);

    const handleRun = () => {
        if (!input.trim()) { setError(new JSONToolError(new Error(""), input)); setOutput(""); return; }
        setError(null); setIsProcessing(true);
        setTimeout(() => {
            try {
                const result = minifyJSON(input);
                setOutput(result.output);
                setSavedPercent(result.savedPercent);
                setOrigLen(result.originalSize);
                setMinLen(result.minifiedSize);
                setHasRun(true);
            } catch (err) {
                setError(err instanceof JSONToolError ? err : new JSONToolError(err as Error, input));
                setOutput(""); setSavedPercent(0);
            } finally { setIsProcessing(false); }
        }, 300);
    };

    const handleCopy = () => { if (output) navigator.clipboard.writeText(output); };
    const handleClear = () => { setInput(""); setOutput(""); setError(null); setHasRun(false); setSavedPercent(0); };
    const handleShare = () => navigator.clipboard.writeText(window.location.href);
    const handleExample = () => setInput('{\n  "name": "Subham",\n  "role": "admin",\n  "active": true,\n  "score": 42\n}');

    const displayOutput = output;

    const outputFooter = (
        <div style={{
            height: "36px", background: "var(--surface-el)", borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", padding: "0 16px", gap: "16px", flexShrink: 0
        }}>
            {hasRun && !error && savedPercent > 0 ? (
                <>
                    <span style={{ fontSize: "12px", color: "var(--green)", fontFamily: "var(--mono)", fontWeight: 500 }}>
                        {savedPercent}% smaller
                    </span>
                    <div style={{ width: "1px", height: "12px", background: "var(--border)" }} />
                    <span style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
                        {origLen} → {minLen} characters
                    </span>
                </>
            ) : null}
        </div>
    );

    return (
        <ToolShell
            tool={TOOL}
            input={input} setInput={v => { setInput(v); if (error) setError(null); }}
            output={displayOutput} error={error?.message ?? null}
            indent="2" setIndent={() => { }}
            isProcessing={isProcessing} hasRun={hasRun}
            onRun={handleRun} onCopy={handleCopy} onClear={handleClear}
            onShare={handleShare} onExample={handleExample}
            outputFooter={outputFooter}
        />
    );
}
