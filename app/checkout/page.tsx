import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutClient } from "@/components/checkout-client";
export const metadata: Metadata = { title: "إتمام الطلب | DRIP EGYPT" };
export default function CheckoutPage() { return <main className="page-shell shell"><div className="breadcrumb"><Link href="/">الرئيسية</Link> / <Link href="/cart">السلة</Link> / إتمام الطلب</div><h1 className="page-title">إتمام الطلب</h1><p className="page-intro">الدفع عند الاستلام · توصيل لكل محافظات مصر.</p><CheckoutClient /></main>; }

