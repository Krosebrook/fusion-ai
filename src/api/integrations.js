/**
 * Integrations API
 * 
 * Provides access to Base44 platform integrations.
 * Core integrations for AI, communication, and file operations.
 * 
 * @module api/integrations
 */

import { base44 } from './base44Client';

/**
 * Core Integrations
 * 
 * Collection of core platform integration methods.
 * 
 * @type {Object}
 */
export const Core = base44.integrations.Core;

/**
 * Invoke LLM Integration
 * 
 * Call Large Language Models (OpenAI, Claude, Gemini, etc.)
 * 
 * @type {Function}
 * @param {Object} params - LLM invocation parameters
 * @param {string} params.prompt - The prompt to send to the LLM
 * @param {string} params.model - Model identifier (e.g., 'gpt-4', 'claude-3')
 * @param {number} [params.temperature] - Temperature for response randomness (0-1)
 * @param {number} [params.maxTokens] - Maximum tokens in response
 * @returns {Promise<Object>} LLM response with generated text
 * 
 * @example
 * const response = await InvokeLLM({
 *   prompt: 'Write a hello world function',
 *   model: 'gpt-4',
 *   temperature: 0.7
 * });
 */
export const InvokeLLM = base44.integrations.Core.InvokeLLM;

/**
 * Send Email Integration
 * 
 * Send emails via configured email provider.
 * 
 * @type {Function}
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (HTML or plain text)
 * @returns {Promise<Object>} Send result
 */
export const SendEmail = base44.integrations.Core.SendEmail;

/**
 * Send SMS Integration
 * 
 * Send SMS messages via configured SMS provider.
 * 
 * @type {Function}
 * @param {Object} params - SMS parameters
 * @param {string} params.to - Recipient phone number
 * @param {string} params.message - SMS message text
 * @returns {Promise<Object>} Send result
 */
export const SendSMS = base44.integrations.Core.SendSMS;

/**
 * Upload File Integration
 * 
 * Upload files to cloud storage.
 * 
 * @type {Function}
 * @param {Object} params - Upload parameters
 * @param {File} params.file - File object to upload
 * @param {string} [params.folder] - Optional folder path
 * @returns {Promise<Object>} Upload result with file URL
 */
export const UploadFile = base44.integrations.Core.UploadFile;

/**
 * Generate Image Integration
 * 
 * Generate images using AI (DALL-E, Stable Diffusion, etc.)
 * 
 * @type {Function}
 * @param {Object} params - Image generation parameters
 * @param {string} params.prompt - Image generation prompt
 * @param {string} [params.model] - Model to use
 * @param {string} [params.size] - Image size (e.g., '1024x1024')
 * @returns {Promise<Object>} Generated image URL and metadata
 * 
 * @example
 * const result = await GenerateImage({
 *   prompt: 'A futuristic city at sunset',
 *   size: '1024x1024'
 * });
 */
export const GenerateImage = base44.integrations.Core.GenerateImage;

/**
 * Extract Data From Uploaded File Integration
 * 
 * Extract structured data from uploaded documents (PDF, images, etc.)
 * 
 * @type {Function}
 * @param {Object} params - Extraction parameters
 * @param {string} params.fileId - ID of the uploaded file
 * @param {string} [params.extractionType] - Type of data to extract
 * @returns {Promise<Object>} Extracted data
 */
export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;


