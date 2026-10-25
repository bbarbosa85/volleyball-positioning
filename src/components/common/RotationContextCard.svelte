<script lang="ts">
  import { ArrowLeftRight, Lock } from '@lucide/svelte';

  interface Props {
    rotation: number;
    isLocked?: boolean;
    onChangeRotation: (r: number) => void;
  }

  let {
    rotation,
    isLocked = false,
    onChangeRotation
  }: Props = $props();

  let isBannerShaking = $state<boolean>(false);

  function triggerRotationLockShake() {
    isBannerShaking = false;
    setTimeout(() => {
      isBannerShaking = true;
      setTimeout(() => {
        isBannerShaking = false;
      }, 400);
    }, 10);
  }

  function handleRotationClick(targetRotation: number) {
    if (isLocked) {
      triggerRotationLockShake();
      return;
    }
    onChangeRotation(targetRotation);
  }
</script>

<div
  id="cardRotationContext"
  class="card bg-base-200/60 border p-4 transition-all duration-200 {
    isLocked
      ? 'border-warning shadow-[0_0_20px_rgba(245,158,11,0.25)]'
      : 'border-base-300'
  }"
>
  <div class="flex items-center justify-between flex-wrap gap-2">
    <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/80">
      <ArrowLeftRight class="w-4 h-4 text-primary" />
      <span>1. Rotation Context</span>
    </div>
    <span class="badge badge-primary badge-soft font-bold text-[11px] py-1">
      {rotation === 1 ? 'Man Serving (1 Man Net)' : 'Woman Serving (2 Men Net)'}
    </span>
  </div>

  <!-- Segmented Control with Strict Capture-Phase Freeze -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-base-300/50 border border-base-300 transition-all {
      isLocked ? 'cursor-not-allowed opacity-80' : ''
    }"
    onclickcapture={(e) => {
      if (isLocked) {
        e.preventDefault();
        e.stopPropagation();
        triggerRotationLockShake();
      }
    }}
  >
    <button
      type="button"
      disabled={isLocked}
      onclick={() => handleRotationClick(1)}
      class="py-2.5 px-3 rounded-lg font-bold text-xs flex flex-col items-center gap-0.5 transition-all text-center {
        rotation === 1
          ? 'btn btn-primary h-auto py-2'
          : 'btn btn-ghost h-auto py-2 hover:bg-base-200 text-base-content/70'
      } {isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
    >
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full {rotation === 1 ? 'bg-primary-content' : 'bg-info'}"></span>
        <span class="font-extrabold text-xs">Man Serving</span>
      </div>
      <span class="text-[10px] opacity-80 font-normal">1 Man Net • 2 Women Front</span>
    </button>

    <button
      type="button"
      disabled={isLocked}
      onclick={() => handleRotationClick(2)}
      class="py-2.5 px-3 rounded-lg font-bold text-xs flex flex-col items-center gap-0.5 transition-all text-center {
        rotation === 2
          ? 'btn btn-primary h-auto py-2'
          : 'btn btn-ghost h-auto py-2 hover:bg-base-200 text-base-content/70'
      } {isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
    >
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full {rotation === 2 ? 'bg-primary-content' : 'bg-secondary'}"></span>
        <span class="font-extrabold text-xs">Woman Serving</span>
      </div>
      <span class="text-[10px] opacity-80 font-normal">2 Men Net • 1 Woman Front</span>
    </button>
  </div>

  <!-- Rotation Locked Warning Banner (REQ-03C) -->
  {#if isLocked}
    <div
      id="rotLockedBanner"
      role="alert"
      class="alert alert-warning alert-soft py-2 px-3 text-xs font-semibold shadow-xs animate-fadeIn {
        isBannerShaking ? 'animate-shake' : ''
      }"
    >
      <Lock class="w-4 h-4 text-warning shrink-0" />
      <span>Rotation locked with unsaved changes. Save or Reset to switch.</span>
    </div>
  {/if}
</div>

<style>
  @keyframes bannerShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }
  :global(.animate-shake) {
    animation: bannerShake 0.35s ease;
  }
</style>
