import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import PageTransition from "@/components/ui/PageTransition";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevLogs",
  description: "A public developer journal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-black text-white min-h-screen`}>
        <Navbar />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
