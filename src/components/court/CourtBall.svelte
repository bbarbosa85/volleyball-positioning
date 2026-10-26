<script lang="ts">
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
    <svg class="w-3.5 h-3.5 text-blue-900/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="M14.83 14.83 19.07 19.07" />
      <path d="m9.17 14.83-4.24 4.24" />
    </svg>
  </div>
</div>
