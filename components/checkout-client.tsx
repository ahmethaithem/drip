"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";
import { Modal } from "./modal";
import { EGYPT_GOVERNORATES } from "@/lib/governorates";
import { getProduct } from "@/lib/products";
import { calculateTotals, formatEGP, normalizeEgyptianPhone } from "@/lib/commerce.mjs";
import { createIdempotencyKey, createOrderEndpoint, readJsonResponse } from "@/lib/checkout-submit.mjs";

type FormData = { fullName:string; primaryPhone:string; secondaryPhone:string; governorate:string; city:string; address:string; buildingNumber:string; floorApartment:string; landmark:string; notes:string; honeypot:string };
type DetailedItem = { product:NonNullable<ReturnType<typeof getProduct>>; productId:string; size:"S"|"M"|"L"|"XL"; quantity:number };
const initialForm: FormData = { fullName:"", primaryPhone:"", secondaryPhone:"", governorate:"", city:"", address:"", buildingNumber:"", floorApartment:"", landmark:"", notes:"", honeypot:"" };

export function CheckoutClient() {
  const router = useRouter();
  const { items, ready, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [idempotencyKey] = useState(createIdempotencyKey);
  const submitLock = useRef(false);
  const details = useMemo(() => items.flatMap((item) => { const product = getProduct(item.productId); return product ? [{ ...item, product }] : []; }), [items]);
  const totals = calculateTotals(details);

  function set(name: keyof FormData, value: string) { setForm((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: "" })); }
  function validate() {
    const next: Record<string,string> = {};
    if (form.fullName.trim().length < 3) next.fullName = "اكتب اسم المستلم بالكامل.";
    if (!normalizeEgyptianPhone(form.primaryPhone)) next.primaryPhone = "يرجى إدخال رقم موبايل مصري صحيح.";
    if (form.secondaryPhone && !normalizeEgyptianPhone(form.secondaryPhone)) next.secondaryPhone = "يرجى إدخال رقم موبايل مصري صحيح.";
    if (!EGYPT_GOVERNORATES.includes(form.governorate as (typeof EGYPT_GOVERNORATES)[number])) next.governorate = "اختار المحافظة.";
    if (form.city.trim().length < 2) next.city = "اكتب المدينة أو المنطقة.";
    if (form.address.trim().length < 5) next.address = "اكتب العنوان بالتفصيل.";
    setErrors(next); return Object.keys(next).length === 0;
  }
  function openReview(event: FormEvent) { event.preventDefault(); if (validate()) { setServerError(""); setReview(true); } }
  async function confirm() {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true); setServerError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    let stage = "prepare";
    try {
      const payload = { idempotencyKey, honeypot:form.honeypot, customer:form, items:items.map(({ productId,size,quantity }) => ({ productId,size,quantity })) };
      stage = "request";
      const response = await fetch(createOrderEndpoint(window.location.href), {
        method:"POST",
        credentials:"same-origin",
        cache:"no-store",
        headers:{ "Accept":"application/json", "Content-Type":"application/json" },
        body:JSON.stringify(payload),
        signal:controller.signal,
      });
      stage = "response";
      const result = await readJsonResponse(response) as { error?:string; orderNumber?:string; codAmountEGP?:number; reference?:string } | null;
      if (!response.ok || !result?.orderNumber) {
        const message = result?.error || "تعذر إرسال الطلب حالياً. حاول مرة أخرى بعد قليل.";
        throw new CheckoutSubmissionError(message, response.status);
      }
      stage = "complete";
      try {
        sessionStorage.setItem("drip-egypt-last-order", JSON.stringify({ orderNumber:result.orderNumber, codAmountEGP:result.codAmountEGP }));
      } catch {
        // Private browsing can reject storage; a saved order should still finish.
      }
      clearCart();
      router.replace(`/success?order=${encodeURIComponent(result.orderNumber)}`);
    } catch (error) {
      const message = error instanceof CheckoutSubmissionError
        ? error.message
        : error instanceof DOMException && error.name === "AbortError"
          ? "استغرق إرسال الطلب وقتاً أطول من المتوقع. حاول مرة أخرى، ولن يتم تكرار الطلب."
          : navigator.onLine === false
            ? "لا يوجد اتصال بالإنترنت. تحقق من الشبكة ثم حاول مرة أخرى."
            : "تعذر إرسال الطلب حالياً. بياناتك ما زالت محفوظة، حاول مرة أخرى بعد قليل.";
      console.error("Checkout submission failed", {
        stage,
        name: error instanceof Error ? error.name : "UnknownError",
        status: error instanceof CheckoutSubmissionError ? error.status : undefined,
      });
      setServerError(message);
    } finally {
      window.clearTimeout(timeout);
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  if (!ready) return <div className="empty-state"><p>جاري تحميل الطلب…</p></div>;
  if (!details.length) return <div className="empty-state"><ShoppingBag size={42} /><h2>لا يوجد طلب لإتمامه</h2><p>أضف جاكيتاً إلى السلة أولاً.</p><a href="/#products" className="button button-dark">تصفح الجاكيتات</a></div>;

  return (
    <>
      <form className="checkout-layout" onSubmit={openReview} noValidate>
        <div className="checkout-form">
          <div className="checkout-section-head"><span>01</span><div><h2>بيانات الاستلام</h2><p>اكتب البيانات اللي هنتواصل معاك عليها.</p></div></div>
          {serverError && <div className="form-error" role="alert">{serverError}</div>}
          <div className="form-grid">
            <Field label="اسم المستلم بالكامل" required error={errors.fullName}><input autoComplete="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
            <Field label="رقم الموبايل الأساسي" required error={errors.primaryPhone}><input dir="ltr" inputMode="tel" autoComplete="tel" placeholder="010XXXXXXXX" value={form.primaryPhone} onChange={(e) => set("primaryPhone", e.target.value)} /></Field>
            <Field label="رقم موبايل إضافي (اختياري)" error={errors.secondaryPhone}><input dir="ltr" inputMode="tel" value={form.secondaryPhone} onChange={(e) => set("secondaryPhone", e.target.value)} /></Field>
            <Field label="المحافظة" required error={errors.governorate}><select value={form.governorate} onChange={(e) => set("governorate", e.target.value)}><option value="">اختار المحافظة</option>{EGYPT_GOVERNORATES.map((name) => <option key={name}>{name}</option>)}</select></Field>
            <Field label="المدينة أو المنطقة" required error={errors.city}><input autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="العنوان بالتفصيل" required error={errors.address} full><textarea autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="رقم المبنى (اختياري)"><input value={form.buildingNumber} onChange={(e) => set("buildingNumber", e.target.value)} /></Field>
            <Field label="الدور ورقم الشقة (اختياري)"><input value={form.floorApartment} onChange={(e) => set("floorApartment", e.target.value)} /></Field>
            <Field label="علامة مميزة قريبة (اختياري)" full><input value={form.landmark} onChange={(e) => set("landmark", e.target.value)} /></Field>
            <Field label="ملاحظات الطلب (اختياري)" full><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
            <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(e) => set("honeypot", e.target.value)} /></label></div>
          </div>
        </div>
        <OrderSummary details={details} totals={totals} button />
      </form>

      <Modal open={review} title="راجع طلبك" onClose={() => !submitting && setReview(false)}>
        <OrderSummary details={details} totals={totals} />
        <div className="review-address"><h3>بيانات التوصيل</h3><p><b>{form.fullName}</b><br />{form.primaryPhone}<br />{form.governorate}، {form.city}<br />{form.address}</p></div>
        <p className="cod-review">هتدفع عند الاستلام: <b dir="ltr">{formatEGP(totals.codAmountEGP)}</b></p>
        {serverError && <div className="form-error" role="alert">{serverError}</div>}
        <div className="modal-actions"><button className="button button-outline" type="button" disabled={submitting} onClick={() => setReview(false)}>تعديل الطلب</button><button className="button button-dark" type="button" disabled={submitting} onClick={confirm}>{submitting ? "جاري التأكيد…" : "تأكيد الطلب"}</button></div>
      </Modal>
    </>
  );
}

class CheckoutSubmissionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "CheckoutSubmissionError";
  }
}

function Field({ label, required, error, full, children }: { label:string; required?:boolean; error?:string; full?:boolean; children:React.ReactNode }) {
  return <div className={`field${full ? " full" : ""}`}><label><span>{label} {required && <span aria-hidden="true">*</span>}</span>{children}</label>{error && <span className="field-error" role="alert">{error}</span>}</div>;
}

function OrderSummary({ details, totals, button=false }: { details:DetailedItem[]; totals:ReturnType<typeof calculateTotals>; button?:boolean }) {
  return <aside className="summary-card checkout-summary"><h2>ملخص الطلب</h2><div className="summary-items">{details.map(({ product,size,quantity }) => <div className="summary-item" key={`${product.id}:${size}`}><Image src={product.images[0]} alt={product.name} width={62} height={72} /><div><p>{product.name}</p><small>المقاس {size} · الكمية {quantity}</small></div><strong dir="ltr">{formatEGP(product.priceEGP * quantity)}</strong></div>)}</div><div className="summary-row"><span>المنتجات</span><strong dir="ltr">{formatEGP(totals.subtotalEGP)}</strong></div><div className="summary-row"><span>الشحن</span><strong dir="ltr">{formatEGP(totals.shippingFeeEGP)}</strong></div><div className="summary-row total"><span>الإجمالي</span><strong dir="ltr">{formatEGP(totals.codAmountEGP)}</strong></div>{button && <button type="submit" className="button button-dark button-full">مراجعة وتأكيد الطلب</button>}</aside>;
}

