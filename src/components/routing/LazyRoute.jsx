/**
 * Lazy Route Wrapper Component
 * 
 * Provides lazy loading with suspense boundary and loading states.
 * Automatically handles code-splitting for improved initial load performance.
 * 
 * Features:
 * - React.lazy() integration
 * - Suspense boundary with cinematic loader
 * - Error boundary for failed chunk loads
 * - Retry mechanism for network failures
 * 
 * @component
 * @example
 * // Usage in route definitions
 * const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
 * <Route path="/dashboard" element={<LazyRoute component={LazyDashboard} />} />
 */
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Cinematic loading screen with pulsing animation
 */
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-cyan-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-sm"
        >
          Loading...
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Lazy Route Component
 * Wraps lazy-loaded components with Suspense and loading state
 */
export function LazyRoute({ component: Component, fallback, ...props }) {
  return (
    <Suspense fallback={fallback || <RouteLoader />}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Error Boundary for Lazy Routes
 * Handles chunk loading errors with retry capability
 */
import { Component as ReactComponent } from 'react';

export class LazyRouteErrorBoundary extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Failed to Load
            </h2>
            <p className="text-white/60 text-sm mb-6">
              {this.state.error?.message || 'Unable to load this page. Please check your connection.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              Retry
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}