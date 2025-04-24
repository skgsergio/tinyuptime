import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PAGE_TITLE,
  description: process.env.NEXT_PUBLIC_PAGE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-gray-900 text-gray-300">
        {children}
      </body>
    </html>
  );
}