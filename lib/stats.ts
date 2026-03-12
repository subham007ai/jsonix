export type EditorStats = {
    characters: number;
    lines: number;
};

export function getEditorStats(content: string): EditorStats {
    if (!content) {
        return { characters: 0, lines: 0 };
    }

    return {
        characters: content.length,
        lines: content.split(/\r\n|\r|\n/).length
    };
}
