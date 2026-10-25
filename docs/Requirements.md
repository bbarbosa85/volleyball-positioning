# System Requirements

> **VolleyDefense Tactics — Functional & Architectural Requirements**  
> *Last updated: October 2026*  
> This document provides the single, non-redundant requirements checklist for the application. For detailed specifications and architectural schemas, refer to the corresponding topic documents linked below.

---

## 1. Tactical Engine & Simulation

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-01** | **Continuous Dual Selection** | At all times, both a Base Formation preset (start) and a Defensive Formation preset (end) must be selected to determine positions and transition vectors. | [Layout.md Section 4.2](./layout/Layout.md#42-block-2-base-formation-card-base-card) |
| **REQ-02** | **Decoupled Tactic Editing** | Base Formations and Defensive Formations compose a tactic, but are managed and edited separately. Editing one never alters the other. | [Layout.md Section 4.4](./layout/Layout.md#44-approach-a-section-scoped-focused-edit-lock--modification-lifecycle) |
| **REQ-03** | **Direct Canvas Manipulation** | All defenders, the opponent attacker, setter, and the attack landing target can be dragged freely across the full court canvas (ball is phase-anchored to setter or attacker). | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-03A** | **Section-Scoped Focused Edit Lock (Approach A)** | In strict decoupling ([REQ-02](#req-02)), modifying positions in one section marks only that section's preset `.modified` and disables only that section's sibling presets without blocking the other section. Displays dedicated section alerts (*Save*, *Save as New*, *Reset*); built-in presets remain immutable. | [Layout.md Section 4.4](./layout/Layout.md#44-approach-a-section-scoped-focused-edit-lock--modification-lifecycle) |
| **REQ-03B** | **Container Dirty Amber Outlines (`.is-dirty`)** | Court canvas, Base Formation, and Defensive Formation containers maintain clean transparent backgrounds and transparent default borders, automatically lighting up with a prominent amber outline (`border: 1px solid rgba(245, 158, 11, 0.75)`) whenever modified. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-03C** | **Strict Rotation Freeze on Dirty (`.rotation-locked`)** | While either Base Formation or Defensive Formation has unsaved modifications, the Serving Rotation Switcher (*Man Serving* \| *Woman Serving*) is strictly frozen: clicks are intercepted via capture-phase blocking and an animated shake warning banner is displayed, strictly preventing cross-rotation state corruption until explicitly saved or reset. | [Layout.md Section 4.1](./layout/Layout.md#41-block-1-rotation-context-tactical-multiplier) |
| **REQ-04** | **Coordinate Preservation Guarantee** | When players are dragged to custom coordinates, their positions are 100% preserved and never overridden by automated heuristics. | [CoedRules.md Section 6](./CoedRules.md#6-direct-manipulation--coordinate-preservation) |
| **REQ-05** | **Animated Transition Engine** | Selecting a Defensive Formation preset or toggling stage positions directly in the Court Header Bar smoothly animates defenders between Base Formation coordinates (0%) and Defensive Formation coordinates (100%). | [Layout.md Section 3.1](./layout/Layout.md#31-court-card-header-bar-integrated-phase-switcher) |

---

## 2. Court, Opponent Team & Visuals

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-06** | **Opponent Team Modeling & Clean Court Viewport** | Court features Opponent Attacker, Setter, Ball, and Draggable Attack Target. Attacker and Setter positions belong to each preset phase (Base Formation vs. Defensive Formation). In Base Formation, the ball is stationed with Setter (no attack arrow, no block shadow), and moving opponent tokens modifies the Base preset. In Defensive Formation, the ball glides to and remains with Attacker, while the attack landing target is displayed and draggable; moving opponent tokens or target modifies the Defensive Formation preset. Blocker shadow cone is displayed in Defensive Formation only. The court canvas maintains a clean viewport free of bottom clutter or redundant help text. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-07** | **View Overlays & Settings Cog** | View overlays (*Zones*, *All Arrows*, *Block Shadow*, *3D*) and Light/Dark theme toggle are housed in the header's Settings Cog (`Settings` SVG) menu, keeping the court viewport uncluttered. | [Layout.md Section 2](./layout/Layout.md#2-top-header-global-configurations) |
| **REQ-08** | **Full 18m × 9m Court Simulation (Attack + Defense)** | Renders both sides of the regulation volleyball court fully (9m × 9m opponent attacking court and 9m × 9m defending court, centered at net `y = 0%`). Enables configuring and simulating attack scenarios from any depth or angle across the net (outside, middle, opposite, back-row pipe/bic, and out-of-system sets). | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |

---

## 3. UI Hierarchy & Preset Anatomy

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-09** | **Top Header Exclusivity & Clean 1-Liner** | Top header is a clean 1-liner with vertical breathing room (`padding: 0.75rem 1.5rem`), zero description lines, transparent background, and no bottom border lines (`background: transparent; border-bottom: none;`). *Share* is styled as a prominent contained button (`.btn-share-contained`). *Theme Toggle* and *Settings Cog* are borderless icon buttons. Header controls are hosted exclusively in the top header and displayed only once. | [Layout.md Section 2](./layout/Layout.md#2-top-header-global-configurations) |
| **REQ-10** | **Preset Button Anatomy & Immutability** | Preset buttons feature the preset name at the top in line with miniature court thumbnail below. Predefined system presets are immutable and strictly omit the edit icon/button so users cannot attempt to rename default presets. Custom presets display an author badge alongside in-line *Edit (Pencil)* and *Delete (Trash2)* action buttons. | [Layout.md Section 5](./layout/Layout.md#5-preset-button-anatomy) |
| **REQ-10A** | **Contextual Preset Description & Key Visibility** | Whenever a preset is selected, its tactical description and key focus (when provided) must be visibly displayed in a dedicated contextual info callout with vector `Info` SVG within that section's card (Block 2 for Base Formation, Block 3 for Defensive Formation), ensuring coaches and players can clearly read the coverage rationale and tactical instructions for the active setup. | [Layout.md Section 4.2 & 4.3](./layout/Layout.md#42-block-2-base-formation-card-base-card) |
| **REQ-11** | **Rotation Context Multiplier & Scoped Playbooks** | Serving rotation context (*Man Serving* vs. *Woman Serving*, modeling R1 and R4 lineups) is a fundamental tactical multiplier placed at the top of the right panel (Block 1). Presets are **strictly rotation-scoped**: both Base Formations and Defensive Formations are rotation-dependent. Presets saved under *Man Serving* (Rotation 1) are different from presets saved under *Woman Serving* (Rotation 2) and are kept strictly separated in both UI and storage. *Man Serving* maintains 3 predefined defensive formations + 2 base formations, and *Woman Serving* maintains 3 predefined defensive formations + 2 base formations. Custom presets for both Base Formations and Defensive Formations operate exclusively within the rotation context they were created in and never bleed across rotations. Base Formation (Block 2) and Defensive Formation (Block 3) are organized as two separate, standalone panel cards with dedicated headers, contextual descriptions, and independent scoped edit locks. Containers maintain transparent backgrounds and default borders, showing an amber outline only when dirty. | [Layout.md Section 4.1](./layout/Layout.md#41-block-1-rotation-context-tactical-multiplier) |
| **REQ-12** | **Mobile-Friendly & Touch Optimization** | Responsive single-column layout on mobile, touch-drag support with `touch-action: none` on court, and minimum 44px tap targets. | [Layout.md Section 6](./layout/Layout.md#6-mobile-responsiveness--touch-constraints) |
| **REQ-20** | **Vector SVG Iconography Standard** | UI icons across the application must be vector SVGs from Lucide (`lucide-svelte`), strictly prohibiting raw system emojis for controls, themes, and badges. | [Layout.md Section 8](./layout/Layout.md#8-iconography--visual-asset-standards-layout-rule) |
| **REQ-21** | **Component Modularity & Common Standard (`src/components/common`)** | Svelte files must remain concise and maintainable (< 250–350 lines). Small reusable components must live inside `src/components/common/` (`PresetCard`, `ModificationAlert`, `PresetDescriptionCallout`, `RotationContextCard`, `CourtPhaseToggle`, `TopHeader`, `CourtNet`, `CourtZones`, `CourtPlayerToken`, `CourtOverlaySvg`), enforcing clean separation of concerns and single responsibility. | [AGENTS.md](../AGENTS.md) |

---

## 4. COED 6v6 League Rules

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-13** | **COED Rotational Contexts** | Exactly 6 players: 3 Men and 3 Women alternating in rotation sequence (`M - F - M - F - M - F`), modeled via 2 serving contexts (*Man Serving* vs. *Woman Serving*) with zero personal name overhead. | [CoedRules.md Section 1](./CoedRules.md#1-overview--league-standard) |
| **REQ-14** | **Multi-Touch Gender Contact Rule** | If the ball is contacted more than once on a side (block exempted), at least one woman must contact it (1st, 2nd, or 3rd touch). | [CoedRules.md Section 3](./CoedRules.md#3-the-multi-touch-gender-contact-rule) |
| **REQ-15** | **Tactical Men-Only Blocking Convention** | While women may legally block under official rules, competitive convention assigns blocking duties to front-row men (on a 2.43m men's net). Front-row women peel off the net for tip and short-court defense. | [CoedRules.md Section 4.1](./CoedRules.md#41-tactical-convention-men-focused-blocking-women-peeling-off) |
| **REQ-16** | **Single-Man Block Default** | 1 front-row man results in a solo block. 2 front-row men defaults to a single solo block by the man closest to the attack angle, with the other covering. | [CoedRules.md Section 4.2](./CoedRules.md#42-single-blocker-vs-double-blocker-policy) |

---

## 5. Persistence & Local Storage

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-17** | **Local-First Storage** | Operates 100% client-side via `localStorage` with zero accounts, servers, or database setup required. | [Layout.md Section 4.2](./layout/Layout.md#42-block-2-base-formation-card-base-card) |

---

## 6. Sharing & Guest Mode

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-18** | **Compressed URL Sharing with Rotation Multiplier** | Coaches select the rotation context multiplier alongside up to 3 Base Formation + 3 Defensive Formation presets into a compressed URL hash (`#share=...`) with zero database lookups, ensuring recipient coaches view the calibrated rotation lineup. | [SharedLinks.md Section 2](./SharedLinks.md#2-v1-compressed-url-architecture-url-as-database) |
| **REQ-19** | **Read-Only Guest Mode** | Shared links open in read-only Guest Mode: dragging tokens is disabled, save alerts are suppressed, and an optional "Save to My Tactics" import button is provided. | [SharedLinks.md Section 4](./SharedLinks.md#4-guest-mode-read-only-invariants--permissions) |

---

## 7. Future Roadmap (V2 Pro Tier)

All upcoming post-V1 features (user accounts, cloud database synchronization, team playbooks, and unlimited shortlinks) are maintained separately in [**docs/roadmap/ProTier.md**](./roadmap/ProTier.md) to keep active V1 implementation requirements clear and unmixed.
