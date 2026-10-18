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
  return <html lang="ar" dir="rtl"><body><CartProvider><SiteHeader />{children}<SiteFooter /></CartProvider></body></html>;
}

