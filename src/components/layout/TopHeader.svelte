<script lang="ts">
  import { Share2, Sun, Moon, Download, PlusCircle, MoreVertical } from '@lucide/svelte';
  import VolleyballIcon from '../common/icons/VolleyballIcon.svelte';

  interface Props {
    isDarkMode?: boolean;
    canShare?: boolean;
    isSharedMode?: boolean;
    sharedTitle?: string | null;
    onToggleTheme: () => void;
    onShare: () => void;
    onOpenImportShared?: () => void;
    onExitSharedMode?: () => void;
  }

  let {
    isDarkMode = true,
    canShare = true,
    isSharedMode = false,
    sharedTitle = null,
    onToggleTheme,
    onShare,
    onOpenImportShared,
    onExitSharedMode
  }: Props = $props();

  let sharedDropdownEl = $state<HTMLDetailsElement | null>(null);

  function handleWindowClick(e: MouseEvent) {
    if (sharedDropdownEl?.open && e.target instanceof Node && !sharedDropdownEl.contains(e.target)) {
      sharedDropdownEl.open = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<header class="w-full bg-base-100/80 backdrop-blur-md border-b border-base-200/60 sticky top-0 z-40 px-3 sm:px-4 lg:px-8 py-2 sm:py-2.5">
  <div class="max-w-[1720px] mx-auto flex items-center justify-between gap-2 flex-nowrap">
    <!-- Brand & Title -->
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

    <!-- Right Actions -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {#if isSharedMode}
        <!-- Desktop Shared Actions -->
        <div class="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onclick={onOpenImportShared}
            class="btn btn-sm btn-primary gap-1.5 shadow-sm"
            title="Select and copy shared strategies into your own board"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Copy to My Strategies</span>
          </button>

          <button
            type="button"
            onclick={onExitSharedMode}
            class="btn btn-sm btn-ghost border border-base-300 gap-1.5"
            title="Leave shared link and go to your own board"
          >
            <PlusCircle class="w-3.5 h-3.5" />
            <span>Create My Own Strategies</span>
          </button>
        </div>

        <!-- Mobile Shared Actions Dropdown -->
        <details bind:this={sharedDropdownEl} class="dropdown dropdown-end sm:hidden">
          <summary class="btn btn-xs btn-primary gap-1 list-none [&::-webkit-details-marker]:hidden">
            <Download class="w-3.5 h-3.5" />
            <span>Shared</span>
            <MoreVertical class="w-3.5 h-3.5" />
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
              <span>Copy to My Strategies</span>
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
              <span>Create My Own Strategies</span>
            </button>
          </div>
        </details>
      {:else}
        <!-- Contained Share Button -->
        <button
          type="button"
          onclick={onShare}
          disabled={!canShare}
          class="btn btn-xs sm:btn-sm btn-primary gap-1.5 shadow-md"
          title="Share tactical bundle via compressed link"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      {/if}

      <!-- Theme Toggle Button -->
      <button
        type="button"
        onclick={onToggleTheme}
        class="btn btn-xs sm:btn-sm btn-ghost btn-circle"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {#if isDarkMode}
          <Sun class="w-4 h-4 text-warning" />
        {:else}
          <Moon class="w-4 h-4 text-primary" />
        {/if}
      </button>
    </div>
  </div>
</header>
