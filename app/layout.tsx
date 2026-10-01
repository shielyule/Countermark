import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Countermark",
  description:
    "Paste an unfair bill or charge. Get a ready-to-send dispute email.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#f7f9fb] font-sans text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
