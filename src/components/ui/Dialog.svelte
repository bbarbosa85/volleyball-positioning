<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from '@lucide/svelte';

  interface Props {
    open: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
    children?: Snippet;
    maxWidth?: string;
  }

  let {
    open,
    title = '',
    description = '',
    onClose,
    children,
    maxWidth = 'max-w-2xl'
  }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onclick={onClose}
    ></div>

    <!-- Content Panel -->
    <div
      class="relative z-10 w-full {maxWidth} max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl transition-all animate-in zoom-in-95 duration-200 text-slate-100 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          {#if title}
            <h2 class="text-xl font-bold tracking-tight text-white">{title}</h2>
          {/if}
          {#if description}
            <p class="text-xs text-slate-400 mt-1">{description}</p>
          {/if}
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          onclick={onClose}
          aria-label="Fechar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-4">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
{/if}
