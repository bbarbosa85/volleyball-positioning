<script lang="ts">
  import { strategyStore } from '../../data/strategyStore.svelte';
  import StrategyEditForm from '../strategies/StrategyEditForm.svelte';
  import MarkdownEditor from '../common/MarkdownEditor.svelte';
  import ManSignIcon from '../common/icons/ManSignIcon.svelte';
  import WomanSignIcon from '../common/icons/WomanSignIcon.svelte';
  import { renderMarkdown } from '../../utils/markdown';
  import { Info, Check, Copy, X } from '@lucide/svelte';

  const activeStrategy = $derived(strategyStore.activeStrategy);
  const canSave = $derived(Boolean(strategyStore.draft?.name.trim()));

  const descriptionHtml = $derived.by(() => {
    return activeStrategy.description ? renderMarkdown(activeStrategy.description) : '';
  });
</script>

<div class="flex flex-col h-full w-full gap-3 select-none">
  {#if !strategyStore.hasActiveOrDraft}
    <!-- EMPTY STATE PLACEHOLDER FOR RIGHT COLUMN -->
    <div class="card bg-base-200/40 border border-dashed border-base-300 p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[260px]">
      <div class="w-11 h-11 rounded-full bg-base-300/60 flex items-center justify-center text-base-content/40">
        <Info class="w-5 h-5" />
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-base-content/75">Rotation & Notes</span>
        <p class="text-[11px] text-base-content/55 leading-relaxed max-w-[230px]">
          Select or create a scenario to view its serving rotation and tactical instructions.
        </p>
      </div>
    </div>

  {:else if strategyStore.isEditing && strategyStore.draft}
    <!-- EDIT MODE: Right column houses the full Edit Form + Notes input + Action Buttons -->
    <div class="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 pb-2">
      <StrategyEditForm
        draft={strategyStore.draft}
        visiblePhase={strategyStore.visiblePhase}
        onUpdate={(updates) => strategyStore.updateDraft(updates)}
        onSelectPhase={(phase) => strategyStore.setVisiblePhase(phase)}
        onResetPhase={(phase) => strategyStore.resetPhaseToDefault(phase)}
      />

      <MarkdownEditor
        value={strategyStore.draft.description || ''}
        onchange={(val) => strategyStore.updateDraft({ description: val })}
        label="Notes"
        placeholder="Describe defensive triggers, setter reads, and coverage priorities..."
        rows={8}
        id="strategy-description-editor"
      />

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-300">
        <button
          type="button"
          onclick={() => strategyStore.cancelEdit()}
          class="btn btn-sm btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200 gap-1 text-base-content/75 hover:text-base-content"
          title="Discard draft changes"
        >
          <X class="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onclick={() => strategyStore.saveDraftAsNew()}
          disabled={!canSave}
          class="btn btn-sm btn-neutral gap-1 shadow-xs"
          title="Save as a new scenario"
        >
          <Copy class="w-3.5 h-3.5" />
          <span>Save as new</span>
        </button>

        <button
          type="button"
          onclick={() => strategyStore.saveDraft()}
          disabled={!canSave}
          class="btn btn-sm btn-primary gap-1 shadow-sm"
          title="Save scenario changes"
        >
          <Check class="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>
    </div>

  {:else}
    <!-- READ MODE: Extra Information Panel (Serving Rotation + Notes stacked) -->
    <!-- 1. Serving Rotation Card -->
    <div class="card bg-base-200/50 border border-base-300 p-3.5 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-base-content/80">
          Serving Rotation
        </span>

        <span
          class="badge badge-sm rounded-full bg-transparent text-base-content font-bold text-[10px] px-2.5 py-0.5 gap-1 border {
            activeStrategy.rotation === 2 ? 'border-warning' : 'border-info'
          }"
        >
          {#if activeStrategy.rotation === 2}
            <WomanSignIcon class="w-3.5 h-3.5 text-warning shrink-0" />
            <span>Woman Serving</span>
          {:else}
            <ManSignIcon class="w-3.5 h-3.5 text-info shrink-0" />
            <span>Man Serving</span>
          {/if}
        </span>
      </div>

      <p class="text-xs text-base-content/70 leading-relaxed">
        {#if activeStrategy.rotation === 2}
          Two men in the front row (Zones 4 & 2) with one woman in Zone 3.
        {:else}
          One man in the front row (Zone 3) flanked by two women (Zones 4 & 2).
        {/if}
      </p>
    </div>

    <!-- 2. Notes Card (no "Tactical Notes" title) -->
    <div class="card bg-base-200/50 border border-base-300 p-3.5 flex flex-col gap-2">
      {#if descriptionHtml}
        <div class="text-xs text-base-content/85 leading-relaxed prose prose-xs max-w-none">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html descriptionHtml}
        </div>
      {:else}
        <p class="text-xs text-base-content/50 italic">
          {#if strategyStore.isSharedMode}
            No notes provided for this scenario.
          {:else}
            No notes added. Click <strong>Edit</strong> to add instructions for this defense.
          {/if}
        </p>
      {/if}
    </div>
  {/if}
</div>
