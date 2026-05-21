import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Github repo search",
  description: "Search for repositories on GitHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              Github Repo Search
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
