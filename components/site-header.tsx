"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a href="/" className="brand" aria-label="DRIP EGYPT - الرئيسية">
          DRIP <span>EGYPT</span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <a href="/">الرئيسية</a>
          <a href="/#products">المنتجات</a>
        </nav>
        <a href="/cart" className="bag-link" aria-label={`السلة، ${count} منتجات`}>
          <ShoppingBag aria-hidden="true" size={21} />
          <span>السلة</span>
          <b>{count}</b>
        </a>
      </div>
    </header>
  );
}

