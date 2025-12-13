/**
 * Application Logger
 * Structured logging with levels and context
 */

import { ENV } from './config';

// ============================================================================
// Type Definitions
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

// ============================================================================
// Logger Configuration
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS: Record<LogLevel, string> = {
  debug: '#6B7280',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

// ============================================================================
// Logger Class
// ============================================================================

class Logger {
  private minLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor(minLevel: LogLevel = ENV.isDevelopment ? 'debug' : 'info') {
    this.minLevel = minLevel;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
    };

    // Add to log history
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    if (ENV.isDevelopment) {
      this.consoleLog(entry);
    }

    // Send to monitoring in production
    if (ENV.isProduction && level === 'error') {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Format and output to console
   */
  private consoleLog(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const color = COLORS[entry.level];
    
    const style = `color: ${color}; font-weight: bold;`;
    const resetStyle = 'color: inherit; font-weight: normal;';

    console.log(
      `%c[${entry.level.toUpperCase()}]%c ${timestamp} - ${entry.message}`,
      style,
      resetStyle,
      entry.context || ''
    );
  }

  /**
   * Send critical logs to monitoring service
   */
  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Integrate with monitoring service
    // Example: send to CloudWatch, DataDog, etc.
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Clear log history
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const logger = new Logger();

export default logger;