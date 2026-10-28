<script lang="ts">
  import Dialog from '../common/Dialog.svelte';
  import Button from '../common/Button.svelte';
  import MarkdownEditor from '../common/MarkdownEditor.svelte';
  import ManSignIcon from '../common/icons/ManSignIcon.svelte';
  import WomanSignIcon from '../common/icons/WomanSignIcon.svelte';
  import { strategyStore } from '../../data/strategyStore.svelte';
  import { renderMarkdown } from '../../utils/markdown';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  const currentStrategy = $derived(strategyStore.currentStrategy);
  const descriptionHtml = $derived.by(() => {
    return currentStrategy.description ? renderMarkdown(currentStrategy.description) : '';
  });
</script>

<Dialog
  {open}
  {onClose}
  title={strategyStore.isEditing ? 'Edit Strategy Notes' : (currentStrategy.name || 'Strategy Notes')}
  maxWidth="max-w-lg"
>
  <div class="flex flex-col gap-3.5 select-none">
    <!-- Serving Rotation Summary Strip -->
    <div class="card bg-base-200/50 border border-base-300 p-3 flex flex-col gap-1.5">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-base-content/80">
          Serving Rotation
        </span>

        <span
          class="badge badge-sm rounded-full bg-transparent text-base-content font-bold text-[10px] px-2.5 py-0.5 gap-1 border {
            currentStrategy.rotation === 2 ? 'border-warning' : 'border-info'
          }"
        >
          {#if currentStrategy.rotation === 2}
            <WomanSignIcon class="w-3.5 h-3.5 text-warning shrink-0" />
            <span>Woman Serving</span>
          {:else}
            <ManSignIcon class="w-3.5 h-3.5 text-info shrink-0" />
            <span>Man Serving</span>
          {/if}
        </span>
      </div>

      <p class="text-xs text-base-content/70 leading-relaxed m-0">
        {#if currentStrategy.rotation === 2}
          Two men in the front row (Zones 4 & 2) with one woman in Zone 3.
        {:else}
          One man in the front row (Zone 3) flanked by two women (Zones 4 & 2).
        {/if}
      </p>
    </div>

    <!-- Notes Content (Markdown Editor in Edit Mode, Rendered Markdown in Read Mode) -->
    {#if strategyStore.isEditing && strategyStore.draft}
      <MarkdownEditor
        value={strategyStore.draft.description || ''}
        onchange={(val) => strategyStore.updateDraft({ description: val })}
        label="Notes"
        placeholder="Describe defensive triggers, setter reads, and coverage priorities..."
        rows={8}
        id="mobile-strategy-description-editor"
      />
    {:else}
      <div class="card bg-base-200/50 border border-base-300 p-3.5 flex flex-col gap-2 max-h-[55vh] overflow-y-auto select-text">
        {#if descriptionHtml}
          <div class="text-xs text-base-content/85 leading-relaxed prose prose-xs max-w-none">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html descriptionHtml}
          </div>
        {:else}
          <p class="text-xs text-base-content/50 italic m-0">
            {#if strategyStore.isSharedMode}
              No notes provided for this strategy.
            {:else}
              No notes added for this strategy yet.
            {/if}
          </p>
        {/if}
      </div>
    {/if}
  </div>

  <div class="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-base-300 select-none">
    <Button variant="default" size="sm" onclick={onClose}>
      Done
    </Button>
  </div>
</Dialog>

