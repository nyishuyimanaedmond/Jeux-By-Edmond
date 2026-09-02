import { RotateCcw, Trophy, Home, Layers, AlertTriangle } from "lucide-react";
import type { GameStats, LevelConfig } from "@/game/types";

interface GameOverProps {
  stats: GameStats;
  level: LevelConfig;
  reason: "crash" | "time";
  onRestart: () => void;
  onLevels: () => void;
  onMainMenu: () => void;
}

export function GameOver({ stats, level, reason, onRestart, onLevels, onMainMenu }: GameOverProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-gray-900/90 to-black/90 backdrop-blur-sm" />

      <div
        className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-red-500/30 p-8 w-full max-w-sm mx-4"
        style={{ animation: "scaleIn 0.4s ease-out" }}
      >
        {/* Crash icon */}
        <div className="text-center mb-4">
          <div style={{ animation: "shake 0.5s ease-out" }}>
            <AlertTriangle size={56} className="text-red-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-black text-red-500 mt-2">GAME OVER</h2>
          <p className="text-sm text-gray-400 mt-1">
            {reason === "crash"
              ? "Votre voiture a quitté la route ou subi une collision."
              : "Le temps est écoulé !"}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2" style={{ animation: "fadeInUp 0.4s ease-out 0.2s both" }}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Niveau</span>
            <span className="text-white font-bold">{level.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Distance</span>
            <span className="text-white font-bold">{Math.round(stats.distancePercent)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Collisions</span>
            <span className="text-white font-bold">{stats.collisions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Score</span>
            <span className="text-yellow-400 font-bold">{stats.score}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2" style={{ animation: "fadeInUp 0.4s ease-out 0.4s both" }}>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 rounded-xl hover:from-red-500 hover:to-red-400 transition-all active:scale-95"
          >
            <RotateCcw size={18} /> RECOMMENCER
          </button>
          <div className="flex gap-2">
            <button
              onClick={onLevels}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all active:scale-95"
            >
              <Layers size={16} /> NIVEAUX
            </button>
            <button
              onClick={onMainMenu}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all active:scale-95"
            >
              <Home size={16} /> MENU
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          EDMOND NYISHUYIMANA — ITN CAMPUS KAMENGE
        </p>
      </div>
    </div>
  );
}
