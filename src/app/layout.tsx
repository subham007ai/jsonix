import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jsonix.dev"),
  title: {
    default: "JSONix — JSON Tools for Developers",
    template: "%s | JSONix",
  },
  description:
    "Seven precision JSON tools. Format, validate, minify, diff, convert, query, and schema-validate JSON. 100% client-side — your data never leaves the browser.",
  keywords: [
    "JSON formatter",
    "JSON validator",
    "JSON minifier",
    "JSON diff",
    "JSON to CSV",
    "JSONPath tester",
    "JSON schema validator",
    "developer tools",
  ],
  authors: [{ name: "JSONix" }],
  creator: "JSONix",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jsonix.dev",
    siteName: "JSONix",
    title: "JSONix — JSON Tools for Developers",
    description:
      "Seven precision JSON tools. Format, validate, minify, diff, convert, query. 100% client-side.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "JSONix — JSON Tools for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSONix — JSON Tools for Developers",
    description:
      "Seven precision JSON tools. 100% client-side — your data never leaves the browser.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
