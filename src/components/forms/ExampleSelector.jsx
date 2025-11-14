import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExampleSelector({ examples, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!examples || examples.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-orange-400" />
          <span className="font-semibold text-white">Try an Example</span>
          <span className="text-xs text-gray-500">({examples.length} templates)</span>
        </div>
        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(example)}
              className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-orange-400 transition-colors">
                    {example.name}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {example.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 shrink-0"
                >
                  Use This
                </Button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}