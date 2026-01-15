import React from 'react';
import { AlertTriangle, Home, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PerformanceMonitor } from './PerformanceMonitor';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({ 
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to monitoring service
    this.logErrorToService(error, errorInfo);

    // Track in performance monitor
    try {
      PerformanceMonitor.metrics['error_boundary_triggered'] = Date.now();
    } catch (e) {
      // Performance monitoring failed, ignore
    }
  }

  logErrorToService(error, errorInfo) {
    // Safe refactor: Added Sentry placeholder for production error logging
    // In production, send to Sentry, LogRocket, etc.
    
    try {
      // Placeholder for Sentry integration
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     contexts: {
      //       react: {
      //         componentStack: errorInfo.componentStack
      //       }
      //     }
      //   });
      // }
      
      // Fallback: Always log to console for debugging
      console.error('Global Error Boundary caught:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    } catch (loggingError) {
      // Safe refactor: Fail gracefully if error logging itself fails
      console.error('Error logging failed:', loggingError);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isCritical = this.state.errorCount > 3;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-3">
                  {isCritical ? 'Critical Error' : 'Something went wrong'}
                </h1>
                <p className="text-gray-400 text-lg">
                  {isCritical 
                    ? "Multiple errors detected. Please reload the application."
                    : "We encountered an unexpected error. Don't worry, your data is safe."
                  }
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Bug className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
                      <code className="text-sm text-red-300 break-all block">
                        {this.state.error.toString()}
                      </code>
                    </div>
                  </div>
                  
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-3">
                      <summary className="text-sm text-red-400 cursor-pointer hover:text-red-300">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-red-300 overflow-auto max-h-40 p-2 bg-black/20 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-300"
                >
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-white/10 text-gray-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Error Count Warning */}
              {this.state.errorCount > 1 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-yellow-400">
                    ⚠️ {this.state.errorCount} errors detected in this session
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}