<script lang="ts">
  import type { Snippet } from "svelte";
  import { Pencil, Trash } from "@lucide/svelte";

  interface Props {
    title: string;
    subtitle?: string;
    isSelected: boolean;
    isModified?: boolean;
    isDisabled?: boolean;
    canDelete?: boolean;
    accent?: "blue" | "rose";
    onSelect: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    children?: Snippet;
  }

  let {
    title,
    subtitle,
    isSelected,
    isModified = false,
    isDisabled = false,
    canDelete = true,
    accent = "blue",
    onSelect,
    onRename,
    onDelete,
    children,
  }: Props = $props();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  }
</script>

<tr
  onclick={onSelect}
  onkeydown={handleKeyDown}
  tabindex={isDisabled ? -1 : 0}
  role="button"
  aria-pressed={isSelected}
  aria-disabled={isDisabled}
  class="group cursor-pointer transition-all duration-150 border-b border-base-300/60 select-none {isDisabled
    ? 'opacity-40 grayscale pointer-events-none cursor-not-allowed'
    : isSelected
      ? isModified
        ? 'bg-warning/15 border-l-4 border-l-warning text-base-content'
        : 'bg-primary/15 border-l-4 border-l-primary text-base-content'
      : 'hover:bg-base-200/70 text-base-content/85'}">
  <!-- 1. ICON (Court Thumbnail - keeps original size) -->
  <td class="w-24 p-2 text-center align-middle">
    <div
      class="relative w-[76px] h-[76px] mx-auto rounded-lg overflow-hidden bg-base-300/40 border border-base-300 shadow-inner p-0.5 transition-transform group-hover:scale-102">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </td>

  <!-- 2. NAME -->
  <td class="p-2 align-middle">
    <div class="flex flex-col gap-1 text-left">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="font-bold text-xs sm:text-sm leading-tight {isSelected ? 'text-base-content' : 'text-base-content/90'}">
          {title}
        </span>
        {#if isSelected && isModified}
          <span class="badge badge-warning badge-xs font-semibold">Modified</span>
        {/if}
      </div>
      {#if subtitle}
        <span class="text-[11px] text-base-content/60 font-medium line-clamp-1">
          {subtitle}
        </span>
      {/if}
    </div>
  </td>

  <!-- 3. ACTIONS (Edit, Delete in this order) -->
  <td class="w-24 p-2 text-right align-middle" onclick={(e) => e.stopPropagation()}>
    <div class="flex items-center justify-end gap-1.5">
      {#if onRename}
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          class="btn btn-xs btn-square btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-300 shadow-xs"
          title="Edit preset"
          aria-label="Edit preset">
          <Pencil class="w-3.5 h-3.5" />
        </button>
      {/if}
      {#if onDelete && canDelete}
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          class="btn btn-xs btn-square btn-ghost text-error hover:bg-error/20 shadow-xs"
          title="Delete preset"
          aria-label="Delete preset">
          <Trash class="w-3.5 h-3.5" />
        </button>
      {/if}
    </div>
  </td>
</tr>
