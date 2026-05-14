import type { CustomerCategoryResponse, CustomerCollectionResponse } from "@modular-monolith/clients-shared/api/types/productcatalog";
import "./landing-sidebar.css";

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.97-1.67L23 6H6" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

export function LandingSidebar({
  categories,
  collections,
}: {
  categories: CustomerCategoryResponse[];
  collections: CustomerCollectionResponse[];
}) {
  return (
    <div className="landing-sidebar">
      <span className="landing-sidebar-orb" aria-hidden="true" />
      <nav className="landing-sidebar-panel" aria-label="Menu">
        <div className="landing-sidebar-inner">

          {/* Icon links */}
          <div className="landing-sidebar-icons">
            <a href="/cart" className="landing-sidebar-icon-btn" aria-label="Giỏ hàng">
              <IconCart />
            </a>
            <a href="/account" className="landing-sidebar-icon-btn" aria-label="Tài khoản">
              <IconProfile />
            </a>
            <a href="/notifications" className="landing-sidebar-icon-btn" aria-label="Thông báo">
              <IconBell />
            </a>
          </div>

          <div className="landing-sidebar-divider" />

          {/* Categories */}
          {categories.length > 0 && (
            <div className="landing-sidebar-section">
              <div className="landing-sidebar-section-heading">Danh mục</div>
              <ul className="landing-sidebar-list">
                {categories.map((c) => (
                  <li key={c.id}>
                    <a href={`/categories/${c.slug}`} className="landing-sidebar-link">
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Collections */}
          {collections.length > 0 && (
            <div className="landing-sidebar-section">
              <div className="landing-sidebar-section-heading">Bộ sưu tập</div>
              <ul className="landing-sidebar-list">
                {collections.map((c) => (
                  <li key={c.id}>
                    <a href={`/collections/${c.slug}`} className="landing-sidebar-link">
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </nav>
    </div>
  );
}
