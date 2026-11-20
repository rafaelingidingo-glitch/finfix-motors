import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const headingFont = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Elly Magari — Car Dealership in Mwanza, Tanzania",
    template: "%s | Elly Magari",
  },
  description:
    "Elly Magari is a trusted car dealership in Pasiansi, Mwanza, Tanzania. Buy and sell quality vehicles, import cars on order, and get reliable vehicle transportation. Located opposite Lenana Hotel.",
  keywords: [
    "car dealership Mwanza",
    "cars for sale Tanzania",
    "magari Mwanza",
    "buy car Mwanza",
    "sell car Tanzania",
    "import car Tanzania",
    "Elly Magari",
    "gari Mwanza",
    "car yard Pasiansi",
  ],
  authors: [{ name: "Elly Magari" }],
  icons: {
    icon: "/images/elly-magari-logo.jpg",
    apple: "/images/elly-magari-logo.jpg",
  },
  openGraph: {
    title: "Elly Magari — Car Dealership in Mwanza, Tanzania",
    description:
      "Quality Cars. Trusted Service. Buy, sell and import vehicles with Elly Magari — Pasiansi, Mwanza, Tanzania.",
    url: siteUrl,
    siteName: "Elly Magari",
    locale: "en_TZ",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1440, height: 720, alt: "Elly Magari car showroom" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elly Magari — Car Dealership in Mwanza, Tanzania",
    description: "Quality Cars. Trusted Service. Your Journey Starts With Us.",
    images: ["/images/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${headingFont.variable} ${bodyFont.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
