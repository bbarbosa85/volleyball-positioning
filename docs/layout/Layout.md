# Layout & UI Hierarchy Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](../Requirements.md)*  
> *Domain Model: [docs/Strategies.md](../Strategies.md)*  
> *Interactive Prototype (legacy 2-column, pending update): [docs/layout/prototype.html](./prototype.html)*  
> *Last updated: October 2026*

---

## 1. Overview & Structural Layout

The interface is a **strategy-centric, 3-column workspace** under a **Top Header**:

1. **Column 1 — Strategies** (list, create, edit, delete)
2. **Column 2 — Court Simulator** (court canvas + court controls)
3. **Column 3 — Phases** (vertical Base / Defensive toggler; edit form and phase tools in edit mode)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER (Clean 1-liner - No background color, no border lines)               │
│ [Brand & Title]                           [Share CTA] [Sun/Moon SVG] [Cog SVG]  │
├───────────────┬──────────────────────────────────────┬──────────────────────────┤
│ COL 1         │ COL 2                                │ COL 3                    │
│ STRATEGIES    │ COURT SIMULATOR                      │ PHASES                   │
│ [+ New]       │ ┌──────────────────────────────────┐ │ ┌──────────────────────┐ │
│               │ │ [ Base Formation ]➔[ Defensive ] │ │ │ BASE FORMATION       │ │
│ ● Strategy A  │ ├──────────────────────────────────┤ │ │  (SVG thumbnail)     │ │
│   Man Serving │ │                                  │ │ ├──────────────────────┤ │
│   (Edit)(Del) │ │          COURT CANVAS            │ │ │ DEFENSIVE FORMATION  │ │
│ ○ Strategy B  │ │  (Full 18m x 9m Court Viewport)  │ │ │  (SVG thumbnail)     │ │
│ ○ Strategy C  │ │                                  │ │ └──────────────────────┘ │
│               │ │  • Opponent Attack Side (9x9m)   │ │                          │
│               │ │  • Net, Antennas & Poles         │ │ Strategy name &          │
│               │ │  • Defending Team Side (9x9m)    │ │ description (markdown)   │
│               │ │  • 6 Defender Tokens             │ │                          │
│               │ │  • Attacker, Setter & Ball       │ │ (Edit mode: + form and   │
│               │ └──────────────────────────────────┘ │  phase tools)            │
└───────────────┴──────────────────────────────────────┴──────────────────────────┘
```

Two modes drive the right-hand columns: **View mode** (default, read-only) and **Edit mode** (draft). See [Strategies.md Section 4](../Strategies.md#4-modes).

---

## 2. Top Header (Global Configurations)

Global actions are hosted **exclusively in the top header** as a clean, minimalist one-liner with vertical breathing room:
- **Zero Visual Clutter**: No background colors, no glassmorphism overlays, and no bottom border lines (`background: transparent; border-bottom: none;`).
- **Clean 1-Liner Logo Block with Vertical Padding**: Features comfortable vertical padding (`padding: 0.75rem 1.5rem;` max-width 1720px aligned with the main layout), a compact 26px vector volleyball icon alongside the bold title `VolleyDefense Tactics`, and no forced height or subtitle/description paragraphs.
- **Contained Share Button**: The Share CTA is styled as a prominent contained button with a solid primary fill, vector SVG icon, and no border. It opens the **strategy picker** ([Section 7](#7-share-modal-strategy-picker)) and is **disabled while a strategy is in edit mode**.
- **Border-less Icon Controls**: Quick theme toggle (`Sun`/`Moon`) and view settings cog (`Settings`) are border-less, transparent icon buttons that highlight subtly on hover.
- **Settings Cog Dropdown**: Houses Court View Overlays (*Court Zones 1–6*, *Motion Vector Arrows*, *Blocker Shadow Cone*, *3D Perspective Court*), keeping the court canvas completely clean.

> **Hierarchy Rule**: Never duplicate Share, Theme, or Settings buttons inside the columns, court area, or cards.

---

## 3. Column 2: Court Canvas & Court Controls

### 3.1 Court Controls (Top Header of Column 2)
In read mode and edit mode, the **Court Controls** (`CourtOverlayControls`) sit centered at the **top of the middle column**, directly above the court canvas. This provides immediate 1-click access to all visual overlays without burying them in nested menus:
- **Court Zones (1–6)** (`Grid3x3` icon): Toggles zone number overlays across both half-courts.
- **Motion Vector Arrows** (`MoveUpRight` icon): Toggles defender transition vector arrows between base reading spots and defensive reaction targets.
- **Blocker Shadow Cone** (`Shield` icon): Toggles the triangular defensive block coverage shadow cast by front-row blockers against the spiker's attack trajectory.
- **Coverage Range** (`Radar` icon): Toggles individual defender defensive dig radius circles.
- **3D Perspective View** (`Box` icon): Toggles the dynamic 26° isometric tilt for realistic court depth.

> **Clean Column Division**: The middle column hosts the court controls at the top and the court canvas at the bottom. Phase selection is hosted exclusively in **Column 3 (Phases)**, which indicates the active phase on the court.

### 3.2 Court Canvas Elements
- **Container Styling & Dirty Outline**: The court container (`.court-card`) has a transparent background and default transparent border. While a strategy draft has unsaved changes, an amber border outline (`border: 1px solid rgba(245, 158, 11, 0.75);`) lights up automatically around the container.
- **Interaction by Mode**:
  - **View mode**: all tokens and the attack target are **read-only**.
  - **Edit mode**: all tokens and the attack target are draggable; drags modify the **draft**.
- **Full 18m × 9m Regulation Court Simulation (Both Sides Displayed)**:
  - The simulator renders **both sides of the court fully** (a regulation 18m × 9m volleyball court comprising two 9m × 9m half-courts divided by the center net).
  - **Tactical Utility for Attack Coverage**: Displaying the full opponent attack side allows coaches and players to model and simulate attack scenarios from realistic depths, angles, and rotational configurations:
    - **Front-Row Net Attacks**: Outside hitter swings (Zone 4), quick middle hits / slides (Zone 3), and opposite/right-side attacks (Zone 2).
    - **Back-Row Attacks**: Pipe / Bic spikes originating from Zone 6 and D-ball / back-one attacks from Zone 1.
    - **Out-of-System Angles**: High sets pushed wide, out-of-system passes 4–6 meters off the net, or chaotic defensive overpasses originating deep near the opponent baseline.
- **Court Dimensions & Line Markings**:
  - **Center Net & Antennas**: Positioned at `y = 0%`. Center dividing net line with red-and-white striped antennas at `x = 0%` and `x = 100%`.
  - **Defending Half-Court (`y = 0%` to `100%`)**: 9m × 9m defensive surface with 3-meter line at `y = 33.3%`, defensive baseline at `y = 100%`, and defense court zones (1–6).
  - **Opponent Attacking Half-Court (`y = -100%` to `0%`)**: Full 9m × 9m attacking surface with opponent 3-meter line at `y = -33.3%`, opponent baseline at `y = -100%`, and opponent court zones.
  - **Theme-Aware Styling**: Floor textures and court line strokes adapt seamlessly to Light and Dark modes.
- **6 Defender Tokens (Numbers & Gender Colors Only)**:
  - Tokens display **only the player's position number** (1–6) in bold, centered typography.
  - Gender identity is conveyed purely by **token fill/stroke color** (Blue for Men, Rose/Pink for Women).
  - **Zero Name Overhead**: Player names are excluded from the court display and data schema, maximizing readability, eliminating clutter, and keeping shared URLs ultra-compact.
- **Opponent Team & Attack Configuration**:
  - Located on the full opponent attacking half-court (`y <= 0%`).
  - **Base Formation Position**: Ball is stationed with Setter `S`; no attack trajectory arrow, target reticle, or block shadow cone is displayed.
  - **Defensive Formation Position**: Ball animates smoothly from Setter to Attacker `A` and remains with Attacker; spiker trajectory arrow, draggable landing target reticle (edit mode), and blocker shadow cone appear.
  - **Non-Draggable Ball**: The ball is fixed; its position is driven strictly by phase.
  - **Draggable Attack Landing Target (edit mode)**: Interactive (`x: 4–96%`, `y: 4–96%`). The attack arrow is anchored to the Attacker/Ball and the target and updates dynamically.
  - **Opponent Scenario Scoped Directly to the Strategy**: Setter, Attacker, and Target coordinates belong directly to the Strategy:
    - **Base Formation**: Ball is stationed with Setter; defenders hold reading positions.
    - **Defensive Formation**: Ball animates smoothly from Setter to Attacker; spiker trajectory arrow points to Target reticle, and blocker shadow cone appears.
- **Draft Drift Detection**:
  - Dragging in the **Base** phase (edit mode) marks the draft's **base positioning** as modified.
  - Dragging in the **Defensive** phase (edit mode) marks the draft's **defensive positioning** as modified.
  - The two sections are tracked independently ([REQ-02](../Requirements.md#req-02)). Toggling phases never clears either modification.

---

## 4. Column 1: Strategies

A vertical list of strategies with creation and management actions.

### 4.1 Header
- Title `Strategies` with a `Layers` (or similar Lucide) icon.
- **`+ New` button** (primary, `Plus` icon): creates a draft and enters edit mode ([Strategies.md Section 6.1](../Strategies.md#61-creation--new)).

### 4.2 Strategy Row Anatomy

```
┌────────────────────────────────────────────┐
│ ● Strategy Name                (Pen)(Trash) │
│   [Man Serving]  [Active]                    │
└────────────────────────────────────────────┘
```

- **Name** (truncate with ellipsis) and a **rotation badge** (*Man Serving* / *Woman Serving*).
- Selected row: blue outline, `Active` tag; clicking any row selects it and loads it into the court.
- **Actions** (sibling elements with `e.stopPropagation()`, no nested buttons):
  - **`Pencil` (Edit)**: enters edit mode for that strategy.
  - **`Copy` (Duplicate)**: immediately clones the strategy as `"{Name} (Copy)"` and selects it.
  - **`Trash2` (Delete)**: opens confirmation dialog to delete the strategy.
- **Edit lock**: while a draft exists, all other rows are `.disabled` (`opacity: 0.36`, `pointer-events: none`, `aria-disabled="true"`).

### 4.3 Empty / Minimum State
At least one strategy always exists. If the user deletes all strategies, a new default strategy is recreated. The list never renders empty.

---

## 5. Column 3: Phases

### 5.1 View Mode — Phase Toggler

Two large cards stacked **vertically**, acting as a single-choice toggler for the **visible phase**:

```
┌──────────────────────────────┐
│ [Shield] BASE FORMATION       │
│   ┌────────────────────────┐ │
│   │   SVG court thumbnail  │ │
│   └────────────────────────┘ │
├──────────────────────────────┤
│ [Crosshair] DEFENSIVE FORM.   │
│   ┌────────────────────────┐ │
│   │   SVG court thumbnail  │ │
│   └────────────────────────┘ │
└──────────────────────────────┘
```

- Thumbnails are the existing `CourtThumbnail` SVGs for the active strategy's base and defensive formations.
- The card matching the court's **active phase** gets the prominent status treatment: **green outline** and a green `Visible` tag with an `Eye` icon (or blue `Active` tag).
- Clicking a card switches the active phase on the court with smooth transition animation.
- Beneath the phase cards: the strategy's **name** and rendered **markdown description** (callout with `Info` icon), when present.

### 5.2 Edit Mode — Edit Form & Phase Tools

The toggler remains, and Column 3 adds the tools needed to author the strategy:

- **Edit form** (top of column 3):
  - `Strategy name` input (required).
  - `Description` markdown editor.
  - **Rotation control** (*Man Serving* / *Woman Serving*). Changing rotation keeps the coordinates (zone-keyed) and relabels the tokens for the new lineup.
- **Per-phase tools** on each phase card (Base and Defensive):
  - **`Reset to default`**: restores the built-in default positioning for that phase.
- **Modified indicator**: a phase card shows an amber outline and `Modified` tag when its coordinates differ from the saved strategy.
- **Edit footer** (sticky): **`Save`** (primary, disabled until a name is present), **`Save as new`** (secondary), **`Cancel`** (ghost).
- There are **no formation pickers or preset tables**: positions belong to the strategy.

### 5.3 Container Styling
Cards use `card bg-base-200/60 border`. Default border is `border-base-300`; the border is **amber** when the section is dirty.

---

## 6. Mobile Responsiveness & Touch Constraints

Volleyball coaches and players frequently use the application courtside on mobile phones and tablets. The UI must be fully touch-optimized:

### 6.1 Viewport Breakpoints & Stacking
- **Desktop (>= 1280px)**: 3-column layout (Strategies ~ 3 cols · Court ~ 6 cols · Phases ~ 3 cols of a 12-col grid).
- **Tablet (1024px – 1279px)**: 2-column layout: Court beside a stacked right area (Strategies on top as a horizontal/compact list, Phases below).
- **Mobile (< 1024px)**: Single-column vertically stacked layout:
  1. **Top Header**: Compact sticky bar with brand, Share button, Theme toggle, and Settings cog.
  2. **Strategies**: Collapsible list (shows the active strategy; expands to the full list).
  3. **Court Simulator Area**: Centered and fluidly responsive up to full viewport width.
  4. **Phases**: Base / Defensive toggler (and edit form in edit mode) beneath the court.

### 6.2 Touch Drag & Gesture Protection
- **`touch-action: none` on Court Canvas**: The court SVG container must apply `touch-action: none` so that dragging a defender, attacker, or target on a smartphone does **not** inadvertently scroll the page.
- **Minimum Tap Targets**: All interactive buttons (strategy rows, action icons, toggler cards, rotation buttons, view toggles) must maintain minimum 44px x 44px touch areas (or appropriate padding).

---

## 7. Share Modal: Strategy Picker

When clicking **Share** in the header, the modal offers visual selection of **strategies only**:

1. **Optional Share Title** (shown in the guest banner).
2. **Strategy Cards**:
   - Each card shows the strategy **name**, **rotation badge**, and the **Base** and **Defensive** SVG thumbnails side by side.
   - Clean checkbox indicator toggles inclusion.
   - Selection counter: `[X Selected]`.
   - The active strategy is pre-selected.
3. **No Rotation or Formation Sections**: rotation and positioning are defined by each strategy.
4. **1-Click Generation**:
   - Encodes the selected strategies into the compressed URL hash (`#share=...`) and copies it to the clipboard with `Copy`/`Check` SVG feedback.

