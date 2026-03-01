import type { Metadata } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { env } from "@/lib/env";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "BiraniKothayLal",
  description: "লালমনিরহাটের মানুষে মিলে ইফতার/বিরানি খবরের খাতা birani dibe lalmonirhat er khabar birani kothay lalmonirhat iftar birani news",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: "/",
  },
  keywords: ["BiraniKothayLal", "Lalmonirhat", "Iftar", "Sehri", "Mosque", "Bangladesh", "Community Vote", "Ramadan"],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    siteName: "BiraniKothayLal",
    title: "BiraniKothayLal",
    description: "লালমনিরহাটের মানুষে মিলে ইফতার/বিরানি খবরের খাতা",
    url: env.NEXT_PUBLIC_APP_URL,
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "BiraniKothayLal" }],
  },
  twitter: {
    card: "summary",
    title: "BiraniKothayLal",
    description: "লালমনিরহাটের মানুষে মিলে ইফতার/বিরানি খবরের খাতা",
    images: ["/logo.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "BiraniKothayLal",
        url: env.NEXT_PUBLIC_APP_URL,
      },
      {
        "@type": "WebSite",
        name: "BiraniKothayLal",
        url: env.NEXT_PUBLIC_APP_URL,
      },
    ],
  };

  return (
    <html lang={lang}>
      <body className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-3 py-4 md:px-4 md:py-6">{children}</main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
