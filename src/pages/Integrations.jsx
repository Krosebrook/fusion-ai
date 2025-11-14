
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link2, Github, Loader2, AlertTriangle, FolderTree } from 'lucide-react';

export default function IntegrationsPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileTree, setFileTree] = useState(null);

  const handleSync = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFileTree(null);

    try {
      const response = await base44.functions.invoke('getRepoStructure', { repoUrl });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setFileTree(response.data.tree);
    } catch (err) {
      setError(err.message || 'Failed to sync repository.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }} className="ff-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF620, #8B5CF610)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Link2 size={28} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', marginBottom: '8px' }}>
                Integrations
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Connect your favorite tools to supercharge your workflow.
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Integration Card */}
        <div className="ff-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Github size={32} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF' }}>
              GitHub Repository Sync
            </h2>
          </div>
          
          <form onSubmit={handleSync} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <Input
              type="url"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF'
              }}
            />
            <Button type="submit" disabled={isLoading || !repoUrl} className="ff-btn-primary">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" style={{ marginRight: '8px' }} size={20} />
                  Syncing...
                </>
              ) : (
                'Sync Files'
              )}
            </Button>
          </form>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444',
              borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <AlertTriangle style={{ color: '#F87171' }} />
              <p style={{ color: '#FCA5A5' }}>{error}</p>
            </div>
          )}

          {fileTree && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={20} />
                Repository Structure
              </h3>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)', borderRadius: '12px', padding: '24px',
                maxHeight: '400px', overflowY: 'auto', fontFamily: 'monospace',
                fontSize: '14px', color: '#CBD5E1', whiteSpace: 'pre'
              }}>
                {fileTree.map(file => file.path).join('\n')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
