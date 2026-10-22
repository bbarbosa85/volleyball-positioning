<script lang="ts">
  import type { Player, PlayerRole, Gender } from '../types/volleyball';
  import Dialog from './ui/Dialog.svelte';
  import Button from './ui/Button.svelte';
  import Badge from './ui/Badge.svelte';
  import { Users, Save, RotateCcw } from '@lucide/svelte';
  import { defaultRoster } from '../data/defaultRoster';

  interface Props {
    open: boolean;
    onClose: () => void;
    roster: Player[];
    onSaveRoster: (newRoster: Player[]) => void;
  }

  let {
    open,
    onClose,
    roster,
    onSaveRoster
  }: Props = $props();

  // Local editable copy
  let editableRoster = $state<Player[]>([]);

  $effect(() => {
    if (open) {
      editableRoster = JSON.parse(JSON.stringify(roster));
    }
  });

  const roles: PlayerRole[] = [
    'Outside Hitter',
    'Opposite Hitter',
    'Middle Blocker',
    'Setter',
    'Universal',
    'Libero'
  ];

  function handleSave() {
    onSaveRoster(editableRoster);
    onClose();
  }

  function handleReset() {
    editableRoster = JSON.parse(JSON.stringify(defaultRoster));
  }

  // Count genders
  const menCount = $derived(editableRoster.filter(p => p.gender === 'M').length);
  const womenCount = $derived(editableRoster.filter(p => p.gender === 'F').length);
</script>

<Dialog
  {open}
  {onClose}
  title="COED League Lineup & Roster Setup"
  description="Configure the 6 players on the team (3 Men and 3 Women) for simple rotation."
  maxWidth="max-w-3xl"
>
  <div class="flex flex-col gap-4 text-slate-200">
    <!-- COED Balance Indicator -->
    <div class="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
      <div class="flex items-center gap-2">
        <Users class="w-4 h-4 text-indigo-400" />
        <span class="text-xs font-bold text-white">COED Team Composition:</span>
      </div>
      <div class="flex items-center gap-2">
        <Badge variant="male">
          {menCount} Men (♂)
        </Badge>
        <Badge variant="female">
          {womenCount} Women (♀)
        </Badge>
        {#if menCount === 3 && womenCount === 3}
          <Badge variant="success">Valid Balance (3M / 3F)</Badge>
        {:else}
          <Badge variant="warning">Recommended 3M & 3F</Badge>
        {/if}
      </div>
    </div>

    <!-- Players Table / Editor -->
    <div class="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
      {#each editableRoster as player, idx}
        <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <!-- Slot Badge (P1 to P6) with Men (Blue) / Women (Yellow) -->
          <div class="flex items-center">
            <span
              class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border {
                player.gender === 'M'
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-yellow-400 text-slate-950 font-black border-yellow-200'
              }"
            >
              P{idx + 1}
            </span>
          </div>

          <!-- Slot Label -->
          <div class="flex-1 min-w-[130px]">
            <label for={`player-name-${idx}`} class="text-[10px] text-slate-400 uppercase font-semibold block">Position Label</label>
            <input
              id={`player-name-${idx}`}
              type="text"
              bind:value={player.name}
              placeholder={`Position P${idx + 1}`}
              class="w-full bg-slate-900 border border-slate-700 font-semibold text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <!-- Gender Switcher -->
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Gender</span>
            <div class="flex items-center rounded-lg bg-slate-900 border border-slate-700 p-0.5">
              <button
                type="button"
                onclick={() => player.gender = 'M'}
                class="px-2.5 py-0.5 rounded text-xs font-bold transition-colors {player.gender === 'M' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}"
              >
                M (♂)
              </button>
              <button
                type="button"
                onclick={() => player.gender = 'F'}
                class="px-2.5 py-0.5 rounded text-xs font-bold transition-colors {player.gender === 'F' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}"
              >
                F (♀)
              </button>
            </div>
          </div>

          <!-- Role Select -->
          <div class="min-w-[140px]">
            <label for={`player-role-${idx}`} class="text-[10px] text-slate-400 uppercase font-semibold block">Role</label>
            <select
              id={`player-role-${idx}`}
              bind:value={player.role}
              class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {#each roles as r}
                <option value={r}>{r}</option>
              {/each}
            </select>
          </div>
        </div>
      {/each}
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-3 border-t border-slate-800">
      <Button variant="ghost" size="sm" onclick={handleReset} class="text-xs">
        <RotateCcw class="w-3.5 h-3.5" />
        Restore Defaults
      </Button>

      <div class="flex items-center gap-2">
        <Button variant="secondary" size="sm" onclick={onClose}>
          Cancel
        </Button>
        <Button variant="default" size="sm" onclick={handleSave}>
          <Save class="w-3.5 h-3.5" />
          Save Roster
        </Button>
      </div>
    </div>
  </div>
</Dialog>
