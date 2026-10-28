<script lang="ts">
  import type { Strategy } from '../../types/volleyball';
  import { Pencil, Copy, Trash2 } from '@lucide/svelte';

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
  class="group relative w-full text-left py-2.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer {
    disabled
      ? 'opacity-40 pointer-events-none border-base-300/40 bg-base-200/20'
      : isActive
        ? 'bg-primary border-primary text-primary-content shadow-sm'
        : 'border-base-300/80 bg-base-200/50 text-base-content hover:bg-base-200 hover:border-base-content/20'
  }"
>
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center gap-2 min-w-0 flex-1">
      <!-- Rotation Symbol inline before the strategy name -->
      <span
        class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 {
          isActive ? 'bg-base-100/90 shadow-2xs' : 'bg-base-300/80'
        }"
        title={strategy.rotation === 2 ? 'Woman Serving' : 'Man Serving'}
      >
        {#if strategy.rotation === 2}
          <svg
            class="w-3.5 h-3.5 text-warning shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-label="Woman Serving"
          >
            <circle cx="12" cy="9" r="6" />
            <path d="M12 15v7" />
            <path d="M9 19h6" />
          </svg>
        {:else}
          <svg
            class="w-3.5 h-3.5 text-info shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-label="Man Serving"
          >
            <circle cx="10" cy="14" r="6" />
            <path d="M14.5 9.5 20 4" />
            <path d="M15 4h5v5" />
          </svg>
        {/if}
      </span>

      <span class="font-bold text-sm truncate" title={strategy.name}>
        {strategy.name || 'Untitled Strategy'}
      </span>
    </div>

    <!-- Actions Toolbar: Sibling elements with stopPropagation (hidden in shared read-only mode) -->
    {#if !readonly}
      <div
        class="flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity shrink-0"
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
          class="btn btn-ghost btn-xs btn-square transition-colors {
            isActive
              ? 'text-primary-content/80 hover:text-primary-content hover:bg-black/15'
              : 'text-base-content/70 hover:text-primary hover:bg-base-300'
          }"
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
          class="btn btn-ghost btn-xs btn-square transition-colors {
            isActive
              ? 'text-primary-content/80 hover:text-primary-content hover:bg-black/15'
              : 'text-base-content/70 hover:text-secondary hover:bg-base-300'
          }"
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
          class="btn btn-ghost btn-xs btn-square transition-colors {
            isActive
              ? 'text-primary-content/80 hover:text-primary-content hover:bg-black/15'
              : 'text-base-content/70 hover:text-error hover:bg-error/20'
          }"
          title="Delete strategy"
          aria-label="Delete strategy"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    {/if}
  </div>
</div>
