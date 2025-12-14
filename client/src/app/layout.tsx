import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Izzo Computers | Laptops, Printers and Accessory Shop",
    description:
        "Shop the latest laptops, cameras, and accessories at Izzo Computers. Get high-quality accessory at unbeatable prices, fast delivery, and reliable customer support across Kenya.",
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}
