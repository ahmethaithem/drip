import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatEGP } from "@/lib/commerce.mjs";

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;

  return (
    <article className="product-card">
      <a href={href} className="product-card-link" aria-label={`عرض تفاصيل ${product.name}`}>
        <span className="product-image-wrap">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 760px) 100vw, 33vw"
            className="product-image"
          />
        </span>
        <span className="product-card-body">
          <span className="eyebrow">{product.gender}</span>
          <h2 className="product-card-title">{product.name}</h2>
          <span className="product-card-foot">
            <strong>{formatEGP(product.priceEGP)}</strong>
            <span className="text-link">
              <span>عرض التفاصيل</span>
              <small>VIEW DETAILS</small>
              <ArrowLeft size={17} aria-hidden="true" />
            </span>
          </span>
        </span>
      </a>
    </article>
  );
}

