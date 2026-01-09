/**
 * Clone Website function wrapper
 * 
 * This module exports the cloneWebsite function for cloning websites using AI.
 */
import { base44 } from '../api/base44Client';

/**
 * Clone a website using AI-powered code generation.
 * Integrates with Firecrawl for crawling, Anthropic for generation, and Vercel for deployment.
 * 
 * @param {Object} params - The parameters for cloning
 * @param {string} params.url - The URL of the website to clone
 * @param {string} params.name - The name of the project
 * @param {string} [params.framework] - The framework to use (default: 'react')
 * @param {string} [params.styling] - The styling approach (default: 'tailwind')
 * @param {boolean} [params.deploy] - Whether to deploy the project
 * @returns {Promise<any>} Promise resolving to the function result
 */
export async function cloneWebsite(params) {
  return await base44.functions.invoke('cloneWebsite', params);
}
