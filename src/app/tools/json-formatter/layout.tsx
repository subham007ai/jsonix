import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Formatter',
    description: 'Beautify and format JSON with precise indentation. Supports 2-space, 4-space, and tab indentation. 100% client-side.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-formatter',
    },
    openGraph: {
        title: 'JSON Formatter',
        description: 'Beautify and format JSON with precise indentation. Supports 2-space, 4-space, and tab indentation. 100% client-side.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
