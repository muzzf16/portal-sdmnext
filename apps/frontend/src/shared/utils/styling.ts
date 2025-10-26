// src/shared/utils/styling.ts
import { tv } from 'tailwind-variants';

// Button variants
export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  variants: {
    variant: {
      default: 'bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-800',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary',
    },
    size: {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

// Card variants
export const cardVariants = tv({
  base: 'rounded-xl border bg-white dark:bg-neutral-800 text-card-foreground shadow',
  variants: {
    variant: {
      default: 'border-gray-200 dark:border-neutral-700',
      elevated: 'border-0 shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// Input variants
export const inputVariants = tv({
  base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    variant: {
      default: 'border-gray-300 focus-visible:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus-visible:ring-primary-400',
      error: 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});