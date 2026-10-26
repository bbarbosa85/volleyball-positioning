<script lang="ts">
  interface Props {
    visible?: boolean;
  }

  let { visible = true }: Props = $props();
</script>

{#if visible}
  <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 select-none pointer-events-none z-10">
    <!-- FRONT ROW RECTANGLES (Net to 3m line: row 1, 33.33% height) -->
    <!-- Zone 4: Left Front -->
    <div
      class="col-start-1 row-start-1 border flex items-center justify-center p-1 transition-colors duration-300"
      style="border-color: var(--court-zone-border); background-color: var(--court-zone-bg);"
    >
      <span
        class="font-black text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none transition-colors duration-300"
        style="color: var(--court-zone-text);"
      >
        Zone 4
      </span>
    </div>
    <!-- Zone 3: Middle Front -->
    <div
      class="col-start-2 row-start-1 border flex items-center justify-center p-1 transition-colors duration-300"
      style="border-color: var(--court-zone-border); background-color: var(--court-zone-bg);"
    >
      <span
        class="font-black text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none transition-colors duration-300"
        style="color: var(--court-zone-text);"
      >
        Zone 3
      </span>
    </div>
    <!-- Zone 2: Right Front -->
    <div
      class="col-start-3 row-start-1 border flex items-center justify-center p-1 transition-colors duration-300"
      style="border-color: var(--court-zone-border); background-color: var(--court-zone-bg);"
    >
      <span
        class="font-black text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none transition-colors duration-300"
        style="color: var(--court-zone-text);"
      >
        Zone 2
      </span>
    </div>

    <!-- BACK ROW RECTANGLES (3m line to baseline: row 2 & 3, 66.67% height) -->
    <!-- Zone 5: Left Back -->
    <div
      class="col-start-1 row-start-2 row-span-2 border flex items-center justify-center p-1 transition-colors duration-300"
      style="border-color: var(--court-zone-border); background-color: var(--court-zone-bg);"
    >
      <span
        class="font-black text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none transition-colors duration-300"
        style="color: var(--court-zone-text);"
      >
        Zone 5
      </span>
    </div>
    <!-- Zone 6: Middle Back -->
    <div
      class="col-start-2 row-start-2 row-span-2 border flex items-center justify-center p-1 transition-colors duration-300"
      style="border-color: var(--court-zone-border); background-color: var(--court-zone-bg);"
    >
      <span
        class="font-black text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none transition-colors duration-300"
        style="color: var(--court-zone-text);"
      >
        Zone 6
      </span>
    </div>
    <!-- Zone 1: Right Back -->
    <div
      class="col-start-3 row-start-2 row-span-2 border flex items-center justify-center p-1 transition-colors duration-300"
      style="border-color: var(--court-zone-border); background-color: var(--court-zone-bg);"
    >
      <span
        class="font-black text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none transition-colors duration-300"
        style="color: var(--court-zone-text);"
      >
        Zone 1
      </span>
    </div>
  </div>
{/if}
