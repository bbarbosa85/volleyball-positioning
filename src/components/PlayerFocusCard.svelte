<script lang="ts">
  import type { Player, PlayerMovement, AttackScenario } from '../types/volleyball';
  import Badge from './ui/Badge.svelte';
  import Button from './ui/Button.svelte';
  import { Shield, Target, Compass, ArrowRight, Info, CheckCircle2 } from '@lucide/svelte';

  interface Props {
    roster: Player[];
    movements: PlayerMovement[];
    selectedPlayerId: string | null;
    scenario: AttackScenario;
    rotation: number;
    onSelectPlayer: (id: string | null) => void;
  }

  let {
    roster,
    movements,
    selectedPlayerId,
    scenario,
    rotation,
    onSelectPlayer
  }: Props = $props();

  const selectedMovement = $derived(
    selectedPlayerId ? movements.find(m => m.playerId === selectedPlayerId) : null
  );

  const selectedPlayer = $derived(
    selectedMovement ? roster.find(p => p.id === selectedMovement.playerId) : null
  );

  // Calculate distance moved in court meters (standard half court is 9m x 9m)
  const distanceMoved = $derived(() => {
    if (!selectedMovement) return '0.0';
    const dx = ((selectedMovement.defensePosition.x - selectedMovement.basePosition.x) / 100) * 9;
    const dy = ((selectedMovement.defensePosition.y - selectedMovement.basePosition.y) / 100) * 9;
    return Math.sqrt(dx * dx + dy * dy).toFixed(1);
  });
</script>

<div class="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col gap-4 text-slate-100">
  {#if selectedMovement && selectedPlayer}
    <!-- Focused Single Player Card -->
    <div class="flex items-start justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-3">
        <!-- Zone Avatar Badge -->
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-lg border-2 {
            selectedPlayer.gender === 'M'
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-950/80'
              : 'bg-yellow-400 text-slate-950 font-black border-yellow-100 shadow-yellow-950/80'
          }"
        >
          P{selectedMovement.zone}
        </div>

        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-white">Position P{selectedMovement.zone}</h3>
            <Badge variant={selectedPlayer.gender === 'M' ? 'male' : 'female'}>
              {selectedPlayer.gender === 'M' ? 'Male (M)' : 'Female (F)'}
            </Badge>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Role: <strong class="text-white font-semibold">{selectedPlayer.role}</strong> • Rotation (R{rotation})
          </p>
        </div>
      </div>

      <button
        type="button"
        onclick={() => onSelectPlayer(null)}
        class="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
      >
        View All
      </button>
    </div>

    <!-- Assignment Highlight -->
    <div class="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3.5 flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <Shield class="w-4 h-4 text-blue-400 shrink-0" />
        <span class="text-xs uppercase font-extrabold tracking-wider text-blue-300">Primary Responsibility</span>
      </div>
      <p class="text-sm font-bold text-white pl-6">
        {selectedMovement.actionTitle}
      </p>
    </div>

    <!-- Specific Movement Metrics -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
        <span class="text-slate-400 text-[10px] uppercase block">Displacement</span>
        <span class="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
          <Compass class="w-3.5 h-3.5" />
          {distanceMoved()} meters
        </span>
      </div>

      <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
        <span class="text-slate-400 text-[10px] uppercase block">Tactical Role</span>
        <span class="text-sm font-bold text-cyan-300 truncate block mt-0.5">
          {selectedMovement.actionType.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    </div>

    <!-- Tactical Instruction / Coaching Tip -->
    <div class="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-1">
      <div class="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
        <Info class="w-3.5 h-3.5" />
        Court Instruction:
      </div>
      <p class="text-xs text-slate-300 leading-relaxed pl-5">
        {selectedMovement.instructions}
      </p>
    </div>

  {:else}
    <!-- Team Overview of all 6 Players in this Rotation -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div>
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          Team Defensive Setup (Rotation R{rotation})
        </h3>
        <p class="text-[11px] text-slate-400 mt-0.5">
          Click any player on the list or on the court to highlight their specific assignment.
        </p>
      </div>
    </div>

    <!-- Players quick list -->
    <div class="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
      {#each movements as move}
        {@const p = roster.find(player => player.id === move.playerId)}
        {#if p}
          <button
            type="button"
            onclick={() => onSelectPlayer(p.id)}
            class="flex items-center justify-between p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/70 hover:border-slate-700 transition-all text-left group"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border {
                  p.gender === 'M'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-yellow-400 text-slate-950 font-black border-yellow-200 shadow-sm'
                }"
              >
                P{move.zone}
              </span>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    Position P{move.zone}
                  </span>
                  <span class="text-[10px] text-slate-300">
                    • {p.role}
                  </span>
                  <span class="text-[10px] {p.gender === 'M' ? 'text-blue-300' : 'text-yellow-300'}">
                    ({p.gender === 'M' ? '♂' : '♀'})
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {move.actionTitle}
                </div>
              </div>
            </div>

            <ArrowRight class="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        {/if}
      {/each}
    </div>

    <!-- Scenario Key summary -->
    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
      <span class="font-bold text-amber-300 block mb-1">Team Tactical Key:</span>
      <p class="text-slate-300 text-[11px] leading-relaxed">
        {scenario.defensiveKey}
      </p>
    </div>
  {/if}
</div>
