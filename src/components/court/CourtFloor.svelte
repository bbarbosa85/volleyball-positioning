<script lang="ts">
  import CourtNet from './CourtNet.svelte';
  import CourtZones from './CourtZones.svelte';

  interface Props {
    is3DView?: boolean;
    showZones?: boolean;
  }

  let {
    is3DView = false,
    showZones = false
  }: Props = $props();
</script>

<!-- Floor wood grain texture -->
<div
  class="absolute inset-0 pointer-events-none rounded-sm overflow-hidden"
  style="opacity: 0.12; background: linear-gradient(to right, var(--court-grain) 1px, transparent 1px); background-size: 10% 100%;"
></div>

<!-- 1. OPPONENT HALF COURT (0% TO 50%) -->
<div class="absolute top-0 left-0 right-0 h-1/2 pointer-events-none">
  <div
    class="absolute top-[66.67%] left-0 right-0 h-[3px] transition-colors duration-300"
    style="background-color: var(--court-line);"
  ></div>
</div>

<!-- 2. CENTER LINE & ELEVATED ISOMETRIC 3D NET -->
<CourtNet {is3DView} />

<!-- 3. DEFENDING HALF COURT (50% TO 100%) -->
<div class="absolute top-1/2 bottom-0 left-0 right-0 pointer-events-none">
  <div
    class="absolute top-[33.33%] left-0 right-0 h-[3px] transition-colors duration-300"
    style="background-color: var(--court-line);"
  ></div>
  <CourtZones visible={showZones} />
</div>
