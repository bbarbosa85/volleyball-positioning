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

  const variantStyles = {
    default: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'border-slate-700 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    destructive: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    male: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    female: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
  };

  const classes = $derived(
    twMerge(
      clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
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
