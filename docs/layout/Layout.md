# Layout & UI Hierarchy Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](../Requirements.md)*  
> *Interactive Prototype: [docs/layout/prototype.html](./prototype.html)*  
> *Last updated: October 2026*

---

## 1. Overview & Structural Layout

The application interface is divided into three primary regions: the **Top Header**, the **Left Court Simulator Area**, and the **Right Tactical Panel**. An interactive, responsive prototype is available at [prototype.html](./prototype.html).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP HEADER (Clean 1-liner - No background color, no border lines)           │
│ [Brand & Title]                      [Share CTA] [Sun/Moon SVG] [Cog SVG]   │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ LEFT: Court Simulator Area           │ RIGHT: Tactical Playbook Panel       │
│                                      │                                      │
│ ┌──────────────────────────────────┐ │ 1. ROTATION CONTEXT (Multiplier)     │
│ │ [ 1. Base Formation ]➔[ 2. Def ] │ │    [Man Serving] [Woman Serving]     │
│ ├──────────────────────────────────┤ ├──────────────────────────────────────┤
│ │                                  │ │ 2. BASE FORMATION                    │
│ │        COURT CANVAS              │ │    [Deep Read]  [Short Tip]          │
│ │  (Full 18m x 9m Court Viewport)  │ ├──────────────────────────────────────┤
│ │                                  │ │ 3. DEFENSIVE FORMATION               │
│ │  • Full Opponent Attack Side(9x9)│ │    [Outside Cross] [Fast Line D]     │
│ │  • Center Net, Antennas & Poles  │ │                                      │
│ │  • Defending Team Side (9x9m)    │ │ (Containers have transparent borders;│
│ │  • 6 Defender Tokens             │ │  amber border appears when dirty)    │
│ │  • Vector Arrows to Spike Target │ │                                      │
│ │  • Attacker, Setter & Ball       │ │                                      │
│ └──────────────────────────────────┘ │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Top Header (Global Configurations)

Global actions are hosted **exclusively in the top header** as a clean, minimalist one-liner with vertical breathing room:
- **Zero Visual Clutter**: No background colors, no glassmorphism overlays, and no bottom border lines (`background: transparent; border-bottom: none;`).
- **Clean 1-Liner Logo Block with Vertical Padding**: Features comfortable vertical padding (`padding: 0.75rem 1.5rem;` max-width 1720px aligned with the main court layout), a compact 26px vector volleyball icon alongside the bold title `VolleyDefense Tactics`, and no forced height or subtitle/description paragraphs.
- **Contained Share Button**: The Share CTA is styled as a prominent contained button with a solid primary fill (`var(--primary)`), white text, vector SVG icon, and no border.
- **Border-less Icon Controls**: Quick theme toggle (`Sun`/`Moon`) and view settings cog (`Settings`) are border-less, transparent icon buttons that highlight subtly on hover.
- **Settings Cog Dropdown**: Houses Court View Overlays (*Court Zones 1–6*, *Motion Vector Arrows*, *Blocker Shadow Cone*, *3D Perspective Court*), keeping the court canvas completely clean.

> **Hierarchy Rule**: Never duplicate Share, Theme, or Settings buttons inside the sidebar, court area, or tactical containers.

---

## 3. Left Area: Court Canvas

### 3.1 Court Card Header Bar (Integrated Phase Switcher)
The Stage Switcher is housed directly in the **Court Card Header Bar** centered immediately above the court canvas:
- **`1. Base Formation` Button**:
  - Puts the court in pre-contact reading stance (`0%` transition).
  - Defenders stand at their Base coordinates.
  - **Ball with Setter**: The ball is fixed and grouped with the opponent Setter (`S`).
  - **No Attacker Arrow**: No attack trajectory arrow is shown during Base Formation.
  - **Block Shadow Hidden**: Blocker shadow cone is strictly hidden on the base reading position.
  - **Defender Transition Vectors Active**: Arrows are dynamically drawn pointing from each defender's Base spot to their reaction target defined by the active Defensive Formation preset.
  - Active visual cue: Highlighted in primary blue accent with subtle glow.
