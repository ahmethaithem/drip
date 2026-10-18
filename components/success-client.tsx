"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { formatEGP } from "@/lib/commerce.mjs";
export function SuccessClient() {
  const query = useSearchParams();
  const [data,setData] = useState<{orderNumber:string;codAmountEGP:number}|null>(null);
  useEffect(() => { let value:null|{orderNumber:string;codAmountEGP:number}=null; try { const saved=sessionStorage.getItem("drip-egypt-last-order"); if(saved) value=JSON.parse(saved); } catch {} queueMicrotask(()=>setData(value)); }, []);
  const orderNumber = data?.orderNumber || query.get("order") || "—";
  return <div className="success-card"><div className="success-icon"><Check size={34} /></div><p className="kicker">ORDER CONFIRMED</p><h1>تم استلام طلبك بنجاح</h1><p>شكراً لاختيارك DRIP EGYPT. هنتواصل معاك لتأكيد تفاصيل الطلب قبل الشحن.</p><div className="success-details"><div><span>رقم الطلب</span><b dir="ltr">{orderNumber}</b></div>{data && <div><span>المبلغ النهائي</span><b>{formatEGP(data.codAmountEGP)}</b></div>}<div><span>طريقة الدفع</span><b>الدفع عند الاستلام</b></div></div><Link href="/#products" className="button button-dark">العودة للتسوق</Link></div>;
}

