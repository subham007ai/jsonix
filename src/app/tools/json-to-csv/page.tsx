"use client";

import { useState, useEffect } from "react";
import { ToolShell } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { jsonToCSV, CSVResult } from "../../../../lib/json-utils";
import { getStateFromURL, setStateInURL } from "../../../../lib/url-state";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "csv")!;

export default function JsonToCSV() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [csvMeta, setCsvMeta] = useState<CSVResult | null>(null);

    useEffect(() => {
        const state = getStateFromURL();
        if (state) setInput(state);
    }, []);

    useEffect(() => { setStateInURL(input); }, [input]);

    const handleRun = () => {
        if (!input.trim()) { setError(new JSONToolError(new Error(""), input)); setOutput(""); setCsvMeta(null); return; }
        setError(null); setIsProcessing(true);
        setTimeout(() => {
            try {
                const result = jsonToCSV(input);
                setOutput(result.output);
                setCsvMeta(result);
                setHasRun(true);
            } catch (err) {
                setError(err instanceof JSONToolError ? err : new JSONToolError(err as Error, input));
                setOutput(""); setCsvMeta(null);
            } finally { setIsProcessing(false); }
        }, 300);
    };

    const handleCopy = () => { if (output) navigator.clipboard.writeText(output); };
    const handleClear = () => { setInput(""); setOutput(""); setError(null); setHasRun(false); setCsvMeta(null); };
    const handleShare = () => navigator.clipboard.writeText(window.location.href);
    const handleExample = () => setInput('[{"id":1,"name":"Alice","score":95},{"id":2,"name":"Bob","score":87}]');

    const displayOutput = output;

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const outputFooter = csvMeta && !error ? (
        <div style={{
            height: "36px", background: "var(--surface-el)", borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", padding: "0 16px", gap: "16px", flexShrink: 0
        }}>
            <span style={{ fontSize: "12px", color: "var(--text-2)", fontFamily: "var(--mono)" }}>
                {csvMeta.rows} rows · {csvMeta.columns} columns
            </span>
            <div style={{ width: "1px", height: "12px", background: "var(--border)" }} />
            <span style={{
                fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--mono)",
                maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
                Headers: {csvMeta.headers.join(", ")}
            </span>
            <div style={{ flex: 1 }} />
            <button onClick={handleDownload} style={{
                height: "24px", padding: "0 10px", background: "transparent",
                border: "1px solid var(--border)", borderRadius: "4px",
                color: "var(--text-2)", fontSize: "11px", fontFamily: "var(--mono)",
                cursor: "pointer", transition: "all 0.15s"
            }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--text-3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                ↓ Download
            </button>
        </div>
    ) : null;

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
