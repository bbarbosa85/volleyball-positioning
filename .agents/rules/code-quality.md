# Code Quality & Component Architecture Guidelines

These instructions define the mandatory architectural standards for Svelte components and codebase organization in this project.

## 1. Component Size & Modularity Standard
- **Target File Size**: Aim for components to be **under 250–350 lines**.
- **Decomposition Principle**: If a component exceeds ~300 lines or begins handling multiple disparate concerns (e.g., complex SVG math rendering alongside DOM drag interactions and preset cards), decompose it into focused, single-responsibility sub-components.
- **Pure Presentation vs. Orchestration**: Keep view controllers (such as `App.svelte` or `Court.svelte`) focused on coordinating reactive state, event delegation, and high-level layout. Delegate intricate visual chunks (net meshes, SVG overlays, card templates, banner warnings) to dedicated child components.

## 2. Directory Hierarchy & Placement Rules
- **`src/components/layout/`**: View-level 3-column layout containers:
  - `Strategies.svelte`: Column 1 strategies list, search, duplicate/edit/delete actions, and new strategy creation.
  - `Court.svelte`: Column 2 court canvas and top overlay controls (`CourtOverlayControls.svelte`).
  - `Phases.svelte`: Column 3 phase cards (`PhaseTogglerCard.svelte`), read-only notes, and inline edit mode form/footer.
  - `TopHeader.svelte`: 1-liner navigation header with brand, contained Share CTA, theme toggle, and settings cog.
- **`src/components/court/`**: Court canvas modules, SVG geometry, tokens, and overlays:
  - `CourtFloor.svelte`, `CourtNet.svelte`, `CourtZones.svelte`, `CourtPlayerToken.svelte`, `CourtOpponents.svelte`, `CourtLandingTarget.svelte`, `CourtBall.svelte`, `CourtThumbnail.svelte`.
  - `CourtOverlaySvg.svelte`: SVG coordinate projection, blocker shadow polygon, attack vectors, and transition arrows.
  - `CourtOverlayControls.svelte`: Centered top-bar overlay toggles for Column 2.
- **`src/components/strategies/`**: Strategy management components:
  - `StrategyRow.svelte`: Strategy list item with Eye icon on active item, high-contrast rotation badge, and edit/duplicate/delete actions.
  - `StrategyEditForm.svelte`: Edit form for title, notes, serving rotation, and inline formation toggle.
- **`src/components/controls/`**: Phase control toggle:
  - `PhaseTogglerCard.svelte`: Side-by-side inline toggle (`| [icon] Base | [icon] Defensive |`) with blue border on the active formation.
- **`src/components/modals/`**: User dialog modals:
  - `ShareModal.svelte`: Modal supporting multi-strategy selection with side-by-side thumbnails and URL copying.
  - `ImportSharedModal.svelte`: Modal allowing selective copy of shared strategies into the user's local board.
- **`src/components/common/`**: Reusable generic UI primitives:
  - `Button.svelte`, `Dialog.svelte`, `MarkdownEditor.svelte`.

## 3. Svelte 5 Idiomatic Patterns & Best Practices
- **Runes Only**: Always use Svelte 5 runes (`$props()`, `$state()`, `$derived()`, `$effect()`). Avoid legacy Svelte 3/4 syntax (`export let`, `$: reactive`).
- **Typed Props**: Define an explicit `interface Props` for every component and assign types using `$props<Props>()` or `: Props = $props()`.
- **Snippets for Reusability**: Use Svelte 5 Snippets (`Snippet`) and `@render` for slots and transclusion (e.g., passing custom thumbnail previews into `PresetCard`).
- **Event Callbacks**: Pass typed callback functions (`onSelect: () => void`, `onUpdatePosition: (...) => void`) as props instead of using legacy `createEventDispatcher`.

## 4. UI Library Standard (daisyUI)
- **Mandatory Default**: Use daisyUI for all UI components, dialogs, buttons, alerts, and styling.
- **Skill Reference**: Always refer to the skill at `.agents/skills/daisyui/SKILL.md` for UI changes and component discoveries.
- **Semantic Components**: Use daisyUI semantic classes (`btn`, `badge`, `card`, `alert`, `modal`, `input`, `join`, `dropdown`, etc.) and semantic color tokens (`primary`, `secondary`, `neutral`, `base-100`, `base-200`, `base-300`, `warning`, `error`, `info`, `success`).
- **Themes**:
  - The Svelte application uses generic semantic themes: `'dark'` (`data-theme="dark"`) and `'light'` (`data-theme="light"`), mapped in `src/app.css` via `@plugin "./theme-bridge.js"`. No specific daisyUI theme names should be hardcoded inside Svelte components.

## 5. Quality Gate & Continuous Verification
- Any modification MUST pass:
  ```bash
  pnpm run scan
  ```
  (`oxlint && svelte-check --tsconfig ./tsconfig.app.json && tsc -p tsconfig.node.json`) with **0 errors and 0 warnings**.
- Never commit or leave code with lingering lint or typecheck warnings.
