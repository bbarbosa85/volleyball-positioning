# VolleyDefense Tactics 🏐

Interactive volleyball court defense positioning and animation tactical board, tailored for **COED** teams (3 men and 3 women in rotational play) as well as conventional systems.

Built with **Svelte 5 (Runes)** + **Vite** + **Tailwind CSS** (shadcn-inspired component architecture) + **TypeScript**.

---

## 🌟 Key Features

1. **Clear Transition Animations**:
   - Smooth animations from **Base Reading Position** (pre-set) to **Adjusted Defensive Position** (formed block, defenders positioned on line alleys, cross diagonals, and tip coverage).
   - Complete playback control: Play/Pause, real-time Scrubbing slider, speed selector (0.5x, 1x, 1.5x, 2x), and quick position snaps.

2. **Opponent Attack Scenarios**:
   - **Opponent Outside Hitter (Zone 4)**: Hard Cross, Fast Line Shot, Tip / Roll Shot behind block.
   - **Opponent Right-Side / Opposite (Zone 2)**: Cross-Court, Line Shot.
   - **Opponent Middle Blocker (Zone 3)**: Quick 1st Tempo.
   - **Opponent Backrow (Zone 6)**: Pipe Attack (10-foot / 3-meter center).
   - Dynamic attack trajectory vectors, block shadow coverage cone (shaded protected area vs open seams), and target impact zones.

3. **COED League Setup (3 Men & 3 Women)**:
   - Visual tokens with clear gender badges (`♂` blue / `♀` pink), jersey numbers, customizable team colors, and volleyball positions.
   - Simple rotation selector (**R1 to R6**): automatically calculates which zone (P1 to P6) each player is currently defending in that rotation.

4. **Defensive Schemes in Named JSON Files**:
   - Built-in tactical schemes located in `src/data/schemes/`:
     - `defesa-6-recuado-tradicional.json`: Rotational Defense 6 Deep (Perimeter)
     - `defesa-6-avancado-cobertura.json`: Defense 6 Up (Tip Cover / Donut)
     - `defesa-fechando-paralela.json`: Line-Sealing Defense
     - `defesa-fechando-diagonal.json`: Cross-Sealing Defense
   - **Visual JSON Manager & Editor**:
     - View, live-edit, syntax-check, and apply JSON configs directly to the court.
     - Export/download `.json` or import custom coach configurations.
     - Drag-and-drop players on the court canvas to visually fine-tune coordinates.

5. **Individual Player Focus & Coaching Insights**:
   - Click any player on the court or list to inspect their displacement (in meters), specific tactical responsibility, and personalized coaching instructions for that scenario.

---

## 🚀 Running Locally

### 1. Install dependencies
```bash
yarn install --ignore-engines
# or
npm install --legacy-peer-deps
```

### 2. Start development server
```bash
yarn dev
```
Open `http://localhost:5174/` in your browser.

### 3. Production build
```bash
yarn build
```

---

## 📁 Project Architecture

```
volleyball-ideas/
├── src/
│   ├── components/
│   │   ├── ui/                       # Shadcn-style primitives (Button, Card, Badge, Dialog)
│   │   ├── Court.svelte              # Interactive court canvas with SVG vectors & tokens
│   │   ├── Controls.svelte           # Timeline scrubber, speed, scenarios & rotations
│   │   ├── PlayerFocusCard.svelte    # Individual & team tactical insights panel
│   │   ├── JsonManagerModal.svelte   # JSON configuration viewer, editor & importer
│   │   └── RosterModal.svelte        # COED (3M / 3F) lineup & role editor
│   ├── data/
│   │   ├── schemes/                  # Named JSON defensive scheme files
│   │   ├── defaultRoster.ts          # Default COED roster
│   │   ├── scenarios.ts              # Opponent attack catalog
│   │   └── schemeRegistry.ts         # Scheme loading & localStorage persistence
│   ├── types/
│   │   └── volleyball.ts             # TypeScript domain models
│   ├── App.svelte                    # Root app component
│   ├── app.css                       # Tailwind CSS & theme tokens
│   └── main.ts
├── scripts/
│   └── generate_schemes.js           # Automated JSON scheme generator
└── package.json
```
