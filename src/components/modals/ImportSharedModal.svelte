<script lang="ts">
  import Dialog from '../common/Dialog.svelte';
  import Button from '../common/Button.svelte';
  import { strategyStore } from '../../data/strategyStore.svelte';
  import { Download, Check, Layers } from '@lucide/svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  let selectedIds = $state<string[]>([]);

  $effect(() => {
    if (open) {
      selectedIds = strategyStore.strategies.map(s => s.id);
    }
  });

  function toggleSelection(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(x => x !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  function handleToggleAll() {
    if (selectedIds.length === strategyStore.strategies.length) {
      selectedIds = [];
    } else {
      selectedIds = strategyStore.strategies.map(s => s.id);
    }
  }

  function handleConfirmImport() {
    if (selectedIds.length === 0) return;
    strategyStore.copySelectedSharedToMyBoard(selectedIds);
    onClose();
  }
</script>

<Dialog
  {open}
  {onClose}
  title="Copy Strategies to My Board"
  description="Select which shared strategies you want to import into your own board so you can edit and customize them."
  maxWidth="max-w-lg"
>
  <div class="flex flex-col gap-3.5 select-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/90">
        <Layers class="w-3.5 h-3.5 text-primary" />
        <span>Shared Strategies</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="badge badge-primary badge-soft font-bold text-[11px] py-1">
          {selectedIds.length} of {strategyStore.strategies.length} Selected
        </span>
        <button
          type="button"
          onclick={handleToggleAll}
          class="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
        >
          {selectedIds.length === strategyStore.strategies.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
      {#each strategyStore.strategies as strategy (strategy.id)}
        {@const isChecked = selectedIds.includes(strategy.id)}

        <button
          type="button"
          onclick={() => toggleSelection(strategy.id)}
          class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 {
            isChecked
              ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40'
              : 'bg-base-200/50 border-base-300 opacity-70 hover:opacity-100 hover:border-base-content/30'
          }"
        >
          <div class="flex flex-col min-w-0 gap-1">
            <span class="font-bold text-sm truncate text-base-content" title={strategy.name}>
              {strategy.name}
            </span>
            <div class="flex items-center gap-2">
              <span
                class="badge badge-sm font-bold text-[10px] px-2 py-0.5 {
                  strategy.rotation === 2 ? 'badge-secondary' : 'badge-info'
                }"
              >
                {strategy.rotation === 2 ? 'Woman Serving' : 'Man Serving'}
              </span>
            </div>
          </div>

          <div
            class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors {
              isChecked
                ? 'bg-primary border-primary text-primary-content'
                : 'border-base-content/30 bg-base-300/60'
            }"
          >
            {#if isChecked}
              <Check class="w-3.5 h-3.5 stroke-[3]" />
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <div class="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-base-300 select-none">
    <Button variant="ghost" size="sm" onclick={onClose}>
      Cancel
    </Button>

    <button
      type="button"
      onclick={handleConfirmImport}
      disabled={selectedIds.length === 0}
      class="btn btn-primary btn-sm gap-1.5 shadow-sm"
    >
      <Download class="w-4 h-4" />
      <span>Copy Selected ({selectedIds.length})</span>
    </button>
  </div>
</Dialog>

