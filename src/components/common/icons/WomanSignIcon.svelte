<script lang="ts">
  interface Props {
    class?: string;
    ariaLabel?: string;
  }

  let {
    class: className = 'w-4 h-4 text-warning shrink-0',
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
  <circle cx="12" cy="9" r="6" />
  <path d="M12 15v7" />
  <path d="M9 19h6" />
</svg>

