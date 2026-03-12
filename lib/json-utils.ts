/* eslint-disable */
import { JSONToolError } from './errors';
import Ajv from 'ajv';

export type ValidationResult = {
    valid: boolean;
    errors: JSONError[];
};

export type JSONError = {
    message: string;
    line: number;
    column: number;
    hint: string;
};

export type MinifyResult = {
    output: string;
    originalSize: number;
    minifiedSize: number;
    savedPercent: number;
};

export type CSVResult = {
    output: string;
    rows: number;
    columns: number;
    headers: string[];
};

export type DiffChange = {
    path: string;
    type: "added" | "removed" | "modified";
    leftValue?: unknown;
    rightValue?: unknown;
};

export type DiffResult = {
    changes: DiffChange[];
    additions: number;
    deletions: number;
    modifications: number;
};

export type JSONPathResult = {
    matches: unknown[];
    count: number;
    path: string;
};

export type SchemaError = {
    path: string;
    message: string;
    expected: string;
    received: string;
};

export type SchemaResult = {
    valid: boolean;
    errors: SchemaError[];
};

/**
 * Core safe parser to catch native JSON errors and convert them
 * to the custom JSONToolError format.
 */
function safeParse(input: string): any {
    try {
        return JSON.parse(input);
    } catch (err) {
        throw new JSONToolError(err, input);
    }
}

/**
 * 1. Formats JSON string
 * @param input Raw JSON string
 * @param indent Size of indentation or tab
 */
export function formatJSON(input: string, indent: 2 | 4 | "tab"): string {
    const parsed = safeParse(input);
    const space = indent === "tab" ? "\t" : indent;
    return JSON.stringify(parsed, null, space as string | number);
}

/**
 * 2. Validates JSON string
 * @param input Raw JSON string
 */
export function validateJSON(input: string): ValidationResult {
    try {
        JSON.parse(input);
        return { valid: true, errors: [] };
    } catch (err) {
        const errors: JSONError[] = [];

        // 1. Native JSON.parse error
        const jErr = new JSONToolError(err, input);
        errors.push({
            message: jErr.message,
            line: jErr.line,
            column: jErr.column,
            hint: jErr.hint
        });

        // 2. Line-by-line analysis
        const lines = input.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const lineStr = lines[i];
            const lineNum = i + 1;

            // Single quotes
            const sqRegex = /(?<![\\])\'([^\']*)\'(?=\s*[,}\]:]|$)/g;
            let match;
            while ((match = sqRegex.exec(lineStr)) !== null) {
                errors.push({
                    message: "Single quotes are not valid in JSON",
                    line: lineNum,
                    column: match.index + 1,
                    hint: "Use double quotes for all strings"
                });
            }

            // Trailing comma
            const tcRegex = /,\s*([}\]])/g;
            while ((match = tcRegex.exec(lineStr)) !== null) {
                errors.push({
                    message: "Trailing comma found",
                    line: lineNum,
                    column: match.index + 1,
                    hint: "Remove the comma after the last item"
                });
            }

            // Unquoted keys
            const ukRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
            while ((match = ukRegex.exec(lineStr)) !== null) {
                errors.push({
                    message: `Unquoted key found: ${match[1]}`,
                    line: lineNum,
                    column: match.index + 1 + lineStr.substring(match.index).indexOf(match[1]),
                    hint: "All keys must be wrapped in double quotes"
                });
            }
        }

        // Missing commas between properties
        for (let i = 0; i < lines.length - 1; i++) {
            const currentLine = lines[i].trim();
            if (!currentLine) continue;

            // Ends in a value
            if (/("|[0-9]|true|false|null|}|])$/.test(currentLine)) {
                let nextLineIdx = i + 1;
                while (nextLineIdx < lines.length && !lines[nextLineIdx].trim()) {
                    nextLineIdx++;
                }

                if (nextLineIdx < lines.length) {
                    const nextLine = lines[nextLineIdx].trim();
                    // Next line starts with a quoted key
                    if (/^"[^"]+"\s*:/.test(nextLine)) {
                        errors.push({
                            message: "Missing comma between properties",
                            line: i + 1,
                            column: lines[i].length > 0 ? lines[i].length : 1,
                            hint: "Add a comma after this value"
                        });
                    }
                }
            }
        }

        // Deduplicate by line number
        const uniqueErrorsMap = new Map<number, JSONError>();
        for (const e of errors) {
            if (!uniqueErrorsMap.has(e.line)) {
                uniqueErrorsMap.set(e.line, e);
            }
        }

        const uniqueErrors = Array.from(uniqueErrorsMap.values());
        uniqueErrors.sort((a, b) => a.line - b.line);

        return {
            valid: false,
            errors: uniqueErrors
        };
    }
}

