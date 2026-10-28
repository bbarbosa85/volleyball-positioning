<script lang="ts">
  import { Share2, Sun, Moon, Download, PlusCircle, ClipboardList, ChevronDown, Crosshair, Check, X, Pencil, Copy } from '@lucide/svelte';
  import VolleyballIcon from '../common/icons/VolleyballIcon.svelte';
  import ManSignIcon from '../common/icons/ManSignIcon.svelte';
  import WomanSignIcon from '../common/icons/WomanSignIcon.svelte';
  import CourtOverlayControls from '../court/CourtOverlayControls.svelte';

  interface Props {
    isDarkMode?: boolean;
    canShare?: boolean;
    isSharedMode?: boolean;
    sharedTitle?: string | null;
    isEditing?: boolean;
    canSave?: boolean;
    strategiesCount?: number;
    hasActiveStrategy?: boolean;
    currentStrategyName?: string;
    currentStrategyRotation?: 1 | 2;
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
    onToggleTheme: () => void;
    onShare: () => void;
    onOpenImportShared?: () => void;
    onExitSharedMode?: () => void;
    onOpenMobileDrawer?: () => void;
    onEdit?: () => void;
    onClone?: () => void;
    onSave?: () => void;
    onSaveAsNew?: () => void;
    onCancel?: () => void;
  }

  let {
    isDarkMode = true,
    canShare = true,
    isSharedMode = false,
    sharedTitle = null,
    isEditing = false,
    canSave = false,
    strategiesCount = 0,
    hasActiveStrategy = false,
    currentStrategyName = '',
    currentStrategyRotation = 1,
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
    onToggleTheme,
    onShare,
    onOpenImportShared,
    onExitSharedMode,
    onOpenMobileDrawer,
    onEdit,
    onClone,
    onSave,
    onSaveAsNew,
    onCancel
  }: Props = $props();

  let sharedDropdownEl = $state<HTMLDetailsElement | null>(null);

  function handleWindowClick(e: MouseEvent) {
    if (sharedDropdownEl?.open && e.target instanceof Node && !sharedDropdownEl.contains(e.target)) {
      sharedDropdownEl.open = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<header class="w-full bg-base-100/90 backdrop-blur-md border-b border-base-200/60 sticky top-0 z-40 select-none">
  <!-- Row 1: App Title + Actions -->
  <div class="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 flex-nowrap">
    <!-- Brand & Title (Visible on both Mobile and Desktop) -->
    <div class="flex items-center gap-2 min-w-0">
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content shadow-md shadow-primary/30 shrink-0">
        <VolleyballIcon class="w-4 h-4" />
      </div>
      <div class="flex items-center gap-2 min-w-0">
        <h1 class="text-sm sm:text-base font-extrabold tracking-tight text-base-content m-0 truncate">
          VolleyDefense <span class="text-primary font-medium">Tactics</span>
        </h1>
        {#if isSharedMode}
          <span class="hidden md:inline-flex badge badge-warning badge-sm font-bold text-[11px] gap-1 shrink-0">
            {sharedTitle ? `Shared: ${sharedTitle}` : 'Shared Playbook (Read-Only)'}
          </span>
        {/if}
      </div>
    </div>

    <!-- DESKTOP RIGHT ACTIONS (lg+) -->
    <div class="hidden lg:flex items-center gap-2 shrink-0">
      {#if isSharedMode}
        <button
          type="button"
          onclick={onOpenImportShared}
          class="btn btn-sm btn-primary gap-1.5 shadow-sm"
          title="Select and copy shared scenarios into your own board"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Copy to My Scenarios</span>
        </button>

        <button
          type="button"
          onclick={onExitSharedMode}
          class="btn btn-sm btn-ghost border border-base-300 gap-1.5"
          title="Leave shared link and go to your own board"
        >
          <PlusCircle class="w-3.5 h-3.5" />
          <span>Create My Own Scenarios</span>
        </button>
      {:else}
        <button
          type="button"
          onclick={onShare}
          disabled={!canShare}
          class="btn btn-sm btn-primary gap-1.5 shadow-md"
          title="Share tactical bundle via compressed link"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      {/if}

      <button
        type="button"
        onclick={onToggleTheme}
        class="btn btn-sm btn-ghost btn-circle"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {#if isDarkMode}
          <Sun class="w-4 h-4 text-warning" />
        {:else}
          <Moon class="w-4 h-4 text-primary" />
        {/if}
      </button>
    </div>

    <!-- MOBILE RIGHT ACTIONS: 1. Share/Shared Dropdown/Button + 2. Settings Icon Dropdown (< lg) -->
    <div class="flex lg:hidden items-center gap-1.5 shrink-0">
      {#if isEditing}
        <button
          type="button"
          onclick={onCancel}
          class="btn btn-xs btn-ghost border border-base-300 bg-base-200/70 gap-1 text-base-content/75"
          title="Discard draft changes"
        >
          <X class="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onclick={onSave}
          disabled={!canSave}
          class="btn btn-xs btn-primary gap-1 shadow-xs"
          title="Save strategy changes"
        >
          <Check class="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      {:else if isSharedMode}
        <!-- 1. Shared Dropdown Menu (Button with Icon and Text) -->
        <details bind:this={sharedDropdownEl} class="dropdown dropdown-end">
          <summary class="btn btn-sm btn-primary gap-1.5 px-2.5 list-none [&::-webkit-details-marker]:hidden">
            <Share2 class="w-3.5 h-3.5" />
            <span>Shared</span>
            <ChevronDown class="w-3.5 h-3.5 opacity-80" />
          </summary>

          <div
            class="dropdown-content z-50 mt-2 w-56 rounded-2xl bg-base-200 border border-base-300 shadow-2xl p-2 flex flex-col gap-1"
          >
            <button
              type="button"
              onclick={() => {
                if (sharedDropdownEl) sharedDropdownEl.open = false;
                onOpenImportShared?.();
              }}
              class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-content cursor-pointer"
            >
              <Download class="w-4 h-4 shrink-0" />
              <span>Copy to My Scenarios</span>
            </button>
            <button
              type="button"
              onclick={() => {
                if (sharedDropdownEl) sharedDropdownEl.open = false;
                onExitSharedMode?.();
              }}
              class="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-base-content/85 hover:bg-base-300/70 cursor-pointer"
            >
              <PlusCircle class="w-4 h-4 shrink-0" />
              <span>Create My Own Scenarios</span>
            </button>
          </div>
        </details>
      {:else}
        <!-- 1. Share Button (with Icon and Text) -->
        <button
          type="button"
          onclick={onShare}
          disabled={!canShare}
          class="btn btn-sm btn-primary gap-1.5 px-2.5 shadow-sm"
          title="Share tactical bundle via compressed link"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      {/if}

      <!-- 2. Settings Dropdown Menu (Just Icon) -->
      <CourtOverlayControls
        {showZones}
        {onToggleZones}
        {showAllArrows}
        {onToggleArrows}
        {showBlockShadow}
        {onToggleBlockShadow}
        {showCoverageRange}
        {onToggleCoverageRange}
        {is3DView}
        {onToggle3D}
        {isEditing}
        {canSave}
        {isDarkMode}
        {onSave}
        {onSaveAsNew}
        {onCancel}
        {onToggleTheme}
      />
    </div>
  </div>

  <!-- Row 2 (Mobile Only): Full-Width Fixed Scenario Selector Block Below Title Bar -->
  {#if !isEditing}
    <div class="lg:hidden w-full border-t border-base-200/70 bg-base-200/60 flex items-center justify-between px-3 py-2 gap-2">
      <button
        type="button"
        onclick={onOpenMobileDrawer}
        class="flex-1 min-w-0 flex items-center gap-2 text-left hover:opacity-85 transition-opacity cursor-pointer"
      >
        <div class="h-6 px-2 rounded-lg bg-base-300 flex items-center gap-1.5 text-primary shrink-0">
          <ClipboardList class="w-3.5 h-3.5" />
          <span class="text-xs font-extrabold text-base-content leading-none">
            {strategiesCount}
          </span>
        </div>

        {#if hasActiveStrategy}
          <div class="flex items-center gap-1.5 min-w-0">
            {#if currentStrategyRotation === 2}
              <WomanSignIcon class="w-4 h-4 text-warning shrink-0" ariaLabel="Woman Serving" />
            {:else}
              <ManSignIcon class="w-4 h-4 text-info shrink-0" ariaLabel="Man Serving" />
            {/if}
            <span class="font-bold text-sm sm:text-base text-base-content truncate">
              {currentStrategyName || 'Untitled Scenario'}
            </span>
          </div>
        {:else}
          <span class="text-sm font-medium text-base-content/60 italic truncate">
            No scenario selected — tap to open
          </span>
        {/if}

        <ChevronDown class="w-4 h-4 text-base-content/60 shrink-0" />
      </button>

      {#if hasActiveStrategy && !isSharedMode}
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onclick={onEdit}
            class="btn btn-xs btn-ghost btn-square text-base-content/70 hover:text-primary hover:bg-base-300"
            title="Edit scenario"
            aria-label="Edit scenario"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onclick={onClone}
            class="btn btn-xs btn-ghost btn-square text-base-content/70 hover:text-secondary hover:bg-base-300"
            title="Clone scenario"
            aria-label="Clone scenario"
          >
            <Copy class="w-3.5 h-3.5" />
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="lg:hidden w-full border-t border-base-200/70 bg-warning/10 py-1.5 px-3 flex items-center gap-2">
      <Crosshair class="w-3.5 h-3.5 text-warning shrink-0" />
      <span class="text-xs font-bold text-base-content truncate">
        Editing: {currentStrategyName || 'New Scenario'}
      </span>
    </div>
  {/if}
</header>
