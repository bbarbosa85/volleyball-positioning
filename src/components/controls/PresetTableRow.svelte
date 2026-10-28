<script lang="ts">
  import type { Snippet } from "svelte";
  import { Pencil, Trash, Eye } from "@lucide/svelte";

  interface Props {
    title: string;
    subtitle?: string;
    isSelected: boolean;
    isVisibleOnCourt?: boolean;
    isActive?: boolean; // backwards compatible alias
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
    isVisibleOnCourt = false,
    isActive,
    isModified = false,
    isDisabled = false,
    canDelete = true,
    accent = "blue",
    onSelect,
    onRename,
    onDelete,
    children,
  }: Props = $props();

  const isVisible = $derived(isVisibleOnCourt || isActive || false);

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
    : isVisible
      ? isModified
        ? 'bg-warning/20 outline outline-2 outline-warning -outline-offset-2 border-l-4 border-l-warning text-base-content shadow-xs'
        : 'bg-success/10 outline outline-2 outline-success -outline-offset-2 border-l-4 border-l-success text-base-content shadow-xs'
      : isSelected
        ? isModified
          ? 'bg-warning/10 outline outline-2 outline-warning/60 -outline-offset-2 border-l-4 border-l-warning text-base-content'
          : 'bg-primary/10 outline outline-2 outline-primary -outline-offset-2 border-l-4 border-l-primary text-base-content shadow-xs'
        : 'hover:bg-base-200/60 text-base-content/85'}">
  <!-- 1. ICON (Court Thumbnail - keeps original size) -->
  <td class="w-24 p-2 text-center align-middle">
    <div
      class="relative w-[76px] h-[76px] mx-auto rounded-lg overflow-hidden bg-base-300/40 border shadow-inner p-0.5 transition-all {
        isVisible
          ? isModified
            ? 'border-2 border-warning ring-2 ring-warning/30 scale-102'
            : 'border-2 border-success ring-2 ring-success/40 scale-102'
          : isSelected
            ? 'border-2 border-primary ring-2 ring-primary/30'
            : 'border-base-300 group-hover:scale-102'
      }">
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

        <!-- ACTIVE TAG: Always visible if formation is active (Blue) -->
        {#if isSelected}
          <span class="badge badge-primary badge-xs font-semibold gap-1 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-content"></span>
            Active
          </span>
        {/if}

        <!-- VISIBLE TAG: Visible when currently showing on the court (Green with Eye icon) -->
        {#if isVisible}
          <span class="badge badge-success badge-xs font-bold gap-1 shadow-xs">
            <Eye class="w-3 h-3 text-success-content shrink-0" />
            Visible
          </span>
        {/if}

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
