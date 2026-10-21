import type { Metadata, Viewport } from "next";
import { Geist_Mono, Onest, Sora } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { site } from "@/lib/site";
import "./globals.css";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Onest({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f8fe" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1b3a" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("Meta"), getLocale()]);
  const url = `https://${site.domain}`;

  return {
    metadataBase: new URL(url),
    title: { default: t("title"), template: `%s | ${site.name}` },
    description: t("description"),
    keywords: t("keywords").split(", "),
    applicationName: site.name,
    authors: [{ name: site.author, url: site.github }],
    creator: site.author,
    category: "technology",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title: t("title"),
      description: t("description"),
      locale: locale === "de" ? "de_AT" : "en_US",
      alternateLocale: locale === "de" ? ["en_US"] : ["de_AT"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          <SmoothScroll />
          <CustomCursor />
          <ScrollProgress />
        </ThemeProvider>
      </body>
    </html>
  );
}
