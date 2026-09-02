import { useEffect, useRef } from "react";
import { Star, Trophy, Clock, Gauge, AlertTriangle, Award } from "lucide-react";
import type { GameStats, LevelConfig } from "@/game/types";

interface VictoryProps {
  stats: GameStats;
  level: LevelConfig;
  nextLevelUnlocked: boolean;
  onNextLevel: () => void;
  onLevels: () => void;
  onMainMenu: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function Victory({
  stats,
  level,
  nextLevelUnlocked,
  onNextLevel,
  onLevels,
  onMainMenu,
}: VictoryProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes coinRise {
          0% { transform: translateY(100vh) rotate(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti */}
      <Confetti />

      {/* Coins rising */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${5 + Math.random() * 90}%`,
              animation: `coinRise ${2 + Math.random() * 2}s ease-out ${Math.random() * 2}s infinite`,
            }}
          >
            🪙
          </div>
        ))}
      </div>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/80 via-orange-900/80 to-red-900/80 backdrop-blur-sm" />

      {/* Content */}
      <div
        className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-yellow-500/30 p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{ animation: "scaleIn 0.5s ease-out" }}
      >
        {/* Trophy */}
        <div className="text-center mb-4">
          <div
            className="inline-block"
            style={{ animation: "scaleIn 0.6s ease-out 0.2s both" }}
          >
            <Trophy size={64} className="text-yellow-400 mx-auto" />
          </div>
          <h2
            className="text-3xl font-black mt-2"
            style={{
              background: "linear-gradient(90deg, #ffcc00, #ff6600, #ffcc00)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shine 2s linear infinite",
            }}
          >
            VICTOIRE !
          </h2>
          <p className="text-sm text-gray-400 mt-1">Niveau {level.id} terminé</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              size={40}
              className={i < stats.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
              style={{ animation: `starPop 0.5s ease-out ${0.5 + i * 0.2}s both` }}
            />
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4" style={{ animation: "fadeInUp 0.5s ease-out 0.8s both" }}>
          <StatCard icon={<Clock size={16} />} label="Temps" value={formatTime(stats.timeUsed)} />
          <StatCard icon={<Gauge size={16} />} label="Vitesse max" value={`${stats.topSpeed} km/h`} />
          <StatCard icon={<AlertTriangle size={16} />} label="Collisions" value={stats.collisions.toString()} />
          <StatCard icon={<Award size={16} />} label="Score" value={stats.score.toString()} highlight />
        </div>

        {/* Next level unlock */}
        {nextLevelUnlocked && (
          <div
            className="bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-3 mb-4 text-center"
            style={{ animation: "fadeInUp 0.5s ease-out 1s both" }}
          >
            <p className="text-green-400 font-bold text-sm">
              NIVEAU {level.id + 1} DÉBLOQUÉ ! 🔓
            </p>
          </div>
        )}

        {/* Credits */}
        <div
          className="text-center mb-4 space-y-0.5"
          style={{ animation: "fadeInUp 0.5s ease-out 1.2s both" }}
        >
          <p className="text-sm font-bold text-yellow-400">FÉLICITATIONS !</p>
          <p className="text-xs text-gray-300">EDMOND NYISHUYIMANA</p>
          <p className="text-xs text-gray-400">ITN — CAMPUS KAMENGE</p>
          <p className="text-xs text-gray-400">Merci d'avoir bien joué à JEUX BY EDMOND</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2" style={{ animation: "fadeInUp 0.5s ease-out 1.4s both" }}>
          {nextLevelUnlocked && (
            <button
              onClick={onNextLevel}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all active:scale-95"
            >
              NIVEAU SUIVANT →
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onLevels}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all active:scale-95"
            >
              NIVEAUX
            </button>
            <button
              onClick={onMainMenu}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all active:scale-95"
            >
              MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "bg-yellow-500/10 border-yellow-500/30" : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-yellow-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = ["#ffcc00", "#ff6600", "#00ccff", "#00ff88", "#ff3366", "#ffffff"];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 8;
      piece.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size * (Math.random() > 0.5 ? 1 : 0.5)}px;
        background: ${color};
        left: ${Math.random() * 100}%;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        animation: confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite;
        pointer-events: none;
      `;
      container.appendChild(piece);
      pieces.push(piece);
    }

    return () => pieces.forEach((p) => p.remove());
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
}
