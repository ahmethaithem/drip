"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="DRIP EGYPT - الرئيسية">
          DRIP <span>EGYPT</span>
        </Link>
        <nav aria-label="التنقل الرئيسي">
          <Link href="/">الرئيسية</Link>
          <Link href="/#products">المنتجات</Link>
        </nav>
        <Link href="/cart" className="bag-link" aria-label={`السلة، ${count} منتجات`}>
          <ShoppingBag aria-hidden="true" size={21} />
          <span>السلة</span>
          <b>{count}</b>
        </Link>
      </div>
    </header>
  );
}

