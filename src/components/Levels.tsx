import { ArrowLeft, Lock, Play, Check, Star } from "lucide-react";
import { LEVELS } from "@/game/levels";
import type { GameProgress } from "@/game/types";

interface LevelsProps {
  progress: GameProgress;
  onPlay: (levelId: number) => void;
  onBack: () => void;
}

export function Levels({ progress, onPlay, onBack }: LevelsProps) {
  const isUnlocked = (levelId: number) => progress.unlockedLevels.includes(levelId);
  const isCompleted = (levelId: number) => progress.completedLevels.includes(levelId);
  const getResult = (levelId: number) => progress.levelResults[levelId];

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: "linear-gradient(135deg, #0a0a1a, #0f1a2a, #0a1a1a)" }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Retour</span>
          </button>
          <h1 className="text-xl font-bold text-white flex-1 text-center">NIVEAUX</h1>
          <div className="w-20 text-right text-xs text-gray-400">
            {progress.completedLevels.length}/{LEVELS.length}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {LEVELS.map((level, idx) => {
            const unlocked = isUnlocked(level.id);
            const completed = isCompleted(level.id);
            const result = getResult(level.id);

            return (
              <div
                key={level.id}
                className={`
                  relative rounded-xl p-4 border-2 transition-all duration-300
                  ${completed
                    ? "border-green-500/40 bg-green-500/5"
                    : unlocked
                    ? "border-yellow-500/40 bg-yellow-500/5 hover:border-yellow-400"
                    : "border-white/5 bg-white/5 opacity-60"
                  }
                `}
                style={{ animation: `fadeInUp 0.3s ease-out ${idx * 0.02}s both` }}
              >
                {/* Level number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">NIVEAU</span>
                  <span className="text-2xl font-black text-white">{level.id}</span>
                </div>

                {/* Name */}
                <p className="text-xs font-bold text-white truncate mb-1">{level.name}</p>
                <p className="text-[10px] text-gray-500 truncate mb-2">{level.description}</p>

                {/* Difficulty dots */}
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-2 rounded-full ${i < level.difficulty ? "bg-orange-400" : "bg-white/10"}`}
                    />
                  ))}
                </div>

                {/* Status */}
                {completed ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                      <Check size={14} /> TERMINÉ
                    </div>
                    {result && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < result.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">{result.bestScore}</span>
                      </div>
                    )}
                    <button
                      onClick={() => onPlay(level.id)}
                      className="w-full mt-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 rounded-md transition-all active:scale-95"
                    >
                      REJOUER
                    </button>
                  </div>
                ) : unlocked ? (
                  <button
                    onClick={() => onPlay(level.id)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold py-2 rounded-md hover:from-yellow-400 hover:to-orange-400 transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Play size={12} /> JOUER
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-red-400/60 text-xs font-bold py-2">
                    <Lock size={12} /> VERROUILLÉ
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
