<script lang="ts">
  import { strategyStore } from '../../data/strategyStore.svelte';
  import StrategyRow from '../strategies/StrategyRow.svelte';
  import Dialog from '../common/Dialog.svelte';
  import Button from '../common/Button.svelte';
  import {
    Layers,
    Plus,
    Trash2,
    PanelLeftClose,
    ChevronUp
  } from '@lucide/svelte';
  import type { Strategy } from '../../types/volleyball';

  interface Props {
    onCloseDrawer?: () => void;
    onAfterSelect?: () => void;
  }

  let {
    onCloseDrawer,
    onAfterSelect
  }: Props = $props();

  let strategyToDelete = $state<Strategy | null>(null);

  function handleConfirmDelete() {
    if (strategyToDelete) {
      strategyStore.deleteStrategy(strategyToDelete.id);
      strategyToDelete = null;
    }
  }

  function handleNewStrategy() {
    strategyStore.startNewStrategy();
    onAfterSelect?.();
  }

  function handleSelectStrategy(id: string) {
    strategyStore.selectStrategy(id);
    onAfterSelect?.();
  }

  function handleEditStrategy(id: string) {
    strategyStore.startEdit(id);
    onAfterSelect?.();
  }
</script>

<!-- SCENARIOS DRAWER CONTENT -->
<div class="flex flex-col h-full w-full gap-3 select-none">
  <!-- Header Bar -->
  <div class="flex items-center justify-between gap-2 px-1">
    <div class="flex items-center gap-2">
      <Layers class="w-5 h-5 text-primary" />
      <h2 class="text-base font-extrabold tracking-tight text-base-content m-0">
        Scenarios
      </h2>
      <span class="badge badge-sm badge-neutral text-xs font-semibold">
        {strategyStore.strategies.length}
      </span>
    </div>

    <div class="flex items-center gap-1.5">
      {#if !strategyStore.isSharedMode}
        <button
          type="button"
          onclick={handleNewStrategy}
          class="btn btn-primary btn-sm gap-1.5 shadow-sm"
          title="Create new scenario"
        >
          <Plus class="w-4 h-4" />
          <span>New</span>
        </button>
      {/if}

      {#if onCloseDrawer}
        <button
          type="button"
          onclick={onCloseDrawer}
          class="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-base-content hover:bg-base-200"
          title="Close scenarios drawer"
          aria-label="Close scenarios drawer"
        >
          <ChevronUp class="w-5 h-5 lg:hidden" />
          <PanelLeftClose class="w-4 h-4 hidden lg:block" />
        </button>
      {/if}
    </div>
  </div>

  <!-- Scenario List or Empty State -->
  {#if strategyStore.strategies.length === 0}
    <div class="card bg-base-200/40 border border-dashed border-base-300 p-6 flex flex-col items-center justify-center text-center gap-2.5 my-1">
      <div class="w-10 h-10 rounded-full bg-base-300/60 flex items-center justify-center text-base-content/50">
        <Layers class="w-5 h-5" />
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-base-content/80">No scenarios yet</span>
        <p class="text-[11px] text-base-content/60 leading-relaxed max-w-[210px]">
          Click <strong>+ New</strong> to create your first defensive formation scenario.
        </p>
      </div>
    </div>
  {:else}
    <div class="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
      {#each strategyStore.strategies as strategy (strategy.id)}
        <StrategyRow
          {strategy}
          isActive={strategy.id === strategyStore.activeStrategyId}
          readonly={strategyStore.isSharedMode}
          onSelect={() => handleSelectStrategy(strategy.id)}
          onEdit={() => handleEditStrategy(strategy.id)}
          onDuplicate={() => strategyStore.duplicateStrategy(strategy.id)}
          onDelete={() => {
            strategyToDelete = strategy;
          }}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Delete Confirmation Modal -->
<Dialog
  open={strategyToDelete !== null}
  title="Delete Scenario"
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
