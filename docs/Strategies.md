# Strategies Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](./Requirements.md)*  
> *Related: [Layout.md](./layout/Layout.md) · [SharedLinks.md](./SharedLinks.md) · [CoedRules.md](./CoedRules.md)*  
> *Last updated: October 2026*

---

## 1. Overview

A **Strategy** is the only unit of the application. It is **self-contained**: it carries its own name, description, rotation, **base positioning**, and **defensive positioning**.

```
Strategy = Name + Description + Rotation + Base positioning + Defensive positioning
```

- Coaches **browse, create, edit, delete, and share strategies**.
- There is **no separate formation/preset library**. Base and defensive positions live *inside* the strategy and are edited as part of it.
- Sharing accepts **strategies only**, bundled in a compressed link.

### 1.1 Vocabulary

| Term | Meaning |
|---|---|
| **Strategy** | Named, self-contained tactical unit: rotation, opponent scenario (setter, attacker, target), base positioning, and defensive positioning. |
| **Base positioning** | Start coordinates of the 6 defenders (reading phase). |
| **Defensive positioning** | End coordinates of the 6 defenders + tactical actions (reaction phase). |
| **Opponent attack scenario** | Opponent setter, attacker contact point, and attack landing target on defending court, defined directly on the strategy. |
| **Default positioning** | Built-in template copied when a strategy is created or reset. |
| **Active strategy** | The strategy selected in column 1. Always exactly one. |
| **Visible phase** | The phase (Base or Defensive) currently rendered on the court. |
| **Draft** | A working copy of a strategy while it is being edited. |

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
  name: string;            // required, 1-60 chars
  description?: string;    // markdown
  rotation: 1 | 2;         // 1 = Man Serving, 2 = Woman Serving
  setter: CourtPosition;   // opponent setter position (ball starts here in Base)
  attacker: CourtPosition; // opponent attacker position / contact point (ball glides here in Defense)
  target: CourtPosition;   // attack landing target on defending court
  base: BaseLayout;
  defense: DefenseLayout;
}
```

### 2.1 Positions are keyed by court zone

Defenders are keyed by **court zone (1-6)**, not by player id. Who stands in each zone is derived from the strategy's **rotation** lineup (see [CoedRules.md](./CoedRules.md)). Consequences:

- A strategy never references other entities; it is a plain value and trivially copyable and shareable.
- Changing the rotation in edit mode **keeps the positions by zone** and relabels the tokens for the new lineup (gender colors and front-row blocker eligibility update automatically).

### 2.2 Opponent scenario directly on the Strategy

Opponent setter, attacker, and landing target coordinates belong directly to the **Strategy**:
- In the **Base** phase: the ball is stationed with the setter; defenders hold reading positions.
- In the **Defensive** phase: the ball glides to the attacker, the spiker trajectory arrow points to `target`, the target reticle is displayed, and blocker shadow cones are projected from the blockers against the attack line.
- In **Edit mode**: defenders, setter, attacker, and target reticle are all draggable on the canvas and update the draft directly.

### 2.3 Default positioning

A single built-in template, **zone-keyed and rotation-agnostic**, defines:

- 6 defender positions (a standard balanced 6-up/base spread).
- Opponent setter, attacker, and target positions.

When a new strategy is created, default values are seeded into both `base` and `defense`, as well as `setter`, `attacker`, and `target`. **Reset to default** (per phase) restores default defender positions for that phase.

### 2.4 All strategies are user-manageable (`isCustom` not needed)

- There is no distinction between "built-in" and "custom" strategies; all strategies are first-class items stored in client storage.
- The app provides clean initial default strategies on first launch so the collection is never empty.
- Every strategy can be edited, renamed, saved, deleted, or forked via **Save as new**.

---

## 3. Layout (3 Columns)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER                                    [Share] [Theme] [Settings] │
├───────────────┬──────────────────────────────────┬───────────────────────┤
│ COL 1         │ COL 2                            │ COL 3                 │
│ STRATEGIES    │ COURT                            │ PHASES                │
│ [+ New]       │ [Court Controls: Zones, 3D, ...] │ ┌───────────────────┐ │
│ ● Strat A     │ ──────────────────────────────── │ │ Base Formation    │ │
│ ○ Strat B     │                                  │ │  (svg thumbnail)  │ │
│ ○ Strat C     │        COURT CANVAS              │ │ [Active]          │ │
│               │                                  │ ├───────────────────┤ │
│               │                                  │ │ Defensive Format. │ │
│               │                                  │ │  (svg thumbnail)  │ │
│               │                                  │ └───────────────────┘ │
└───────────────┴──────────────────────────────────┴───────────────────────┘
```

| Column | Content |
|---|---|
| **1 - Strategies** | List of strategies, **+ New** button, per-row **Edit** and **Delete**. Selected row = active strategy. |
| **2 - Court** | **Top**: Court controls (Zones, Motion Vectors, Blocker Shadow, Coverage Range, 3D Perspective). **Bottom**: Court canvas. |
| **3 - Phases** | **View mode**: Indicates the **active phase** rendered on court via two thumbnail cards (Base / Defensive); clicking a card switches the active phase. Active strategy name and markdown description below. **Edit mode**: Phase cards with per-phase edit tools, strategy edit form, and sticky footer. |

On viewports below 1024px the columns stack: strategies (collapsible) -> court -> phases.

---

## 4. Modes

### 4.1 View mode (default)

