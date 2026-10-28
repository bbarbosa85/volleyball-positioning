<script lang="ts">
  import { Check, Copy, X } from '@lucide/svelte';

  interface Props {
    canSave: boolean;
    onSave: () => void;
    onSaveAsNew: () => void;
    onCancel: () => void;
  }

  let { canSave, onSave, onSaveAsNew, onCancel }: Props = $props();
</script>

<div class="sticky bottom-0 bg-base-100/90 backdrop-blur-md pt-3 pb-1 border-t border-base-300 flex items-center justify-between gap-2 z-30 select-none">
  <button
    type="button"
    onclick={onCancel}
    class="btn btn-ghost btn-sm gap-1 text-base-content/70 hover:text-base-content"
    title="Discard draft changes"
  >
    <X class="w-3.5 h-3.5" />
    <span>Cancel</span>
  </button>

  <div class="flex items-center gap-1.5">
    <button
      type="button"
      onclick={onSaveAsNew}
      disabled={!canSave}
      class="btn btn-neutral btn-sm gap-1 shadow-xs"
      title="Save as a new strategy"
    >
      <Copy class="w-3.5 h-3.5" />
      <span>Save as new</span>
    </button>

    <button
      type="button"
      onclick={onSave}
      disabled={!canSave}
      class="btn btn-primary btn-sm gap-1 shadow-sm"
      title="Save strategy changes"
    >
      <Check class="w-3.5 h-3.5" />
      <span>Save</span>
    </button>
  </div>
</div>
