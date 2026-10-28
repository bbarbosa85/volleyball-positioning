<script lang="ts">
  import { strategyStore } from '../../data/strategyStore.svelte';
  import StrategyRow from '../strategies/StrategyRow.svelte';
  import Dialog from '../common/Dialog.svelte';
  import Button from '../common/Button.svelte';
  import { Layers, Plus, Trash2 } from '@lucide/svelte';
  import type { Strategy } from '../../types/volleyball';

  let strategyToDelete = $state<Strategy | null>(null);

  function handleConfirmDelete() {
    if (strategyToDelete) {
      strategyStore.deleteStrategy(strategyToDelete.id);
      strategyToDelete = null;
    }
  }
</script>

<div class="flex flex-col h-full w-full gap-3 select-none">
  <!-- Header Bar -->
  <div class="flex items-center justify-between gap-2 px-1">
    <div class="flex items-center gap-2">
      <Layers class="w-5 h-5 text-primary" />
      <h2 class="text-base font-extrabold tracking-tight text-base-content m-0">
        Strategies
      </h2>
      <span class="badge badge-sm badge-neutral text-xs font-semibold">
        {strategyStore.strategies.length}
      </span>
    </div>

    <button
      type="button"
      onclick={() => strategyStore.startNewStrategy()}
      disabled={strategyStore.isEditing}
      class="btn btn-primary btn-sm gap-1.5 shadow-sm"
      title="Create new strategy"
    >
      <Plus class="w-4 h-4" />
      <span>New</span>
    </button>
  </div>

  <!-- Strategy List -->
  <div class="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
    {#each strategyStore.strategies as strategy (strategy.id)}
      <StrategyRow
        {strategy}
        isActive={strategy.id === strategyStore.activeStrategyId}
        disabled={strategyStore.isEditing}
        onSelect={() => strategyStore.selectStrategy(strategy.id)}
        onEdit={() => strategyStore.startEdit(strategy.id)}
        onDuplicate={() => strategyStore.duplicateStrategy(strategy.id)}
        onDelete={() => {
          strategyToDelete = strategy;
        }}
      />
    {/each}
  </div>
</div>

<!-- Delete Confirmation Modal -->
<Dialog
  open={strategyToDelete !== null}
  title="Delete Strategy"
  maxWidth="max-w-md"
  onClose={() => {
    strategyToDelete = null;
  }}
>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-base-content/80">
      Are you sure you want to delete <strong class="text-base-content">{strategyToDelete?.name}</strong>? This action cannot be undone.
    </p>

    <div class="flex items-center justify-end gap-2 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onclick={() => {
          strategyToDelete = null;
        }}
      >
        Cancel
      </Button>

      <button
        type="button"
        onclick={handleConfirmDelete}
        class="btn btn-error btn-sm gap-1 text-white shadow-xs"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>
    </div>
  </div>
</Dialog>
