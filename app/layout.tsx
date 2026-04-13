import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PersonaProvider } from "@/lib/persona";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Talent Edge",
  description: "AI-Powered Early Careers Recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <PersonaProvider>{children}</PersonaProvider>
      </body>
    </html>
  );
}
