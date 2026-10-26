<script lang="ts">
  import { AlertTriangle, BookmarkPlus, Check, RotateCcw } from '@lucide/svelte';

  interface Props {
    title: string;
    accent?: 'blue' | 'rose';
    onSave?: () => void;
    onSaveAsNew?: () => void;
    onReset?: () => void;
  }

  let {
    title,
    accent = 'blue',
    onSave,
    onSaveAsNew,
    onReset
  }: Props = $props();
</script>

<div
  role="alert"
  class="alert alert-warning alert-soft shadow-md p-2.5 text-xs flex flex-wrap items-center justify-between gap-2"
>
  <div class="flex items-center gap-1.5 font-bold">
    <AlertTriangle class="w-4 h-4 text-warning shrink-0" />
    <span>{title}</span>
  </div>

  <div class="flex items-center gap-1.5">
    {#if onSave}
      <button
        type="button"
        onclick={onSave}
        class="btn btn-xs {accent === 'blue' ? 'btn-primary' : 'btn-secondary'} gap-1 shadow-xs"
        title="Save changes to this preset"
      >
        <Check class="w-3 h-3" />
        <span>Save</span>
      </button>
    {/if}

    {#if onSaveAsNew}
      <button
        type="button"
        onclick={onSaveAsNew}
        class="btn btn-xs btn-warning gap-1 shadow-xs"
        title="Save as a new preset"
      >
        <BookmarkPlus class="w-3 h-3" />
        <span>Save as New</span>
      </button>
    {/if}

    {#if onReset}
      <button
        type="button"
        onclick={onReset}
        class="btn btn-xs btn-ghost border border-base-content/30 text-base-content hover:bg-base-300 gap-1 shadow-xs"
        title="Discard changes and revert positions"
      >
        <RotateCcw class="w-3 h-3" />
        <span>Reset</span>
      </button>
    {/if}
  </div>
</div>
