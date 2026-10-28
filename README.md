# VolleyDefense Tactics 🏐

Interactive volleyball court defense positioning and transition simulator, tailored specifically for **COED 6v6 teams** (3 men and 3 women in rotational play) as well as conventional systems.

Built with **Svelte 5 (Runes)**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 📖 Documentation & Specifications

The complete architectural, tactical, and functional specifications are maintained as dedicated modules in the [`docs/`](./docs) directory:

- [**System Requirements**](./docs/Requirements.md) — Concise checklist of all functional and architectural requirements (REQ-01 to REQ-25).
- [**Strategies Specification**](./docs/Strategies.md) — Core domain model (`Strategy = Rotation + Opponent Scenario + Base Positioning + Defensive Positioning`), 3-column workspace, view/edit lifecycle, and persistence.
- [**COED Volleyball Rules**](./docs/CoedRules.md) — 6v6 alternating gender rotation, multi-touch contact rules, and net blocking constraints.
- [**UI & Layout Hierarchy**](./docs/layout/Layout.md) — 3-column workspace (Strategies, Court + Overlay Controls, Phases), status visual language, mobile-friendly touch constraints, and [interactive prototype](./docs/layout/prototype.html).
- [**Shared Links & Guest Mode**](./docs/SharedLinks.md) — Strategy-only compressed URL sharing (`#share=...`), zero-backend architecture, and read-only guest mode.
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
│   ├── Requirements.md           # Concise system requirements checklist (REQ-01 to REQ-23)
│   ├── Strategies.md             # Domain model: Strategy = rotation + base + defense formations
│   ├── CoedRules.md              # Official COED 6v6 league rules & blocking constraints
│   ├── layout/
│   │   ├── Layout.md             # 3-column UI architecture & component hierarchy
│   │   └── prototype.html        # Interactive responsive HTML/CSS/JS prototype
│   ├── SharedLinks.md            # Public shared links & read-only guest mode
│   └── roadmap/
│       └── ProTier.md            # Post-V1 roadmap: cloud database, user accounts & shortlinks
├── src/
│   ├── components/
│   │   ├── layout/               # 3-column layout containers (Strategies, Court, Phases, TopHeader)
│   │   ├── court/                # Court canvas modules (Floor, Net, Zones, Tokens, Opponents, Target, Ball, Overlays)
│   │   ├── strategies/           # Strategy row, edit form, and sticky action footer
│   │   ├── controls/             # PhaseTogglerCard (SVG thumbnail, status badge, reset)
│   │   ├── modals/               # Dialog modals (ShareModal)
│   │   └── common/               # Reusable UI primitives (Button, Dialog, MarkdownEditor)
│   ├── data/
│   │   ├── coedRules.ts          # COED front-row analysis & blocking rules
│   │   ├── defaultLayout.ts      # Default coordinates & seed strategies generator
│   │   ├── defaultRoster.ts      # Default COED 3M / 3F roster
│   │   ├── shareCodec.ts         # URL serialization/deserialization for shared strategies
│   │   ├── strategyAdapter.ts    # Transforms strategies to court animation movements & scenarios
│   │   ├── strategyRegistry.ts   # Local persistence, initial seeds, and CRUD operations
│   │   └── strategyStore.svelte.ts # Svelte 5 runes store managing active tactic state
│   ├── types/
│   │   └── volleyball.ts         # TypeScript domain models (Strategy, BaseLayout, DefenseLayout, etc.)
│   ├── utils/
│   │   └── markdown.ts           # Safe markdown-to-HTML parser
│   ├── App.svelte                # Root coordinator component
│   └── main.ts
└── package.json
```
