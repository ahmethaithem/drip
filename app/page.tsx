import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Banknote, MapPin, ShieldCheck } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default function Home() {
  return (
    <main>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="kicker">DROP 01 · CAIRO</p>
          <h1>ستايل مختلف.<br /><em>حضور أقوى.</em></h1>
          <p className="hero-lead">جاكيتات مختارة بعناية، توصيل لجميع محافظات مصر، والدفع عند الاستلام.</p>
          <Link href="#products" className="button button-dark">تسوق الآن <ArrowLeft size={19} aria-hidden="true" /></Link>
        </div>
        <div className="hero-visual">
          <Image src="/products/bmw/bmw-model.jpg" alt="جاكيت BMW من DRIP EGYPT" fill priority sizes="(max-width: 800px) 100vw, 52vw" />
          <div className="hero-stamp" aria-hidden="true">DRIP<br />EGYPT</div>
          <div className="hero-caption"><span>01</span> جاكيتات الموسم</div>
        </div>
      </section>

      <section className="trust-bar" aria-label="مميزات الطلب">
        <div className="shell trust-grid">
          <div><Banknote aria-hidden="true" /><span><b>الدفع عند الاستلام</b><small>ادفع عند وصول طلبك</small></span></div>
          <div><MapPin aria-hidden="true" /><span><b>كل محافظات مصر</b><small>شحن ثابت 100 جنيه</small></span></div>
          <div><ShieldCheck aria-hidden="true" /><span><b>راجع قبل التأكيد</b><small>كل التفاصيل واضحة</small></span></div>
        </div>
      </section>

      <section className="products-section shell" id="products">
        <div className="section-heading">
          <div><p className="kicker">THE COLLECTION</p><h2>اختار جاكيتك</h2></div>
          <p>ثلاث اختيارات. نفس الحضور القوي.</p>
        </div>
        <div className="products-grid">{PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="closing-banner shell">
        <p>شحن موحد لكل الطلبات</p>
        <h2>مهما كان عدد الجاكيتات، الشحن <em>100 جنيه فقط.</em></h2>
        <Link href="#products" className="button button-light">اختار جاكيتك <ArrowLeft size={19} /></Link>
      </section>
    </main>
  );
}

