# Public Shared Links & Guest Mode Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](./Requirements.md)*  
> *Last updated: October 2026*

---

## 1. Overview & Objectives

Coaches need to share tactical formations, base defenses, and attack reactions with their players without forcing players to register, log in, or risk accidentally altering the coach's presets.

### The Strategy: V1 (Free) vs. V2 (Pro)

| Feature | V1 (Free Tier) | V2 (Pro Cloud Tier) |
|---|---|---|
| **Storage Architecture** | **100% Client-Side** (No DB / No Server) | Cloud Database (SQLite / Postgres) |
| **Share Mechanism** | **Compressed URL Hash** (`#share=...`) | Shortlink URL (`/t/:tacticSlug`) |
| **Presets per Share Link** | **Up to 3 Base + 3 Attack Presets** | **Unlimited Presets** (Entire season playbooks) |
| **Account Required?** | **None** (Instant usage for coach & players) | Coach account required |
| **Recipient Experience** | Read-Only Guest Mode + "Save to My Tactics" | Read-Only Guest Mode + Team Access + View Analytics |

> *Note: For the full Pro Tier specifications, cloud database schemas, and shortlink architecture, see [docs/roadmap/ProTier.md](./roadmap/ProTier.md).*

---

## 2. V1 Compressed URL Architecture ("URL as Database")

In V1, sharing requires **zero backend infrastructure**. The tactical data is compressed directly into the URL hash using a client-side compression library (`lz-string`).

```
Selected Presets (Up to 3 Base + 3 Attack)
  │
  ▼
JSON Payload (~1.5 KB)
  │
  ▼
LZ-String URI-Safe Compression
  │
  ▼
https://volleydefense.app/#share=eNp9Vstu... (~500 - 800 characters)
```

### 2.1 The 3+3 Preset Bundle (Virality & Compactness)
- Coaches can bundle up to **3 Base Defense presets** and up to **3 Attack presets** in a single link.
- **Why this limit works**:
  - Provides a complete, actionable match plan (e.g., Deep & Tip Cover against Outside Cross, Fast Line, and Pipe).
  - Keeps the compressed URL safely under 900 characters (compatible with WhatsApp, iMessage, SMS, and email clients which support up to 2,000+ characters).
  - **Ultra-Compact Schema**: By modeling the two serving rotations with numbers and gender colors instead of custom player names, player name strings and custom roster payloads are completely omitted, reducing URL payload size by over 40%.
  - Serves as the natural upsell threshold for the future **Pro Tier** (unlimited presets per share).

---

## 3. Coach Workflow (Generating a Shared Link)

1. **Initiate Share**: Coach clicks the **Share** button in the top header.
2. **Share Modal**:
   - **Tactic Title** (e.g. *"Defense vs. Lincoln High"*).
   - **0. Rotation Context (Tactical Multiplier)**:
     - Segmented control selecting the serving rotation context (*Man Serving (R1)* vs. *Woman Serving (R4)*).
     - Because serving rotations dictate front-row net blocker eligibility and court baseline geometry, presets are calibrated to this rotation multiplier.
   - **1. Base Formation Presets (Start Coordinates / Reading Phase)**:
     - Visual grid of preset cards featuring miniature court thumbnails.
     - Checkbox selection with a 3-preset cap (counter: `[X / 3 Selected]`).
     - Clarifies that these represent initial defender reading coordinates.
   - **2. Defensive Formation Presets (End Coordinates / Reaction Phase)**:
     - Visual grid of attack preset cards featuring miniature court thumbnails and vector indicators.
     - Checkbox selection with a 3-preset cap (counter: `[X / 3 Selected]`).
     - Clarifies that these represent defensive reaction adjustments and blocking assignments.
3. **Generate & Copy**:
   - Clicking **Generate & Copy Share Link** compresses the payload (including the rotation context) into the URL hash (`#share=...`) and copies it to the clipboard.
   - Toast feedback confirms: *"Link copied! Anyone with this link can view and play this tactic."*

---

## 4. Guest Mode (Read-Only) Invariants & Permissions

When an unauthenticated player or teammate opens a shared link (`/#share=...`):

### 4.1 Strict Read-Only Restrictions
To protect tactical integrity:
- **No Player / Ball Dragging**:
  - Defender tokens, the opponent attacker, setter, and ball are rendered in fixed/view-only mode.
  - Drag handlers are disabled.
- **No Modification Alerts**:
  - Alerts such as *"Base positions modified"* or *"Defensive formation modified"* are completely suppressed.
- **No Edit / Delete Action Buttons**:
  - The `Pencil` (rename) and `Trash2` (delete) buttons are **never rendered** on preset cards.
- **No Save / Custom Modal**:
  - All "Save as Custom" dialogs and quick-save triggers are inaccessible.

### 4.2 Allowed Guest Interactions
Guests enjoy full interactive simulation capabilities within the shared bundle:
1. **Switch Between Shared Presets**:
   - Guests can toggle among the Base Formation presets included in the link.
   - Guests can toggle among the Defensive Formation presets included in the link.
2. **Switch Rotations**:
   - Guests can toggle between **Man Serving** and **Woman Serving** to see how the team rotates.
3. **Direct Smooth Transitions**:
   - Selecting any shared Base or Attack preset automatically glides defenders into place along their tactical transition vectors.
4. **Stage Position Toggle**:
   - Guests can toggle between `Base Position` (0%) and `Set / Spike Position` (100%) to inspect both phases.
5. **View Options**:
   - Guests can toggle `Zones`, `All Arrows`, `Block Shadow`, and `3D View`.
6. **"Save to My Tactics" (Local Import)**:
   - A button in the guest banner allows recipients to copy the shared presets directly into their own browser's `localStorage` for offline practice.

---

## 5. Visual Guest Mode Indicator

In Guest Mode:
- The top header displays a subtle, clean banner:
  ```
  👁️ Shared Tactic: [Tactic Title] • Read-Only • [Save to My Tactics]
  ```
- If the visitor exits the shared view, the app restores their personal local presets.
