import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
<<<<<<< Updated upstream
import { ClerkProvider } from "@clerk/nextjs";
=======
import { DataProvider } from "@/context/DataContext";
>>>>>>> Stashed changes
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< Updated upstream
  title: "AI Governance Platform",
  description: "AI governance and risk management powered by NIST AI RMF",
=======
  title: "AI Governance & Compliance",
  description: "NIST AI RMF – organization and product-level assessments",
>>>>>>> Stashed changes
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< Updated upstream
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
=======
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <DataProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </DataProvider>
      </body>
    </html>
>>>>>>> Stashed changes
  );
}
