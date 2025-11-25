import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function PerformanceHeatmap({ runs }) {
  const heatmapData = useMemo(() => {
    const hourlyData = Array(7).fill(null).map(() => Array(24).fill({ count: 0, avgDuration: 0, successRate: 0 }));
    
    runs.forEach(run => {
      const date = new Date(run.created_date);
      const day = date.getDay();
      const hour = date.getHours();
      
      const current = hourlyData[day][hour];
      const newCount = (current.count || 0) + 1;
      const newDuration = ((current.avgDuration || 0) * (current.count || 0) + (run.duration_seconds || 0)) / newCount;
      const successCount = (current.successCount || 0) + (run.status === 'success' ? 1 : 0);
      
      hourlyData[day][hour] = {
        count: newCount,
        avgDuration: Math.round(newDuration),
        successCount,
        successRate: Math.round(successCount / newCount * 100)
      };
    });

    return hourlyData;
  }, [runs]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (cell) => {
    if (!cell.count) return 'rgba(255,255,255,0.02)';
    const intensity = Math.min(cell.count / 10, 1);
    const successFactor = cell.successRate / 100;
    
    if (successFactor > 0.8) return `rgba(16, 185, 129, ${0.2 + intensity * 0.6})`;
    if (successFactor > 0.5) return `rgba(245, 158, 11, ${0.2 + intensity * 0.6})`;
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 p-6"
      style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-purple-400" />
        Build Activity Heatmap
      </h3>
      <p className="text-sm text-gray-400 mb-4">Activity by day of week and hour</p>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex ml-12 mb-2">
            {hours.filter((_, i) => i % 3 === 0).map(hour => (
              <div key={hour} className="flex-1 text-xs text-gray-500 text-center">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-xs text-gray-400">{day}</div>
              <div className="flex flex-1 gap-0.5">
                {hours.map(hour => {
                  const cell = heatmapData[dayIdx][hour];
                  return (
                    <div
                      key={hour}
                      className="flex-1 h-6 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-white/30"
                      style={{ background: getColor(cell) }}
                      title={cell.count > 0 
                        ? `${day} ${hour}:00 - ${cell.count} builds, ${cell.successRate}% success, avg ${Math.floor(cell.avgDuration/60)}m`
                        : `${day} ${hour}:00 - No builds`
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgba(16, 185, 129, 0.6)' }} />
              <span className="text-xs text-gray-400">High Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgba(245, 158, 11, 0.6)' }} />
              <span className="text-xs text-gray-400">Medium Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.6)' }} />
              <span className="text-xs text-gray-400">Low Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgba(255,255,255,0.02)' }} />
              <span className="text-xs text-gray-400">No Activity</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}