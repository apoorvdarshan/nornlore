import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://nornlore.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Nornlore — What History Shares Your Birthday?",
    template: "%s — Nornlore",
  },
  description:
    "Enter your birthday and discover the famous events, legendary people, music releases, and movies that share your exact date in history. 366 dates, 2,594 tales.",
  keywords: [
    "birthday history",
    "this day in history",
    "historical events by date",
    "famous birthdays",
    "what happened on my birthday",
    "born on this day",
    "history birthday lookup",
    "on this day",
    "daily prophet",
    "nornlore",
  ],
  authors: [{ name: "Apoorv Darshan", url: "https://apoorvdarshan.com" }],
  creator: "Apoorv Darshan",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Nornlore",
    title: "Nornlore — What History Shares Your Birthday?",
    description:
      "Enter your birthday and discover the famous events, legendary people, music releases, and movies that share your exact date in history.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nornlore — What History Shares Your Birthday?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nornlore — What History Shares Your Birthday?",
    description:
      "Discover the famous events, people, music, and movies that share your exact date in history. 366 dates, 2,594 tales.",
    images: ["/og-image.png"],
    creator: "@apoorvdarshan",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=IM+Fell+English:ital@0;1&family=IM+Fell+DW+Pica:ital@0;1&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel+Decorative:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Nornlore",
              url: SITE_URL,
              description:
                "Enter your birthday and discover the famous events, legendary people, music releases, and movies that share your exact date in history.",
              applicationCategory: "Entertainment",
              operatingSystem: "Any",
              author: {
                "@type": "Person",
                name: "Apoorv Darshan",
                url: "https://apoorvdarshan.com",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
