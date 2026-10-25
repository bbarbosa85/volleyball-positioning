<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children }: Props = $props();

  const classes = $derived(
    twMerge(
      clsx(
        'card bg-base-200/90 border border-base-300/80 shadow-xl backdrop-blur-md text-base-content',
        className
      )
    )
  );
</script>

<div class={classes}>
  {#if children}
    {@render children()}
  {/if}
</div>
