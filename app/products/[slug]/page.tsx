import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/products";
import { ProductDetailClient } from "@/components/product-detail-client";

export function generateStaticParams() { return PRODUCTS.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | DRIP EGYPT`,
    description: `${product.description} السعر 1,499 ج.م والتوصيل لكل محافظات مصر.`,
    openGraph: { locale: "ar_EG", title: `${product.name} | DRIP EGYPT`, description: product.description, images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <main className="page-shell shell"><div className="breadcrumb"><Link href="/">الرئيسية</Link> / <Link href="/#products">المنتجات</Link> / {product.name}</div><ProductDetailClient product={product} /></main>;
}

