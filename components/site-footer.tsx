import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <div className="brand brand-light">DRIP <span>EGYPT</span></div>
          <p>ستايل شارع مصري بثقة وحضور.</p>
        </div>
        <div className="footer-links">
          <Link href="/#products">المنتجات</Link>
          <Link href="/cart">السلة</Link>
          <Link href="/admin">الإدارة</Link>
        </div>
        <p className="copyright">© {new Date().getFullYear()} DRIP EGYPT</p>
      </div>
    </footer>
  );
}

