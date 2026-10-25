<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'male' | 'female';
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'default',
    class: className = '',
    children
  }: Props = $props();

  const variantStyles: Record<NonNullable<Props['variant']>, string> = {
    default: 'badge-primary badge-soft',
    secondary: 'badge-neutral',
    outline: 'badge-outline',
    success: 'badge-success badge-soft',
    warning: 'badge-warning badge-soft',
    destructive: 'badge-error badge-soft',
    male: 'badge-info badge-soft',
    female: 'badge-warning badge-soft',
  };

  const classes = $derived(
    twMerge(
      clsx(
        'badge gap-1.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )
    )
  );
</script>

<span class={classes}>
  {#if children}
    {@render children()}
  {/if}
</span>
