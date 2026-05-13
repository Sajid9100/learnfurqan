import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnFurqan — Learn Quran Online with Certified Teachers Worldwide",
  description:
    "Live one-on-one Quran classes for kids and adults. Flexible schedules, verified teachers, proven results. Start your free trial today.",
  keywords: [
    "Quran online",
    "Quran teacher",
    "Tajweed",
    "Hifz",
    "Islamic learning",
    "Quran classes for kids",
  ],
  openGraph: {
    title: "LearnFurqan — Learn Quran Online",
    description:
      "Live one-on-one Quran classes with certified teachers worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0F766E",
          colorText: "#0A0F1A",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    >
      {tree}
    </ClerkProvider>
  );
}
