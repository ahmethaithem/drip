import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatEGP } from "@/lib/commerce.mjs";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-wrap" aria-label={`عرض ${product.name}`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 760px) 100vw, 33vw"
          className="product-image"
        />
      </Link>
      <div className="product-card-body">
        <p className="eyebrow">{product.gender}</p>
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        <div className="product-card-foot">
          <strong>{formatEGP(product.priceEGP)}</strong>
          <Link href={`/products/${product.slug}`} className="text-link">
            عرض التفاصيل <ArrowLeft size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

