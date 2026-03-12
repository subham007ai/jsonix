"use client";

import { useState, useEffect } from "react";
import { ToolShell } from "@/components/ToolShell";
import { JSONToolError } from "../../../../lib/errors";
import { formatJSON } from "../../../../lib/json-utils";
import { getStateFromURL, setStateInURL } from "../../../../lib/url-state";
import { TOOLS } from "@/components/tools-data";

const TOOL = TOOLS.find(t => t.id === "formatter")!;

export default function JsonFormatter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<JSONToolError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [indent, setIndent] = useState("2");
    const [hasRun, setHasRun] = useState(false);

    useEffect(() => {
        const state = getStateFromURL();
        if (state) {
            setInput(state);
            try { setOutput(formatJSON(state, 2)); } catch { }
        }
    }, []);

    useEffect(() => { setStateInURL(input); }, [input]);

    const handleRun = () => {
        if (!input.trim()) { setError(new JSONToolError(new Error(""), input)); return; }
        setError(null); setIsProcessing(true);
        setTimeout(() => {
            try {
                const space = indent === "tab" ? "tab" : (parseInt(indent) as 2 | 4);
                setOutput(formatJSON(input, space));
                setHasRun(true);
            } catch (err) {
                setError(err instanceof JSONToolError ? err : new JSONToolError(err as Error, input));
                setOutput("");
            } finally { setIsProcessing(false); }
        }, 300);
    };

    const handleCopy = () => { if (output) navigator.clipboard.writeText(output); };
    const handleClear = () => { setInput(""); setOutput(""); setError(null); setHasRun(false); };
    const handleShare = () => navigator.clipboard.writeText(window.location.href);
    const handleExample = () => setInput('{\n  "name": "Subham",\n  "role": "admin",\n  "active": true,\n  "score": 42\n}');

    return (
        <ToolShell
            tool={TOOL}
            input={input} setInput={v => { setInput(v); if (error) setError(null); }}
            output={output} error={error?.message ?? null}
            indent={indent} setIndent={setIndent}
            isProcessing={isProcessing} hasRun={hasRun}
            onRun={handleRun} onCopy={handleCopy} onClear={handleClear}
            onShare={handleShare} onExample={handleExample}
        />
    );
}
