
export default function ProgressBar({ step, total }) {
  const percentage = (step / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-400">
          Step {step} of {total}
        </span>
        <span className="text-sm font-semibold text-orange-400">
          {Math.round(percentage)}% Complete
        </span>
      </div>
      
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}