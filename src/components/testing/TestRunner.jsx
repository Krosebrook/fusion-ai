import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TestRunner({ suites, onRunComplete }) {
  const [running, setRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [runResults, setRunResults] = useState(null);

  const handleRun = async () => {
    if (!selectedSuite) {
      toast.error('Select a test suite to run');
      return;
    }

    setRunning(true);
    setRunResults(null);

    try {
      const suite = suites.find(s => s.id === selectedSuite);
      
      // Simulate test execution (in production, this would call a backend function)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const results = suite.test_cases.map(test => ({
        test_id: test.id,
        name: test.name,
        status: Math.random() > 0.2 ? 'passed' : 'failed',
        duration_ms: Math.floor(Math.random() * 500) + 50,
        error_message: Math.random() > 0.2 ? null : 'AssertionError: Expected true to be false'
      }));

      const testRun = await base44.entities.TestRun.create({
        suite_id: suite.id,
        status: results.every(r => r.status === 'passed') ? 'passed' : 'failed',
        trigger: 'manual',
        environment: 'local',
        results,
        performance: {
          total_duration_ms: results.reduce((acc, r) => acc + r.duration_ms, 0),
          avg_test_duration_ms: Math.round(results.reduce((acc, r) => acc + r.duration_ms, 0) / results.length)
        },
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

      setRunResults(testRun);
      onRunComplete?.(testRun);
      
      if (testRun.status === 'passed') {
        toast.success('All tests passed!');
      } else {
        toast.error('Some tests failed');
      }
    } catch (error) {
      toast.error('Failed to run tests');
      console.error(error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select value={selectedSuite} onValueChange={setSelectedSuite}>
          <SelectTrigger className="flex-1 bg-slate-800/50 border-white/10 text-white">
            <SelectValue placeholder="Select test suite" />
          </SelectTrigger>
          <SelectContent>
            {suites.map(suite => (
              <SelectItem key={suite.id} value={suite.id}>
                {suite.name} ({suite.test_cases?.length || 0} tests)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleRun}
          disabled={running || !selectedSuite}
          className="bg-gradient-to-r from-green-500 to-emerald-600"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {runResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className={`p-6 rounded-lg border-2 ${
            runResults.status === 'passed' 
              ? 'bg-green-500/10 border-green-500/50' 
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {runResults.status === 'passed' ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {runResults.status === 'passed' ? 'All Tests Passed!' : 'Some Tests Failed'}
                </h3>
                <p className="text-white/60">
                  {runResults.results.filter(r => r.status === 'passed').length} passed, {' '}
                  {runResults.results.filter(r => r.status === 'failed').length} failed
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/80">
                  {runResults.performance.total_duration_ms}ms total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/80">
                  Avg: {runResults.performance.avg_test_duration_ms}ms
                </span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold mb-3">Test Results</h4>
            {runResults.results.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  result.status === 'passed'
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-white">{result.name}</span>
                  </div>
                  <span className="text-white/60 text-sm">{result.duration_ms}ms</span>
                </div>
                {result.error_message && (
                  <div className="mt-2 ml-8 p-3 rounded bg-red-900/20 text-red-400 text-sm font-mono">
                    {result.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}