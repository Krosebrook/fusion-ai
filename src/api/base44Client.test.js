import { describe, it, expect, vi, beforeEach } from 'vitest';
import { base44 } from './base44Client';

// Mock the base44 SDK
vi.mock('@base44/sdk', () => ({
  createClient: vi.fn((config) => ({
    config,
    entities: {
      Query: {
        find: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      }
    },
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
    },
    integrations: {
      Core: {
        InvokeLLM: vi.fn(),
        SendEmail: vi.fn(),
        SendSMS: vi.fn(),
        UploadFile: vi.fn(),
        GenerateImage: vi.fn(),
        ExtractDataFromUploadedFile: vi.fn(),
      }
    }
  }))
}));

vi.mock('@/lib/app-params', () => ({
  appParams: {
    appId: 'test-app-id',
    serverUrl: 'https://test-server.com',
    token: 'test-token',
    functionsVersion: 'prod'
  }
}));

describe('base44Client', () => {
  it('should create client with correct configuration', () => {
    expect(base44).toBeDefined();
    expect(base44.config).toBeDefined();
  });

  it('should configure client with app parameters', () => {
    expect(base44.config.appId).toBe('test-app-id');
    expect(base44.config.serverUrl).toBe('https://test-server.com');
    expect(base44.config.token).toBe('test-token');
    expect(base44.config.functionsVersion).toBe('prod');
  });

  it('should not require authentication', () => {
    expect(base44.config.requiresAuth).toBe(false);
  });

  it('should expose entities API', () => {
    expect(base44.entities).toBeDefined();
    expect(base44.entities.Query).toBeDefined();
  });

  it('should expose auth API', () => {
    expect(base44.auth).toBeDefined();
    expect(base44.auth.signIn).toBeDefined();
    expect(base44.auth.signOut).toBeDefined();
    expect(base44.auth.signUp).toBeDefined();
    expect(base44.auth.getCurrentUser).toBeDefined();
  });

  it('should expose integrations API', () => {
    expect(base44.integrations).toBeDefined();
    expect(base44.integrations.Core).toBeDefined();
  });
});
