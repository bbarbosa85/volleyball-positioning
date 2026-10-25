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
  <dialog class="modal modal-open modal-bottom sm:modal-middle" aria-modal="true">
    <!-- Content Panel -->
    <div class="modal-box {maxWidth} max-h-[90vh] flex flex-col border border-base-300 bg-base-200 text-base-content shadow-2xl p-6">
      <div class="flex items-center justify-between pb-3 border-b border-base-300">
        <div>
          {#if title}
            <h2 class="text-xl font-bold tracking-tight text-base-content">{title}</h2>
          {/if}
          {#if description}
            <p class="text-xs opacity-70 mt-1">{description}</p>
          {/if}
        </div>
        <button
          type="button"
          class="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-base-content"
          onclick={onClose}
          aria-label="Close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-4">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>

    <!-- Backdrop form for clicking outside -->
    <form method="dialog" class="modal-backdrop bg-black/60 backdrop-blur-xs">
      <button type="button" onclick={onClose}>close</button>
    </form>
  </dialog>
{/if}
