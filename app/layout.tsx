import type { Metadata } from "next";
import { Didact_Gothic } from "next/font/google";
import "./globals.css";

const didactGothic = Didact_Gothic({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-didact-gothic",
});

export const metadata: Metadata = {
  title: "Words That Sound Like...",
  description:
    "Find words that sound like a given word, supporting multiple languages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${didactGothic.variable} antialiased`}>{children}</body>
    </html>
  );
}
