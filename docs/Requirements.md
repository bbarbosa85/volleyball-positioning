# System Requirements

> **VolleyDefense Tactics — Functional & Architectural Requirements**  
> *Last updated: October 2026*  
> This document provides the single, non-redundant requirements checklist for the application. For detailed specifications and architectural schemas, refer to the corresponding topic documents linked below.
>
> **Core concept:** the unit of work and sharing is the **Strategy**, a self-contained bundle of name, notes, rotation, opponent scenario (setter, attacker, target), base positioning, and defensive positioning. See [Strategies.md](./Strategies.md).

---

## 1. Strategies (Core Domain)

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-22** | **Self-Contained Strategy** | A Strategy bundles a required unique **name**, optional markdown **notes**, a **rotation** (Man Serving / Woman Serving), top-level opponent scenario coordinates (**setter**, **attacker**, and initial attack **target**), its own **base positioning** (6 defenders), and its own **defensive positioning** (6 defenders + actions). There is **no separate formation/preset library** and **no `isCustom` flag**. | [Strategies.md Section 2](./Strategies.md#2-domain-model) |
| **REQ-23** | **Strategy Management & Empty Board** | Column 1 lists all strategies with a **+ New** button and per-row **Edit**, **Duplicate**, and **Delete**. Active strategy shows an **Eye (`👁`) icon** and high-contrast rotation badge (`badge-info` / `badge-secondary`). Initial boards start with **0 strategies** and show placeholders across the columns until a strategy is created or imported. | [Layout.md Section 4](./layout/Layout.md#4-column-1-strategies--edit-form-strategiessvelte) |
| **REQ-24** | **Read Mode & Edit Mode + Name Validation** | **Read mode** displays the strategy with free target dragging to test coverage. **Edit mode** turns Column 1 into the non-collapsible Edit Strategy form (Name, Serving Rotation, Formations toggle with Reset) and Column 3 into the Notes editor, while placing **Cancel**, **Save as new**, and **Save** on the right of the shared header. Both **Save** and **Save as new** validate that the strategy name is not already in use by another strategy. | [Strategies.md Section 3 & 4](./Strategies.md#3-workspace-layout-read-mode-vs-edit-mode) |
| **REQ-25** | **Default Positioning Template** | A single built-in, zone-keyed default layout (6 defenders, opponent setter/attacker, attack target) seeds both phases of every new strategy and is restorable per phase via **Reset Base / Reset Defensive**. | [Strategies.md Section 2.3](./Strategies.md#23-default-positioning) |

---

## 2. Tactical Engine & Simulation

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-01** | **Continuous Dual Positioning** | Every strategy always has both a base positioning (start) and a defensive positioning (end), which together determine positions and transition vectors. | [Strategies.md Section 2](./Strategies.md#2-domain-model) |
| **REQ-02** | **Decoupled Phase Editing** | Within a strategy, base and defensive positioning are edited independently. Modifying one phase never alters the other. | [Strategies.md Section 2](./Strategies.md#2-domain-model) |
| **REQ-03** | **Canvas Manipulation & Interactive Target Coverage** | In edit mode, all defenders, the opponent attacker, setter, and the attack target are draggable. In read mode (both normal and shared), the **attack target remains freely draggable** from its initial strategy position to test coverage, turning **green** (`Covered`) when inside any non-blocking defender's radius of action (`150px` diameter) and **red** (`Uncovered`) otherwise. | [Layout.md Section 5](./layout/Layout.md#5-interactive-target-coverage--defender-reach-courtsvelte) |
| **REQ-04** | **Coordinate Preservation Guarantee** | When players are dragged to custom coordinates, their positions are 100% preserved and never overridden by automated heuristics. | [CoedRules.md Section 6](./CoedRules.md#6-direct-manipulation--coordinate-preservation) |
| **REQ-05** | **Animated Transition & Play/Reset Control** | Clicking the Formation toggle (`Base` / `Defensive`) smoothly animates defenders (`400ms`). Clicking the **Play** button next to the toggle plays the full Base-to-Defensive transition over **`2.2s` (`≥ 2s`)** and becomes a **Reset** button to return to Base. | [Layout.md Section 3](./layout/Layout.md#3-shared-header-for-columns-2--3) |

---

## 3. Court, Opponent Team & Visuals

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-06** | **Opponent Team Modeling & Clean Court Viewport** | Court features Opponent Attacker, Setter, Ball, and Draggable Attack Target. In Base, the ball is stationed with Setter. In Defensive, the ball glides to Attacker, the attack landing target is displayed (green if covered, red if uncovered), and the blocker shadow cone is shown. | [Layout.md Section 5](./layout/Layout.md#5-interactive-target-coverage--defender-reach-courtsvelte) |
| **REQ-07** | **Settings Dropdown Menu (Court Overlays)** | A compact **Settings (`⚙`)** dropdown menu in the shared header of Columns 2 & 3 provides toggles for *Court Zones (1–6)*, *Motion Vectors*, *Blocker Shadow Cone*, *Defense Coverage*, and *3D Dynamic Tilt*. | [Layout.md Section 3](./layout/Layout.md#3-shared-header-for-columns-2--3) |
| **REQ-08** | **Full 18m × 9m Court Simulation (Attack + Defense)** | Renders both sides of the regulation volleyball court fully (9m × 9m opponent attacking court and 9m × 9m defending court). | [Layout.md Section 1](./layout/Layout.md#1-overview--structural-layout) |

---

## 4. UI Hierarchy & Layout

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-09** | **Top Header & Shared Link Actions** | Top header hosts brand title, **Share** CTA (normal mode), **Copy to My Strategies** & **Create My Own Strategies** CTAs (shared mode), and **Theme Toggle**. | [Layout.md Section 2](./layout/Layout.md#2-top-header-topheadersvelte) |
| **REQ-10** | **Three-Column Workspace & Collapsible Column 1** | **Column 1** (Strategies list with right border, collapsible on desktop in Read Mode; transforms into non-collapsible Edit Strategy form in Edit Mode). **Columns 2 & 3** share a unified full-width header with bottom border above **Column 2 (Court)** and **Column 3 (Rotation + Notes in Read Mode; Notes editor in Edit Mode)**. | [Layout.md Section 1](./layout/Layout.md#1-overview--structural-layout) |
| **REQ-11** | **Segmented Toggles & Gender Iconography** | Both the Formation toggle (`Base` / `Defensive` with SVG thumbnails) and Serving Rotation toggle (`♂ Man Serving` / `♀ Woman Serving` with circle-arrow and circle-cross SVG icons) use a segmented pill track (`bg-base-300/90` with elevated `bg-base-100` active card). All user-facing text uses **Man / Men** and **Woman / Women** (never "male" or "female"). | [Layout.md Section 3 & 4](./layout/Layout.md#3-shared-header-for-columns-2--3) |
| **REQ-12** | **Mobile Left Slide-Out Drawer** | On viewports `< 1024px` in Read Mode, a trigger bar above the court shows the current strategy name and opens a **left slide-out drawer** for the Strategies list, with the court and details stacked below. | [Layout.md Section 6](./layout/Layout.md#6-mobile-responsiveness--lg) |

---

## 5. COED 6v6 League Rules

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-13** | **COED Rotational Contexts** | 6 players: 3 Men and 3 Women alternating in rotation sequence (`M - F - M - F - M - F`), modeled via 2 serving rotations (*Man Serving* R1 vs. *Woman Serving* R2). | [CoedRules.md Section 1](./CoedRules.md#1-overview--league-standard) |
| **REQ-14** | **Multi-Touch Gender Contact Rule** | If the ball is contacted more than once on a side (block exempted), at least one woman must contact it. | [CoedRules.md Section 3](./CoedRules.md#3-the-multi-touch-gender-contact-rule) |
| **REQ-15** | **Tactical Men-Only Blocking Convention** | Front-row men handle net blocking; front-row women peel off the net for tip and short-court defense. | [CoedRules.md Section 4.1](./CoedRules.md#41-tactical-convention-men-focused-blocking-women-peeling-off) |

---

## 6. Persistence & Shared Links

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-17** | **Local-First Storage & Empty Initial State** | Operates 100% client-side via `localStorage` (`volleydefense.strategies.v1`). Starts with an empty board (`[]`) on initial launch. | [Strategies.md Section 4.1](./Strategies.md#41-initial-empty-board) |
| **REQ-18** | **Strategy-Only Compressed URL Sharing** | Sharing bundles selected strategies into `#share=...` (`SharePayloadV2`) with no arbitrary count limit. | [SharedLinks.md Section 2](./SharedLinks.md#2-compressed-url-architecture-url-as-database) |
| **REQ-19** | **Isolated Read-Only Shared Mode & Selective Copy** | Opening `#share=...` loads **only** the shared strategies in memory (read-only, without touching `localStorage`). Users can drag the attack target to test coverage, click **Copy to My Strategies** to selectively import strategies via `ImportSharedModal.svelte`, or click **Create My Own Strategies** to switch to their own board. | [SharedLinks.md Section 4](./SharedLinks.md#4-isolated-shared-view-mode-recipient-experience) |
