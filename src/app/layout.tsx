import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/drawers/cart-drawer";

const ebGaramondHeading = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loki",
  description: "Loki storefront",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        ebGaramondHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <CartDrawer />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
