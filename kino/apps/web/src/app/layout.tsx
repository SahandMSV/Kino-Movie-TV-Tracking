import { Suspense } from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { TolgeeNextProvider } from "@/tolgee/client";
import { getTolgee } from "@/tolgee/server";
import { getLanguage } from "@/tolgee/language";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Kino",
  description: "Every story worth watching, in one place.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLanguage();
  const tolgee = await getTolgee();
  const staticData = await tolgee.loadRequired();

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", "font-sans", outfit.variable)}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <ThemeProvider>
          <TolgeeNextProvider language={locale} staticData={staticData}>
            <Suspense fallback={null}>{children}</Suspense>
          </TolgeeNextProvider>
          <Toaster position='bottom-right' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