- **`2. Defensive Formation` Button**:
  - Glides defenders smoothly into their defensive coverage positions (`100%` transition).
  - **Ball Moves to Attacker**: During transition, the ball glides smoothly from the Setter to the Attacker (`A`) and remains with the Attacker in this end state.
  - **Attack Trajectory Arrow Displayed**: An arrow originating at the Attacker/Ball points to the attack landing target across the net.
  - **Block & Shadow Active**: Displays the formed net block and the defensive blocker shadow cone.
  - Active visual cue: Highlighted in rose accent with subtle glow.

> **Clean UI Rule**: No redundant text labels (such as "Viewing Base Reading") are displayed. The active button's color and glow provide unambiguous, instant visual feedback.

### 3.2 Court Canvas Elements
- **Container Styling & Dirty Outline**: The court container (`.court-card`) has a transparent background and default transparent border. When any preset is dirty, an amber border outline (`border: 1px solid rgba(245, 158, 11, 0.75);`) lights up automatically around the container.
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
  - **Base Formation Position**: Ball is stationed with Setter `S` (positioned at the setting point or transition pass); no attack trajectory arrow, target reticle, or block shadow cone is displayed.
  - **Defensive Formation Position**: Ball animates smoothly from Setter to Attacker `A` and remains with Attacker at the point of attack contact; spiker trajectory arrow, draggable landing target reticle, and blocker shadow cone appear.
  - **Non-Draggable Ball**: The ball is fixed and non-draggable; its position is driven strictly by phase (with setter in Base Formation, with attacker in Defensive Formation).
  - **Draggable Attack Landing Target**: The destination/target of where the attacker might send the ball into the defending court is interactive and draggable (`x: 4–96%`, `y: 4–96%`).
  - **Dynamic Arrow Anchoring**: The attack trajectory arrow follows the target dynamically, with its origin anchored to the Attacker/Ball and its tip anchored to the draggable destination target across the net. Moving the target automatically stretches, rotates, and updates the arrow.
  - **Interactive Opponent Tokens Scoped to Presets**:
    - Both the attacker and setter tokens are draggable anywhere across the full opponent half-court (`y <= 0%`).
    - **Preset Phase Scoping**: Attacker and Setter positions are **integral parts of each preset**:
      - **Base Formations**: Persist defenders plus the pre-set reading positions of the opponent attacker and setter (with the ball fixed at the setter's hands).
      - **Defensive Formations**: Persist defenders plus the attack contact point of the opponent attacker, setter transition, and the landing target (with the ball at the attacker and the attack vector line drawn to the target).
  - **Preset Drift Detection (Approach A: Focused Edit Lock)**:
    - Dragging in `1. Base Formation` (defenders or opponent attacker/setter) marks the **Base Formation** as modified, enters the Base focused edit lock, disables sibling Base presets, highlights the container with an amber border, and displays the Base quick-alert bar (`#baseModAlert`).
    - Dragging in `2. Defensive Formation` (defenders, opponent attacker/setter, or attack target) marks the **Defensive Formation** as modified, enters the Defensive focused edit lock, disables sibling Defensive presets, highlights the container with an amber border, and displays the Defensive quick-alert bar (`#attackModAlert`).

---

## 4. Right Controls: Tactical Playbook Panel

The right controls are organized as **three distinct, independent panel-card blocks** with their own card headers:

### 4.1 Block 1: Rotation Context (Tactical Multiplier)
Positioned at the top of the right panel:
- **Serving Rotation Lineup**:
  - **Man Serving**: 1 Man on the Net (P3), 2 Women Front (P4, P2). Since women cannot block at the net in COED, only 1 legal net blocker exists (models traditional Rotation 1 / R1 lineup).
  - **Woman Serving**: 2 Men on the Net (P4, P2), 1 Woman Front (P3). The defense features 2 legal net blockers capable of running a double wall (models traditional Rotation 4 / R4 lineup).
- **Architectural Scope & Multiplier**: Presets are **strictly rotation-scoped**. Because blocking rules and legal net participation shift fundamentally between rotations, *Man Serving* and *Woman Serving* each maintain their own dedicated, calibrated sets of Base Formations and Defensive Formations rather than sharing a generic list.
- **Strict Freeze When Dirty**: If either Base Formation (Block 2) or Defensive Formation (Block 3) has unsaved modifications (`.modified`), Block 1 enters `.rotation-locked` and all containers gain `.is-dirty` outlines. Rotation switching buttons are disabled (`opacity: 0.45; cursor: not-allowed;`) and an amber banner appears: *"Rotation locked with unsaved changes. Save or Reset to switch."* Any click during freeze is captured, rejected, and shakes the warning banner. Switching is permitted only when both sections are clean.
- **Container Styling**: Containers (`.panel-card`) maintain transparent backgrounds and transparent default borders; the container border lights up amber only when dirty.
- **No Redundant Chips**: Labels like "Roster: 3M / 3F" are omitted since gender sequences and rules are self-evident from the segmented control and court tokens.

### 4.2 Block 2: Base Formation Card (`.base-card`)
A standalone `.panel-card` dedicated to pre-contact reading defense:
- Features card header `2. Base Formation` with defensive shield icon.
- Renders the active rotation's base reading presets (e.g. *Solo-Block Deep Read* in Man Serving; *Double-Block Perimeter Read* in Woman Serving).
- Transparent by default; lights up with an amber container border (`.is-dirty`) as soon as base coordinates are modified.
- **Direct Transition**: Clicking any Base preset automatically glides the court to Base reading formation.
- Hosts `#baseModAlert` contextual edit lock bar.

### 4.3 Block 3: Defensive Formation Card (`.attack-card`)
A standalone `.panel-card` dedicated to post-contact reaction coverage:
- Features card header `3. Defensive Formation` with target reticle icon.
- Renders the active rotation's defensive reactions (e.g. *Outside Cross (Solo Block)* in Man Serving; *Outside Cross (Double Wall)* in Woman Serving).
- Transparent by default; lights up with an amber container border (`.is-dirty`) as soon as reaction coordinates or attack targets are modified.
- **Direct Transition**: Clicking any Defensive preset automatically glides defenders into their reaction spots and reveals the attack trajectory.
- Hosts `#attackModAlert` contextual edit lock bar.

### 4.4 Approach A: Section-Scoped Focused Edit Lock & Modification Lifecycle

In strict adherence to **[REQ-02 (Decoupled Tactic Editing)](../Requirements.md#req-02)**, Base Formation and Defensive Formation maintain **completely independent, section-scoped edit locks, alert bars, and modification lifecycles**. Modifying one never locks or alters the other.

1. **Independent Scoped Edit Locks**:
   - **Base Formation (Block 2)**:
     - When any defender or opponent token (Attacker or Setter) is dragged while in `1. Base Formation`:
       - The active Base preset card enters `.modified` (amber outline, subtle glow).
       - The `#cardBasePresets` and `.court-card` containers gain `.is-dirty` (amber border outline).
       - **Only sibling Base preset cards** become `.disabled` (`opacity: 0.36`, `filter: grayscale(0.5)`, `pointer-events: none`, `cursor: not-allowed`, `aria-disabled="true"`).
       - The **Base Quick-Alert Bar** (`#baseModAlert`) appears directly beneath the "2. Base Formation" header.
       - **Crucial Decoupling**: The **Defensive Formation card remains 100% interactive**. The coach is completely free to switch Defensive presets to test how their modified base interacts with different opponent spikes (e.g. *Outside Cross* vs *Fast Line D*).
   - **Defensive Formation (Block 3)**:
     - When any defender, opponent attacker/setter, or attack target is dragged while in `2. Defensive Formation`:
       - The active Defensive preset card enters `.modified`.
       - The `#cardAttackPresets` and `.court-card` containers gain `.is-dirty` (amber border outline).
       - **Only sibling Defensive preset cards** become `.disabled`.
       - The **Defensive Quick-Alert Bar** (`#attackModAlert`) appears directly beneath the "3. Defensive Formation" header.
       - The **Base Formation card remains 100% interactive**.

2. **Simultaneous Dual Dirty States & Court Stage Independence**:
   - Both cards can be modified and dirty simultaneously without interference.
   - **Toggling Court Stages** (`1. Base Formation` vs `2. Defensive Formation` on the court header bar) smoothly glides canvas tokens to preview either state, and **never clears, resets, or dismisses either card's edit lock**.
   - Locks persist until the coach deliberately resolves each card.

3. **Strict Freeze on Rotation Switching**:
   - While either Base Formation OR Defensive Formation is in a modified/dirty state, the **Rotation Switcher (Block 1) is strictly frozen**:
     - Buttons `#rotMen` and `#rotWomen` are disabled (`opacity: 0.45; cursor: not-allowed;`).
     - `#cardRotationContext` gains `.is-dirty` amber outline.
     - The `#rotLockedBanner` displays an amber lock notice: *"Rotation locked with unsaved changes. Save or Reset to switch."*
     - A capture-phase listener captures any click on the rotation control, preventing rotation change and re-animating the banner shake feedback.
   - *Rationale*: Because tactical formations are intrinsically tied to rotation legalities (1-man front vs 2-men front), switching rotations mid-edit would either corrupt the destination rotation's formation or discard the coach's work.
   - The rotation switcher unlocks automatically once both sections are saved or reset.

4. **Context-Aware 3-Action Resolution per Section**:
   - Each card features its own dedicated action buttons:
     - **Custom Preset Active (`.user-custom-tag`)**:
       - **`[ Save ]` (Primary Blue)**: 1-click overwrite of that specific custom preset. Re-enables only that card's sibling presets and clears container `.is-dirty`.
       - **`[ Save as New ]` (Secondary Amber)**: Prompts for a new preset name and forks the modified layout into a new custom preset card in that section.
       - **`[ Reset ]` (Subtle Red / Ghost)**: Discards coordinate drift for that section, reverts its positions back to the saved preset, and unlocks only that card's grid.
     - **Built-in Default Preset Active**:
       - Built-in tactics (*Solo-Block Deep Read*, *Outside Cross*, etc.) are strictly immutable.
       - **`[ Save ]` is omitted/hidden** to prevent default preset corruption.
       - **`[ Save as New ]` (Secondary Amber)**: Prompts for a name and forks the modified layout into a new custom preset with a `Custom` tag.
       - **`[ Reset ]` (Subtle Red / Ghost)**: Reverts coordinates back to immutable system defaults and unlocks only that card's grid.
   - Resolving Base (saving or resetting) only affects Base and re-enables Base presets. The Defensive section remains locked until separately resolved, and vice versa.

---

## 5. Preset Button Anatomy

Every preset button in both grids adheres to this exact layout:

```
┌──────────────────────────────────────────────┐
│ [User] Preset Name           (Pencil)(Trash) │  <-- Top Header Line
│                                              │
│         ┌──────────────────────────┐         │
│         │                          │         │
│         │     COURT THUMBNAIL      │         │  <-- Miniature Court Preview
│         │                          │         │
│         └──────────────────────────┘         │
└──────────────────────────────────────────────┘
```

- **Top Header Line**:
  - **Left**: Preset name with text truncation, prefixed with a small `User` icon badge if it is a custom preset.
  - **Right**:
    - **Predefined Presets**: Predefined system presets are strictly immutable — **the edit/pencil icon is omitted** so users cannot attempt to rename system defaults.
    - **Custom Presets**: In-line action buttons rendered when selected:
      - **`Pencil` (Rename)**: Opens Dialog to rename the custom preset.
      - **`Trash2` (Delete)**: Removes the custom preset.
- **Center**: Miniature court thumbnail rendering current defender positions.
- **Accessibility Invariant**: Action buttons are rendered as sibling elements inside the card container with `e.stopPropagation()` to avoid illegal nested `<button>` DOM tags.

---

## 6. Mobile Responsiveness & Touch Constraints

Volleyball coaches and players frequently use the application courtside on mobile phones and tablets. The UI must be fully touch-optimized:

### 6.1 Viewport Breakpoints & Stacking
- **Desktop (>= 1024px)**: 2-column layout (7 cols Court simulator + 5 cols Tactical controls).
- **Mobile & Tablet (< 1024px)**: Single-column vertically stacked layout:
  1. **Top Header**: Compact sticky bar with brand, Share button, Theme toggle, and Settings cog.
  2. **Court Simulator Area**: Centered and fluidly responsive up to full viewport width, maximizing court visibility without floating toolbars.
  3. **Tactical Controls**: Follows underneath the court (Rotation switcher, Stage switcher, Presets grids).

### 6.2 Touch Drag & Gesture Protection
- **`touch-action: none` on Court Canvas**:
  - The court SVG container must apply `touch-action: none` so that dragging a defender, attacker, or ball on a smartphone screen does **not** inadvertently scroll the web page.
- **Minimum Tap Targets**:
  - All interactive buttons (presets, action icons, rotation buttons, view option toggles) must maintain minimum 44px x 44px touch tap areas (or appropriate padding) to prevent accidental mis-taps.
- **Preset Grid Responsiveness**:
  - Desktop: 3 columns (`grid-cols-3`).
  - Mobile: 2 columns (`grid-cols-2`) with thumbnail scaling to fit compact screens.

---

## 7. Share Modal: Visual Thumbnails & Phase Separation

When clicking **Share** in the header, the modal provides visual selection of the tactic bundle:

1. **Clear Phase & Context Separation**:
   - **Section 0: Rotation Context (Tactical Multiplier)** (`ArrowLeftRight` / `Users` SVG):
     - Serving rotation segmented control (*Man Serving* vs. *Woman Serving*). Synchronizes dynamically with the on-court active rotation and updates the share grid cards accordingly.
     - Calibrates the tactical package so that recipients view the correct rotation lineup, net blocking eligibility, and court geometry.
   - **Section 1: Base Formation Presets (Start Coordinates / Reading Phase)** (`Shield` SVG):
     - Clear description: *"Initial positioning of all 6 defenders before the opponent set."*
     - Selection limit badge: `[X / 3 Selected]`.
   - **Section 2: Defensive Formation Presets (End Coordinates / Reaction Phase)** (`Crosshair` SVG):
     - Clear description: *"Defensive blocks and court coverage adjustments when the ball is spiked."*
     - Selection limit badge: `[X / 3 Selected]`.
2. **Visual Thumbnail Cards**:
   - Each preset option displays its title, custom indicator (`User` SVG), and a mini SVG court preview of the positions.
   - Clean checkbox indicator toggles inclusion.
3. **1-Click Generation**:
   - Encodes up to 3+3 presets into the compressed URL hash (`#share=...`) and copies it directly to the clipboard with `Copy`/`Check` SVG feedback.

---

## 8. Iconography & Visual Asset Standards (Layout Rule)

To ensure professional aesthetics, consistent visual weight, and cross-platform fidelity, the application adheres to strict iconography rules across both the production app and interactive prototypes:

1. **100% Vector SVG Icons Only**:
   - **Strictly Prohibited**: Raw system emojis (such as ⚙️, ☀️, 🌙, 🔗, ✏️, 🗑️, 🛡️, ⚔️, 🏐, 👁️) must **never** be used for UI controls, buttons, toggles, badges, overlay switches, or modal tabs.
   - *Rationale*: Emojis render with radically disparate color schemes, glyph sizes, and baseline alignments across operating systems (macOS, Windows, Android, iOS, Linux) and do not support dynamic theme tinting.
2. **Single Consistent Library**:
   - All icons are sourced exclusively from **Lucide Icons** (`lucide-svelte` / Lucide core).
   - In the Svelte application: imported directly from `lucide-svelte` (e.g., `<Share2 size={16} />`, `<Settings size={18} />`).
   - In static prototypes / HTML mockups: rendered as clean, inline SVG elements with `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, and `stroke-width="2"`.
3. **Harmonious Sizing Scale**:
   - **Micro Actions & Badges (12px – 14px)**: Preset edit (`Pencil`), delete (`Trash2`), custom author badge (`User`).
   - **Header Controls & Primary Buttons (16px – 18px)**: Share (`Share2`), theme switch (`Sun` / `Moon`), settings dropdown (`Settings`).
   - **Section Titles & Phase Headers (16px – 20px)**: Base defense (`Shield`), attack reaction (`Crosshair`), rotation context (`ArrowLeftRight` / `Users`).
4. **Theme Adaptation**:
   - All SVG icons use `stroke="currentColor"`, automatically adapting to Light Mode and Dark Mode contrast without hardcoded fills.
