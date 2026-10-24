<script lang="ts">
  import Dialog from './ui/Dialog.svelte';
  import Button from './ui/Button.svelte';
  import { Check } from '@lucide/svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
    targetMode?: 'base' | 'attack' | 'spike';
    initialName?: string;
    initialLabel?: string;
    initialType?: string;
    onSave: (data: {
      name: string;
      label: string;
      type: 'hard_cross' | 'line' | 'tip' | 'pipe' | 'quick_middle' | 'custom';
      description: string;
      defensiveKey: string;
    }) => void;
  }

  let {
    open,
    onClose,
    targetMode = 'spike',
    initialName = '',
    initialLabel = '',
    initialType = 'custom',
    onSave
  }: Props = $props();

  let name = $state('');
  let label = $state('');
  let attackType = $state<'hard_cross' | 'line' | 'tip' | 'pipe' | 'quick_middle' | 'custom'>('custom');
  let description = $state('');
  let defensiveKey = $state('');

  $effect(() => {
    if (open) {
      if (targetMode === 'base') {
        name = initialName ? `${initialName} (Custom)` : 'Custom Base Defense';
        label = initialLabel || 'Custom Base';
        description = 'Custom base reading formation customized on the visual court.';
        defensiveKey = 'Base positioning before the set and attack.';
      } else {
        name = initialName ? `${initialName} (Custom)` : 'My Tactical Attack Defense';
        label = initialLabel ? `${initialLabel}*` : 'Custom Attack';
        attackType = (initialType as any) || 'custom';
        description = 'Custom defensive tactical alignment customized on the visual court.';
        defensiveKey = 'Defenders adjusted to seal the specific attack lane and tip cover.';
      }
    }
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      label: label.trim() || name.trim().slice(0, 16),
      type: attackType,
      description: description.trim(),
      defensiveKey: defensiveKey.trim()
    });

    onClose();
  }
</script>

<Dialog
  {open}
  {onClose}
  title={targetMode === 'base' ? 'Save Base Defense Preset' : 'Save Attack Preset'}
  description={targetMode === 'base'
    ? 'Save your current court reading formation as a custom base defense preset'
    : 'Save current attack and defending positions as a new attack preset'}
  maxWidth="max-w-md"
>
  <form onsubmit={handleSubmit} class="flex flex-col gap-4 text-xs">
    <!-- Preset Name -->
    <div class="flex flex-col gap-1.5">
      <label for="adj-name" class="font-bold text-slate-200">
        Preset Name <span class="text-rose-400">*</span>
      </label>
      <input
        id="adj-name"
        type="text"
        bind:value={name}
        placeholder={targetMode === 'base' ? 'e.g. Deep Shift Line Coverage' : 'e.g. Deep Line Defense - Outside Hitter'}
        required
        class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
      />
    </div>

    {#if targetMode === 'spike'}
      <!-- Short Button Label -->
      <div class="flex flex-col gap-1.5">
        <label for="adj-label" class="font-bold text-slate-200 flex items-center justify-between">
          <span>List Button Label</span>
          <span class="text-[10px] text-slate-400 font-normal">Shown in adjustments list</span>
        </label>
        <input
          id="adj-label"
          type="text"
          bind:value={label}
          placeholder="e.g. Deep Line"
          class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
        />
      </div>

      <!-- Attack Category -->
      <div class="flex flex-col gap-1.5">
        <label for="adj-type" class="font-bold text-slate-200">
          Attack Classification
        </label>
        <select
          id="adj-type"
          bind:value={attackType}
          class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer"
        >
          <option value="custom">Custom Tactical Set</option>
          <option value="hard_cross">Hard Cross Attack</option>
          <option value="line">Line Shot</option>
          <option value="tip">Tip / Roll Shot</option>
          <option value="quick_middle">Quick Middle</option>
          <option value="pipe">Pipe (Backrow Attack)</option>
        </select>
      </div>

      <!-- Key Tactical Notes -->
      <div class="flex flex-col gap-1.5">
        <label for="adj-key" class="font-bold text-slate-200">
          Defensive Key / Reading Note
        </label>
        <textarea
          id="adj-key"
          bind:value={defensiveKey}
          rows="2"
          placeholder="e.g. Zone 5 takes two steps forward for tip; Zone 6 holds deep corner."
          class="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
        ></textarea>
      </div>
    {:else}
      <!-- Base Defense Description -->
      <div class="flex flex-col gap-1.5">
        <label for="adj-desc" class="font-bold text-slate-200">
          Description / Tactical Notes
        </label>
        <textarea
          id="adj-desc"
          bind:value={description}
          rows="2"
          placeholder="e.g. Zone 6 shifted right, perimeter defenders pinched in."
          class="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
        ></textarea>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
      <Button type="button" variant="outline" size="sm" onclick={onClose}>
        Cancel
      </Button>
      <Button type="submit" variant="default" size="sm" class="bg-blue-600 hover:bg-blue-500 text-white font-bold">
        <Check class="w-3.5 h-3.5" />
        Save & Add to Presets
      </Button>
    </div>
  </form>
</Dialog>
