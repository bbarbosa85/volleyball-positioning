<script lang="ts">
  import Dialog from '../common/Dialog.svelte';
  import Button from '../common/Button.svelte';
  import MarkdownEditor from '../common/MarkdownEditor.svelte';

  interface Props {
    open: boolean;
    type: 'base' | 'attack';
    name: string;
    description?: string;
    defensiveKey?: string;
    onClose: () => void;
    onSave: (updates: { name: string; description: string; defensiveKey?: string }) => void;
  }

  let {
    open,
    type,
    name = $bindable(''),
    description = $bindable(''),
    defensiveKey = $bindable(''),
    onClose,
    onSave
  }: Props = $props();

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      description: description.trim(),
      defensiveKey: type === 'attack' ? defensiveKey.trim() : undefined
    });
  }
</script>

<Dialog
  {open}
  onClose={onClose}
  title={type === 'base' ? 'Edit Base Formation Preset' : 'Edit Defensive Formation Preset'}
  maxWidth="max-w-lg"
>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
    class="flex flex-col gap-4 mt-1 text-xs"
  >
    <div class="flex flex-col gap-1.5">
      <label for="edit-preset-input" class="font-bold text-base-content/90">
        Preset Name <span class="text-error">*</span>
      </label>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        id="edit-preset-input"
        type="text"
        bind:value={name}
        placeholder="Enter preset name"
        class="input input-bordered w-full text-xs"
        required
        autofocus
      />
    </div>

    {#if type === 'attack'}
      <div class="flex flex-col gap-1.5">
        <label for="edit-preset-key-input" class="font-bold text-base-content/90">
          Defensive Key (Short Summary)
        </label>
        <input
          id="edit-preset-key-input"
          type="text"
          bind:value={defensiveKey}
          placeholder="e.g. Line & Cross, Pipe Trap, Tip Coverage"
          class="input input-bordered w-full text-xs"
        />
      </div>
    {/if}

    <MarkdownEditor
      bind:value={description}
      label="Preset Description & Tactical Notes (Markdown)"
      placeholder="Enter tactical assignments, positioning cues, or transition instructions..."
      rows={3}
    />

    <div class="flex items-center justify-end gap-2 pt-3 border-t border-base-300">
      <Button
        type="button"
        variant="secondary"
        onclick={onClose}
        class="text-xs"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="default"
        disabled={!name.trim()}
        class="btn btn-primary text-xs font-bold"
      >
        Save Changes
      </Button>
    </div>
  </form>
</Dialog>
