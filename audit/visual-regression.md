# Visual Regression & Layout Comparison Report

## 1. Overview & Verification Methodology
Visual comparison was conducted between the target reference capture (`scratch/silverbhai_dom.html`, `scratch/reference_target.png`) and the reconstructed application served at `http://localhost:5173/`.

High-resolution screenshots were captured using Playwright Chromium across two standardized viewports:
1. **Desktop Viewport**: $1280 \times 800$ px (Standard laptop display)
2. **Mobile Viewport**: $390 \times 844$ px (iPhone 14/15 profile with touch emulation)

Screenshots are persisted in `audit/screenshots/`.

---

## 2. Design Tokens & Visual Fidelity Matrix

| Design Attribute | Target Reference (`silverbhai.com`) | Reconstructed Implementation (`E:\SLIVER-EXCHANGE`) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Header Background** | Dark Cyan (`#073b4c`) | Maroon (`#800000`) | **CUSTOMIZED** | Changed to Maroon as requested by client |
| **Sub-Header Background** | Deep Teal (`#052833`) | Deep Maroon (`#580000`) | **CUSTOMIZED** | Synchronized with Maroon palette |
| **Footer Background** | Dark Cyan (`#073b4c`) | Maroon (`#800000`) | **CUSTOMIZED** | Changed to Maroon as requested by client |
| **Body Background** | `#16191C` | `#16191C` | **MATCH (1:1)** | Exact dark theme body canvas |
| **Back Odds Color** | `#72bbef` | `#72bbef` | **MATCH (1:1)** | Standard exchange blue |
| **Lay Odds Color** | `#faa9ba` | `#faa9ba` | **MATCH (1:1)** | Standard exchange pink |
| **Suspended Odd Box** | `#e9ecef` / `#dee2e6` | `#dee2e6` (with lock icon) | **MATCH (1:1)** | Suspended state with centered lock |
| **Typography Family** | `Roboto Condensed, sans-serif` | `Roboto Condensed, sans-serif` | **MATCH (1:1)** | Google Fonts CDN + local fallbacks |
| **Odds Ladder Width** | 6 columns $\times$ 80px = 480px | 6 columns $\times$ 80px = 480px | **MATCH (1:1)** | 3 Back tiers + 3 Lay tiers |
| **Table Borders** | `#293339` | `#293339` | **MATCH (1:1)** | Grid lines conform to target CSS |
| **Left Sidebar Accordion** | Collapsible sports tree | Collapsible sports tree | **MATCH (1:1)** | Badges, count pills & live icons |
| **Right Sidebar Bet Slip** | Slide-in drawer with stake buttons | Slide-in drawer with stake buttons | **MATCH (1:1)** | Increments (+100 to +25,000) & liability math |

---

## 3. Viewport Breakdown

### 3.1. Desktop Viewport ($1280 \times 800$)
- **Three-Column Grid**:
  - Left Sidebar: $220\text{px}$ fixed-width accordion tree.
  - Center Container: Flexible layout accommodating match market cards, live scoreboards, and 6-column ladder grids.
  - Right Sidebar: $320\text{px}$ live TV streaming card and interactive bet slip.
- **Top Header Bar**:
  - Left: Brand logo (`public/logo.png`, height $38\text{px}$) + Home icon.
  - Center: Live match quick search input with autocomplete overlay.
  - Right: Rules modal trigger, APK download button, live balance badge (`₹1,00,000`), exposure indicator (`₹0.00`), and user dropdown menu.
- **Subnav Bar**:
  - Ticker marquee with announcement text.
  - Bottom navigation links: `In-Play`, `Cricket`, `Football`, `Tennis`, `Casino`, and `Crash` (with red Aviator SVG icon).

### 3.2. Mobile Viewport ($390 \times 844$)
- **Responsive Drawer**: Left sidebar collapses into an off-canvas drawer triggered by the hamburger icon (`fas fa-bars`).
- **Right Sidebar Stacking**: Bet slip transforms into a docked sticky bottom container when an odd box is clicked, preventing horizontal overflow.
- **Table Density**: 6-column odds ladder switches gracefully to 2-column best Back / Lay view on narrow viewports ($< 768\text{px}$), matching target mobile behavior.

---

## 4. Visual Evidence Artifacts

The following screenshot files are stored in `audit/screenshots/`:
- `desktop_login.png`: Unauthenticated login gateway.
- `desktop_register.png`: Registration form with mobile verification fields.
- `desktop_home.png`: Logged-in homepage with maroon header/footer, sports fixture table, and casino grid.
- `desktop_game-details_4_710711374.png`: Match details view featuring live radar, scorecard, and 6-column odds ladder.
- `desktop_betslip_active.png`: Active bet slip with odds calculation, stake chips, and profit/liability figures.
- `desktop_search_autocomplete.png`: Search input with live dropdown suggestions.
- `desktop_user_dropdown.png`: User menu showing 11 options (Account Statement, Profit & Loss, Change Password, etc.).
- `desktop_casino-list.png`: Full casino games lobby.
- `desktop_account-statement.png`: Statement passbook with date filter.
- `mobile_home.png`: Mobile home view.
- `mobile_sidebar_open.png`: Mobile off-canvas sports drawer active.
- `mobile_game_details.png`: Mobile cricket match view.