/**
 * 3. Minifies JSON string
 * @param input Raw JSON string
 */
export function minifyJSON(input: string): MinifyResult {
    const parsed = safeParse(input);
    const output = JSON.stringify(parsed);

    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([output]).size;
    const savedPercent = originalSize === 0 ? 0 : Number(((originalSize - minifiedSize) / originalSize * 100).toFixed(2));

    return { output, originalSize, minifiedSize, savedPercent };
}

/**
 * 4. Converts Array JSON Objects to CSV format
 * @param input Raw JSON string
 */
export function jsonToCSV(input: string): CSVResult {
    const parsed = safeParse(input);

    if (!Array.isArray(parsed) || parsed.some(item => typeof item !== 'object' || item === null)) {
        throw new JSONToolError(new Error("Input must be an array of objects."));
    }

    const flattenObj = (ob: Record<string, any>, prefix = ''): Record<string, any> => {
        let result: Record<string, any> = {};
        for (const i in ob) {
            if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
            if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
                Object.assign(result, flattenObj(ob[i], prefix + i + '.'));
            } else {
                result[prefix + i] = ob[i];
            }
        }
        return result;
    };

    const flatData = parsed.map(item => flattenObj(item));
    const headers = Array.from(new Set(flatData.flatMap(Object.keys)));

    if (headers.length === 0) {
        return { output: '', rows: parsed.length, columns: 0, headers: [] };
    }

    const csvLines = [headers.join(',')];
    for (const row of flatData) {
        const values = headers.map(header => {
            let val = row[header];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') val = JSON.stringify(val);
            else val = String(val);

            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        });
        csvLines.push(values.join(','));
    }

    return {
        output: csvLines.join('\n'),
        rows: flatData.length,
        columns: headers.length,
        headers
    };
}

/**
 * 5. Compares two valid JSON strings recursively
 * @param left First JSON string
 * @param right Second JSON string
 */
export function diffJSON(left: string, right: string): DiffResult {
    const leftObj = safeParse(left);
    let rightObj;
    try {
        rightObj = JSON.parse(right);
    } catch (err) {
        throw new JSONToolError(err, right);
    }

    const changes: DiffChange[] = [];
    let additions = 0;
    let deletions = 0;
    let modifications = 0;

    const getPathStr = (path: (string | number)[]) => {
        return path.reduce<string>((acc, curr) => {
            if (typeof curr === 'number') return `${acc}[${curr}]`;
            if (!acc) return curr;
            return `${acc}.${curr}`;
        }, '$');
    };

    const compare = (l: any, r: any, path: (string | number)[]) => {
        const isObject = (val: any) => typeof val === 'object' && val !== null;

        if (l === r) return;

        if (l === undefined && r !== undefined) {
            changes.push({ path: getPathStr(path), type: "added", rightValue: r });
            additions++;
            return;
        }

        if (l !== undefined && r === undefined) {
            changes.push({ path: getPathStr(path), type: "removed", leftValue: l });
            deletions++;
            return;
        }

        if (!isObject(l) || !isObject(r) || Array.isArray(l) !== Array.isArray(r)) {
            changes.push({ path: getPathStr(path), type: "modified", leftValue: l, rightValue: r });
            modifications++;
            return;
        }

        const allKeysArr = Array.from(new Set([...Object.keys(l), ...Object.keys(r)]));
        for (const key of allKeysArr) {
            const parsedKey = Array.isArray(l) ? parseInt(key, 10) : key;
            // Object properties safely accessed, skipping prototypes just in case
            compare(l[key as keyof typeof l], r[key as keyof typeof r], [...path, parsedKey]);
        }
    };

    compare(leftObj, rightObj, []);

    return { changes, additions, deletions, modifications };
}

