import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { getLang } from "@/lib/lang";
import { env } from "@/lib/env";
import logo from './../../public/logo.png';

export const metadata: Metadata = {
  title: "BiraniKothayLal",
  description: "লালমনিরহাটের মানুষে মিলে ইফতার/বিরানি খবরের খাতা birani dibe lalmonirhat er khabar birani kothay lalmonirhat iftar birani news",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  openGraph: {
    siteName: "BiraniKothayLal",
    title: "BiraniKothayLal",
    description: "লালমনিরহাটের মানুষে মিলে ইফতার/বিরানি খবরের খাতা",
    url: env.NEXT_PUBLIC_APP_URL,
    type: "website",
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
      <body>
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-black h">
              <Image src={logo} alt="BiraniKothayLal Logo" width={130} height={0} />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/about" className="text-sm font-medium text-zinc-700">
                About Us
              </Link>
              <Link
                href="/add"
                className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
              >
                বিড়ানির খবর দিন
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
