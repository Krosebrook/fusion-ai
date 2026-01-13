import { useEffect, useRef } from 'react';

export function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    let mermaidAPI;
    
    const loadMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({ 
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#8B5CF6',
            primaryTextColor: '#fff',
            primaryBorderColor: '#7C3AED',
            lineColor: '#A78BFA',
            secondaryColor: '#EC4899',
            tertiaryColor: '#14B8A6'
          }
        });
        mermaidAPI = mermaid.default;

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaidAPI.render(id, chart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-red-400 text-sm">${chart}</pre>`;
        }
      }
    };

    loadMermaid();
  }, [chart]);

  return (
    <div 
      ref={containerRef}
      className="bg-slate-900/50 p-4 rounded-lg overflow-auto"
    />
  );
}