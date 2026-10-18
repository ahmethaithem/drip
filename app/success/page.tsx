import { Suspense } from "react";
import type { Metadata } from "next";
import { SuccessClient } from "@/components/success-client";
export const metadata: Metadata = { title: "تم استلام طلبك | DRIP EGYPT", robots:{ index:false, follow:false } };
export default function SuccessPage() { return <main className="page-shell shell"><Suspense fallback={<div className="empty-state">جاري تحميل الطلب…</div>}><SuccessClient /></Suspense></main>; }

