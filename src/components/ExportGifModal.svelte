<script lang="ts">
  import type { AttackScenario, Player, PlayerMovement } from '../types/volleyball';
  import { exportCourtAnimationGif } from '../services/gifExporter';
  import Dialog from './ui/Dialog.svelte';
  import Button from './ui/Button.svelte';
  import { Download, Check, Loader2, Sparkles, RefreshCw } from '@lucide/svelte';

  interface Props {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    scenario: AttackScenario;
    movements: PlayerMovement[];
    roster: Player[];
    rotation: number;
    showBlockShadow: boolean;
  }

  let {
    open,
    isOpen,
    onClose,
    scenario,
    movements,
    roster,
    rotation,
    showBlockShadow
  }: Props = $props();

  const isModalOpen = $derived(open !== undefined ? open : Boolean(isOpen));

  let isGenerating = $state(false);
  let progressPct = $state(0);
  let frameCurrent = $state(0);
  let frameTotal = $state(0);
  let generatedGifUrl = $state<string | null>(null);
  let generatedFileSize = $state<number>(0);
  let errorMsg = $state<string | null>(null);

  async function handleStartExport() {
    isGenerating = true;
    errorMsg = null;
    progressPct = 0;
    generatedGifUrl = null;

    try {
      const result = await exportCourtAnimationGif({
        scenario,
        movements,
        roster,
        rotation,
        showBlockShadow,
        width: 520,
        height: 680,
        onProgress: (pct, cur, total) => {
          progressPct = pct;
          frameCurrent = cur;
          frameTotal = total;
        }
      });

      generatedGifUrl = result.url;
      generatedFileSize = result.fileSize;
    } catch (err: any) {
      console.error('GIF generation failed:', err);
      errorMsg = err?.message || 'Failed to generate GIF';
    } finally {
      isGenerating = false;
    }
  }

  function handleDownload() {
    if (!generatedGifUrl) return;
    const a = document.createElement('a');
    a.href = generatedGifUrl;
    const cleanName = scenario.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `volleydefense-${cleanName}-r${rotation}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Auto-start generation when modal opens
  $effect(() => {
    if (isModalOpen && !generatedGifUrl && !isGenerating) {
      handleStartExport();
    }
  });

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
</script>

<Dialog
  open={isModalOpen}
  {onClose}
  title="Export Tactical GIF"
  description="{scenario.name} • Rotation R{rotation}"
  maxWidth="max-w-lg"
>
  <div class="flex flex-col items-center justify-center gap-4 text-xs">
    {#if isGenerating}
      <!-- Progress view -->
      <div class="py-10 flex flex-col items-center gap-3 text-center">
        <div class="relative flex items-center justify-center">
          <Loader2 class="w-10 h-10 text-amber-400 animate-spin" />
          <Sparkles class="w-4 h-4 text-rose-400 absolute animate-pulse" />
        </div>

        <div class="flex flex-col gap-1 items-center">
          <span class="text-sm font-bold text-white">
            Rendering Animation Frames...
          </span>
          <span class="text-xs text-slate-400">
            Frame {frameCurrent} of {frameTotal} ({progressPct}%)
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-64 h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mt-2">
          <div
            class="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-150 rounded-full"
            style="width: {progressPct}%;"
          ></div>
        </div>

        <p class="text-[11px] text-slate-500 max-w-xs mt-2">
          Interpolating player positions, attack vector, and block shadows into a smooth looping GIF.
        </p>
      </div>
    {:else if errorMsg}
      <!-- Error view -->
      <div class="py-8 flex flex-col items-center gap-3 text-center text-rose-400">
        <p class="text-sm font-semibold">{errorMsg}</p>
        <Button variant="secondary" onclick={handleStartExport}>
          <RefreshCw class="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </Button>
      </div>
    {:else if generatedGifUrl}
      <!-- Preview & Download view -->
      <div class="flex flex-col items-center gap-3 w-full">
        <div class="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black max-w-[320px]">
          <img
            src={generatedGifUrl}
            alt="Tactical Volleyball Animation"
            class="w-full h-auto object-contain block"
          />
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-black bg-slate-950/80 text-amber-300 border border-slate-700/80 shadow">
            {formatBytes(generatedFileSize)}
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <Check class="w-4 h-4 text-emerald-400" />
          <span>Animation generated successfully!</span>
        </div>

        <div class="flex items-center gap-2 w-full pt-2 border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onclick={handleStartExport}
            class="flex-1 text-xs"
          >
            <RefreshCw class="w-3.5 h-3.5 mr-1" />
            Regenerate
          </Button>

          <button
            type="button"
            onclick={handleDownload}
            class="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 border border-emerald-400/40 transition-all cursor-pointer"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Download .gif</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</Dialog>
