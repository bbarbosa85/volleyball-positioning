<script lang="ts">
  import type { Snippet } from 'svelte';
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent' | 'emerald';
    size?: 'sm' | 'default' | 'lg' | 'icon';
    children?: Snippet;
    class?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    title?: string;
    onclick?: (e: MouseEvent) => void;
  }

  let {
    variant = 'default',
    size = 'default',
    children,
    class: className = '',
    type = 'button',
    onclick,
    ...rest
  }: Props = $props();

  const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/40 active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 active:scale-[0.98]',
    outline: 'border border-slate-700 hover:bg-slate-800/80 text-slate-200 hover:text-white active:scale-[0.98]',
    ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white',
    destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950 active:scale-[0.98]',
    accent: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-900/30 active:scale-[0.98]',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950 active:scale-[0.98]',
  };

  const sizeStyles = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-lg px-6 text-base font-semibold',
    icon: 'h-9 w-9 p-0 flex items-center justify-center',
  };

  const classes = $derived(
    twMerge(
      clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )
    )
  );
</script>

<button {type} {onclick} class={classes} {...rest}>
  {#if children}
    {@render children()}
  {/if}
</button>
