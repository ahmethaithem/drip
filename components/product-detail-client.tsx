"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banknote, MapPin, PackageCheck, Minus, Plus } from "lucide-react";
import type { Product, Size } from "@/lib/products";
import { SIZES } from "@/lib/products";
import { formatEGP } from "@/lib/commerce.mjs";
import { useCart } from "./cart-provider";
import { Modal } from "./modal";

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [image, setImage] = useState(product.images[0]);
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  function add(goToCheckout = false) {
    if (!size) {
      setError("اختار المقاس المناسب قبل إضافة المنتج.");
      return;
    }
    setError("");
    addItem({ productId: product.id, size, quantity });
    if (goToCheckout) router.push("/checkout");
    else setAdded(true);
  }

  return (
    <>
      <div className="product-detail-grid">
        <div className="gallery">
          <div className="gallery-main">
            <Image src={image} alt={`${product.name} - صورة المنتج`} fill priority sizes="(max-width: 850px) 100vw, 55vw" />
          </div>
          <div className="thumbnails" aria-label="صور المنتج">
            {product.images.map((src, index) => (
              <button key={src} type="button" className={src === image ? "active" : ""} onClick={() => setImage(src)} aria-label={`عرض صورة ${index + 1}`}>
                <Image src={src} alt="" fill sizes="90px" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <p className="kicker">DRIP EGYPT · JACKETS</p>
          <h1>{product.name}</h1>
          <p className="product-gender">{product.gender}</p>
          <strong className="product-price">{formatEGP(product.priceEGP)}</strong>
          <p className="product-description">{product.description}</p>
          <dl className="product-facts">
            <div><dt>اللون</dt><dd>{product.color}</dd></div>
            <div><dt>الفئة</dt><dd>جاكيتات</dd></div>
          </dl>

          <fieldset className="size-picker">
            <legend>اختار المقاس <span>*</span></legend>
            <div>{SIZES.map((option) => <button key={option} type="button" className={size === option ? "active" : ""} onClick={() => { setSize(option); setError(""); }}>{option}</button>)}</div>
          </fieldset>
          {error && <p className="field-error" role="alert">{error}</p>}

          <div className="quantity-row">
            <span>الكمية</span>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="تقليل الكمية"><Minus size={16} /></button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))} disabled={quantity >= 10} aria-label="زيادة الكمية"><Plus size={16} /></button>
            </div>
          </div>

          <div className="product-actions">
            <button type="button" className="button button-dark" onClick={() => add(false)}>أضف إلى السلة</button>
            <button type="button" className="button button-outline" onClick={() => add(true)}>اطلب الآن</button>
          </div>
          <div className="product-trust">
            <div><Banknote /><span>الدفع عند الاستلام</span></div>
            <div><MapPin /><span>توصيل لجميع محافظات مصر</span></div>
            <div><PackageCheck /><span>مصاريف الشحن 100 ج.م للطلب</span></div>
          </div>
        </div>
      </div>

      <Modal open={added} title="تمت الإضافة إلى السلة" onClose={() => setAdded(false)}>
        <div className="added-product">
          <Image src={product.images[0]} alt={product.name} width={90} height={110} />
          <div><h3>{product.name}</h3><p>المقاس: {size} · الكمية: {quantity}</p><strong>{formatEGP(product.priceEGP * quantity)}</strong></div>
        </div>
        <div className="modal-actions">
          <Link href="/cart" className="button button-dark">الذهاب إلى السلة</Link>
          <button type="button" className="button button-outline" onClick={() => setAdded(false)}>متابعة التسوق</button>
        </div>
      </Modal>
    </>
  );
}

