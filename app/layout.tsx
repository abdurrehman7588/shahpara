import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";
import SmoothScroll from "@/components/motion/SmoothScroll";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import Toaster from "@/components/layout/Toaster";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import IntroLoader from "@/components/layout/IntroLoader";
import { getMenuData } from "@/lib/navigation";
import { getCatalog } from "@/lib/woo";
import { allowIndexing, site } from "@/lib/site";

// Fraunces is self-hosted (full axes: opsz, SOFT, WONK, wght) so builds never depend on a font CDN.
const display = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2", style: "normal", weight: "100 900" },
    { path: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
const sans = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
// Urdu is only used for accents, so it is not preloaded (it is the heaviest file).
const urdu = localFont({
  src: "../node_modules/@fontsource-variable/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-wght-normal.woff2",
  weight: "400 700",
  variable: "--font-urdu",
  display: "swap",
  preload: false,
  fallback: ["serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Shahpara — Handmade & personalised gifts from Lahore", template: "%s · Shahpara" },
  description: site.description,
  applicationName: "Shahpara",
  keywords: ["personalised gifts Pakistan", "Nikkah nama", "handmade cards Lahore", "Eidi envelopes", "Urdu calligraphy gifts", "name board", "Shahpara"],
  openGraph: {
    type: "website",
    siteName: "Shahpara",
    locale: "en_PK",
    url: site.url,
    title: "Shahpara — Handmade & personalised gifts",
    description: site.description,
    images: [{ url: site.heroImages[0], alt: "A flat-lay of Shahpara’s handmade cards, frames and gifts" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
  alternates: { canonical: "/" },
  robots: allowIndexing ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1F4A3A",
  width: "device-width",
  initialScale: 1,
};

const introScript = `try{if(sessionStorage.getItem('shahpara:intro-seen'))document.documentElement.classList.add('intro-seen')}catch(e){}`;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Shahpara",
  alternateName: site.urduName,
  url: site.url,
  logo: site.logo,
  image: site.heroImages[0],
  description: site.description,
  email: site.email,
  telephone: `+${site.whatsapp}`,
  address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
  sameAs: [site.instagram.url, site.facebook.url],
  currenciesAccepted: "PKR",
  paymentAccepted: "Bank transfer",
};

// Menus and listings refresh from WordPress at most this often (seconds); /api/revalidate refreshes them instantly.
export const revalidate = 300;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const menu = getMenuData(await getCatalog());
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${urdu.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <noscript>
          <style>{`[data-intro]{display:none}`}</style>
        </noscript>
        <link rel="preconnect" href="https://shahpara.pk" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="paper-grain">
        <StoreProvider>
          <a href="#main" className="sr-only z-[200] rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            Skip to content
          </a>
          <IntroLoader />
          <SmoothScroll />
          <AnnouncementBar />
          <Header menu={menu} />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster />
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}
