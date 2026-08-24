import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://nornlore.aopv.dev";

export const metadata: Metadata = {
  title: {
    default: "Nornlore — What History Shares Your Birthday? | Born On This Day",
    template: "%s — Nornlore",
  },
  description:
    "Discover famous events, people, music, and movies that share your birthday. Daily Prophet style magical newspaper with 366 dates and 2,594 tales.",
  keywords: [
    // Core birthday queries
    "what happened on my birthday",
    "this day in history",
    "today in history",
    "born on this day",
    "famous birthdays",
    "famous birthdays today",
    "celebrity birthdays",
    "celebrity birthdays today",
    "who shares my birthday",
    "who was born on my birthday",
    "share your birthday with",
    "birthday history",
    "birthday history lookup",
    "birthday history generator",
    "historical events by date",
    "historical events calendar",
    "birthday facts",
    "cool birthday facts",
    "fun birthday history",
    "what happened today in history",
    "on this day in history",
    "birthday newspaper",
    // Music & movie
    "songs released on my birthday",
    "movies released on my birthday",
    "number one song on my birthday",
    "what movie came out on my birthday",
    "what song was number one on my birthday",
    "music released on this day",
    // Harry Potter / Daily Prophet bait
    "daily prophet",
    "daily prophet newspaper",
    "daily prophet style",
    "daily prophet template",
    "daily prophet generator",
    "wizarding newspaper",
    "magical newspaper",
    "harry potter newspaper",
    "harry potter birthday",
    "hogwarts daily prophet",
    "enchanted newspaper",
    "moving photographs",
    "enchanted chronicles",
    // Brand
    "nornlore",
  ],
  authors: [{ name: "Apoorv Darshan", url: "https://apoorvdarshan.com" }],
  creator: "Apoorv Darshan",
  publisher: "Apoorv Darshan",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Nornlore",
    title: "Nornlore — What History Shares Your Birthday?",
    description:
      "Enter your birthday and discover famous events, people, music, and movies that share your date. Daily Prophet style newspaper with 2,594 tales.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nornlore — What History Shares Your Birthday? Daily Prophet style birthday newspaper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nornlore — What History Shares Your Birthday?",
    description:
      "Discover famous events, people, music, and movies that share your birthday. Daily Prophet style newspaper. 366 dates, 2,594 tales.",
    images: ["/og-image.png"],
    creator: "@aporvv",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "entertainment",
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
              alternateName: "Nornlore Birthday History",
              url: SITE_URL,
              description:
                "Enter your birthday and discover the famous events, legendary people, music releases, and movies that share your exact date in history. Styled like the Daily Prophet magical newspaper with moving photographs and enchanted chronicles.",
              applicationCategory: "Entertainment",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              keywords:
                "birthday history, this day in history, famous birthdays, daily prophet, wizarding newspaper, what happened on my birthday, born on this day, celebrity birthdays, birthday newspaper, moving photographs, enchanted chronicles, harry potter newspaper, birthday facts, songs released on my birthday, movies released on my birthday",
              inLanguage: "en",
              isAccessibleForFree: true,
              author: {
                "@type": "Person",
                name: "Apoorv Darshan",
                url: "https://apoorvdarshan.com",
                sameAs: [
                  "https://github.com/apoorvdarshan",
                  "https://www.linkedin.com/in/aopv/",
                  "https://x.com/aporvv",
                ],
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
      <body>
        {children}
      </body>
    </html>
  );
}
