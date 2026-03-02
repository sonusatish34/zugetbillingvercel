import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ThemeScript } from "@/components/ThemeScript";
import AuthGate from "@/components/AuthGate";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZuGet Billing System",
  description: "Comprehensive billing and inventory management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className}>
        <ThemeScript />
        <AuthGate>
          <Providers>{children}</Providers>
        </AuthGate>
      </body>
    </html>
  );
}