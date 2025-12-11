/**
 * Error Handling Service
 * Centralized error management and reporting
 */

class ErrorService {
  constructor() {
    this.handlers = [];
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  registerHandler(handler) {
    this.handlers.push(handler);
  }

  handle(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };

    this.errorLog.unshift(errorData);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    this.handlers.forEach(handler => {
      try {
        handler(errorData);
      } catch (e) {
        console.error('Error handler failed:', e);
      }
    });

    return errorData;
  }

  getRecentErrors(count = 10) {
    return this.errorLog.slice(0, count);
  }

  clearLog() {
    this.errorLog = [];
  }

  // Common error patterns
  isNetworkError(error) {
    return error.message?.includes('network') || 
           error.message?.includes('fetch') ||
           error.name === 'NetworkError';
  }

  isAuthError(error) {
    return error.message?.includes('unauthorized') ||
           error.message?.includes('authentication') ||
           error.status === 401;
  }

  isValidationError(error) {
    return error.message?.includes('validation') ||
           error.status === 422;
  }

  getUserMessage(error) {
    if (this.isNetworkError(error)) {
      return 'Network connection issue. Please check your internet.';
    }
    if (this.isAuthError(error)) {
      return 'Authentication required. Please sign in again.';
    }
    if (this.isValidationError(error)) {
      return 'Invalid input. Please check your data.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}

export const errorService = new ErrorService();
export default errorService;