# System Requirements

> **VolleyDefense Tactics — Functional & Architectural Requirements**  
> *Last updated: October 2026*  
> This document provides the single, non-redundant requirements checklist for the application. For detailed specifications and architectural schemas, refer to the corresponding topic documents linked below.
>
> **Core concept:** the unit of work and sharing is the **Strategy**, a self-contained bundle of name, description, rotation, base positioning, and defensive positioning. See [Strategies.md](./Strategies.md).

---

## 1. Strategies (Core Domain)

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-22** | **Self-Contained Strategy** | A Strategy bundles a required **name**, optional markdown **description**, a **rotation** (Man Serving / Woman Serving), top-level opponent scenario coordinates (**setter**, **attacker**, and attack **target**), its own **base positioning** (6 defenders), and its own **defensive positioning** (6 defenders + actions). There is **no separate formation/preset library** and **no `isCustom` flag**: all strategies are user-manageable. New strategies start from a **default positioning**. Strategies are what users browse, create, edit, delete, and share. | [Strategies.md Section 2](./Strategies.md#2-domain-model) |
| **REQ-23** | **Strategy Management (Column 1)** | Column 1 lists all strategies with a **+ New** button and per-row **Edit**, **Duplicate / Clone**, and **Delete**. Exactly one strategy is active at all times. All strategies are editable and deletable; at least one strategy always exists. | [Layout.md Section 4](./layout/Layout.md#4-column-1-strategies) |
| **REQ-24** | **View Mode & Edit Mode** | **View mode** (default) is read-only: the court shows the active strategy and the Base/Defensive toggler switches the visible phase. **Edit mode** operates on a **draft**: players can be dragged, rotation changed, name/description edited, and phases reset or copied; the draft is persisted only via **Save**, forked via **Save as new**, or discarded via **Cancel**. While a draft exists, other strategies and Share are disabled. | [Strategies.md Section 4](./Strategies.md#4-modes) |
| **REQ-25** | **Default Positioning Template** | A single built-in, zone-keyed default layout (6 defenders, opponent setter/attacker, attack target) seeds both phases of every new strategy and is restorable per phase via **Reset to default**. Names and descriptions exist only on strategies. | [Strategies.md Section 2.2](./Strategies.md#22-default-positioning) |

---

## 2. Tactical Engine & Simulation

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-01** | **Continuous Dual Positioning** | Every strategy always has both a base positioning (start) and a defensive positioning (end), which together determine positions and transition vectors. | [Strategies.md Section 2](./Strategies.md#2-domain-model) |
| **REQ-02** | **Decoupled Phase Editing** | Within a strategy, base and defensive positioning are edited independently. Modifying one phase never alters the other. | [Strategies.md Section 4.3](./Strategies.md#43-dirty-tracking) |
| **REQ-03** | **Direct Canvas Manipulation (Edit Mode)** | In edit mode, all defenders, the opponent attacker, setter, and the attack landing target can be dragged freely across the full court canvas (ball is phase-anchored to setter or attacker). In view mode and Guest Mode the canvas is read-only. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-03A** | **Strategy-Scoped Focused Edit Lock** | While a strategy is being edited, other strategies are disabled and Share is disabled. The draft is resolved only through **Save**, **Save as new**, or **Cancel**. | [Strategies.md Section 4.2](./Strategies.md#42-edit-mode) |
| **REQ-03B** | **Container Dirty Amber Outlines (`.is-dirty`)** | The court container and the modified formation section lighten up with a prominent amber outline (`border: 1px solid rgba(245, 158, 11, 0.75)`) whenever the draft has unsaved changes. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-03C** | **Rotation Is a Strategy Field** | Rotation is changeable **only in edit mode**. Positions are keyed by court zone, so changing rotation keeps the coordinates and relabels the tokens for the new lineup. (Replaces the v1 "freeze rotation while dirty" rule.) | [Strategies.md Section 2.1](./Strategies.md#21-positions-are-keyed-by-court-zone) |
| **REQ-04** | **Coordinate Preservation Guarantee** | When players are dragged to custom coordinates, their positions are 100% preserved and never overridden by automated heuristics. | [CoedRules.md Section 6](./CoedRules.md#6-direct-manipulation--coordinate-preservation) |
| **REQ-05** | **Animated Transition Engine** | Selecting a strategy or clicking a phase card in Column 3 smoothly animates defenders between Base Formation coordinates (0%) and Defensive Formation coordinates (100%). | [Layout.md Section 5.1](./layout/Layout.md#51-view-mode--phase-toggler) |

---

## 3. Court, Opponent Team & Visuals

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-06** | **Opponent Team Modeling & Clean Court Viewport** | Court features Opponent Attacker, Setter, Ball, and Draggable Attack Target (edit mode). Attacker, Setter, and Target positions belong directly to the Strategy. In Base, the ball is stationed with Setter (no attack arrow, no block shadow). In Defensive, the ball glides to and remains with Attacker, the attack landing target is displayed, and the blocker shadow cone is shown. The court canvas maintains a clean viewport free of bottom clutter or redundant help text. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-07** | **Court Controls Bar** | Quick court overlay controls (*Zones*, *All Arrows*, *Block Shadow*, *Coverage*, *3D*) sit centered at the top of the middle column directly above the court canvas, providing 1-click access to simulation overlays. Light/Dark theme toggle is in the top header. | [Layout.md Section 3.1](./layout/Layout.md#31-court-controls-top-header-of-column-2) |
| **REQ-08** | **Full 18m × 9m Court Simulation (Attack + Defense)** | Renders both sides of the regulation volleyball court fully (9m × 9m opponent attacking court and 9m × 9m defending court, centered at net `y = 0%`). Enables configuring and simulating attack scenarios from any depth or angle across the net. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |

---

## 4. UI Hierarchy & Layout

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-09** | **Top Header Exclusivity & Clean 1-Liner** | Top header is a clean 1-liner with vertical breathing room, zero description lines, transparent background, and no bottom border. *Share* is a prominent contained button (disabled during strategy edit). *Theme Toggle* and *Settings Cog* are borderless icon buttons. Header controls are hosted exclusively in the top header and displayed only once. | [Layout.md Section 2](./layout/Layout.md#2-top-header-global-configurations) |
| **REQ-10** | **Three-Column Workspace** | Desktop layout has three columns: **Column 1 Strategies**, **Column 2 Court controls (top) + Court canvas (bottom)**, **Column 3 Phases**. Columns stack on small viewports (strategies collapsible → court → phases). | [Layout.md Section 1](./layout/Layout.md#1-overview--structural-layout) |
| **REQ-10A** | **Column 3 Phase Indicator & Strategy Description** | In view mode, Column 3 displays two thumbnail cards (Base / Defensive) indicating which phase is **active on the court** and switching phases on click. The active strategy's name and rendered markdown description are shown beneath it. | [Layout.md Section 5.1](./layout/Layout.md#51-view-mode--phase-toggler) |
| **REQ-10B** | **Edit-Mode Column 3** | In edit mode, Column 3 keeps the Base/Defensive phase cards and adds an edit form (name, description, rotation), per-phase tools (*Reset to default*), and a sticky footer (*Save*, *Save as new*, *Cancel*). | [Layout.md Section 5.2](./layout/Layout.md#52-edit-mode--edit-form--phase-tools) |
| **REQ-10C** | **Status Visual Language** | **Active** = blue outline + blue `Active` tag. **Visible on court** = green outline + green `Visible` tag with `Eye` icon. **Modified** = amber. Tags appear on rows/cards only, never on column or block headers. | [Layout.md Section 9](./layout/Layout.md#9-status-visual-language-tags--outlines) |
| **REQ-11** | **Rotation Context** | Serving rotation (*Man Serving* R1 vs *Woman Serving* R2) is a field of the strategy. It determines the lineup (who stands in each zone, gender colors, and front-row blocker eligibility). Coordinates are zone-keyed and shared by both rotations. | [Strategies.md Section 2.1](./Strategies.md#21-positions-are-keyed-by-court-zone) |
| **REQ-12** | **Mobile-Friendly & Touch Optimization** | Responsive layout (3-column desktop → stacked mobile), touch-drag support with `touch-action: none` on court, and minimum 44px tap targets. | [Layout.md Section 6](./layout/Layout.md#6-mobile-responsiveness--touch-constraints) |
| **REQ-20** | **Vector SVG Iconography Standard** | UI icons across the application must be vector SVGs from Lucide (`@lucide/svelte`), strictly prohibiting raw system emojis for controls, themes, and badges. | [Layout.md Section 8](./layout/Layout.md#8-iconography--visual-asset-standards-layout-rule) |
| **REQ-21** | **Component Modularity & Folder Standard** | Svelte files must remain concise (< 250-350 lines). Components are organized by domain: `layout/` (view-level columns), `strategies/`, `controls/`, `court/`, `modals/`, and `common/` (primitives). Application state lives in a Svelte 5 runes store, not in `App.svelte`. | [AGENTS.md](../AGENTS.md), [Strategies.md Section 8](./Strategies.md#8-component-map) |

---

## 5. COED 6v6 League Rules

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-13** | **COED Rotational Contexts** | Exactly 6 players: 3 Men and 3 Women alternating in rotation sequence (`M - F - M - F - M - F`), modeled via 2 serving contexts (*Man Serving* vs. *Woman Serving*) with zero personal name overhead. | [CoedRules.md Section 1](./CoedRules.md#1-overview--league-standard) |
| **REQ-14** | **Multi-Touch Gender Contact Rule** | If the ball is contacted more than once on a side (block exempted), at least one woman must contact it (1st, 2nd, or 3rd touch). | [CoedRules.md Section 3](./CoedRules.md#3-the-multi-touch-gender-contact-rule) |
| **REQ-15** | **Tactical Men-Only Blocking Convention** | While women may legally block under official rules, competitive convention assigns blocking duties to front-row men (on a 2.43m men's net). Front-row women peel off the net for tip and short-court defense. | [CoedRules.md Section 4.1](./CoedRules.md#41-tactical-convention-men-focused-blocking-women-peeling-off) |
| **REQ-16** | **Single-Man Block Default** | 1 front-row man results in a solo block. 2 front-row men defaults to a single solo block by the man closest to the attack angle, with the other covering. | [CoedRules.md Section 4.2](./CoedRules.md#42-single-blocker-vs-double-blocker-policy) |

---

## 6. Persistence & Local Storage

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-17** | **Local-First Storage & Clean Start** | Operates 100% client-side via `localStorage` with zero accounts, servers, or database setup. Strategies and the active strategy id are stored locally. Starts clean with built-in default strategies on initial launch. | [Strategies.md Section 6](./Strategies.md#6-persistence--clean-start) |

---

## 7. Sharing & Guest Mode

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-18** | **Strategy-Only Compressed URL Sharing** | Sharing accepts **strategies only** (no arbitrary cap). Because strategies are self-contained, the payload is the selected strategies, compressed into a URL hash (`#share=...`, payload `v: 2`) with zero database lookups. Legacy v1 links are converted on open into auto-named strategies. | [SharedLinks.md Section 2](./SharedLinks.md#2-v1-compressed-url-architecture-url-as-database) |
| **REQ-19** | **Read-Only Guest Mode** | Shared links open in read-only Guest Mode: edit mode, dragging, save alerts, strategy *Edit/Delete/New*, and re-sharing are unavailable. Guests can switch among the shared strategies and the Base/Defensive toggler. An optional **Save to My Tactics** button imports the strategies (fresh ids). | [SharedLinks.md Section 4](./SharedLinks.md#4-guest-mode-read-only-invariants--permissions) |

---

## 8. Future Roadmap (V2 Pro Tier)

All upcoming post-V1 features (user accounts, cloud database synchronization, team playbooks, and unlimited shortlinks) are maintained separately in [**docs/roadmap/ProTier.md**](./roadmap/ProTier.md) to keep active V1 implementation requirements clear and unmixed.
