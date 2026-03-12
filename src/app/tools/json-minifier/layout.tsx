import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Minifier',
    description: 'Strip whitespace and minimize JSON payload size. See exact byte savings with before and after character counts.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-minifier',
    },
    openGraph: {
        title: 'JSON Minifier',
        description: 'Strip whitespace and minimize JSON payload size. See exact byte savings with before and after character counts.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