/**
 * 6. Execute JSONPath queries against string input
 * @param input Raw JSON string
 * @param path Simple JSONPath expression mapped to array and object structures
 */
export function testJSONPath(input: string, path: string): JSONPathResult {
    const parsed = safeParse(input);
    const matches: unknown[] = [];

    const evaluate = (data: any, tokens: string[]) => {
        if (tokens.length === 0) {
            if (data !== undefined) matches.push(data);
            return;
        }

        const token = tokens[0];
        const rest = tokens.slice(1);

        if (token === '$') {
            evaluate(data, rest);
            return;
        }

        if (token === '..') {
            const traverse = (obj: any) => {
                evaluate(obj, rest);
                if (typeof obj === 'object' && obj !== null) {
                    for (const ObjectKey in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, ObjectKey)) {
                            traverse(obj[ObjectKey as keyof typeof obj]);
                        }
                    }
                }
            };
            traverse(data);
            return;
        }

        if (token === '*') {
            if (Array.isArray(data)) {
                for (const item of data) {
                    evaluate(item, rest);
                }
            } else if (typeof data === 'object' && data !== null) {
                for (const ObjectKey in data) {
                    if (Object.prototype.hasOwnProperty.call(data, ObjectKey)) {
                        evaluate(data[ObjectKey as keyof typeof data], rest);
                    }
                }
            }
            return;
        }

        if (typeof data === 'object' && data !== null && token in data) {
            evaluate(data[token as keyof typeof data], rest);
        }
    };

    let norm = path.replace(/\["([^"]+)"\]/g, '.$1')
        .replace(/\['([^']+)'\]/g, '.$1')
        .replace(/\[(\d+)\]/g, '.$1')
        .replace(/\[\*\]/g, '.*');

    const tokens: string[] = [];
    let i = 0;
    while (i < norm.length) {
        if (norm.slice(i, i + 2) === '..') {
            tokens.push('..');
            i += 2;
            continue;
        }
        const nextDot = norm.indexOf('.', i);
        if (nextDot === -1) {
            if (norm.slice(i) !== '') tokens.push(norm.slice(i));
            break;
        } else {
            if (nextDot > i) tokens.push(norm.slice(i, nextDot));
            i = nextDot + 1;
        }
    }

    try {
        evaluate(parsed, tokens);
    } catch (err) {
        throw new JSONToolError(new Error("Invalid JSONPath expression"));
    }

    return {
        matches,
        count: matches.length,
        path
    };
}

/**
 * 7. Validate JSON input against an Ajv JSON schema
 * @param json Raw JSON Data String
 * @param schema Raw JSON Schema String
 */
export function validateSchema(json: string, schema: string): SchemaResult {
    const data = safeParse(json);
    let schemaObj;
    try {
        schemaObj = JSON.parse(schema);
    } catch (err) {
        throw new JSONToolError(err, schema);
    }

    const ajv = new Ajv({ allErrors: true });
    let validate;
    try {
        validate = ajv.compile(schemaObj);
    } catch (err: any) {
        throw new JSONToolError(new Error("Invalid JSON Schema: " + err.message));
    }

    const valid = validate(data);
    const errors: SchemaError[] = [];

    if (!valid && validate.errors) {
        for (const err of validate.errors as any[]) {
            errors.push({
                path: err.instancePath ?? "",
                message: err.message ?? "",
                expected: (err.schemaPath as string) ?? "",
                received: ""
            });
        }
    }

    return { valid: !!valid, errors };
}
