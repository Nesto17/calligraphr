import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "Calligraphr",
  description: "Turn your handwriting into a real, installable font",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAF8] text-[#1A1A1A] antialiased">
        {children}
      </body>
    </html>
  );
}
