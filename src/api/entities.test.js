import { describe, it, expect } from 'vitest';
import { Query, User } from './entities';
import { base44 } from './base44Client';

describe('entities', () => {
  describe('Query', () => {
    it('should export Query entity from base44', () => {
      expect(Query).toBeDefined();
      expect(typeof Query).toBe('object');
    });

    it('should have base44 entity methods', () => {
      // Base44 SDK provides list, get, create, update, delete methods
      expect(Query).toHaveProperty('list');
      expect(Query).toHaveProperty('get');
      expect(Query).toHaveProperty('create');
      expect(Query).toHaveProperty('update');
      expect(Query).toHaveProperty('delete');
    });
  });

  describe('User', () => {
    it('should export User (auth) from base44', () => {
      expect(User).toBeDefined();
      expect(typeof User).toBe('object');
    });

    it('should have base44 auth methods', () => {
      // Base44 SDK auth module - check that it has the me method at minimum
      expect(User).toHaveProperty('me');
      
      // Auth should be an object with auth-related methods
      const authMethods = Object.keys(User);
      expect(authMethods.length).toBeGreaterThan(0);
      expect(authMethods).toContain('me');
    });
  });
});
