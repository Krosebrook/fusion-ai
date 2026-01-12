import { describe, it, expect } from 'vitest';
import {
  Core,
  InvokeLLM,
  SendEmail,
  SendSMS,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
} from './integrations';
import { base44 } from './base44Client';

describe('integrations', () => {
  describe('Core', () => {
    it('should export Core integration from base44', () => {
      expect(Core).toBeDefined();
      expect(typeof Core).toBe('object');
    });
  });

  describe('InvokeLLM', () => {
    it('should export InvokeLLM integration', () => {
      expect(InvokeLLM).toBeDefined();
      expect(typeof InvokeLLM).toBe('function');
    });
  });

  describe('SendEmail', () => {
    it('should export SendEmail integration', () => {
      expect(SendEmail).toBeDefined();
      expect(typeof SendEmail).toBe('function');
    });
  });

  describe('SendSMS', () => {
    it('should export SendSMS integration', () => {
      expect(SendSMS).toBeDefined();
      expect(typeof SendSMS).toBe('function');
    });
  });

  describe('UploadFile', () => {
    it('should export UploadFile integration', () => {
      expect(UploadFile).toBeDefined();
      expect(typeof UploadFile).toBe('function');
    });
  });

  describe('GenerateImage', () => {
    it('should export GenerateImage integration', () => {
      expect(GenerateImage).toBeDefined();
      expect(typeof GenerateImage).toBe('function');
    });
  });

  describe('ExtractDataFromUploadedFile', () => {
    it('should export ExtractDataFromUploadedFile integration', () => {
      expect(ExtractDataFromUploadedFile).toBeDefined();
      expect(typeof ExtractDataFromUploadedFile).toBe('function');
    });
  });

  describe('All integrations', () => {
    it('should have all core integrations available', () => {
      const integrations = [
        InvokeLLM,
        SendEmail,
        SendSMS,
        UploadFile,
        GenerateImage,
        ExtractDataFromUploadedFile
      ];

      integrations.forEach((integration) => {
        expect(integration).toBeDefined();
        expect(typeof integration).toBe('function');
      });
    });
  });
});
