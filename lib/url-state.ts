import LZString from 'lz-string';

export function encodeState(input: string): string {
    return LZString.compressToEncodedURIComponent(input);
}

export function decodeState(encoded: string): string | null {
    try {
        const decoded = LZString.decompressFromEncodedURIComponent(encoded);
        if (decoded === null) return null;
        return decoded;
    } catch {
        return null;
    }
}

export function getStateFromURL(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (!q) return null;

        return decodeState(q);
    } catch {
        return null;
    }
}

export function setStateInURL(input: string): void {
    if (typeof window === 'undefined') return;

    try {
        const encoded = encodeState(input);
        const url = new URL(window.location.href);
        if (encoded) {
            url.searchParams.set('q', encoded);
        } else {
            url.searchParams.delete('q');
        }

        window.history.replaceState({}, '', url.toString());
    } catch {
        // Safe fallback, do nothing
    }
}

export function getShareableURL(input: string): string {
    if (typeof window === 'undefined') return '';

    try {
        const encoded = encodeState(input);
        const url = new URL(window.location.href);
        if (encoded) {
            url.searchParams.set('q', encoded);
        } else {
            url.searchParams.delete('q');
        }
        return url.toString();
    } catch {
        return '';
    }
}
