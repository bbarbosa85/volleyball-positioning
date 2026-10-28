# Layout & UI Hierarchy Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](../Requirements.md)*  
> *Domain Model: [docs/Strategies.md](../Strategies.md)*  
> *Last updated: October 2026*

---

## 1. Overview & Structural Layout

The interface is a **3-column workspace** under a **Top Header**, with a **Shared Workspace Header** spanning Columns 2 and 3:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER                                             [Share / Copy CTA] [Sun / Moon] │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ COL 1 (Collapsible)     │ SHARED HEADER FOR COLUMNS 2 & 3 (100% width + bottom border) │
│ [«] STRATEGIES  [+ New] │ [ [svg] Base | [svg] Defensive ] [▶ Play]     [⚙] [✎ Edit]   │
│                         ├─────────────────────────────────────────┬────────────────────┤
│ ┌─ border-primary ────┐ │ COL 2: COURT SIMULATOR                  │ COL 3: DETAILS     │
│ │ 👁 Strategy A ✎ ❐ 🗑│ │                                         │ ┌─ Rotation ─────┐ │
│ │ [Man Serving]       │ │            18m × 9m COURT               │ │ ♂ Man Serving  │ │
│ └─────────────────────┘ │     • Opponent Attack Side (9×9m)       │ └────────────────┘ │
│ ┌─────────────────────┐ │     • Net, Antennas & Zones             │ ┌─ Notes ────────┐ │
│ │ Strategy B    ✎ ❐ 🗑│ │     • Defending Team Side (9×9m)        │ │ Markdown notes │ │
│ │ [Woman Serving]     │ │     • Draggable Target (Green / Red)    │ └────────────────┘ │
│ └─────────────────────┘ │                                         │                    │
└─────────────────────────┴─────────────────────────────────────────┴────────────────────┘
```

### 1.1 Read Mode vs. Edit Mode Column Roles

| Area | Read Mode | Edit Mode |
|---|---|---|
| **Column 1 (`Strategies.svelte`)** | Lists strategies with a right border (`lg:border-r`). Collapsible on desktop into a compact vertical rail (`lg:col-span-1`). | Becomes the non-collapsible **Edit Strategy Form** (`StrategyEditForm.svelte`): Strategy Name, Serving Rotation segmented toggle, and Formations segmented toggle with `Reset`. |
| **Shared Header (Cols 2 & 3)** | Left: segmented Formation Toggle (`Base` / `Defensive` with SVG thumbnails) + **`Play` / `Reset`** transition button (`2.2s` animation). Right: **Settings (`⚙`)** dropdown + **`Edit`** button. | Left: Formation Toggle + `Play` / `Reset`. Right: **Settings (`⚙`)** dropdown + **`Cancel`**, **`Save as new`**, and **`Save`** buttons. |
| **Column 2 (`Court.svelte`)** | Renders the 18m × 9m court. The attack landing target is freely draggable to test defensive coverage (**green** when inside a defender's radius of action, **red** when uncovered). | All defenders, opponent setter, opponent attacker, and attack landing target are draggable. |
| **Column 3 (`Phases.svelte`)** | Displays the **Serving Rotation** card and the rendered markdown **Notes** card stacked vertically (no redundant section title). | Displays the markdown **Notes** input (`MarkdownEditor.svelte`). |

---

## 2. Top Header (`TopHeader.svelte`)

- **Normal Mode**: Displays the brand title, the contained **`Share`** button (disabled when 0 strategies exist or while editing), and the Light/Dark **`Theme Toggle`**.
- **Shared Link Mode (`isSharedMode === true`)**: Displays a `Shared Playbook` badge, a primary **`Copy to My Strategies`** button (opening `ImportSharedModal.svelte` for selective import), and a **`Create My Own Strategies`** button to exit to the user's own board.

---

## 3. Shared Header for Columns 2 & 3

Spans 100% of the width above Columns 2 and 3 with a bottom border line (`border-b border-base-300`):
1. **Formation Segmented Toggle (`PhaseTogglerCard.svelte`)**:
   - Uses a segmented pill track (`p-1 rounded-xl bg-base-300/90`) with an elevated inner card (`bg-base-100 text-base-content shadow-sm rounded-lg`) on the selected option.
   - Each option (`Base` and `Defensive`) renders a live SVG `CourtThumbnail` alongside its label.
2. **Play / Reset Transition Button**:
   - Placed immediately to the right of the Formation toggle.
   - Clicking **`Play`** animates the transition from Base (`0%`) to Defensive (`100%`) over **`2.2s` (`2200ms`)**, then turns into **`Reset`** to return to Base.
3. **Settings Dropdown Menu (`CourtOverlayControls.svelte`)**:
   - Icon button (`Settings2`) opening a dropdown menu with the 5 court visibility toggles: *Court Zones (1–6)*, *Motion Vectors*, *Blocker Shadow Cone*, *Defense Coverage*, and *3D Dynamic Tilt*.
4. **Mode Action Buttons**:
   - **Read Mode**: `[✎ Edit]` button (hidden in shared read-only mode).
   - **Edit Mode**: `[Cancel]`, `[Save as new]`, and `[Save]` buttons in the same spot.

---

## 4. Column 1: Strategies & Edit Form (`Strategies.svelte`)

### 4.1 Strategy Row Anatomy (`StrategyRow.svelte`)
- **Active Indicator**: The active strategy row has a primary border (`border-primary`) and an **`Eye` icon (`👁`)** next to its name (no `"Active"` text badge).
- **High-Contrast Rotation Badge**:
  - `Man Serving`: `badge-info`
  - `Woman Serving`: `badge-secondary`
- **Row Actions**: `Edit` (`Pencil`), `Duplicate` (`Copy`), and `Delete` (`Trash2`), hidden when viewing a shared link.

### 4.2 Serving Rotation Toggle (`StrategyEditForm.svelte`)
- Uses the segmented container style (`p-1 rounded-xl bg-base-300/90`) with SVG icons for the **male sign (`♂`, circle with arrow up)** in `text-info` and **female sign (`♀`, circle with cross down)** in `text-warning` alongside `Man Serving` and `Woman Serving`.

### 4.3 Empty Board Placeholders
- New boards start with `0` strategies. When no strategy is active or being drafted, Column 1 shows an empty card and Columns 2 & 3 render empty-state placeholders with a **Create First Strategy** CTA.

---

## 5. Interactive Target Coverage & Defender Reach (`Court.svelte`)

- **Increased Defender Coverage Radius**: Non-blocking defenders in Defensive mode display a `150px × 150px` (`w-[150px] h-[150px]`, ~`15%` court width radius) transparent coverage circle.
- **Free Target Dragging in All Modes**:
  - The strategy's `target` defines the initial attack landing position.
  - Users in both **Read Mode** (normal or shared) and **Edit Mode** can drag the target freely across the defending court.
  - **Green vs. Red Coverage Feedback (`CourtLandingTarget.svelte`)**:
    - **Green (`emerald`)**: Target is within at least one non-blocking defender's radius of action (`Covered`).
    - **Red (`rose`)**: No defender's radius of action covers the target (`Uncovered`).

---

## 6. Mobile Responsiveness (`< lg`)

- In **Read Mode**, a collapsible strategy trigger bar sits directly above the court showing the current strategy name (with its `Eye` icon and rotation badge). Tapping it opens a **left slide-over drawer** containing the Strategies list.
- Below the trigger bar sit the Shared Header, the Court, and the Strategy Details (Rotation + Notes).
