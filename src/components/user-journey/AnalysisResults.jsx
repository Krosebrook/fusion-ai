import { Button } from '@/components/ui/button';
import { Copy, FlaskConical, Zap, MessageSquare, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MermaidDiagram } from '../visualization/MermaidDiagram';

export function AnalysisResults({
  conversation,
  generatingTests,
  onCopy,
  onGenerateTests
}) {
  if (!conversation) return null;

  const lastMessage = conversation.messages?.[conversation.messages.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(lastMessage?.content || '')}
            className="border-white/10"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            size="sm"
            onClick={onGenerateTests}
            disabled={generatingTests}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            {generatingTests ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4 mr-2" />
                Generate A/B Tests
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {conversation.messages?.map((message, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500/10 border border-blue-500/20' 
                : 'bg-slate-800/50 border border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {message.role === 'user' ? (
                <MessageSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <GitBranch className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-sm text-white/60 capitalize">{message.role}</span>
            </div>
            <ReactMarkdown 
              className="prose prose-invert prose-sm max-w-none"
              components={{
                code: ({ inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match && match[1] === 'mermaid') {
                    return <MermaidDiagram chart={String(children).trim()} />;
                  }
                  return inline ? (
                    <code className="bg-slate-700 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-slate-900 p-4 rounded-lg overflow-auto">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}