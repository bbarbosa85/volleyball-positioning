<script lang="ts">
  import type { Strategy } from '../../types/volleyball';
  import MarkdownEditor from '../common/MarkdownEditor.svelte';
  import { Users } from '@lucide/svelte';

  interface Props {
    draft: Strategy;
    onUpdate: (updates: Partial<Strategy>) => void;
  }

  let { draft, onUpdate }: Props = $props();

  function handleNameChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    onUpdate({ name: val });
  }

  function handleRotationChange(r: 1 | 2) {
    onUpdate({ rotation: r });
  }

  function handleDescriptionChange(val: string) {
    onUpdate({ description: val });
  }
</script>

<div class="flex flex-col gap-3.5 w-full select-none">
  <!-- 1. Strategy Name Input -->
  <div class="flex flex-col gap-1 w-full">
    <label for="strategy-name-input" class="text-xs font-bold text-base-content/90 flex items-center justify-between">
      <span>Strategy Name <span class="text-error">*</span></span>
      <span class="text-[10px] text-base-content/60 font-normal">Required</span>
    </label>
    <input
      id="strategy-name-input"
      type="text"
      value={draft.name}
      oninput={handleNameChange}
      placeholder="e.g. Deep & Tip Cover vs. Outside Cross"
      maxlength="60"
      class="input input-sm input-bordered w-full font-medium text-xs focus:input-primary"
      required
    />
  </div>

  <!-- 2. Serving Rotation Switcher -->
  <div class="flex flex-col gap-1 w-full">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-base-content/90 flex items-center gap-1.5">
        <Users class="w-3.5 h-3.5 text-primary" />
        Serving Rotation
      </span>
      <span class="text-[10px] text-base-content/60 font-normal">Lineup & blocker roles</span>
    </div>

    <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-base-300/50 border border-base-300">
      <button
        type="button"
        onclick={() => handleRotationChange(1)}
        class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center {
          draft.rotation === 1
            ? 'btn btn-primary btn-xs'
            : 'btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200'
        }"
      >
        Man Serving (R1)
      </button>

      <button
        type="button"
        onclick={() => handleRotationChange(2)}
        class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center {
          draft.rotation === 2
            ? 'btn btn-primary btn-xs'
            : 'btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200'
        }"
      >
        Woman Serving (R2)
      </button>
    </div>
  </div>

  <!-- 3. Markdown Description Editor -->
  <MarkdownEditor
    value={draft.description || ''}
    onchange={handleDescriptionChange}
    label="Tactical Notes"
    placeholder="Describe defensive triggers, setter reads, and coverage priorities..."
    rows={3}
    id="strategy-description-editor"
  />
</div>
