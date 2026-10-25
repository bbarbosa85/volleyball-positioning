<script lang="ts">
  interface Props {
    playerId: string;
    currentX: number;
    currentY: number;
    gender?: 'M' | 'F';
    isBlocker?: boolean;
    isSelected?: boolean;
    isDragging?: boolean;
    onSelect: () => void;
    onStartDrag: (e: MouseEvent | TouchEvent) => void;
  }

  let {
    playerId,
    currentX,
    currentY,
    gender = 'M',
    isBlocker = false,
    isSelected = false,
    isDragging = false,
    onSelect,
    onStartDrag
  }: Props = $props();

  const isMale = $derived(gender === 'M');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  onclick={(e) => {
    e.stopPropagation();
    onSelect();
  }}
  onmousedown={(e) => {
    e.stopPropagation();
    onStartDrag(e);
  }}
  ontouchstart={(e) => {
    e.stopPropagation();
    onStartDrag(e);
  }}
  class="absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-grab active:cursor-grabbing {
    isDragging ? 'transition-none' : 'transition-all duration-500 ease-out'
  } select-none"
  style="left: {currentX}%; top: {currentY}%;"
>
  <!-- Selected Glow & Emphasis Aura -->
  {#if isSelected}
    <div class="absolute -inset-3.5 rounded-full {isMale ? 'bg-primary/50' : 'bg-warning/50'} blur-lg animate-pulse pointer-events-none"></div>
  {/if}

  <!-- Main Token Circle -->
  <div
    class="relative w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-xl border-2 transition-transform duration-150 group-hover:scale-115 {
      isMale
        ? 'bg-primary text-primary-content border-primary-content/30 shadow-primary/30'
        : 'bg-warning text-warning-content border-warning-content/30 shadow-warning/30 font-black'
    } {
      isSelected
        ? 'ring-4 ring-primary-content shadow-[0_0_22px_rgba(255,255,255,0.9)] scale-120 z-40'
        : isBlocker
        ? 'ring-2 ring-warning'
        : ''
    }"
  >
    <!-- Player Identity Label (P1 to P6) -->
    <span class="tracking-tight leading-none text-sm font-black">
      {playerId.toUpperCase()}
    </span>

    <!-- Blocker Badge -->
    {#if isBlocker}
      <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-base-300 border border-warning text-warning flex items-center justify-center text-[8.5px] font-black shadow-md">
        B
      </span>
    {/if}
  </div>
</div>
