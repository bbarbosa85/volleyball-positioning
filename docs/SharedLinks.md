# Public Shared Links & Guest Mode Specification

> **Module Specification**  
> *Requirements Index: [docs/Requirements.md](./Requirements.md)*  
> *Domain Model: [docs/Strategies.md](./Strategies.md)*  
> *Last updated: October 2026*

---

## 1. Overview & Objectives

Coaches need to share complete defensive game plans with their players without forcing players to register, log in, or risk accidentally altering the coach's work.

The unit of sharing is the **Strategy** (rotation + 1 base formation + 1 defensive formation, with a name and description). See [Strategies.md](./Strategies.md). **Only strategies can be shared**; individual formations are never shared on their own.

### The Strategy: V1 (Free) vs. V2 (Pro)

| Feature | V1 (Free Tier) | V2 (Pro Cloud Tier) |
|---|---|---|
| **Storage Architecture** | **100% Client-Side** (No DB / No Server) | Cloud Database (SQLite / Postgres) |
| **Share Mechanism** | **Compressed URL Hash** (`#share=...`) | Shortlink URL (`/t/:tacticSlug`) |
| **Strategies per Share Link** | **Selected Strategies** | **Unlimited Cloud Strategies** (Entire season playbooks) |
| **Account Required?** | **None** (Instant usage for coach & players) | Coach account required |
| **Recipient Experience** | Read-Only Guest Mode + "Save to My Tactics" | Read-Only Guest Mode + Team Access + View Analytics |

> *Note: For the full Pro Tier specifications, cloud database schemas, and shortlink architecture, see [docs/roadmap/ProTier.md](./roadmap/ProTier.md).*

---

## 2. V1 Compressed URL Architecture ("URL as Database")

In V1, sharing requires **zero backend infrastructure**. The data is compressed directly into the URL hash using a client-side compression library (`lz-string`).

```
Selected Strategies
  │
  ▼
JSON Payload v2 (~1.5 – 5 KB)
  │
  ▼
LZ-String URI-Safe Compression
  │
  ▼
https://volleydefense.app/#share=eNp9Vstu... (~600 - 2000 characters)
```

### 2.1 Payload Schema (v2)

```ts
interface SharePayloadV2 {
  v: 2;
  title?: string;
  strategies: Omit<Strategy, 'id'>[];  // array of strategies
}
```

- Strategies are **self-contained** (name, description, rotation, setter, attacker, target, base and defensive positioning), so no cross-references or deduplication are needed. Ids are regenerated on import.
- Player names are never included. Rotations are modeled by numbers and gender colors, keeping the payload compact.

### 2.2 Bundling Strategies

- Coaches can bundle any combination of their strategies into a single link.
- LZ-String compression keeps the URL compact and compatible with messaging apps (WhatsApp, iMessage, SMS, and email clients).

### 2.2.1 Legacy v1 Links

Links created before strategies existed (payload without `v`, containing separate base/attack presets and a rotation) are **converted on open**: bases and defenses of the same rotation are paired by index into auto-named, self-contained strategies (*"Shared strategy 1"*, ...). If a link cannot be converted, the user sees a non-blocking notice and the app opens normally.

---

## 3. Coach Workflow (Generating a Shared Link)

1. **Initiate Share**: Coach clicks the **Share** button in the top header (disabled while a strategy is being edited).
2. **Share Modal** (strategies only):
   - **Share Title** (optional) used for the guest banner (e.g. *"Defense vs. Lincoln High"*).
   - **Strategy Picker**:
     - Card list of the coach's strategies. Each card shows the strategy **name**, **rotation badge** (*Man Serving* / *Woman Serving*), and the **Base** and **Defensive** SVG thumbnails side by side.
     - Checkbox selection with an active counter (`[X Selected]`).
     - The currently active strategy is pre-selected.
   - There is **no separate rotation selector or formation picker**; both are defined by each strategy.
3. **Generate & Copy**:
   - Clicking **Generate & Copy Share Link** builds the v2 payload, compresses it into the URL hash (`#share=...`) and copies it to the clipboard.
   - Toast feedback confirms: *"Link copied! Anyone with this link can view and play these strategies."*

---

## 4. Guest Mode (Read-Only) Invariants & Permissions

When an unauthenticated player or teammate opens a shared link (`/#share=...`):

### 4.1 Strict Read-Only Restrictions
To protect tactical integrity:
- **View mode only**: Edit mode is unreachable.
- **No Player / Ball Dragging**: Defender tokens, the opponent attacker, setter, and ball are rendered in fixed/view-only mode. Drag handlers are disabled.
- **No Modification Alerts or Save Dialogs**: Dirty alerts, quick-save triggers, and all "Save" dialogs are inaccessible.
- **No Edit / Delete / New**: Strategy *Edit*, *Delete* and *+ New* controls are **never rendered**.
- **No Share**: Guests cannot re-share (the Share button is hidden).

### 4.2 Allowed Guest Interactions
1. **Switch Between Shared Strategies**: Column 1 lists only the strategies in the link; selecting one loads its rotation and positioning.
2. **Base / Defensive Toggler**: Column 3 toggler and the court header switcher animate between phases (`Base` 0% and `Defensive` 100%).
3. **Direct Smooth Transitions**: Defenders glide along their tactical transition vectors.
4. **View Options**: Toggle `Zones`, `All Arrows`, `Block Shadow`, and `3D View`.
5. **"Save to My Tactics" (Local Import)**:
   - A button in the guest banner copies the shared **strategies** into the recipient's own browser `localStorage`.
   - Imported strategies receive **fresh ids**; name collisions get a numeric suffix.
   - Imported strategies are marked custom and are fully editable.

---

## 5. Visual Guest Mode Indicator

In Guest Mode:
- The top header displays a subtle, clean banner:
  ```
  [Eye icon] Shared Strategies: [Share Title] • Read-Only • [Save to My Tactics]
  ```
- If the visitor exits the shared view, the app restores their personal local strategies.
