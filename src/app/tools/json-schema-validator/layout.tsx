import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Schema Validator',
    description: 'Validate JSON against a JSON Schema. Get clear error messages with field paths and expected vs received values.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-schema-validator',
    },
    openGraph: {
        title: 'Schema Validator',
        description: 'Validate JSON against a JSON Schema. Get clear error messages with field paths and expected vs received values.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
