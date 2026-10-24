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
| **REQ-03** | **Direct Manipulation, Scoped Edit Lock & Rotation Freeze** | All defenders, the attacker, setter, and attack landing target can be dragged on canvas (ball is phase-anchored). In strict decoupling ([REQ-02](#req-02)), dragging elements triggers **Approach A: Section-Scoped Focused Edit Lock**, marking only the edited section's preset `.modified`, outlining containers with an amber border (`.is-dirty`), and disabling only that section's sibling presets without blocking the other section. While either section is modified, the **Serving Rotation Switcher is strictly frozen** (`.rotation-locked`) with an amber banner notice and capture-phase click interception to prevent cross-rotation data contamination. Containers maintain transparent default borders, lighting up amber only when dirty. Each section displays its own alert: *Save* (1-click overwrite for custom presets), *Save as New* (forks to new custom preset), and *Reset*. Built-in presets are immutable. | [Layout.md Section 4.4](./layout/Layout.md#44-approach-a-section-scoped-focused-edit-lock--modification-lifecycle) |
| **REQ-04** | **Coordinate Preservation Guarantee** | When players are dragged to custom coordinates, their positions are 100% preserved and never overridden by automated heuristics. | [CoedRules.md Section 5](./CoedRules.md#5-direct-manipulation--coordinate-preservation) |
| **REQ-05** | **Animated Transition Engine** | Selecting a Defensive Formation preset or toggling stage positions directly in the Court Header Bar smoothly animates defenders between Base Formation coordinates (0%) and Defensive Formation coordinates (100%). | [Layout.md Section 3.1](./layout/Layout.md#31-court-card-header-bar-integrated-phase-switcher) |

---

## 2. Court, Opponent Team & Visuals

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-06** | **Opponent Team Modeling & Clean Court Viewport** | Court features Opponent Attacker, Setter, Ball, and Draggable Attack Target. Attacker and Setter positions belong to each preset phase (Base Formation vs. Defensive Formation). In Base Formation, the ball is stationed with Setter (no attack arrow, no block shadow), and moving opponent tokens modifies the Base preset. In Defensive Formation, the ball glides to and remains with Attacker, while the attack landing target is displayed and draggable; moving opponent tokens or target modifies the Defensive Formation preset. Blocker shadow cone is displayed in Defensive Formation only. The court canvas maintains a clean viewport free of bottom clutter or redundant help text. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |
| **REQ-07** | **View Overlays & Settings Cog** | View overlays (*Zones*, *All Arrows*, *Block Shadow*, *3D*) and Light/Dark theme toggle are housed in the header's Settings Cog (`Settings` SVG) menu, keeping the court viewport uncluttered. | [Layout.md Section 2](./layout/Layout.md#2-top-header-global-configurations) |
| **REQ-08** | **Net & Proportions** | Standard 9m x 9m half-court scaled to `0 - 100%` coordinates with net at `y = 0%`, 3m attack line at `y = 33.3%`, and baseline at `y = 100%`. | [Layout.md Section 3.2](./layout/Layout.md#32-court-canvas-elements) |

---

## 3. UI Hierarchy & Preset Anatomy

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-09** | **Top Header Exclusivity & Clean 1-Liner** | Top header is a clean 1-liner with vertical breathing room (`padding: 0.75rem 1.5rem`), zero description lines, transparent background, and no bottom border lines (`background: transparent; border-bottom: none;`). *Share* is styled as a prominent contained button (`.btn-share-contained`). *Theme Toggle* and *Settings Cog* are borderless icon buttons. Header controls are hosted exclusively in the top header and displayed only once. | [Layout.md Section 2](./layout/Layout.md#2-top-header-global-configurations) |
| **REQ-10** | **Preset Button Anatomy & Immutability** | Preset buttons feature the preset name at the top in line with miniature court thumbnail below. Predefined system presets are immutable and strictly omit the edit icon/button so users cannot attempt to rename default presets. Custom presets display an author badge alongside in-line *Edit (Pencil)* and *Delete (Trash2)* action buttons. | [Layout.md Section 5](./layout/Layout.md#5-preset-button-anatomy) |
| **REQ-11** | **Rotation Context Multiplier & Scoped Playbooks** | Serving rotation context (*Man Serving R1* vs. *Woman Serving R4*) is a fundamental tactical multiplier placed at the top of the right panel (Block 1). Presets are **strictly rotation-scoped**: each rotation maintains dedicated sets of Base Formations and Defensive Formations calibrated specifically to front-row blocking eligibility. Base Formation (Block 2) and Defensive Formation (Block 3) are organized as two separate, standalone panel cards with dedicated headers and independent scoped edit locks. Containers maintain transparent backgrounds and default borders, showing an amber outline only when dirty. | [Layout.md Section 4.1](./layout/Layout.md#41-block-1-rotation-context-tactical-multiplier) |
| **REQ-12** | **Mobile-Friendly & Touch Optimization** | Responsive single-column layout on mobile, touch-drag support with `touch-action: none` on court, and minimum 44px tap targets. | [Layout.md Section 6](./layout/Layout.md#6-mobile-responsiveness--touch-constraints) |
| **REQ-20** | **Vector SVG Iconography Standard** | UI icons across the application must be vector SVGs from Lucide (`lucide-svelte`), strictly prohibiting raw system emojis for controls, themes, and badges. | [Layout.md Section 8](./layout/Layout.md#8-iconography--visual-asset-standards-layout-rule) |

---

## 4. COED 6v6 League Rules

| ID | Requirement | Summary | Specification Reference |
|---|---|---|---|
| **REQ-13** | **COED Rotational Contexts** | Exactly 6 players: 3 Men and 3 Women alternating in rotation sequence (`M - F - M - F - M - F`), modeled via 2 serving contexts (*Man Serving R1* vs. *Woman Serving R4*) with zero personal name overhead. | [CoedRules.md Section 1](./CoedRules.md#1-overview--league-standard) |
| **REQ-14** | **Multi-Touch Gender Contact Rule** | If the ball is contacted more than once on a side (block exempted), at least one woman must contact it (1st, 2nd, or 3rd touch). | [CoedRules.md Section 3](./CoedRules.md#3-the-multi-touch-gender-contact-rule) |
| **REQ-15** | **Men-Only Net Blocking** | Only front-row men are eligible to block. Women in the front row pull off the net for tip coverage and short defense. | [CoedRules.md Section 4.1](./CoedRules.md#41-women-on-the-net-do-not-block) |
| **REQ-16** | **Single-Man Block Default** | 1 front-row man results in a solo block. 2 front-row men defaults to a single solo block by the man closest to the attack angle, with the other covering. | [CoedRules.md Section 4.3](./CoedRules.md#43-single-blocker-vs-double-blocker-policy) |

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
