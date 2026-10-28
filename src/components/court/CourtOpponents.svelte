<script lang="ts">
  interface Props {
    attacker: { x: number; y: number };
    setter: { x: number; y: number };
    onStartDragAttacker: () => void;
    onStartDragSetter: () => void;
  }

  let {
    attacker,
    setter,
    onStartDragAttacker,
    onStartDragSetter
  }: Props = $props();
</script>

<!-- Opponent Attacker Token (Draggable) -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  onmousedown={(e) => {
    e.stopPropagation();
    onStartDragAttacker();
  }}
  ontouchstart={(e) => {
    e.stopPropagation();
    onStartDragAttacker();
  }}
  class="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center select-none touch-none group w-11 h-11 cursor-grab active:cursor-grabbing"
  style="left: {attacker.x}%; top: {attacker.y}%;"
  title="Drag opponent attacker to adjust attack origin"
>
  <div class="relative flex items-center justify-center w-11 h-11">
    <div class="w-11 h-11 rounded-2xl bg-error text-error-content flex items-center justify-center shadow-xl border-2 border-error-content/30 transition-transform group-hover:scale-115">
      <span class="text-xs font-black tracking-tight uppercase drop-shadow">ATK</span>
    </div>
  </div>
  <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-base-content bg-base-300 px-1.5 py-0.5 rounded border border-base-content/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
    Drag Attacker
  </span>
</div>

<!-- Opponent Setter Token (Draggable) -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  onmousedown={(e) => {
    e.stopPropagation();
    onStartDragSetter();
  }}
  ontouchstart={(e) => {
    e.stopPropagation();
    onStartDragSetter();
  }}
  class="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center select-none touch-none group w-10 h-10 cursor-grab active:cursor-grabbing"
  style="left: {setter.x}%; top: {setter.y}%;"
  title="Drag opponent setter"
>
  <div class="relative flex items-center justify-center w-10 h-10">
    <div class="w-10 h-10 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg border-2 border-white/30 transition-transform group-hover:scale-115">
      <span class="text-xs font-black tracking-tight uppercase drop-shadow-sm">SET</span>
    </div>
  </div>
  <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-base-content bg-base-300 px-1.5 py-0.5 rounded border border-base-content/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
    Drag Setter
  </span>
</div>
