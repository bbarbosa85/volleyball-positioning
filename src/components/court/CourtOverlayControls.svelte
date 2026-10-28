<script lang="ts">
  import { Settings2, Grid3x3, MoveUpRight, Shield, Radar, Box, Check } from '@lucide/svelte';

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

<div id="courtOverlayControls" class="dropdown dropdown-end select-none">
  <button
    type="button"
    tabindex="0"
    class="btn btn-sm btn-ghost btn-square border border-base-300 bg-base-200/70 hover:bg-base-200 text-base-content/80 hover:text-base-content"
    title="Court Display Settings"
    aria-label="Court Display Settings"
  >
    <Settings2 class="w-4 h-4" />
  </button>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    tabindex="0"
    class="dropdown-content z-30 mt-2 w-60 rounded-2xl bg-base-200 border border-base-300 shadow-2xl p-2 flex flex-col gap-1"
  >
    <div class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">
      Court Overlays
    </div>

    <!-- 1. Court Zones (1–6) -->
    <button
      type="button"
      onclick={onToggleZones}
      class="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer {
        showZones
          ? 'bg-primary/15 text-primary'
          : 'text-base-content/75 hover:bg-base-300/70'
      }"
    >
      <div class="flex items-center gap-2">
        <Grid3x3 class="w-4 h-4 shrink-0" />
        <span>Court Zones (1–6)</span>
      </div>
      {#if showZones}
        <Check class="w-3.5 h-3.5 stroke-[2.5]" />
      {/if}
    </button>

    <!-- 2. Motion Vectors -->
    <button
      type="button"
      onclick={onToggleArrows}
      class="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer {
        showAllArrows
          ? 'bg-primary/15 text-primary'
          : 'text-base-content/75 hover:bg-base-300/70'
      }"
    >
      <div class="flex items-center gap-2">
        <MoveUpRight class="w-4 h-4 shrink-0" />
        <span>Motion Vectors</span>
      </div>
      {#if showAllArrows}
        <Check class="w-3.5 h-3.5 stroke-[2.5]" />
      {/if}
    </button>

    <!-- 3. Blocker Shadow Cone -->
    <button
      type="button"
      onclick={onToggleBlockShadow}
      class="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer {
        showBlockShadow
          ? 'bg-primary/15 text-primary'
          : 'text-base-content/75 hover:bg-base-300/70'
      }"
    >
      <div class="flex items-center gap-2">
        <Shield class="w-4 h-4 shrink-0" />
        <span>Blocker Shadow Cone</span>
      </div>
      {#if showBlockShadow}
        <Check class="w-3.5 h-3.5 stroke-[2.5]" />
      {/if}
    </button>

    <!-- 4. Defense Coverage Range -->
    <button
      type="button"
      onclick={onToggleCoverageRange}
      class="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer {
        showCoverageRange
          ? 'bg-primary/15 text-primary'
          : 'text-base-content/75 hover:bg-base-300/70'
      }"
    >
      <div class="flex items-center gap-2">
        <Radar class="w-4 h-4 shrink-0" />
        <span>Defense Coverage</span>
      </div>
      {#if showCoverageRange}
        <Check class="w-3.5 h-3.5 stroke-[2.5]" />
      {/if}
    </button>

    <div class="h-px bg-base-300 my-0.5"></div>

    <!-- 5. 3D Dynamic Tilt -->
    <button
      type="button"
      onclick={onToggle3D}
      class="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer {
        is3DView
          ? 'bg-primary/15 text-primary'
          : 'text-base-content/75 hover:bg-base-300/70'
      }"
    >
      <div class="flex items-center gap-2">
        <Box class="w-4 h-4 shrink-0" />
        <span>3D Dynamic Tilt</span>
      </div>
      {#if is3DView}
        <Check class="w-3.5 h-3.5 stroke-[2.5]" />
      {/if}
    </button>
  </div>
</div>
