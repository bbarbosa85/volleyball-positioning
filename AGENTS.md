# VolleyDefense Tactics — Agent & Developer Instructions

## Code Quality & Architecture Standards

### 1. Component Size & Decomposition
- Keep Svelte component files concise (target: **< 250–350 lines**).
- When a file grows large or mixes multiple concerns (e.g. complex SVG calculations with DOM canvas and control cards), decompose it into small, single-responsibility components.

### 2. Component Placement (`src/components/common`)
- **All reusable or modular components MUST live inside `src/components/common/`**.
- Keep view-level layout containers in `src/components/` (`Court.svelte`, `Controls.svelte`).
- Keep UI primitives in `src/components/ui/` (`Button.svelte`, `Dialog.svelte`, etc.).

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
