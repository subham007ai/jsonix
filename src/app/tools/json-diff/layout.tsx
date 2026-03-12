import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Diff',
    description: 'Compare two JSON structures visually. See every addition, deletion, and modification with exact path references.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-diff',
    },
    openGraph: {
        title: 'JSON Diff',
        description: 'Compare two JSON structures visually. See every addition, deletion, and modification with exact path references.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
