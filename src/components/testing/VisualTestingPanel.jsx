import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Eye, Diff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function VisualTestingPanel() {
  const [capturing, setCapturing] = useState(false);
  const [url, setUrl] = useState('');
  const [snapshots, setSnapshots] = useState([]);

  const captureSnapshot = async () => {
    if (!url) {
      toast.error('Enter a URL to capture');
      return;
    }

    setCapturing(true);
    try {
      // Simulate capture (in production, use Playwright/Puppeteer)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const snapshot = {
        id: Date.now(),
        url,
        timestamp: new Date().toISOString(),
        baseline: snapshots.length === 0,
        diff: snapshots.length > 0 ? Math.random() < 0.3 : false
      };

      setSnapshots([snapshot, ...snapshots]);
      toast.success('Snapshot captured!');
    } catch (error) {
      toast.error('Capture failed');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <div className="flex items-start gap-3 mb-4">
          <Camera className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="text-white font-semibold mb-1">Visual Regression Testing</h3>
            <p className="text-white/70 text-sm">
              Capture screenshots and detect visual changes automatically
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
            onClick={captureSnapshot}
            disabled={capturing}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            {capturing ? 'Capturing...' : 'Capture'}
          </Button>
        </div>
      </div>

      {/* Snapshots */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Snapshots ({snapshots.length})
        </h4>
        {snapshots.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            No snapshots yet. Capture your first visual baseline!
          </div>
        ) : (
          snapshots.map((snap) => (
            <motion.div
              key={snap.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {snap.diff ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
                <div>
                  <p className="text-white font-medium">{snap.url}</p>
                  <p className="text-white/60 text-sm">
                    {new Date(snap.timestamp).toLocaleString()}
                    {snap.baseline && ' • Baseline'}
                  </p>
                </div>
              </div>
              {snap.diff && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                  <Diff className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Changes detected</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}