<script lang="ts">
  interface Props {
    is3DView?: boolean;
  }

  let { is3DView = false }: Props = $props();
</script>

<!-- Center boundary line on the court floor -->
<div
  class="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 pointer-events-none z-10 transition-colors duration-300"
  style="background-color: var(--court-net-floor);"
></div>

<!-- Shadow cast on the court floor beneath the elevated net -->
<div class="absolute top-1/2 left-[-8%] right-[-8%] h-[5px] -translate-y-1/2 bg-black/50 blur-[2px] pointer-events-none z-10"></div>

<!-- Elevated Isometric 3D Net Structure (Wider than the court) -->
<div
  class="absolute top-1/2 left-[-8%] right-[-8%] -translate-y-1/2 z-30 pointer-events-none transition-all duration-500 ease-out"
  style="transform: translateZ({is3DView ? '40px' : '14px'}) translateY({is3DView ? '-30px' : '-14px'}); transform-style: preserve-3d;"
>
  <!-- Left Net Pole (Vertical steel post outside left court sideline) -->
  <div class="absolute -left-1 -top-10 w-2.5 h-24 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 rounded-sm shadow-xl border border-slate-700"></div>
  <!-- Right Net Pole (Vertical steel post outside right court sideline) -->
  <div class="absolute -right-1 -top-10 w-2.5 h-24 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 rounded-sm shadow-xl border border-slate-700"></div>

  <!-- Left Antenna (Over the left sideline at 7.4% of total net span) -->
  <div class="absolute left-[7.4%] -top-14 w-1.5 h-26 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_6px,#ffffff_6px,#ffffff_12px)] border border-black/50 rounded-sm shadow-md z-40"></div>
  <!-- Right Antenna (Over the right sideline at 92.6% of total net span) -->
  <div class="absolute right-[7.4%] -top-14 w-1.5 h-26 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_6px,#ffffff_6px,#ffffff_12px)] border border-black/50 rounded-sm shadow-md z-40"></div>

  <!-- Vertical Net Mesh Plane (Elevated in the air, spanning full width across poles) -->
  <div
    class="relative w-full h-11 bg-slate-950/40 border-y border-white shadow-lg flex flex-col justify-between"
    style="backdrop-filter: blur(0.5px);"
  >
    <!-- Top white canvas tape headband -->
    <div class="w-full h-1.5 bg-white border-b border-slate-300 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>

    <!-- Square grid mesh pattern -->
    <div class="w-full flex-1 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.45)_0px,rgba(255,255,255,0.45)_1px,transparent_1px,transparent_6px),repeating-linear-gradient(to_bottom,rgba(255,255,255,0.35)_0px,rgba(255,255,255,0.35)_1px,transparent_1px,transparent_5px)] opacity-75"></div>

    <!-- Bottom white canvas band -->
    <div class="w-full h-1 bg-white/90 border-t border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.4)]"></div>
  </div>
</div>
