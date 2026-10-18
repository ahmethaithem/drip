import { PackageCheck } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default function Home() {
  return (
    <main className="catalog-home">
      <section className="shell catalog-section" id="products">
        <header className="catalog-intro">
          <p className="catalog-brand">BEST SELLERS</p>
          <h1>الأكثر مبيعاً</h1>
          <p>اختار موديلك ومقاسك، وادفع عند الاستلام</p>
          <div className="catalog-note">
            <PackageCheck size={18} aria-hidden="true" />
            <span>شحن ثابت 100 EGP لكل الطلب</span>
          </div>
        </header>

        <div className="products-grid catalog-grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

