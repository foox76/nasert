import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
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
  title: "ConsignKeep - Premium Matcha Distribution",
  description: "Track sales, inventory and clients with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fdfcf8] text-[#1a2e25]`}
      >
        <div className="mx-auto max-w-md min-h-screen bg-[#fdfcf8] relative shadow-2xl shadow-black/5 overflow-hidden">
          {children}
          <NavBar />
        </div>
      </body>
    </html>
  );
}
