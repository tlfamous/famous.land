import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { SafetyFooter } from "@/components/SafetyFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Famous Land Summer Quest",
  description: "A summer outdoor QR-code discovery game across Famous Land.",
  metadataBase: new URL("https://famous.land")
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
      <body>
        <Header />
        <main>{children}</main>
        <SafetyFooter />
      </body>
    </html>
  );
}
