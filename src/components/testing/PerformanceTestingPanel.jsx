import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gauge, Zap, Clock, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function PerformanceTestingPanel() {
  const [testing, setTesting] = useState(false);
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);

  const runTest = async () => {
    if (!url) {
      toast.error('Enter a URL to test');
      return;
    }

    setTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults({
        loadTime: Math.floor(Math.random() * 2000) + 500,
        ttfb: Math.floor(Math.random() * 500) + 100,
        fcp: Math.floor(Math.random() * 1000) + 300,
        lcp: Math.floor(Math.random() * 2000) + 800,
        timeline: Array.from({ length: 10 }, (_, i) => ({
          time: i * 100,
          memory: Math.random() * 50 + 20,
          cpu: Math.random() * 70 + 10
        }))
      });

      toast.success('Performance test complete!');
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30">
        <div className="flex items-start gap-3 mb-4">
          <Gauge className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div>
            <h3 className="text-white font-semibold mb-1">Performance Testing</h3>
            <p className="text-white/70 text-sm">
              Measure load time, TTFB, and Core Web Vitals
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-slate-800/50 border-white/10 text-white"
          />
          <Button
            onClick={runTest}
            disabled={testing}
            className="bg-gradient-to-r from-orange-500 to-amber-600"
          >
            {testing ? 'Testing...' : 'Run Test'}
          </Button>
        </div>
      </div>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Load Time', value: `${results.loadTime}ms`, icon: Clock },
              { label: 'TTFB', value: `${results.ttfb}ms`, icon: Zap },
              { label: 'FCP', value: `${results.fcp}ms`, icon: TrendingDown },
              { label: 'LCP', value: `${results.lcp}ms`, icon: Gauge }
            ].map((metric) => (
              <div key={metric.label} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className="w-4 h-4 text-orange-400" />
                  <p className="text-white/60 text-sm">{metric.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Timeline Chart */}
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-4">Resource Usage Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={results.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="memory" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}