# Public Shared Links & Isolated Shared Mode Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](./Requirements.md)*  
> *Domain Model: [docs/Strategies.md](./Strategies.md)*  
> *Last updated: October 2026*

---

## 1. Overview & Objectives

Coaches need to share complete defensive game plans with their players without forcing players to register, log in, or risk altering the coach's work.

The unit of sharing is the **Strategy** (name, notes, rotation, setter, attacker, target, base formation, and defensive formation). See [Strategies.md](./Strategies.md). **Only strategies can be shared**; there is no arbitrary limit on how many strategies can be bundled into a share link.

---

## 2. Compressed URL Architecture ("URL as Database")

Sharing requires **zero backend infrastructure**. Selected strategies are serialized into a `SharePayloadV2` JSON structure and encoded into the URL hash (`#share=...`).

```ts
interface SharedCourtConfig {
  showZones?: boolean;
  showAllArrows?: boolean;
  showBlockShadow?: boolean;
  showCoverageRange?: boolean;
  is3DView?: boolean;
}

interface SharePayloadV2 {
  v: 2;
  title?: string;
  courtConfig?: SharedCourtConfig;
  strategies: Omit<Strategy, 'id'>[];
}
```

- Strategies are **self-contained**, so no cross-references or deduplication are needed. Fresh IDs are generated when a recipient copies strategies into their own board.
- Player names are never included; rotations are modeled by court zone numbers and gender colors.

---

## 3. Coach Workflow (Generating a Shared Link)

1. **Initiate Share**: Coach clicks the **Share** button in the top header (disabled when the board has 0 strategies or while a strategy is being edited).
2. **Share Modal (`ShareModal.svelte`)**:
   - **Playbook Title** (optional): Shown in the header badge when recipients open the link.
   - **Strategy Picker**: Lists all strategies with checkboxes (`Select All`, `[X Selected]`) and side-by-side Base & Defensive SVG thumbnails.
   - **Court Display Settings**: Lets the coach choose which court overlays (`Blocker Shadow`, `Defense Coverage`, `Court Zones (1–6)`, `Motion Vectors`, `3D Tilt`) are initially enabled when recipients open the shared link. By default, **only `Blocker Shadow` is enabled** (`showBlockShadow: true`, all other overlays `false`).
3. **Generate & Copy**: Encodes the selected strategies and court display settings into `#share=...` and copies the URL to the clipboard.

---

## 4. Isolated Shared View Mode (Recipient Experience)

When a user opens a shared link (`/#share=...`):

### 4.1 Strict Isolation & Read-Only Invariants
- **Isolated In-Memory Board (`strategyStore.isSharedMode = true`)**:
  - The app displays **only** the strategies contained in the shared URL.
  - Opening a shared link **never overwrites or mixes with** the recipient's existing `localStorage` strategies.
- **Read-Only Restrictions**:
  - `+ New`, `Edit`, `Duplicate`, and `Delete` actions are hidden.
  - Defender tokens, opponent setter, and opponent attacker cannot be dragged.
- **Interactive Exploration Allowed**:
  - Recipients can switch between the shared strategies in Column 1.
  - Recipients can toggle between **Base** and **Defensive** formations, click **Play / Reset** (`2.2s` transition animation), and toggle all court overlays via the **Settings (`⚙`)** menu.
  - Recipients can **freely drag the attack landing target** on the court to test how the shared defensive formation covers different attack spots (**green** = covered within a defender's radius of action, **red** = uncovered).

### 4.2 Header Actions: Selective Copy or Exit to Own Board
While viewing a shared link, the Top Header displays a `Shared Playbook` badge alongside two actions:
1. **`Copy to My Strategies`** (primary button):
   - Opens [`ImportSharedModal.svelte`](../src/components/modals/ImportSharedModal.svelte), allowing the user to select which shared strategies they want to copy (all pre-selected by default, with `Select All / Deselect All`).
   - Clicking **Copy Selected (N)** imports the chosen strategies with fresh IDs into the user's `localStorage` board, clears `#share=...` from the URL, and exits Shared Mode so the strategies become fully editable.
2. **`Create My Own Strategies`** (secondary button):
   - Exits Shared Mode without importing, clears `#share=...` from the URL, and loads the user's own local board.
