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
        'rounded-xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md shadow-xl text-slate-100',
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
