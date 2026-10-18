"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "./cart-provider";
import { getProduct } from "@/lib/products";
import { calculateTotals, formatEGP } from "@/lib/commerce.mjs";

export function CartPageClient() {
  const { items, ready, updateQuantity, removeItem } = useCart();
  const details = items.flatMap((item) => {
    const product = getProduct(item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const totals = calculateTotals(details);

  if (!ready) return <div className="empty-state"><p>جاري تحميل السلة…</p></div>;
  if (!details.length) return (
    <div className="empty-state">
      <ShoppingBag size={42} aria-hidden="true" />
      <h2>السلة فاضية</h2>
      <p>اختار الجاكيت والمقاس المناسب، وهنحتفظ بيهم هنا.</p>
      <a href="/#products" className="button button-dark">تصفح الجاكيتات</a>
    </div>
  );

  return (
    <div className="cart-layout">
      <div className="cart-list">
        {details.map(({ product, size, quantity }) => (
          <article className="cart-item" key={`${product.id}:${size}`}>
            <a href={`/products/${product.slug}`} className="cart-image"><Image src={product.images[0]} alt={product.name} fill sizes="130px" /></a>
            <div className="cart-item-info">
              <p className="eyebrow">{product.gender}</p>
              <h2><a href={`/products/${product.slug}`}>{product.name}</a></h2>
              <p>المقاس: <b>{size}</b> · اللون: {product.color}</p>
              <span>سعر القطعة: <b dir="ltr">{formatEGP(product.priceEGP)}</b></span>
            </div>
            <div className="cart-item-actions">
              <strong dir="ltr">{formatEGP(product.priceEGP * quantity)}</strong>
              <div className="quantity-control">
                <button type="button" onClick={() => updateQuantity(product.id, size, quantity - 1)} disabled={quantity <= 1} aria-label="تقليل الكمية"><Minus size={15} /></button>
                <output>{quantity}</output>
                <button type="button" onClick={() => updateQuantity(product.id, size, quantity + 1)} disabled={quantity >= 10} aria-label="زيادة الكمية"><Plus size={15} /></button>
              </div>
              <button type="button" className="remove-button" onClick={() => removeItem(product.id, size)}><Trash2 size={16} /> حذف</button>
            </div>
          </article>
        ))}
      </div>
      <aside className="summary-card cart-summary">
        <h2>ملخص السلة</h2>
        <div className="summary-row"><span>إجمالي المنتجات</span><strong dir="ltr">{formatEGP(totals.subtotalEGP)}</strong></div>
        <div className="summary-row"><span>مصاريف الشحن</span><strong dir="ltr">{formatEGP(totals.shippingFeeEGP)}</strong></div>
        <div className="summary-row total"><span>الإجمالي النهائي</span><strong dir="ltr">{formatEGP(totals.codAmountEGP)}</strong></div>
        <p className="cod-note">الدفع عند الاستلام · الشحن مرة واحدة لكل الطلب</p>
        <a href="/checkout" className="button button-dark button-full">إتمام الطلب</a>
        <a href="/#products" className="continue-link">متابعة التسوق</a>
      </aside>
    </div>
  );
}

