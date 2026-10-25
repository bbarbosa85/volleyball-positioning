<script lang="ts">
  import type { Snippet } from 'svelte';
  import { User, Pencil, Trash2 } from '@lucide/svelte';

  interface Props {
    title: string;
    isCustom?: boolean;
    isSelected: boolean;
    isModified?: boolean;
    isDisabled?: boolean;
    accent?: 'blue' | 'rose';
    thumbnailSize?: 'base' | 'attack';
    onSelect: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    children?: Snippet;
  }

  let {
    title,
    isCustom = false,
    isSelected,
    isModified = false,
    isDisabled = false,
    accent = 'blue',
    thumbnailSize = 'base',
    onSelect,
    onRename,
    onDelete,
    children
  }: Props = $props();
</script>

<div class="relative group">
  <button
    type="button"
    disabled={isDisabled}
    onclick={onSelect}
    class="w-full p-2 rounded-xl border transition-all duration-150 flex flex-col items-center gap-1.5 {
      isDisabled
        ? 'opacity-35 grayscale pointer-events-none cursor-not-allowed border-base-300 bg-base-300/20 text-base-content/40'
        : isSelected
        ? isModified
          ? 'bg-warning/15 border-warning text-base-content shadow-lg ring-2 ring-warning/60 scale-[1.01]'
          : accent === 'blue'
          ? 'bg-primary/15 border-primary text-base-content shadow-lg ring-2 ring-primary/60 scale-[1.01]'
          : 'bg-secondary/15 border-secondary text-base-content shadow-lg ring-2 ring-secondary/60 scale-[1.01]'
        : 'bg-base-200/70 border-base-300 text-base-content/75 hover:text-base-content hover:bg-base-200'
    }"
    title={title}
  >
    <!-- Top Line: Title & Custom badge -->
    <div class="flex items-center justify-between w-full gap-1 min-h-[22px] px-0.5">
      <div class="flex items-center gap-1.5 min-w-0 flex-1">
        <span class="font-bold text-xs truncate text-left {isSelected ? 'text-base-content' : 'text-base-content/80'}">
          {title}
        </span>
        {#if isCustom}
          <span class="badge badge-warning badge-soft badge-xs gap-0.5 py-0.5 px-1 shrink-0 font-bold">
            <User class="w-2.5 h-2.5" />
            <span>Custom</span>
          </span>
        {/if}
      </div>
      {#if isCustom && isSelected}
        <!-- Spacer for absolute action buttons -->
        <div class="w-12 shrink-0"></div>
      {/if}
    </div>

    <!-- Court Thumbnail Container -->
    <div class="relative w-full aspect-square {thumbnailSize === 'base' ? 'max-w-[84px]' : 'max-w-[74px]'} rounded-lg overflow-hidden bg-base-300/40 border border-base-300 shadow-inner p-0.5">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </button>

  <!-- Action buttons: ONLY when custom AND selected -->
  {#if isCustom && isSelected}
    <div class="absolute top-1.5 right-1.5 flex items-center gap-1 z-10 animate-fadeIn">
      {#if onRename}
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          class="btn btn-xs btn-square {accent === 'blue' ? 'btn-primary' : 'btn-warning'} shadow-md"
          title="Edit preset"
        >
          <Pencil class="w-3 h-3" />
        </button>
      {/if}
      {#if onDelete}
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          class="btn btn-xs btn-square btn-error shadow-md"
          title="Delete custom preset"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      {/if}
    </div>
  {/if}
</div>
