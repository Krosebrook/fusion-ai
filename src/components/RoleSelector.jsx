import { Code, Palette, BarChart3 } from 'lucide-react';

const roles = [
  {
    id: 'developer',
    title: 'Developer',
    icon: Code,
    description: 'Build apps faster with AI-generated code',
    color: 'from-orange-500 to-red-500',
    benefits: ['Full-stack apps', 'API generation', 'Database schemas']
  },
  {
    id: 'creator',
    title: 'Creator',
    icon: Palette,
    description: 'Content & media at the speed of thought',
    color: 'from-purple-500 to-pink-500',
    benefits: ['Blog posts', 'Social content', 'Marketing copy']
  },
  {
    id: 'business',
    title: 'Business Owner',
    icon: BarChart3,
    description: 'Automate workflows and analyze data',
    color: 'from-cyan-500 to-blue-500',
    benefits: ['Business automation', 'Analytics', 'Revenue tools']
  }
];

export default function RoleSelector({ onSelect, selected }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          What best describes you?
        </h2>
        <p className="text-gray-400">
          We'll recommend the perfect tools for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.id;

          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={`
                relative group text-left p-6 rounded-xl transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-orange-500 scale-105'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600 hover:scale-102'
                }
              `}
            >
              {/* Icon with gradient background */}
              <div className={`
                w-16 h-16 rounded-lg mb-4 flex items-center justify-center
                bg-gradient-to-br ${role.color}
                ${isSelected ? 'shadow-lg' : 'opacity-80 group-hover:opacity-100'}
              `}>
                <Icon size={32} className="text-white" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-white mb-2">
                {role.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {role.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                {role.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                    <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${role.color}`} />
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}