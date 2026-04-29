* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #a3e635;
  --green-dark: #5aa800;
  --text: #2d2d2d;
  --text-muted: #6b6b6b;
  --border: #e8e8e8;
  --white: #ffffff;
}

.app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  background: var(--white);
  min-height: 100vh;
}

/* NAV */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 64px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-logo { cursor: pointer; }
.logo-box {
  background: var(--green);
  color: #1a2e05;
  font-weight: 800;
  font-size: 18px;
  padding: 6px 14px;
  border-radius: 8px;
  letter-spacing: 1px;
}
.logo-box-sm {
  background: var(--green);
  color: #1a2e05;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 1px;
  display: inline-block;
}
.nav-center { display: flex; gap: 28px; align-items: center; }
.nav-center a {
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: 500;
}
.nav-center a:hover { color: var(--text); }
.nav-right { display: flex; gap: 12px; align-items: center; }
.user-greeting { font-size: 13px; color: var(--text-muted); }

.btn-link {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary {
  background: var(--green);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #1a2e05;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.btn-primary:hover { background: var(--green-dark); color: var(--white); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* HERO */
.hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1;
}
.hero-content {
  position: relative;
  z-index: 2;
  padding: 48px 24px;
  width: 100%;
}
.hero h1 {
  font-size: 48px;
  font-weight: 800;
  color: var(--white);
  line-height: 1.1;
  margin-bottom: 14px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}
.hero h1 span { color: var(--green); }
.hero p {
  font-size: 16px;
  color: rgba(255,255,255,0.92);
  max-width: 540px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

/* SEARCH */
.search-pill {
  background: var(--white);
  border-radius: 16px;
  display: flex;
  align-items: stretch;
  max-width: 720px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  overflow: hidden;
}
.sf {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 18px;
  border-right: 1px solid var(--border);
  min-width: 0;
  text-align: left;
}
.sf:last-of-type { border-right: none; }
.sf-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  text-transform: uppercase;
}
.sf input {
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-muted);
  background: transparent;
  width: 100%;
  font-family: inherit;
}
.search-btn {
  background: var(--green);
  border: none;
  width: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-btn:hover { background: var(--green-dark); }
.search-btn svg { width: 22px; height: 22px; }

/* SECTION */
.section {
  padding: 48px 28px;
  max-width: 1280px;
  margin: 0 auto;
}
.sec-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
}

/* CATEGORIES */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.cat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  border-radius: 14px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  background: var(--white);
  transition: all 0.2s;
}
.cat-card:hover {
  border-color: var(--green);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(163,230,53,0.15);
}
.cat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.cat-name {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

/* CARDS */
.cards-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.cards-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.card {
  background: var(--white);
  border-radius: 14px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}
.card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.1);
}
.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}
.card-body { padding: 14px 16px; }
.card-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.card-loc { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
.card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.tag {
  font-size: 11px;
  background: #f0fdf4;
  color: #2d7a2d;
  border-radius: 100px;
  padding: 3px 10px;
  font-weight: 500;
}
.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-price { font-size: 15px; font-weight: 700; color: var(--green-dark); }
.card-cap { font-size: 12px; color: var(--text-muted); }

/* CTA HOST */
.cta-host {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.cta-title { font-size: 22px; font-weight: 800; color: var(--green); margin-bottom: 8px; }
.cta-desc { font-size: 14px; color: #aaa; max-width: 380px; line-height: 1.6; }

/* FOOTER */
.footer {
  padding: 24px 28px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  font-size: 12px;
  color: #999;
}

/* MINI SEARCH */
.mini-search {
  padding: 16px 28px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.mini-search input,
.mini-search select {
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--white);
}
.mini-search input { width: 160px; }

/* LISTING */
.listing-wrap {
  display: grid;
  grid-template-columns: 260px 1fr;
  max-width: 1280px;
  margin: 0 auto;
}
.filters-sidebar {
  padding: 24px 20px;
  border-right: 1px solid var(--border);
  background: var(--white);
}
.sf-group { margin-bottom: 24px; }
.sf-group-title {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.filters-sidebar input,
.filters-sidebar select {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--white);
}
.chk-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-muted);
}
.chk-row input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--green);
  cursor: pointer;
}
.results-area {
  padding: 24px;
  background: var(--white);
}
.results-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.results-bar span { font-size: 14px; color: var(--text-muted); }
.results-bar strong { color: var(--text); }

/* DETAIL */
.back-bar {
  padding: 16px 28px;
  border-bottom: 1px solid var(--border);
  background: var(--white);
}
.back-bar a {
  color: var(--green-dark);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.det-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  padding: 28px;
  max-width: 1280px;
  margin: 0 auto;
}
.det-main-img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 20px;
  display: block;
}
.det-title { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
.det-loc { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
.det-desc { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; }
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}
.stat-item {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}
.stat-val { font-size: 18px; font-weight: 700; }
.stat-lab { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.attrs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.attr {
  background: #f9ffe6;
  border: 1px solid #d9f99d;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #1a5a05;
  font-weight: 500;
}
.quote-box {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  position: sticky;
  top: 80px;
}
.qb-price { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
.qb-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 18px; }
.qb-sec {
  margin-top: 14px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* AUTH */
.auth-wrap {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f9fafb;
}
.auth-card {
  background: var(--white);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
.auth-title { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
.auth-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; }
.fg { margin-bottom: 16px; }
.fg label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.fg input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--white);
  outline: none;
}
.fg input:focus { border-color: var(--green); }
.role-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.role-btn {
  padding: 12px 8px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.role-btn:hover { border-color: var(--green); }
.role-btn.on {
  background: var(--green);
  border-color: var(--green-dark);
  color: #1a2e05;
  font-weight: 600;
}
.chip-btn {
  padding: 6px 14px;
  border: 1.5px solid var(--border);
  border-radius: 100px;
  background: var(--white);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.chip-btn:hover { border-color: var(--green); }
.chip-btn.on {
  background: var(--green);
  border-color: var(--green-dark);
  color: #1a2e05;
  font-weight: 600;
}
.auth-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin: 12px 0;
}
.auth-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin: 12px 0;
}
.auth-switch {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-muted);
}
.auth-switch a {
  color: var(--green-dark);
  font-weight: 600;
  cursor: pointer;
}

/* HOST DASHBOARD */
.stat-card {
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.stat-num { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
.stat-lab2 { font-size: 12px; color: var(--text-muted); }

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero h1 { font-size: 32px; }
  .nav-center { display: none; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .cards-3col, .cards-2col { grid-template-columns: 1fr; }
  .listing-wrap { grid-template-columns: 1fr; }
  .filters-sidebar { border-right: none; border-bottom: 1px solid var(--border); }
  .det-layout { grid-template-columns: 1fr; }
  .search-pill { flex-direction: column; }
  .sf { border-right: none; border-bottom: 1px solid var(--border); }
  .search-btn { width: 100%; padding: 14px; }
  .user-greeting { display: none; }
}

/* BADGE COUNT (notificações no nav) */
.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 100px;
  margin-left: 4px;
}
