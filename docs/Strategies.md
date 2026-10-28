# Strategies Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](./Requirements.md)*  
> *Related: [Layout.md](./layout/Layout.md) · [SharedLinks.md](./SharedLinks.md) · [CoedRules.md](./CoedRules.md)*  
> *Last updated: October 2026*

---

## 1. Overview

A **Strategy** is the self-contained unit of the application: it carries its own name, tactical notes (markdown description), serving rotation, **opponent attack scenario** (`setter`, `attacker`, `target`), **base positioning**, and **defensive positioning**.

```
Strategy = Name + Notes + Rotation + Opponent Scenario (Setter, Attacker, Target) + Base Positioning + Defensive Positioning
```

- Coaches **browse, create, edit, duplicate, delete, and share strategies**.
- There is **no separate formation/preset library**. Base and defensive positions live *inside* the strategy and are edited as part of it.
- Sharing accepts **strategies only**, bundled in a compressed link.
- New boards start **empty** (`0` strategies) with clean placeholders in the workspace until a strategy is created or imported.

### 1.1 Vocabulary & Terminology

| Term | Meaning |
|---|---|
| **Strategy** | Named, self-contained tactical unit: rotation, opponent scenario (setter, attacker, target), base positioning, and defensive positioning. |
| **Base positioning** | Start coordinates of the 6 defenders (pre-contact reading phase). |
| **Defensive positioning** | End coordinates of the 6 defenders + tactical actions (post-contact reaction phase). |
| **Opponent attack scenario** | Opponent setter, attacker contact point, and initial attack landing target on defending court, defined directly on the strategy. |
| **Default positioning** | Built-in template copied when a strategy is created or when a formation phase is reset. |
| **Active strategy** | The strategy selected in Column 1 (marked with an `Eye` icon and primary outline). |
| **Visible phase** | The phase (`Base` or `Defensive`) currently rendered on the court. |
| **Draft** | A working copy of a strategy while it is being edited. |

> **Terminology Standard**: Always use **Man / Men** and **Woman / Women** in user-facing text (never "male" or "female").

---

## 2. Domain Model

```ts
type Zone = 1 | 2 | 3 | 4 | 5 | 6;

interface BaseLayout {
  defenders: Record<Zone, CourtPosition>;   // 6 defenders keyed by court zone
}

interface DefenseLayout {
  defenders: Record<Zone, CourtPosition>;   // 6 defenders keyed by court zone
  actions?: Partial<Record<Zone, DefenseActionType>>; // blocker / digger roles
}

interface Strategy {
  id: string;
  name: string;            // required, 1-60 chars, must be unique across strategies
  description?: string;    // markdown notes
  rotation: 1 | 2;         // 1 = Man Serving, 2 = Woman Serving
  setter: CourtPosition;   // opponent setter position (ball starts here in Base)
  attacker: CourtPosition; // opponent attacker position / contact point (ball glides here in Defense)
  target: CourtPosition;   // initial attack landing target on defending court
  base: BaseLayout;
  defense: DefenseLayout;
}
```

### 2.1 Positions are keyed by court zone

Defenders are keyed by **court zone (1–6)**, not by player id. Who stands in each zone is derived from the strategy's **rotation** lineup (see [CoedRules.md](./CoedRules.md)). Consequences:

- A strategy never references other entities; it is a plain value and trivially copyable and shareable.
- Changing the rotation in edit mode **keeps the positions by zone** and relabels the tokens for the new lineup (colors and front-row blocker eligibility update automatically).

### 2.2 Opponent scenario & interactive attack target

Opponent setter, attacker, and landing target coordinates belong directly to the **Strategy**:
- In the **Base** phase: the ball is stationed with the setter; defenders hold reading positions.
- In the **Defensive** phase: the ball glides to the attacker, the spiker trajectory arrow points to `target`, the target reticle is displayed, and blocker shadow cones are projected from the blockers against the attack line.
- **Interactive Target Coverage Testing (Read Mode & Edit Mode)**:
  - The `target` coordinate saved on the strategy defines the **initial** landing spot.
  - In **Read Mode** (both normal and shared links), users can freely drag the target around the defending court to test coverage against different attack angles without mutating the saved strategy.
  - In **Edit Mode**, dragging the target updates the strategy's saved initial `target` coordinate.
  - **Dynamic Coverage Indicator**: The target reticle renders **green** (`emerald`) whenever it falls within any non-blocking defender's radius of action (`150px` diameter / `15%` court width radius) and **red** (`rose`) when uncovered.

### 2.3 Default positioning

A single built-in template, **zone-keyed and rotation-agnostic**, defines:
- 6 defender positions (a balanced 6-up/base spread).
- Opponent setter, attacker, and target positions.

When a new strategy is created, default values are seeded into both `base` and `defense`, as well as `setter`, `attacker`, and `target`. **Reset Base / Reset Defensive** in edit mode restores default defender positions for the active phase.

---

