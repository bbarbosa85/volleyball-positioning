<script lang="ts">
  import type { Strategy } from '../../types/volleyball';
  import { Eye, Pencil, Copy, Trash2 } from '@lucide/svelte';

  interface Props {
    strategy: Strategy;
    isActive: boolean;
    disabled?: boolean;
    readonly?: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
  }

  let {
    strategy,
    isActive,
    disabled = false,
    readonly = false,
    onSelect,
    onEdit,
    onDuplicate,
    onDelete
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div
  role="button"
  tabindex={disabled ? -1 : 0}
  onclick={() => {
    if (!disabled) onSelect();
  }}
  class="group relative w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer {
    disabled
      ? 'opacity-40 pointer-events-none border-base-300/40 bg-base-200/20'
      : isActive
        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40'
        : 'border-base-300/80 bg-base-200/50 hover:bg-base-200 hover:border-base-content/20'
  }"
>
  <div class="flex items-start justify-between gap-2">
    <div class="flex flex-col min-w-0 flex-1">
      <div class="flex items-center gap-1.5 min-w-0">
        {#if isActive}
          <Eye class="w-4 h-4 text-primary shrink-0" aria-label="Active strategy" />
        {/if}
        <span class="font-bold text-sm text-base-content truncate" title={strategy.name}>
          {strategy.name || 'Untitled Strategy'}
        </span>
      </div>

      <div class="flex items-center gap-2 mt-1.5">
        <span
          class="badge badge-sm font-bold text-[10px] px-2 py-0.5 shadow-2xs {
            strategy.rotation === 2
              ? 'badge-secondary'
              : 'badge-info'
          }"
        >
          {strategy.rotation === 2 ? 'Woman Serving' : 'Man Serving'}
        </span>
      </div>
    </div>

    <!-- Actions Toolbar: Sibling elements with stopPropagation (hidden in shared read-only mode) -->
    {#if !readonly}
      <div
        class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
        onclick={(e) => e.stopPropagation()}
        role="toolbar"
        tabindex="-1"
      >
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          class="btn btn-ghost btn-xs btn-square hover:bg-base-300 text-base-content/70 hover:text-primary transition-colors"
          title="Edit strategy"
          aria-label="Edit strategy"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          class="btn btn-ghost btn-xs btn-square hover:bg-base-300 text-base-content/70 hover:text-secondary transition-colors"
          title="Duplicate strategy"
          aria-label="Duplicate strategy"
        >
          <Copy class="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          class="btn btn-ghost btn-xs btn-square hover:bg-error/20 text-base-content/70 hover:text-error transition-colors"
          title="Delete strategy"
          aria-label="Delete strategy"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    {/if}
  </div>
</div>