---

## 8. Iconography & Visual Asset Standards (Layout Rule)

To ensure professional aesthetics, consistent visual weight, and cross-platform fidelity, the application adheres to strict iconography rules across both the production app and interactive prototypes:

1. **100% Vector SVG Icons Only**:
   - **Strictly Prohibited**: Raw system emojis (such as ⚙️, ☀️, 🌙, 🔗, ✏️, 🗑️, 🛡️, ⚔️, 🏐, 👁️) must **never** be used for UI controls, buttons, toggles, badges, overlay switches, or modal tabs.
   - *Rationale*: Emojis render with radically disparate color schemes, glyph sizes, and baseline alignments across operating systems (macOS, Windows, Android, iOS, Linux) and do not support dynamic theme tinting.
2. **Single Consistent Library**:
   - All icons are sourced exclusively from **Lucide Icons** (`@lucide/svelte` / Lucide core).
   - In the Svelte application: imported directly from `@lucide/svelte` (e.g., `<Share2 size={16} />`, `<Settings size={18} />`).
   - In static prototypes / HTML mockups: rendered as clean, inline SVG elements with `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, and `stroke-width="2"`.
3. **Harmonious Sizing Scale**:
   - **Micro Actions & Badges (12px – 14px)**: Edit (`Pencil`), delete (`Trash2`), custom author badge (`User`), visible tag (`Eye`).
   - **Header Controls & Primary Buttons (16px – 18px)**: Share (`Share2`), theme switch (`Sun` / `Moon`), settings dropdown (`Settings`), new strategy (`Plus`).
   - **Section Titles & Phase Headers (16px – 20px)**: Base formation (`Shield`), defensive formation (`Crosshair`), rotation context (`ArrowLeftRight` / `Users`), strategies (`Layers`).
4. **Theme Adaptation**:
   - All SVG icons use `stroke="currentColor"`, automatically adapting to Light Mode and Dark Mode contrast without hardcoded fills.

---

## 9. Status Visual Language (Tags & Outlines)

| State | Outline | Tag |
|---|---|---|
| **Active** (selected strategy / formation in use) | Blue (`primary`) | Blue `Active` tag |
| **Visible** (the phase currently shown on the court) | Green (`success`) | Green `Visible` tag with `Eye` icon |
| **Modified** (unsaved draft changes) | Amber (`warning`) | Amber `Modified` tag |

- Tags appear **on rows/cards only**, never on column or block headers.
- *Active* is always shown when applicable; *Visible* appears in addition when the active item is also the phase on the court.
