<script lang="ts">
  import {
    Settings2,
    Grid3x3,
    MoveUpRight,
    Shield,
    Radar,
    Box,
    Check,
    Pencil,
    Copy,
    X,
    Sun,
    Moon
  } from '@lucide/svelte';

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

    // Mobile-collapsed strategy & theme actions
    isEditing?: boolean;
    isSharedMode?: boolean;
    canSave?: boolean;
    hasActiveStrategy?: boolean;
    isDarkMode?: boolean;
    onEdit?: () => void;
    onSave?: () => void;
    onSaveAsNew?: () => void;
    onCancel?: () => void;
    onToggleTheme?: () => void;
  }

  let {
    showZones = false,
    onToggleZones,
    showAllArrows = false,
    onToggleArrows,
    showBlockShadow = true,
    onToggleBlockShadow,
    showCoverageRange = false,
    onToggleCoverageRange,
    is3DView = false,
    onToggle3D,
    isEditing = false,
    isSharedMode = false,
    canSave = false,
    hasActiveStrategy = true,
    isDarkMode = true,
    onEdit,
    onSave,
    onSaveAsNew,
    onCancel,
    onToggleTheme
  }: Props = $props();

  let dropdownEl = $state<HTMLDetailsElement | null>(null);

  function handleWindowClick(e: MouseEvent) {
    if (dropdownEl?.open && e.target instanceof Node && !dropdownEl.contains(e.target)) {
      dropdownEl.open = false;
    }
  }

  function closeAndRun(fn?: () => void) {
    if (dropdownEl) dropdownEl.open = false;
    fn?.();
  }
</script>

<svelte:window onclick={handleWindowClick} />

<details bind:this={dropdownEl} class="dropdown dropdown-end select-none">
  <summary
    class="btn btn-sm btn-ghost btn-square border border-base-300 bg-base-200/70 hover:bg-base-200 text-base-content/80 hover:text-base-content list-none [&::-webkit-details-marker]:hidden"
    title="Court Display Settings & Actions"
    aria-label="Court Display Settings & Actions"
  >
    <Settings2 class="w-4 h-4" />
  </summary>

  <div
    class="dropdown-content z-50 mt-2 w-60 rounded-2xl bg-base-200 border border-base-300 shadow-2xl p-2 flex flex-col gap-1"
  >
    <!-- Mobile-Only Strategy Actions (< lg) -->
    {#if isEditing || (!isSharedMode && hasActiveStrategy)}
      <div class="lg:hidden flex flex-col gap-1 pb-1.5 mb-1 border-b border-base-300">
        <div class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">
          Strategy Actions
        </div>

        {#if isEditing}
          <button
            type="button"
            onclick={() => closeAndRun(onSave)}
            disabled={!canSave}
            class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer bg-primary text-primary-content disabled:opacity-40"
          >
            <Check class="w-4 h-4 shrink-0" />
            <span>Save Strategy</span>
          </button>

          <button
            type="button"
            onclick={() => closeAndRun(onSaveAsNew)}
            disabled={!canSave}
            class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-base-content/85 hover:bg-base-300/70 disabled:opacity-40"
          >
            <Copy class="w-4 h-4 shrink-0" />
            <span>Save as new</span>
          </button>

          <button
            type="button"
            onclick={() => closeAndRun(onCancel)}
            class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-error hover:bg-error/10"
          >
            <X class="w-4 h-4 shrink-0" />
            <span>Cancel Editing</span>
          </button>
        {:else if !isSharedMode && hasActiveStrategy}
          <button
            type="button"
            onclick={() => closeAndRun(onEdit)}
            class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-base-content/85 hover:bg-base-300/70"
          >
            <Pencil class="w-4 h-4 text-primary shrink-0" />
            <span>Edit Strategy</span>
          </button>
        {/if}
      </div>
    {/if}

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

    <!-- Mobile-Only Theme Toggle (< lg) -->
    {#if onToggleTheme}
      <div class="lg:hidden flex flex-col gap-1 pt-1 mt-0.5 border-t border-base-300">
        <button
          type="button"
          onclick={onToggleTheme}
          class="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-base-content/75 hover:bg-base-300/70 transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-2">
            {#if isDarkMode}
              <Sun class="w-4 h-4 text-warning shrink-0" />
              <span>Switch to Light Mode</span>
            {:else}
              <Moon class="w-4 h-4 text-primary shrink-0" />
              <span>Switch to Dark Mode</span>
            {/if}
          </div>
        </button>
      </div>
    {/if}
  </div>
</details>
