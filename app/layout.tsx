import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://drip-egypt-store.bravebox33.chatgpt.site"),
  title: "DRIP EGYPT | جاكيتات عصرية في مصر",
  description: "تسوق جاكيتات DRIP EGYPT العصرية مع التوصيل لجميع محافظات مصر والدفع عند الاستلام.",
  openGraph: {
    locale: "ar_EG", type: "website", siteName: "DRIP EGYPT",
    title: "DRIP EGYPT | جاكيتات عصرية في مصر",
    description: "جاكيتات عصرية، توصيل لكل محافظات مصر، والدفع عند الاستلام.",
    images: ["/products/bmw/bmw-model.jpg"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f4f0e8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700&family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" /></head><body><CartProvider><SiteHeader />{children}<SiteFooter /></CartProvider></body></html>;
}

