/* eslint-disable */
export function parseNativeError(rawMessage: string, inputString?: string) {
    let message = "Invalid JSON";
    let hint = "Check your syntax carefully";
    let line = 1;
    let column = 1;

    // Empty / blank input — detect before any other pattern
    if (!inputString || !inputString.trim()) {
        return { message: "Input is empty", hint: "Paste some JSON to get started", line: 1, column: 1 };
    }

    const raw = rawMessage.toLowerCase();

    if (raw.includes("unexpected token }") || raw.includes("unexpected }")) {
        message = "Unexpected closing bracket";
        hint = "You may have an extra } somewhere";
    } else if (raw.includes("unexpected end of json input") || raw.includes("end of json input")) {
        message = "JSON ends too early";
        hint = "You are probably missing a closing bracket or brace";
    } else if (raw.includes("expected property name") || raw.includes("property name")) {
        message = "Invalid property name";
        hint = "Keys must be wrapped in double quotes";
    } else if (raw.includes("unexpected token ,") || raw.includes("unexpected ','")) {
        message = "Trailing comma found";
        hint = "JSON does not allow commas after the last item";
    } else if (raw.includes("unexpected token '") || raw.includes("unexpected \"'\"")) {
        message = "Single quotes are not valid in JSON";
        hint = "Use double quotes for all strings";
    } else if (raw.includes("invalid or unexpected token") || raw.includes("unexpected symbol")) {
        message = "Unexpected character";
        hint = "There is a character out of place — check around the indicated position";
    } else if (raw.includes("duplicate key")) {
        message = "Duplicate key found";
        hint = "Each key in a JSON object must be unique";
    }

    // Match position info from both Chrome and Firefox style errors
    const match = rawMessage.match(/(?:position|at|char(?:acter)?)\s*(\d+)/i);
    if (match && inputString) {
        const position = parseInt(match[1], 10);
        const upToPosition = inputString.slice(0, position);
        const lines = upToPosition.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
    }

    return { message, hint, line, column };
}

export class JSONToolError extends Error {
    line: number;
    column: number;
    hint: string;
    rawMessage: string;

    constructor(error: unknown, fallbackInput?: string) {
        const rawMessage = error instanceof Error ? error.message : String(error);
        super();

        // Restore prototype chain required when extending built-ins in certain TS configs
        Object.setPrototypeOf(this, JSONToolError.prototype);

        this.name = "JSONToolError";
        this.rawMessage = rawMessage;

        const parsed = parseNativeError(rawMessage, fallbackInput);
        this.message = parsed.message;
        this.line = parsed.line;
        this.column = parsed.column;
        this.hint = parsed.hint;
    }
}
