import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function InputWithHelp({
  type = 'input',
  label,
  value,
  onChange,
  tooltip,
  charCount,
  maxChars,
  quality,
  placeholder,
  rows,
  ...props
}) {
  const getQualityConfig = () => {
    if (!quality || quality < 0) return null;
    
    if (quality >= 80) return { icon: CheckCircle, color: 'text-green-500', label: 'Excellent', bg: 'bg-green-500/10' };
    if (quality >= 60) return { icon: CheckCircle, color: 'text-blue-500', label: 'Good', bg: 'bg-blue-500/10' };
    if (quality >= 40) return { icon: AlertCircle, color: 'text-yellow-500', label: 'Fair', bg: 'bg-yellow-500/10' };
    return { icon: AlertCircle, color: 'text-red-500', label: 'Needs work', bg: 'bg-red-500/10' };
  };

  const qualityConfig = getQualityConfig();
  const Component = type === 'textarea' ? Textarea : Input;

  return (
    <div className="space-y-2">
      {/* Label with Tooltip */}
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-200">
            {label}
          </label>
          {tooltip && (
            <div className="group relative">
              <HelpCircle size={14} className="text-gray-500 cursor-help" />
              <div className="invisible group-hover:visible absolute left-0 top-6 z-10 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300 leading-relaxed">
                {tooltip}
                <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input/Textarea */}
      <Component
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
        {...props}
      />

      {/* Footer: Character Count & Quality */}
      {(charCount !== undefined || qualityConfig) && (
        <div className="flex items-center justify-between text-xs">
          {charCount !== undefined && (
            <span className={`text-gray-500 ${maxChars && charCount > maxChars ? 'text-red-500' : ''}`}>
              {charCount}{maxChars ? `/${maxChars}` : ''} characters
            </span>
          )}
          
          {qualityConfig && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${qualityConfig.bg}`}>
              <qualityConfig.icon size={12} className={qualityConfig.color} />
              <span className={`font-semibold ${qualityConfig.color}`}>
                {qualityConfig.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}