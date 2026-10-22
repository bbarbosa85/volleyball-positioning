<script lang="ts">
  import { checkDbStatus, downloadSqliteDbFile, type DbStatus } from '../services/dbClient';
  import Dialog from './ui/Dialog.svelte';
  import Button from './ui/Button.svelte';
  import { Database, Download, FileCheck, RefreshCw } from '@lucide/svelte';

  interface Props {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    customCount: number;
  }

  let { open, isOpen, onClose, customCount }: Props = $props();

  const isModalOpen = $derived(open !== undefined ? open : Boolean(isOpen));

  let dbStatus = $state<DbStatus | null>(null);
  let isLoading = $state(false);

  async function loadStatus() {
    isLoading = true;
    dbStatus = await checkDbStatus();
    isLoading = false;
  }

  $effect(() => {
    if (isModalOpen) {
      loadStatus();
    }
  });

  function formatBytes(bytes?: number) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
</script>

<Dialog
  open={isModalOpen}
  {onClose}
  title="SQLite Database Storage"
  description="Persistent local storage in data/volleyball.db"
  maxWidth="max-w-md"
>
  <div class="flex flex-col gap-4 text-xs text-slate-200">
    <!-- Connection Status Bar -->
    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-3 h-3 rounded-full {dbStatus?.connected ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'}"></div>
        <div>
          <div class="font-bold text-white">
            {dbStatus?.connected ? 'SQLite Connected & Active' : 'Connecting to SQLite...'}
          </div>
          <div class="text-[11px] text-slate-400 font-mono">
            data/volleyball.db
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onclick={loadStatus}
        class="h-7 px-2 text-slate-400 hover:text-white"
        title="Refresh database status"
      >
        <RefreshCw class="w-3.5 h-3.5 {isLoading ? 'animate-spin' : ''}" />
      </Button>
    </div>

    <!-- Database Stats Cards -->
    <div class="grid grid-cols-2 gap-2.5">
      <div class="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col gap-1">
        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Custom Adjustments</span>
        <span class="text-lg font-black text-cyan-400">
          {dbStatus?.counts?.customScenarios ?? customCount}
        </span>
        <span class="text-[10px] text-slate-500">Saved in SQLite</span>
      </div>

      <div class="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col gap-1">
        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Database Size</span>
        <span class="text-lg font-black text-emerald-400">
          {formatBytes(dbStatus?.fileSize)}
        </span>
        <span class="text-[10px] text-slate-500">On disk</span>
      </div>
    </div>

    <!-- Automatic Persistence Note -->
    <div class="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-slate-300 flex flex-col gap-1.5 leading-relaxed text-[11px]">
      <div class="font-bold text-blue-300 flex items-center gap-1.5">
        <FileCheck class="w-3.5 h-3.5" />
        Automatic Persistence
      </div>
      <p class="m-0 text-slate-400">
        Whenever you create, adjust, or save custom volleyball defenses, they are saved directly into the local SQLite database file at <code class="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">data/volleyball.db</code>.
      </p>
    </div>

    <!-- Footer Actions -->
    <div class="pt-2 flex items-center gap-2 border-t border-slate-800">
      <Button
        variant="outline"
        size="sm"
        onclick={onClose}
        class="flex-1"
      >
        Close
      </Button>

      <button
        type="button"
        onclick={downloadSqliteDbFile}
        class="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 border border-cyan-400/40 transition-all cursor-pointer"
      >
        <Download class="w-3.5 h-3.5" />
        <span>Download .db</span>
      </button>
    </div>
  </div>
</Dialog>
