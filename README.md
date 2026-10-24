# VolleyDefense Tactics 🏐

Interactive volleyball court defense positioning and transition simulator, tailored specifically for **COED 6v6 teams** (3 men and 3 women in rotational play) as well as conventional systems.

Built with **Svelte 5 (Runes)**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 📖 Documentation & Specifications

The complete architectural, tactical, and functional specifications are maintained as dedicated modules in the [`docs/`](./docs) directory:

- [**System Requirements**](./docs/Requirements.md) — Concise checklist of all functional and architectural requirements (REQ-01 to REQ-19).
- [**COED Volleyball Rules**](./docs/CoedRules.md) — 6v6 alternating gender rotation, multi-touch contact rules, and net blocking constraints.
- [**UI & Layout Hierarchy**](./docs/layout/Layout.md) — Header exclusivity, View Options placement, tactical hierarchy, mobile-friendly touch constraints, and [interactive prototype](./docs/layout/prototype.html).
- [**Shared Links & Guest Mode**](./docs/SharedLinks.md) — V1 compressed URL sharing (up to 3 tactics), zero-backend architecture, and read-only guest mode.
- [**V2 Pro Tier Roadmap**](./docs/roadmap/ProTier.md) — Post-V1 roadmap: multi-device cloud sync, team accounts, and unlimited shortlinks.

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start development server
```bash
pnpm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Code Validation (0 Errors / 0 Warnings)
```bash
pnpm run scan
```
Runs `oxlint` and `svelte-check` across all files.

---

## 📁 Project Structure

```
volleyball-ideas/
├── docs/
│   ├── Requirements.md           # Concise system requirements checklist (REQ-01 to REQ-19)
│   ├── CoedRules.md              # Official COED 6v6 league rules & blocking constraints
│   ├── layout/
│   │   ├── Layout.md             # UI architecture, view options & component hierarchy
│   │   └── prototype.html        # Interactive responsive HTML/CSS/JS prototype
│   ├── SharedLinks.md            # Public shared links & read-only guest mode
│   └── roadmap/
│       └── ProTier.md            # Post-V1 roadmap: cloud database, user accounts & shortlinks
├── data/
│   └── volleyball.db             # Local SQLite database
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Card, Badge, Dialog primitives
│   │   ├── Court.svelte          # SVG interactive court, vectors & player tokens
│   │   ├── Controls.svelte       # Rotations, Stage Position, Presets & View options
│   │   ├── CourtThumbnail.svelte # Miniature preset preview thumbnail
│   │   ├── SaveAdjustmentModal.svelte # Modal to save custom base or attack presets
│   │   ├── DatabaseModal.svelte  # SQLite database inspector
│   │   └── RosterModal.svelte    # COED 3M / 3F lineup & role editor
│   ├── data/
│   │   ├── coedRules.ts          # COED front-row analysis & blocking rules
│   │   ├── defaultRoster.ts      # Default COED 3M / 3F roster
│   │   ├── scenarios.ts          # Built-in opponent attack catalog
│   │   ├── schemeRegistry.ts     # Base defense schemes & local persistence
│   │   └── customScenarios.ts    # Custom attack scenarios manager
│   ├── server/
│   │   └── sqlitePlugin.ts       # Vite SQLite server integration
│   ├── types/
│   │   └── volleyball.ts         # TypeScript domain models
│   ├── App.svelte                # Root coordinator component
│   └── main.ts
└── package.json
```
