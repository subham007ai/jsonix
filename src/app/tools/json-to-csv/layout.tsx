import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON to CSV',
    description: 'Convert JSON arrays to CSV spreadsheets instantly. Supports nested objects with dot notation flattening.',
    alternates: {
        canonical: 'https://jsonix.dev/tools/json-to-csv',
    },
    openGraph: {
        title: 'JSON to CSV',
        description: 'Convert JSON arrays to CSV spreadsheets instantly. Supports nested objects with dot notation flattening.',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
