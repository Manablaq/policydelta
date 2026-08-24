import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";
import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim();

const vercelUrl =
  process.env.VERCEL_URL?.trim();

const siteUrl =
  configuredSiteUrl ||
  (vercelUrl
    ? `https://${vercelUrl}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: {
    default: "PolicyDelta — Consent integrity for evolving policies",
    template: "%s · PolicyDelta",
  },
  description:
    "PolicyDelta uses GenLayer to determine whether policy changes are material enough to require renewed consent.",
  applicationName: "PolicyDelta",
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
