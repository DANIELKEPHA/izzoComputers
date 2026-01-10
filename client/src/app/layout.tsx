import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google"; // Google Fonts
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

// Sans-serif font
const geistSans = Inter({
    weight: ["400", "500", "700"], // specify the weights you need
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

// Monospace font
const geistMono = Fira_Mono({
    weight: ["400", "500", "700"], // specify the weights
    subsets: ["latin"],
    variable: "--font-geist-mono",
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
