<script lang="ts">
  import { strategyStore } from '../../data/strategyStore.svelte';
  import PhaseTogglerCard from '../controls/PhaseTogglerCard.svelte';
  import StrategyEditForm from '../strategies/StrategyEditForm.svelte';
  import StrategyEditFooter from '../strategies/StrategyEditFooter.svelte';
  import { renderMarkdown } from '../../utils/markdown';
  import { Shield, Crosshair, FileText, Pencil } from '@lucide/svelte';

  const activeStrategy = $derived(strategyStore.activeStrategy);
  const currentStrategy = $derived(strategyStore.currentStrategy);
  const movements = $derived(strategyStore.movements);
  const scenario = $derived(strategyStore.scenario);
  const roster = $derived(strategyStore.roster);

  const descriptionHtml = $derived.by(() => {
    return activeStrategy.description ? renderMarkdown(activeStrategy.description) : '';
  });

  const canSave = $derived.by(() => {
    return Boolean(strategyStore.draft?.name.trim());
  });
</script>

<div class="flex flex-col h-full w-full gap-3 select-none">
  {#if !strategyStore.isEditing}
    <!-- VIEW MODE -->
    <div class="flex items-center justify-between gap-2 px-1">
      <div class="flex items-center gap-2">
        <Shield class="w-5 h-5 text-primary" />
        <h2 class="text-base font-extrabold tracking-tight text-base-content m-0">
          Formations
        </h2>
      </div>

      <button
        type="button"
        onclick={() => strategyStore.startEdit()}
        class="btn btn-ghost btn-sm gap-1.5 text-base-content/70 hover:text-primary hover:bg-base-200"
        title="Edit active strategy"
      >
        <Pencil class="w-3.5 h-3.5" />
        <span>Edit</span>
      </button>
    </div>

    <!-- Phase Cards Toggler -->
    <div class="flex flex-col gap-3">
      <!-- 1. Base Formation -->
      <PhaseTogglerCard
        phase="base"
        title="1. Base Formation"
        subtitle="Pre-Contact Reading Stance"
        isVisible={strategyStore.visiblePhase === 'base'}
        {movements}
        {roster}
        {scenario}
        onSelect={() => strategyStore.setVisiblePhase('base')}
      />

      <!-- 2. Defensive Formation -->
      <PhaseTogglerCard
        phase="defense"
        title="2. Defensive Formation"
        subtitle="Post-Contact Reaction & Dig"
        isVisible={strategyStore.visiblePhase === 'defense'}
        {movements}
        {roster}
        {scenario}
        onSelect={() => strategyStore.setVisiblePhase('defense')}
      />
    </div>

    <!-- Strategy Details Callout -->
    <div class="card bg-base-200/50 border border-base-300 p-3.5 mt-1 flex flex-col gap-2">
      <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/80">
        <FileText class="w-3.5 h-3.5 text-primary" />
        <span>Tactical Notes</span>
      </div>

      {#if descriptionHtml}
        <div class="text-xs text-base-content/85 leading-relaxed prose prose-xs max-w-none">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html descriptionHtml}
        </div>
      {:else}
        <p class="text-xs text-base-content/50 italic">
          No notes added. Click <strong>Edit</strong> to add tactical instructions for this defense.
        </p>
      {/if}
    </div>

  {:else}
    <!-- EDIT MODE -->
    <div class="flex items-center justify-between gap-2 px-1">
      <div class="flex items-center gap-2">
        <Crosshair class="w-5 h-5 text-warning" />
        <h2 class="text-base font-extrabold tracking-tight text-base-content m-0">
          Edit Strategy
        </h2>
      </div>

      <span class="badge badge-warning badge-sm font-bold">Draft</span>
    </div>

    <div class="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 pb-2">
      <!-- Form Fields (Name, Rotation, Description) -->
      {#if strategyStore.draft}
        <StrategyEditForm
          draft={strategyStore.draft}
          onUpdate={(updates) => strategyStore.updateDraft(updates)}
        />
      {/if}

      <!-- Formation Thumbnails with Reset tool -->
      <div class="flex flex-col gap-2.5 pt-2 border-t border-base-300">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-base-content/90">Formation Coordinates</span>
          <span class="text-[10px] text-base-content/60">Drag players on court to adjust</span>
        </div>

        <PhaseTogglerCard
          phase="base"
          title="1. Base Formation"
          subtitle="Pre-Contact Reading Stance"
          isVisible={strategyStore.visiblePhase === 'base'}
          isEditing={true}
          {movements}
          {roster}
          {scenario}
          onSelect={() => strategyStore.setVisiblePhase('base')}
          onReset={() => strategyStore.resetPhaseToDefault('base')}
        />

        <PhaseTogglerCard
          phase="defense"
          title="2. Defensive Formation"
          subtitle="Post-Contact Reaction & Dig"
          isVisible={strategyStore.visiblePhase === 'defense'}
          isEditing={true}
          {movements}
          {roster}
          {scenario}
          onSelect={() => strategyStore.setVisiblePhase('defense')}
          onReset={() => strategyStore.resetPhaseToDefault('defense')}
        />
      </div>
    </div>

    <!-- Sticky Edit Footer -->
    <StrategyEditFooter
      {canSave}
      onSave={() => strategyStore.saveDraft()}
      onSaveAsNew={() => strategyStore.saveDraftAsNew()}
      onCancel={() => strategyStore.cancelEdit()}
    />
  {/if}
</div>
