import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/site-url";

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Finfix Motors Limited — Car Dealership in Dar es Salaam & Dodoma, Tanzania",
    template: "%s | Finfix Motors Limited",
  },
  description:
    "Finfix Motors Limited is a trusted car dealership serving Dar es Salaam and Dodoma, Tanzania. Waagizaji wa magari aina yote — buy and sell quality vehicles, import cars on order, and get reliable vehicle transportation. Exceptional Service, Extraordinary Vehicle.",
  keywords: [
    "car dealership Dar es Salaam",
    "car dealership Dodoma",
    "cars for sale Tanzania",
    "magari Dar es Salaam",
    "magari Dodoma",
    "buy car Dar es Salaam",
    "buy car Dodoma",
    "sell car Tanzania",
    "import car Tanzania",
    "Finfix Motors",
    "Finfix Motors Limited",
    "gari Tanzania",
    "waagizaji wa magari",
  ],
  authors: [{ name: "Finfix Motors Limited" }],
  icons: {
    icon: "/images/finfix-icon.png",
    apple: "/images/finfix-apple-icon.png",
  },
  openGraph: {
    title: "Finfix Motors Limited — Car Dealership in Dar es Salaam & Dodoma, Tanzania",
    description:
      "Waagizaji wa Magari Aina Yote. Buy, sell and import vehicles with Finfix Motors Limited — Dar es Salaam & Dodoma, Tanzania. Exceptional Service, Extraordinary Vehicle.",
    url: siteUrl,
    siteName: "Finfix Motors Limited",
    locale: "en_TZ",
    type: "website",
    images: [
      {
        url: "/images/og-finfix.jpg",
        width: 1200,
        height: 630,
        alt: "Finfix Motors Limited — Exceptional Service, Extraordinary Vehicle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finfix Motors Limited — Car Dealership in Tanzania",
    description:
      "Waagizaji wa Magari Aina Yote — Dar es Salaam & Dodoma. Exceptional Service, Extraordinary Vehicle.",
    images: ["/images/og-finfix.jpg"],
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
