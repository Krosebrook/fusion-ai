/**
 * Core integrations wrapper
 * 
 * This module exports Core integrations from the Base44 SDK.
 * Includes functions like InvokeLLM, SendEmail, UploadFile, etc.
 */
import { base44 } from '../api/base44Client';

/**
 * Core integrations providing essential functionality like LLM invocation,
 * email sending, file uploads, image generation, and more.
 */
export const Core = base44.integrations.Core;

/**
 * Generate text or structured JSON data using AI models.
 */
export const InvokeLLM = base44.integrations.Core.InvokeLLM;

/**
 * Send emails via the Core email integration.
 */
export const SendEmail = base44.integrations.Core.SendEmail;

/**
 * Send SMS messages via the Core SMS integration.
 */
export const SendSMS = base44.integrations.Core.SendSMS;

/**
 * Upload files to storage.
 */
export const UploadFile = base44.integrations.Core.UploadFile;

/**
 * Generate AI images from text prompts.
 */
export const GenerateImage = base44.integrations.Core.GenerateImage;

/**
 * Extract structured data from uploaded files.
 */
export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;
