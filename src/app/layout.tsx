import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nornlore — What History Shares Your Birthday?",
  description:
    "Enter your birthday and discover the famous events, people, music, and movies that share your date in history.",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