## 3. Workspace Layout (Read Mode vs. Edit Mode)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER                              [Copy to My Strategies / Share] [Theme Toggle] │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ COL 1 (Collapsible)     │ SHARED HEADER FOR COLS 2 & 3                                 │
│ [«] STRATEGIES  [+ New] │ [ [svg] Base | [svg] Defensive ] [▶ Play]     [⚙] [✎ Edit]   │
│                         ├─────────────────────────────────────────┬────────────────────┤
│ ┌─ border-primary ────┐ │ COL 2: COURT BODY                       │ COL 3: DETAILS     │
│ │ 👁 Outside Cross    │ │                                         │ ┌─ Rotation ─────┐ │
│ │ [♂ Man Serving]     │ │            18m × 9m COURT               │ │ ♂ Man Serving  │ │
│ └─────────────────────┘ │     (Target draggable: Green / Red)     │ └────────────────┘ │
│                         │                                         │ ┌─ Notes ────────┐ │
│ (In Edit Mode, Col 1    │                                         │ │ Markdown notes │ │
│  becomes Edit Form)     │                                         │ └────────────────┘ │
└─────────────────────────┴─────────────────────────────────────────┴────────────────────┘
```

| Area | Read Mode | Edit Mode |
|---|---|---|
| **Column 1 (Left)** | Collapsible Strategies list (`+ New`, `Edit`, `Duplicate`, `Delete`). Active strategy shows an `Eye` icon (`👁`) and high-contrast rotation badge. On mobile (`< lg`), opens as a left slide-out drawer from a trigger bar above the court. | Transforms into the non-collapsible **Edit Strategy Form**: Strategy Name (with duplicate-name validation), Serving Rotation segmented toggle (`♂ Man Serving` / `♀ Woman Serving`), and Formations segmented toggle (`Base` / `Defensive` with SVG thumbnails and phase `Reset`). |
| **Cols 2 & 3 Header** | Full-width header with bottom border: segmented Formation Toggle (`Base` / `Defensive` with SVG thumbnails) + **`Play` / `Reset`** transition button (`2.2s` animation) on the left; **Settings** dropdown (`⚙` court overlay toggles) + **`Edit`** button on the right. | Same header, with **`Cancel`**, **`Save as new`**, and **`Save`** replacing the `Edit` button on the right. |
| **Column 2 (Middle)** | 18m × 9m court canvas. Attack target is freely draggable to test defender coverage (green = covered, red = uncovered). | Full interactive canvas: defenders, opponent setter, opponent attacker, and attack target are all draggable. |
| **Column 3 (Right)** | Displays **Serving Rotation** card and rendered markdown **Notes** card stacked vertically. | Displays the markdown **Notes** editor (`MarkdownEditor`). |

---

## 4. Lifecycle & Validation

### 4.1 Initial Empty Board
- On first launch (when `localStorage` is empty), the board starts with **0 strategies** (`[]`).
- When no strategy is active or being drafted, Column 1 shows an empty-list prompt and Columns 2 & 3 display empty-state placeholders with a **Create First Strategy** CTA.

### 4.2 Creation, Saving & Duplicate Name Validation
- Clicking **`+ New`** creates a draft from the default positioning and enters Edit Mode.
- Both **`Save`** and **`Save as new`** validate that the strategy name is non-empty and **not already in use by another strategy** (case-insensitive). If a duplicate name is detected, an inline error is shown under the Strategy Name input.

### 4.3 Duplication & Deletion
- **Duplicate (`Copy`)**: Clones any strategy as `"{Name} (Copy)"` with a fresh ID and selects it.
- **Delete (`Trash2`)**: Prompts for confirmation before deleting. Deleting the last strategy leaves the board empty (`[]`).

---

## 5. Component Map

| Folder | Components |
|---|---|
| `src/components/layout/` | `Strategies.svelte` (Col 1 list & edit form container), `Court.svelte` (Col 2 canvas), `Phases.svelte` (Col 3 details & notes editor), `TopHeader.svelte` |
| `src/components/strategies/` | `StrategyRow.svelte`, `StrategyEditForm.svelte` |
| `src/components/controls/` | `PhaseTogglerCard.svelte` (segmented Base / Defensive toggle with SVG thumbnails) |
| `src/components/court/` | `CourtOverlayControls.svelte` (Settings dropdown), `CourtFloor.svelte`, `CourtNet.svelte`, `CourtZones.svelte`, `CourtPlayerToken.svelte`, `CourtOpponents.svelte`, `CourtLandingTarget.svelte`, `CourtBall.svelte`, `CourtOverlaySvg.svelte`, `CourtThumbnail.svelte` |
| `src/components/modals/` | `ShareModal.svelte`, `ImportSharedModal.svelte` |
| `src/data/` | `strategyStore.svelte.ts`, `strategyRegistry.ts`, `defaultLayout.ts`, `strategyAdapter.ts`, `shareCodec.ts`, `coedRules.ts`, `defaultRoster.ts` |