- One strategy is active. The court renders its base and defensive positioning.
- **Column 2 (Court)**:
  - **Top**: Quick court controls (`CourtOverlayControls`) for toggling visual overlays: Court Zones (1–6), Motion Vector Arrows, Blocker Shadow Cone, Coverage Range, and 3D Perspective.
  - **Bottom**: The full 18m × 9m court canvas in read-only mode.
- **Column 3 (Phases)**:
  - Displays two large cards stacked vertically:
    1. **Base Formation** with its SVG thumbnail
    2. **Defensive Formation** with its SVG thumbnail
  - **Indicates the active phase**: The card matching the active phase on the court gets the prominent active treatment (blue/green outline, active tag).
  - Clicking either card switches the active phase on the court with smooth transition animation.
  - The strategy's name and rendered markdown description are shown beneath the phase cards.
- Court is **read-only**: no dragging, no save alerts.
- Actions available: select another strategy, **Edit**, **Delete**, **Share**.

### 4.2 Edit mode

Entered via **Edit** on any strategy, or **+ New**.

- A **draft** copy of the strategy is created. Nothing is persisted until **Save**.
- The court becomes interactive: defenders, opponent attacker/setter, and attack target are draggable ([REQ-03](./Requirements.md#req-03)). Dragging modifies the phase currently visible or the shared attack scenario.
- **Column 3** keeps the Base / Defensive toggler and adds an **edit form**:
  - **Name** (required) and **Description** (markdown).
  - **Rotation** switcher (*Man Serving* / *Woman Serving*). Changing it keeps positions by zone and relabels tokens ([Section 2.1](#21-positions-are-keyed-by-court-zone)).
  - **Per-phase tools** on each phase card: **Reset to default** (restores the default positioning for that phase).
- **Focused edit lock**: other strategies in column 1 are disabled while a draft exists. Share is disabled.
- Footer actions:

| Action | Behavior |
|---|---|
| **Save** | Persists the draft over the active strategy. Disabled until a name is present. |
| **Save as new** | Forks the draft into a new strategy. Always available when a name is present. |
| **Cancel** | Discards the draft and returns to view mode. |

### 4.3 Dirty tracking

A draft is **dirty** when name, description, rotation, or any coordinate differs from the saved strategy. While dirty:

- The court container and the modified phase card show the amber `.is-dirty` outline ([REQ-03B](./Requirements.md#req-03b)).
- Cancelling prompts for confirmation.
- Base and defensive modifications are tracked **independently** ([REQ-02](./Requirements.md#req-02)); switching phases never clears either.

---

## 5. Lifecycle

```
            ┌─────────────┐   Edit / + New   ┌─────────────┐
            │  View mode  │ ───────────────▶ │  Edit mode  │
            │ (read-only) │ ◀─────────────── │   (draft)   │
            └─────────────┘  Save / Cancel   └─────────────┘
                   │                                │
                   │ Share strategies               │ Save as new
                   ▼                                ▼
             #share=...  link                  new strategy
```

### 5.1 Creation (**+ New**)

1. A draft is created from the **default positioning** (both phases), with the rotation of the active strategy and an empty name.
2. App enters edit mode; the name field is focused.
3. **Save** is disabled until a name is provided.

### 5.2 Deletion

- Confirmation dialog required before deleting a strategy.
- If the deleted strategy was active, the first remaining strategy becomes active. If all strategies were deleted, a new default strategy is recreated so at least one strategy always exists.

### 5.3 Duplication (Clone)

- Any strategy in Column 1 can be duplicated via the **Copy / Duplicate** action (`Copy` icon).
- Instantly creates a clone with name `"{Strategy Name} (Copy)"` and fresh id, immediately selecting the clone.

---

## 6. Persistence & Clean Start

| Item | Storage |
|---|---|
| Strategies | `localStorage` key `volleydefense.strategies.v1` (array of `Strategy`, initialized with default seeds on first run) |
| Active strategy id | `localStorage` key `volleydefense.activeStrategy.v1` |

All storage is client-side ([REQ-17](./Requirements.md#req-17)).

### 6.1 Clean Start

- The app starts clean: on first load (or when storage is empty), the application seeds built-in default strategies.
- No legacy preset migration is performed.

---

## 7. Sharing (summary)

Full details in [SharedLinks.md](./SharedLinks.md).

- Share lists **strategies only** (no arbitrary cap).
- Because strategies are self-contained, the payload is simply the selected strategies.
- Recipients open **Guest Mode** (read-only) and may switch among the shared strategies and the Base / Defensive phase cards.
- **Save to My Tactics** imports the strategies with fresh ids.

---

## 8. Component Map

Planned placement, following [AGENTS.md](../AGENTS.md):

| Folder | Components |
|---|---|
| `src/components/layout/` | `Strategies.svelte` (col 1), `Court.svelte` (col 2), `Phases.svelte` (col 3), `TopHeader.svelte` |
| `src/components/strategies/` | `StrategyRow`, `StrategyEditForm`, `StrategyEditFooter` |
| `src/components/controls/` | `PhaseTogglerCard`, `ModificationAlert`, `RotationContextCard` |
| `src/components/modals/` | `ShareModal`, delete confirmation |
| `src/data/` | `strategyRegistry.ts` (load/save/delete/seed/migrate), `defaultLayout.ts`, `shareCodec.ts` |
| `src/types/` | `Strategy`, `BaseLayout`, `DefenseLayout` in `volleyball.ts` |
| State | `strategyStore.svelte.ts` (Svelte 5 runes), extracted from `App.svelte` |

Retired by this model: `BaseFormationCard`, `DefensiveFormationCard`, `PresetTableRow`, `PresetEditModal`, `SaveAdjustmentModal`, and the separate scheme/scenario registries.
