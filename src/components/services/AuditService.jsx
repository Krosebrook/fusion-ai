/**
 * Audit Service
 * 
 * Centralized service for logging user actions throughout the application.
 * Automatically captures user info, timestamps, and action details.
 */
import { base44 } from '@/api/base44Client';

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(action, resourceType, resourceId, options = {}) {
    try {
      const user = await base44.auth.me();
      if (!user) return;

      const auditEntry = {
        user_id: user.id,
        user_email: user.email,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        resource_name: options.resourceName || null,
        changes: options.changes || null,
        details: options.details || null,
        ip_address: await this.getIpAddress(),
        user_agent: navigator.userAgent,
        status: options.status || 'success',
        timestamp: new Date().toISOString(),
      };

      await base44.entities.AuditLog.create(auditEntry);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Silently fail - don't disrupt user experience
    }
  }

  /**
   * Log test creation
   */
  static async logTestCreated(testId, testName, testData) {
    await this.log('created_test', 'test', testId, {
      resourceName: testName,
      details: `Created new A/B test: ${testName}`,
      changes: { created: testData },
    });
  }

  /**
   * Log test edit
   */
  static async logTestEdited(testId, testName, changes) {
    await this.log('edited_test', 'test', testId, {
      resourceName: testName,
      details: `Updated test configuration`,
      changes,
    });
  }

  /**
   * Log test pause
   */
  static async logTestPaused(testId, testName) {
    await this.log('paused_test', 'test', testId, {
      resourceName: testName,
      details: `Paused test: ${testName}`,
    });
  }

  /**
   * Log test resume
   */
  static async logTestResumed(testId, testName) {
    await this.log('resumed_test', 'test', testId, {
      resourceName: testName,
      details: `Resumed test: ${testName}`,
    });
  }

  /**
   * Log test promotion
   */
  static async logTestPromoted(testId, testName, winner) {
    await this.log('promoted_test', 'test', testId, {
      resourceName: testName,
      details: `Promoted ${winner} to production`,
    });
  }

  /**
   * Log report export
   */
  static async logReportExported(testId, testName, format) {
    await this.log('exported_report', 'test', testId, {
      resourceName: testName,
      details: `Exported report as ${format.toUpperCase()}`,
    });
  }

  /**
   * Log permission assignment
   */
  static async logPermissionAssigned(userId, roleId, details) {
    await this.log('assigned_permission', 'user', userId, {
      details: `Assigned role ${roleId}. ${details}`,
    });
  }

  /**
   * Log permission revocation
   */
  static async logPermissionRevoked(userId, roleId, details) {
    await this.log('revoked_permission', 'user', userId, {
      details: `Revoked role ${roleId}. ${details}`,
    });
  }

  /**
   * Get IP address (client-side - best effort)
   */
  static async getIpAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Audit logging hook for React components
 */
export function useAudit() {
  return {
    logTestCreated: AuditService.logTestCreated,
    logTestEdited: AuditService.logTestEdited,
    logTestPaused: AuditService.logTestPaused,
    logTestResumed: AuditService.logTestResumed,
    logTestPromoted: AuditService.logTestPromoted,
    logReportExported: AuditService.logReportExported,
    logPermissionAssigned: AuditService.logPermissionAssigned,
    logPermissionRevoked: AuditService.logPermissionRevoked,
  };
}