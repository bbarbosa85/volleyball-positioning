# Code Quality & Component Architecture Guidelines

These instructions define the mandatory architectural standards for Svelte components and codebase organization in this project.

## 1. Component Size & Modularity Standard
- **Target File Size**: Aim for components to be **under 250–350 lines**.
- **Decomposition Principle**: If a component exceeds ~300 lines or begins handling multiple disparate concerns (e.g., complex SVG math rendering alongside DOM drag interactions and preset cards), decompose it into focused, single-responsibility sub-components.
- **Pure Presentation vs. Orchestration**: Keep view controllers (such as `App.svelte` or `Court.svelte`) focused on coordinating reactive state, event delegation, and high-level layout. Delegate intricate visual chunks (net meshes, SVG overlays, card templates, banner warnings) to dedicated child components.

## 2. Directory Hierarchy & Placement Rules
- **`src/components/common/` (Mandatory for Reusable Components)**:
  - All shared, reusable, or modular UI and tactical components MUST live inside `src/components/common/`.
  - Examples:
    - `PresetCard.svelte`: Generic preset thumbnail card with badge, rename/delete actions, and active/dirty ring styling.
    - `ModificationAlert.svelte`: Scoped unsaved changes quick-alert bar with *Save*, *Save as New*, and *Reset* actions.
    - `PresetDescriptionCallout.svelte`: Contextual tactical explanation callout with `Info` icon.
    - `RotationContextCard.svelte`: Segmented rotation switcher with capture-phase freeze lock and shake alert.
    - `CourtPhaseToggle.svelte`: Dual-phase switcher (Base Formation vs. Defensive Formation).
    - `TopHeader.svelte`: 1-liner navigation header with brand, contained Share CTA, theme toggle, and settings cog.
    - `CourtNet.svelte`: Isometric 3D elevated net structure.
    - `CourtZones.svelte`: Defending court zones 1–6 transparent grid.
    - `CourtOverlaySvg.svelte`: SVG coordinate projection, blocker shadow polygon, attack vectors, and transition arrows.
    - `CourtPlayerToken.svelte`: Draggable player token with gender styling and blocker status.
- **`src/components/ui/`**: Low-level generic primitives only (e.g. `Button`, `Dialog`, `Badge`, `Card`).
- **`src/components/`**: Standalone top-level feature orchestrators (`Controls.svelte`, `Court.svelte`, `CourtThumbnail.svelte`) and full-screen modals (`ShareModal.svelte`, `SaveAdjustmentModal.svelte`, `JsonManagerModal.svelte`, `ExportGifModal.svelte`).

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
  - Dark Theme: `'business'` (`data-theme="business"`).
  - Light Theme: `'nord'` (`data-theme="nord"`).

## 5. Quality Gate & Continuous Verification
- Any modification MUST pass:
  ```bash
  pnpm run scan
  ```
  (`oxlint && svelte-check --tsconfig ./tsconfig.app.json && tsc -p tsconfig.node.json`) with **0 errors and 0 warnings**.
- Never commit or leave code with lingering lint or typecheck warnings.
