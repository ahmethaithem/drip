import type { Metadata } from "next";
import Link from "next/link";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = { title: "سلة التسوق | DRIP EGYPT" };

export default function CartPage() {
  return <main className="page-shell shell"><div className="breadcrumb"><Link href="/">الرئيسية</Link> / السلة</div><h1 className="page-title">سلة التسوق</h1><p className="page-intro">راجع المقاسات والكميات قبل إتمام الطلب.</p><CartPageClient /></main>;
}

