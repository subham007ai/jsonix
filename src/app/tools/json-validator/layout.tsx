import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Validator',
    description: 'Find every JSON error with plain English hints. Line numbers, column positions, and actionable fix suggestions.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-validator',
    },
    openGraph: {
        title: 'JSON Validator',
        description: 'Find every JSON error with plain English hints. Line numbers, column positions, and actionable fix suggestions.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
