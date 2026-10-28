<script lang="ts">
  import Dialog from '../common/Dialog.svelte';
  import Button from '../common/Button.svelte';
  import CourtThumbnail from '../court/CourtThumbnail.svelte';
  import ManSignIcon from '../common/icons/ManSignIcon.svelte';
  import WomanSignIcon from '../common/icons/WomanSignIcon.svelte';
  import { strategyStore } from '../../data/strategyStore.svelte';
  import { buildShareUrl, DEFAULT_SHARED_COURT_CONFIG, type SharedCourtConfig } from '../../data/shareCodec';
  import { strategyToMovements, strategyToScenario, getRosterForRotation } from '../../data/strategyAdapter';
  import { Share2, Check, Layers, Settings2, Grid3x3, MoveUpRight, Shield, Radar, Box } from '@lucide/svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  let shareTitle = $state<string>('');
  let selectedIds = $state<string[]>([]);
  let isCopied = $state<boolean>(false);
  let courtConfig = $state<Required<SharedCourtConfig>>({ ...DEFAULT_SHARED_COURT_CONFIG });

  // Initialize selections and default court config (only block shadow on) when opening
  $effect(() => {
    if (open) {
      selectedIds = [strategyStore.activeStrategyId];
      shareTitle = '';
      isCopied = false;
      courtConfig = { ...DEFAULT_SHARED_COURT_CONFIG };
    }
  });

  function toggleSelection(id: string) {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        selectedIds = selectedIds.filter(x => x !== id);
      }
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  function handleSelectAll() {
    selectedIds = strategyStore.strategies.map(s => s.id);
  }

  function copyTextToClipboard(text: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(textarea);
      resolve();
    });
  }

  function handleCopyShareLink() {
    const selected = strategyStore.strategies.filter(s => selectedIds.includes(s.id));
    if (selected.length === 0) return;

    const url = buildShareUrl(selected, shareTitle, courtConfig);
    copyTextToClipboard(url).then(() => {
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2500);
    });
  }
</script>

<Dialog
  {open}
  {onClose}
  title="Share Tactics Bundle"
  description="Select strategies to bundle into a compressed link with zero server or account setup."
  maxWidth="max-w-2xl"
