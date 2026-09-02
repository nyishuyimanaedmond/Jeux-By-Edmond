import type { GameStats, LevelConfig } from "@/game/types";
import { Clock, Gauge, MapPin } from "lucide-react";

interface HUDProps {
  stats: GameStats;
  level: LevelConfig;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function HUD({ stats, level }: HUDProps) {
  const lowTime = stats.timeRemaining < 15;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none">
      {/* Top bar */}
      <div className="flex items-start justify-between p-3 md:p-4">
        {/* Left: Level */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Niveau</p>
          <p className="text-lg font-bold text-white">{level.id}</p>
        </div>

        {/* Center: Time */}
        <div
          className={`bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border ${lowTime ? "border-red-500/50 animate-pulse" : "border-white/10"}`}
        >
          <div className="flex items-center gap-1.5">
            <Clock size={14} className={lowTime ? "text-red-400" : "text-yellow-400"} />
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Temps</p>
          </div>
          <p className={`text-xl font-bold tabular-nums ${lowTime ? "text-red-400" : "text-white"}`}>
            {formatTime(stats.timeRemaining)}
          </p>
        </div>

        {/* Right: Speed */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <div className="flex items-center gap-1.5">
            <Gauge size={14} className="text-blue-400" />
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Vitesse</p>
          </div>
          <p className="text-lg font-bold text-white tabular-nums">
            {stats.speed} <span className="text-xs text-gray-400">km/h</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-[60px] md:top-[72px] left-1/2 -translate-x-1/2 w-[80%] max-w-sm">
        <div className="flex items-center justify-between text-[10px] text-gray-300 mb-1">
          <span className="flex items-center gap-1">
            <MapPin size={10} /> Départ
          </span>
          <span>{Math.round(stats.distancePercent)}%</span>
          <span>FIN 🏁</span>
        </div>
        <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-200"
            style={{ width: `${stats.distancePercent}%` }}
          />
        </div>
      </div>

      {/* Speed gauge (bottom-right, desktop) */}
      <div className="hidden md:flex absolute bottom-4 right-4 flex-col items-end">
        <div className="relative w-20 h-20 rounded-full bg-black/50 border-2 border-white/20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-black text-white tabular-nums">{stats.speed}</p>
            <p className="text-[9px] text-gray-400">km/h</p>
          </div>
          {/* Speed arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ffcc00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(stats.speed / 300) * 283} 283`}
            />
          </svg>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Max: {stats.topSpeed} km/h</p>
      </div>
    </div>
  );
}
