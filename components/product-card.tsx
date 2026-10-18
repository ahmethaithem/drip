import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatEGP } from "@/lib/commerce.mjs";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link
        href={`/products/${product.slug}`}
        className="product-image-wrap"
        aria-label={`عرض ${product.name}`}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 760px) 100vw, 33vw"
          className="product-image"
        />
      </Link>
      <div className="product-card-body">
        <h2>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
          <span>({product.gender})</span>
        </h2>
        <div className="product-card-foot">
          <strong>{formatEGP(product.priceEGP)}</strong>
          <Link
            href={`/products/${product.slug}`}
            className="product-open"
            aria-label={`اختار ${product.name}`}
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