>
  <div class="flex flex-col gap-4 select-none">
    <!-- 1. Share Title Input (Optional) -->
    <div class="flex flex-col gap-1">
      <label for="share-title-input" class="text-xs font-bold text-base-content/90 flex items-center justify-between">
        <span>Playbook Title</span>
        <span class="text-[10px] text-base-content/60 font-normal">Optional</span>
      </label>
      <input
        id="share-title-input"
        type="text"
        bind:value={shareTitle}
        placeholder="e.g. Defense vs. Lincoln High - Match Plan"
        maxlength="60"
        class="input input-sm input-bordered w-full text-xs font-medium focus:input-primary"
      />
    </div>

    <!-- 2. Strategy Selection List -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/90">
          <Layers class="w-3.5 h-3.5 text-primary" />
          <span>Strategies</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="badge badge-primary badge-soft font-bold text-[11px] py-1">
            {selectedIds.length} Selected
          </span>
          <button
            type="button"
            onclick={handleSelectAll}
            class="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
          >
            Select All
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
        {#each strategyStore.strategies as strategy (strategy.id)}
          {@const isChecked = selectedIds.includes(strategy.id)}
          {@const moves = strategyToMovements(strategy)}
          {@const scenario = strategyToScenario(strategy)}
          {@const roster = getRosterForRotation(strategy.rotation)}

          <button
            type="button"
            onclick={() => toggleSelection(strategy.id)}
            class="p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 {
              isChecked
                ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/40'
                : 'bg-base-200/50 border-base-300 opacity-70 hover:opacity-100 hover:border-base-content/30'
            }"
          >
            <div class="flex items-start justify-between gap-2 w-full">
              <div class="flex flex-col min-w-0 gap-1">
                <span class="font-bold text-xs truncate text-base-content" title={strategy.name}>
                  {strategy.name}
                </span>
                <div class="flex items-center">
                  <span
                    class="badge badge-sm rounded-full bg-transparent text-base-content font-bold text-[10px] px-2 py-0.5 gap-1 border {
                      strategy.rotation === 2 ? 'border-warning' : 'border-info'
                    }"
                  >
                    {#if strategy.rotation === 2}
                      <WomanSignIcon class="w-3 h-3 text-warning shrink-0" />
                      <span>Woman Serving</span>
                    {:else}
                      <ManSignIcon class="w-3 h-3 text-info shrink-0" />
                      <span>Man Serving</span>
                    {/if}
                  </span>
                </div>
              </div>

              <div class="w-4 h-4 rounded flex items-center justify-center shrink-0 border {
                isChecked ? 'bg-primary border-primary text-primary-content' : 'border-base-300 bg-base-300'
              }">
                {#if isChecked}
                  <Check class="w-3 h-3 stroke-[3]" />
                {/if}
              </div>
            </div>

            <!-- Mini Thumbnails side by side: Base & Defensive -->
            <div class="grid grid-cols-2 gap-1.5 w-full">
              <div class="aspect-[1/1] rounded-lg bg-base-300/40 border border-base-300 p-0.5 overflow-hidden pointer-events-none">
                <CourtThumbnail
                  movements={moves}
                  mode="base"
                  {roster}
                  {scenario}
                  active={isChecked}
                />
              </div>

              <div class="aspect-[1/1] rounded-lg bg-base-300/40 border border-base-300 p-0.5 overflow-hidden pointer-events-none">
                <CourtThumbnail
                  movements={moves}
                  mode="spike"
                  {roster}
                  {scenario}
                  active={isChecked}
                />
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- 3. Initial Court Display Configs -->
    <div class="flex flex-col gap-2 pt-1 border-t border-base-300/70">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/90">
          <Settings2 class="w-3.5 h-3.5 text-primary" />
          <span>Court Display Settings</span>
        </div>
        <span class="text-[10px] text-base-content/60">Initial view when link is opened</span>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          onclick={() => { courtConfig.showBlockShadow = !courtConfig.showBlockShadow; }}
          class="btn btn-xs rounded-lg gap-1.5 font-semibold border transition-all {
            courtConfig.showBlockShadow
              ? 'btn-primary border-primary'
              : 'btn-ghost bg-base-200/70 border-base-300 text-base-content/70'
          }"
        >
          <Shield class="w-3.5 h-3.5" />
          <span>Blocker Shadow</span>
          {#if courtConfig.showBlockShadow}
            <Check class="w-3 h-3 stroke-[2.5]" />
          {/if}
        </button>

        <button
          type="button"
          onclick={() => { courtConfig.showCoverageRange = !courtConfig.showCoverageRange; }}
          class="btn btn-xs rounded-lg gap-1.5 font-semibold border transition-all {
            courtConfig.showCoverageRange
              ? 'btn-primary border-primary'
              : 'btn-ghost bg-base-200/70 border-base-300 text-base-content/70'
          }"
        >
          <Radar class="w-3.5 h-3.5" />
          <span>Defense Coverage</span>
          {#if courtConfig.showCoverageRange}
            <Check class="w-3 h-3 stroke-[2.5]" />
          {/if}
        </button>

        <button
          type="button"
          onclick={() => { courtConfig.showZones = !courtConfig.showZones; }}
          class="btn btn-xs rounded-lg gap-1.5 font-semibold border transition-all {
            courtConfig.showZones
              ? 'btn-primary border-primary'
              : 'btn-ghost bg-base-200/70 border-base-300 text-base-content/70'
          }"
        >
          <Grid3x3 class="w-3.5 h-3.5" />
          <span>Court Zones (1–6)</span>
          {#if courtConfig.showZones}
            <Check class="w-3 h-3 stroke-[2.5]" />
          {/if}
        </button>

        <button
          type="button"
          onclick={() => { courtConfig.showAllArrows = !courtConfig.showAllArrows; }}
          class="btn btn-xs rounded-lg gap-1.5 font-semibold border transition-all {
            courtConfig.showAllArrows
              ? 'btn-primary border-primary'
              : 'btn-ghost bg-base-200/70 border-base-300 text-base-content/70'
          }"
        >
          <MoveUpRight class="w-3.5 h-3.5" />
          <span>Motion Vectors</span>
          {#if courtConfig.showAllArrows}
            <Check class="w-3 h-3 stroke-[2.5]" />
          {/if}
        </button>

        <button
          type="button"
          onclick={() => { courtConfig.is3DView = !courtConfig.is3DView; }}
          class="btn btn-xs rounded-lg gap-1.5 font-semibold border transition-all {
            courtConfig.is3DView
              ? 'btn-primary border-primary'
              : 'btn-ghost bg-base-200/70 border-base-300 text-base-content/70'
          }"
        >
          <Box class="w-3.5 h-3.5" />
          <span>3D Tilt</span>
          {#if courtConfig.is3DView}
            <Check class="w-3 h-3 stroke-[2.5]" />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <div class="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-base-300 select-none">
    <Button variant="secondary" onclick={onClose} class="text-xs">
      Cancel
    </Button>

    <Button
      variant={isCopied ? 'emerald' : 'default'}
      onclick={handleCopyShareLink}
      disabled={selectedIds.length === 0}
      class="text-xs font-bold flex items-center gap-1.5 px-4 shadow-md"
    >
      {#if isCopied}
        <Check class="w-4 h-4" />
        <span>Link Copied!</span>
      {:else}
        <Share2 class="w-4 h-4" />
        <span>Generate & Copy Link</span>
      {/if}
    </Button>
  </div>
</Dialog>
