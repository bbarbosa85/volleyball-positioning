# VolleyDefense Tactics — Agent & Developer Instructions

## Code Quality & Architecture Standards

### 1. Component Size & Decomposition
- Keep Svelte component files concise (target: **< 250–350 lines**).
- When a file grows large or mixes multiple concerns (e.g. complex SVG calculations with DOM canvas and control cards), decompose it into small, single-responsibility components.

### 2. Component Placement & Organization
- **Layout Containers**: View-level layout containers live in `src/components/layout/` (the three workspace columns: `Strategies.svelte`, `Court.svelte`, `Phases.svelte`; plus `TopHeader.svelte`).
- **Domain Components**: Feature components are organized into semantic domain folders:
  - `src/components/court/`: Court canvas, floor markings, net, zones, player/opponent tokens, and overlays (`CourtOverlayControls.svelte`, `CourtOverlaySvg.svelte`).
  - `src/components/strategies/`: Strategy rows (`StrategyRow.svelte`) and edit form (`StrategyEditForm.svelte`).
  - `src/components/controls/`: Inline phase toggle (`PhaseTogglerCard.svelte`).
  - `src/components/modals/`: User dialog modals (`ShareModal.svelte`, `ImportSharedModal.svelte`).
- **State**: Application state lives in a Svelte 5 runes store (`*.svelte.ts`), not in `App.svelte`.
- **Specs**: The domain model (strategy = rotation + 1 base + 1 defensive formation) is defined in `docs/Strategies.md`.
- **Common Primitives**: Reusable UI primitives and shared components live in `src/components/common/` (`Button.svelte`, `Dialog.svelte`, `MarkdownEditor.svelte`).

### 3. Svelte 5 Runes Standard
- Use modern Svelte 5 runes (`$props()`, `$state()`, `$derived()`, `$effect()`).
- Define explicit TypeScript interfaces for all component `Props`.
- Use Svelte 5 snippets (`Snippet` & `@render`) for component composition.
- Use explicit callback props for component events.

### 4. UI Library Standard (daisyUI)
- **Always use daisyUI for any UI work or component changes**.
- Reference the installed daisyUI skill: `.agents/skills/daisyui/SKILL.md`.
- Use semantic daisyUI classes (`btn`, `badge`, `card`, `alert`, `modal`, `input`, `join`, `dropdown`, etc.) and semantic colors (`primary`, `secondary`, `neutral`, `base-100`, `base-200`, `base-300`, `warning`, `error`, `info`, `success`).
- **Themes**:
  - The Svelte application uses generic semantic themes: `'dark'` (`data-theme="dark"`) and `'light'` (`data-theme="light"`).
  - Specific daisyUI theme mappings are configured centrally in `src/app.css` using the `@plugin "./theme-bridge.js"` block (e.g. `dark: business`, `light: bumblebee`). No specific daisyUI theme names should be hardcoded inside Svelte components.

### 5. Verification Standard
- Always ensure `pnpm run scan` passes with **0 errors and 0 warnings** before finishing any task:
  ```bash
  pnpm run scan
  ```
