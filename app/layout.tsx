import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { FeaturesProvider } from "@/components/features-provider";
import { AvatarSettingsProvider } from "@/components/avatar-settings-provider";
import { AppearanceProvider } from "@/components/appearance-provider";
import { SITE_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { fontVariableClasses } from "@/lib/theme/next-fonts";
import { APPEARANCE_COOKIE, buildThemeCss, parseUserAppearance, resolveTheme } from "@/lib/theme/config";

const title = "Pairly — Every Celebration Deserves to Feel Personal";
const description =
  "Create beautiful, AI-powered greeting cards and gift cards featuring people, traditions, and cultures that truly represent your loved ones.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s · Pairly",
  },
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Pairly",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ theme, features, avatars }, cookieStore] = await Promise.all([getSiteSettings(), cookies()]);
  const userAppearance = parseUserAppearance(cookieStore.get(APPEARANCE_COOKIE)?.value);
  const themeCss = buildThemeCss(resolveTheme(theme, userAppearance));

  return (
    <html lang="en" suppressHydrationWarning className={`${fontVariableClasses} h-full antialiased`}>
      <head>
        {/* Admin theme + visitor overrides. Colors are validated hex/rgba; see lib/theme/config.ts. */}
        <style id="pairly-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme={theme.defaultMode}
          enableSystem
          disableTransitionOnChange
        >
          <FeaturesProvider features={features}>
            <AvatarSettingsProvider settings={avatars}>
              <AppearanceProvider theme={theme} user={userAppearance}>
                <SessionProvider>
                  <TooltipProvider delay={200}>
                    {children}
                    <ScrollToTop />
                    <Toaster position="top-center" richColors closeButton />
                  </TooltipProvider>
                </SessionProvider>
              </AppearanceProvider>
            </AvatarSettingsProvider>
          </FeaturesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
