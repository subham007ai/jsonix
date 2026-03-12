export type Tool = {
    id: string;
    route: string;
    name: string;
    desc: string;
    tag: string;
    color: string;
    icon: string;
};

export const TOOLS: Tool[] = [
    { id: "formatter", route: "/tools/json-formatter", name: "JSON Formatter", desc: "Beautify raw JSON with precise indentation", tag: "Format", color: "--green", icon: "{ }" },
    { id: "validator", route: "/tools/json-validator", name: "JSON Validator", desc: "Find every error with plain English hints", tag: "Validate", color: "--blue", icon: "✓" },
    { id: "minifier", route: "/tools/json-minifier", name: "JSON Minifier", desc: "Strip whitespace, reduce payload size", tag: "Minify", color: "--yellow", icon: "⇥" },
    { id: "csv", route: "/tools/json-to-csv", name: "JSON → CSV", desc: "Convert arrays of objects to spreadsheets", tag: "Convert", color: "--green", icon: "⇄" },
    { id: "diff", route: "/tools/json-diff", name: "JSON Diff", desc: "Compare two JSON structures visually", tag: "Diff", color: "--red", icon: "±" },
    { id: "path", route: "/tools/json-path-tester", name: "JSON Path Tester", desc: "Test JSONPath expressions in real time", tag: "Query", color: "--blue", icon: "$." },
    { id: "schema", route: "/tools/json-schema-validator", name: "Schema Validator", desc: "Validate JSON against a JSON Schema", tag: "Schema", color: "--yellow", icon: "⬡" },
];
