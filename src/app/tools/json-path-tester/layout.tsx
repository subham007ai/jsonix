import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Path Tester',
    description: 'Test JSONPath expressions in real time. See matching values instantly as you type your path expression.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-path-tester',
    },
    openGraph: {
        title: 'JSON Path Tester',
        description: 'Test JSONPath expressions in real time. See matching values instantly as you type your path expression.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
