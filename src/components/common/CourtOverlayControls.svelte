<script lang="ts">
  import { Grid3x3, MoveUpRight, Shield, Radar, Box } from '@lucide/svelte';

  interface Props {
    showZones?: boolean;
    onToggleZones?: () => void;

    showAllArrows?: boolean;
    onToggleArrows?: () => void;

    showBlockShadow?: boolean;
    onToggleBlockShadow?: () => void;

    showCoverageRange?: boolean;
    onToggleCoverageRange?: () => void;

    is3DView?: boolean;
    onToggle3D?: () => void;
  }

  let {
    showZones = false,
    onToggleZones,
    showAllArrows = false,
    onToggleArrows,
    showBlockShadow = true,
    onToggleBlockShadow,
    showCoverageRange = true,
    onToggleCoverageRange,
    is3DView = false,
    onToggle3D
  }: Props = $props();
</script>

<div
  id="courtOverlayControls"
  class="w-full max-w-[620px] flex items-center justify-between sm:justify-end gap-2 px-1 mb-2 z-20"
>
  <span class="text-[11px] font-bold uppercase tracking-wider text-base-content/60 sm:hidden">
    Court Overlays
  </span>

  <div class="inline-flex items-center gap-1 p-1 rounded-xl bg-base-200/80 border border-base-300 shadow-xs backdrop-blur-xs">
    <!-- 1. Court Zones (1–6) -->
    <div
      class="tooltip tooltip-bottom"
      data-tip={showZones ? 'Hide Court Zones (1–6)' : 'Show Court Zones (1–6)'}
    >
      <button
        type="button"
        onclick={onToggleZones}
        class="btn btn-sm btn-square rounded-lg transition-all {
          showZones
            ? 'btn-primary text-primary-content shadow-xs'
            : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300'
        }"
        aria-label="Toggle Court Zones"
        aria-pressed={showZones}
      >
        <Grid3x3 class="w-4 h-4" />
      </button>
    </div>

    <!-- 2. Motion Vectors -->
    <div
      class="tooltip tooltip-bottom"
      data-tip={showAllArrows ? 'Hide Motion Vectors' : 'Show Motion Vectors'}
    >
      <button
        type="button"
        onclick={onToggleArrows}
        class="btn btn-sm btn-square rounded-lg transition-all {
          showAllArrows
            ? 'btn-primary text-primary-content shadow-xs'
            : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300'
        }"
        aria-label="Toggle Motion Vectors"
        aria-pressed={showAllArrows}
      >
        <MoveUpRight class="w-4 h-4" />
      </button>
    </div>

    <!-- 3. Blocker Shadow Cone -->
    <div
      class="tooltip tooltip-bottom"
      data-tip={showBlockShadow ? 'Hide Blocker Shadow Cone' : 'Show Blocker Shadow Cone'}
    >
      <button
        type="button"
        onclick={onToggleBlockShadow}
        class="btn btn-sm btn-square rounded-lg transition-all {
          showBlockShadow
            ? 'btn-primary text-primary-content shadow-xs'
            : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300'
        }"
        aria-label="Toggle Blocker Shadow Cone"
        aria-pressed={showBlockShadow}
      >
        <Shield class="w-4 h-4" />
      </button>
    </div>

    <!-- 4. Defense Coverage Range -->
    <div
      class="tooltip tooltip-bottom"
      data-tip={showCoverageRange ? 'Hide Defense Coverage Range' : 'Show Defense Coverage Range'}
    >
      <button
        type="button"
        onclick={onToggleCoverageRange}
        class="btn btn-sm btn-square rounded-lg transition-all {
          showCoverageRange
            ? 'btn-primary text-primary-content shadow-xs'
            : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300'
        }"
        aria-label="Toggle Defense Coverage Range"
        aria-pressed={showCoverageRange}
      >
        <Radar class="w-4 h-4" />
      </button>
    </div>

    <div class="w-px h-4 bg-base-300 mx-0.5"></div>

    <!-- 5. 3D Dynamic Tilt -->
    <div
      class="tooltip tooltip-bottom"
      data-tip={is3DView ? 'Switch to Top-Down 2D View' : 'Switch to 3D Dynamic Tilt'}
    >
      <button
        type="button"
        onclick={onToggle3D}
        class="btn btn-sm btn-square rounded-lg transition-all {
          is3DView
            ? 'btn-primary text-primary-content shadow-xs'
            : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300'
        }"
        aria-label="Toggle 3D Dynamic Tilt"
        aria-pressed={is3DView}
      >
        <Box class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
