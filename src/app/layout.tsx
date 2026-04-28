import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import "./globals.css";

const handFont = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "Doodle Font Maker",
  description: "Create your own handwritten font from doodles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${handFont.variable} h-full`}>
      <body className="min-h-full flex flex-col font-hand">{children}</body>
    </html>
  );
}
