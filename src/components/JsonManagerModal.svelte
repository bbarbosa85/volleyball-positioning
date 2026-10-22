<script lang="ts">
  import type { DefenseSchemeConfig } from '../types/volleyball';
  import Dialog from './ui/Dialog.svelte';
  import Button from './ui/Button.svelte';
  import Badge from './ui/Badge.svelte';
  import { Download, Upload, Check, AlertCircle, RefreshCw, Copy, Save } from '@lucide/svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
    currentScheme: DefenseSchemeConfig;
    allSchemes: DefenseSchemeConfig[];
    onSaveScheme: (scheme: DefenseSchemeConfig) => void;
  }

  let {
    open,
    onClose,
    currentScheme,
    allSchemes,
    onSaveScheme
  }: Props = $props();

  let selectedSchemeId = $state('');
  let jsonText = $state('');
  let parseError = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  // Synchronize JSON text when scheme or open changes
  $effect(() => {
    if (open) {
      const active = allSchemes.find(s => s.id === selectedSchemeId) || currentScheme;
      selectedSchemeId = active.id;
      jsonText = JSON.stringify(active, null, 2);
      parseError = null;
      successMessage = null;
    }
  });

  function handleSchemeChange(id: string) {
    selectedSchemeId = id;
    const active = allSchemes.find(s => s.id === id);
    if (active) {
      jsonText = JSON.stringify(active, null, 2);
      parseError = null;
      successMessage = null;
    }
  }

  function handleValidateAndSave() {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.id || !parsed.name || !parsed.schemes) {
        throw new Error('The JSON configuration must include "id", "name", and "schemes" fields.');
      }
      onSaveScheme(parsed as DefenseSchemeConfig);
      parseError = null;
      successMessage = 'Scheme saved and applied to the court successfully!';
      setTimeout(() => {
        successMessage = null;
      }, 3000);
    } catch (err: any) {
      parseError = err.message || 'Invalid JSON format';
      successMessage = null;
    }
  }

  function handleDownload() {
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const active = allSchemes.find(s => s.id === selectedSchemeId) || currentScheme;
      a.href = url;
      a.download = active.fileName || `${active.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          jsonText = JSON.stringify(parsed, null, 2);
          parseError = null;
          successMessage = `File "${file.name}" loaded! Click Save & Apply to activate.`;
        } catch (err: any) {
          parseError = `Error parsing JSON file: ${err.message}`;
        }
      };
      reader.readAsText(file);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(jsonText);
    successMessage = 'JSON copied to clipboard!';
    setTimeout(() => (successMessage = null), 2500);
  }
</script>

<Dialog
  {open}
  {onClose}
  title="Defensive Positioning JSON Configuration"
  description="Inspect, directly edit, or import/export JSON files containing tactical court coordinates for each player."
  maxWidth="max-w-4xl"
>
  <div class="flex flex-col gap-4 text-slate-200">
    <!-- Top toolbar inside modal -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
      <div class="flex items-center gap-2">
        <label for="scheme-select" class="text-xs font-semibold text-slate-300">JSON File:</label>
        <select
          id="scheme-select"
          value={selectedSchemeId}
          onchange={(e) => handleSchemeChange(e.currentTarget.value)}
          class="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          {#each allSchemes as s}
            <option value={s.id}>{s.fileName || s.name}</option>
          {/each}
        </select>
      </div>

      <div class="flex items-center gap-2">
        <!-- Upload button -->
        <label class="cursor-pointer">
          <input type="file" accept=".json" onchange={handleFileUpload} class="hidden" />
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors">
            <Upload class="w-3.5 h-3.5" />
            Import JSON
          </span>
        </label>

        <!-- Copy -->
        <Button variant="ghost" size="sm" onclick={handleCopy} class="text-xs">
          <Copy class="w-3.5 h-3.5" />
          Copy
        </Button>

        <!-- Download button -->
        <Button variant="outline" size="sm" onclick={handleDownload} class="text-xs">
          <Download class="w-3.5 h-3.5" />
          Download (.json)
        </Button>
      </div>
    </div>

    <!-- Status feedback -->
    {#if parseError}
      <div class="flex items-center gap-2 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-400" />
        <span>{parseError}</span>
      </div>
    {/if}

    {#if successMessage}
      <div class="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs text-emerald-300">
        <Check class="w-4 h-4 shrink-0 text-emerald-400" />
        <span>{successMessage}</span>
      </div>
    {/if}

    <!-- Code Editor Area -->
    <div class="relative">
      <textarea
        bind:value={jsonText}
        spellcheck="false"
        class="w-full h-80 bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed select-text"
        placeholder="Paste or edit defensive positioning JSON here..."
      ></textarea>
    </div>

    <!-- Modal Footer Actions -->
    <div class="flex items-center justify-between pt-2 border-t border-slate-800">
      <div class="text-[11px] text-slate-400">
        Pro tip: You can also drag players on the court canvas to visually fine-tune their coordinates!
      </div>
      <div class="flex items-center gap-2">
        <Button variant="secondary" size="sm" onclick={onClose}>
          Close
        </Button>
        <Button variant="default" size="sm" onclick={handleValidateAndSave}>
          <Save class="w-3.5 h-3.5" />
          Save & Apply
        </Button>
      </div>
    </div>
  </div>
</Dialog>
