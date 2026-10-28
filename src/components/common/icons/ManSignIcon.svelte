<script lang="ts">
  interface Props {
    class?: string;
    ariaLabel?: string;
  }

  let {
    class: className = 'w-4 h-4 text-info shrink-0',
    ariaLabel
  }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-label={ariaLabel}
  aria-hidden={ariaLabel ? undefined : 'true'}
>
  <circle cx="10" cy="14" r="6" />
  <path d="M14.5 9.5 20 4" />
  <path d="M15 4h5v5" />
</svg>

