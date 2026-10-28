<script lang="ts">
  import { Share2, Sun, Moon, Download, PlusCircle } from '@lucide/svelte';

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
</script>

<header class="w-full bg-base-100/80 backdrop-blur-md border-b border-base-200/60 sticky top-0 z-40 px-4 lg:px-8 py-2.5">
  <div class="max-w-[1720px] mx-auto flex items-center justify-between gap-3 flex-wrap">
    <!-- Brand & Title -->
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content shadow-md shadow-primary/30 shrink-0">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="m4.93 4.93 4.24 4.24"/>
          <path d="m14.83 9.17 4.24-4.24"/>
          <path d="M14.83 14.83 19.07 19.07"/>
          <path d="m9.17 14.83-4.24 4.24"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <h1 class="text-base font-extrabold tracking-tight text-base-content m-0">
          VolleyDefense <span class="text-primary font-medium">Tactics</span>
        </h1>
        {#if isSharedMode}
          <span class="badge badge-warning badge-sm font-bold text-[11px] gap-1">
            {sharedTitle ? `Shared: ${sharedTitle}` : 'Shared Playbook (Read-Only)'}
          </span>
        {/if}
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-2">
      {#if isSharedMode}
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
          <span class="hidden sm:inline">Create My Own Strategies</span>
          <span class="sm:hidden">My Board</span>
        </button>
      {:else}
        <!-- Contained Share Button -->
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

      <!-- Theme Toggle Button -->
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
  </div>
</header>
