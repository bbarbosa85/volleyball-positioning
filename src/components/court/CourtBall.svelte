<script lang="ts">
  import VolleyballIcon from '../common/icons/VolleyballIcon.svelte';

  interface Props {
    x: number;
    y: number;
  }

  let {
    x,
    y
  }: Props = $props();
</script>

<!-- PHASE-ANCHORED VOLLEYBALL (Smoothly glides from Setter in Base to Attacker in Spike) -->
<div
  class="absolute -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-all ease-out"
  style="left: {x}%; top: {y}%; transform-origin: center center;"
>
  <div class="relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-amber-200 via-white to-blue-200 border border-slate-800 shadow-md">
    <VolleyballIcon
      class="w-3.5 h-3.5 text-blue-900/80"
      strokeWidth={2.5}
      showInnerCircle={false}
    />
  </div>
</div>
