/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application.
 * 
 * @module lib/utils
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine and merge Tailwind CSS classes
 * 
 * Combines multiple class names using clsx and merges conflicting
 * Tailwind classes using tailwind-merge.
 * 
 * @param {...(string|Object|Array)} inputs - Class names to combine
 * @returns {string} Merged class string
 * 
 * @example
 * cn('px-4 py-2', 'px-6') // Returns: 'px-6 py-2'
 * cn('text-red-500', isActive && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Check if the current page is running inside an iframe
 * 
 * Useful for detecting if the app is embedded in another page
 * and adjusting behavior accordingly.
 * 
 * @type {boolean}
 * 
 * @example
 * if (isIframe) {
 *   console.log('Running in iframe');
 * }
 */
export const isIframe = window.self !== window.top;
