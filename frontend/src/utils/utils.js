import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes without style conflicts.
 * Essential for the dynamic column colors in your Kanban board.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}