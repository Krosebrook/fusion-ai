/**
 * Plugin UI Renderer
 * Safely renders plugin-provided UI components in sandboxed iframes
 */

import { useEffect, useRef } from 'react';
import { CinematicCard } from '../atoms/CinematicCard';
import { AlertTriangle } from 'lucide-react';

export function PluginUIRenderer({ plugin, component, config, onMessage }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessage = (event) => {
      if (event.origin !== new URL(component.iframe_url).origin) return;
      
      onMessage?.(event.data);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [component.iframe_url, onMessage]);

  const sendConfigToPlugin = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'CONFIG',
          config,
          pluginId: plugin.id,
        },
        new URL(component.iframe_url).origin
      );
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', sendConfigToPlugin);
    }
  }, [config]);

  const sandboxPerms = [
    'allow-scripts',
    'allow-same-origin',
    ...(component.sandbox_permissions || []),
  ].join(' ');

  return (
    <CinematicCard className="overflow-hidden">
      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <span className="text-white/60 text-xs font-medium">{plugin.name}</span>
        <AlertTriangle className="w-3 h-3 text-yellow-400 ml-auto" />
        <span className="text-white/40 text-xs">Third-party content</span>
      </div>
      <iframe
        ref={iframeRef}
        src={component.iframe_url}
        sandbox={sandboxPerms}
        style={{
          width: '100%',
          height: component.height || '400px',
          border: 'none',
          display: 'block',
        }}
        title={`${plugin.name} - ${component.name}`}
      />
    </CinematicCard>
  );
}

export default PluginUIRenderer;