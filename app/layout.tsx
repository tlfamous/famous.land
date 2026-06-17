import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Famous Land Quest",
  description: "An outdoor QR-code discovery game across Famous Land.",
  metadataBase: new URL("https://famous.land"),
  applicationName: "Famous Land",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Famous Land"
  },
  formatDetection: {
    telephone: false
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico?v=cow-emoji", sizes: "any" },
      { url: "/icon.svg?v=cow-emoji", type: "image/svg+xml" },
      { url: "/icon-192.png?v=cow-emoji", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=cow-emoji", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=cow-emoji", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/favicon.ico?v=cow-emoji"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10140d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=cow-emoji" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
