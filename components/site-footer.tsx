export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <div className="brand brand-light">DRIP <span>EGYPT</span></div>
          <p>الدفع عند الاستلام · توصيل لكل محافظات مصر</p>
        </div>
        <div className="footer-links">
          <a href="/#products">المنتجات</a>
          <a href="/cart">السلة</a>
          <a href="/admin">الإدارة</a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} DRIP EGYPT</p>
      </div>
    </footer>
  );
}

