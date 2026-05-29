import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Header from "@/app/components/Header";
import Footer from "./components/Footer";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { Providers } from "./theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAMX.lk | CCTV & Smart Security Solutions",

  description: "Professional CCTV cameras and smart security systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        className="
          min-h-screen
          bg-background
          text-foreground
          antialiased
          transition-colors
          duration-300
        "
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <Providers>
            <Header />

            <main className="flex-1">{children}</main>

            <Footer />
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
