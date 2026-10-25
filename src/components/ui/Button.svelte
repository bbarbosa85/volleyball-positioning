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

  const variantStyles: Record<NonNullable<Props['variant']>, string> = {
    default: 'btn-primary',
    secondary: 'btn-neutral',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'btn-error',
    accent: 'btn-accent',
    emerald: 'btn-success',
  };

  const sizeStyles: Record<NonNullable<Props['size']>, string> = {
    default: '',
    sm: 'btn-sm',
    lg: 'btn-lg',
    icon: 'btn-square btn-sm p-0',
  };

  const classes = $derived(
    twMerge(
      clsx(
        'btn',
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
