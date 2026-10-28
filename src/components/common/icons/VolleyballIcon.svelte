<script lang="ts">
  interface Props {
    class?: string;
    strokeWidth?: number | string;
    showInnerCircle?: boolean;
    ariaLabel?: string;
  }

  let {
    class: className = 'w-4 h-4',
    strokeWidth = 2,
    showInnerCircle = true,
    ariaLabel
  }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  aria-label={ariaLabel}
  aria-hidden={ariaLabel ? undefined : 'true'}
>
  <circle cx="12" cy="12" r="10" />
  <path d="m4.93 4.93 4.24 4.24" />
  <path d="m14.83 9.17 4.24-4.24" />
  <path d="M14.83 14.83 19.07 19.07" />
  <path d="m9.17 14.83-4.24 4.24" />
  {#if showInnerCircle}
    <circle cx="12" cy="12" r="4" />
  {/if}
</svg>

