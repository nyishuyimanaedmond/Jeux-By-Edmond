import { useState } from "react";
import { ArrowLeft, Lock, Check } from "lucide-react";
import { CARS } from "@/game/cars";
import type { Car } from "@/game/types";

interface GarageProps {
  selectedCarId: string;
  unlockedLevels: number[];
  onSelect: (carId: string) => void;
  onBack: () => void;
}

export function Garage({ selectedCarId, unlockedLevels, onSelect, onBack }: GarageProps) {
  const [previewCar, setPreviewCar] = useState<Car | undefined>(
    CARS.find((c) => c.id === selectedCarId),
  );

  const maxUnlockedLevel = Math.max(...unlockedLevels);

  const isCarUnlocked = (car: Car) => maxUnlockedLevel >= car.requiredLevel;

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
        @keyframes carFloat {
          0%, 100% { transform: translateY(0) rotateY(0deg); }
          50% { transform: translateY(-8px) rotateY(5deg); }
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
          <h1 className="text-xl font-bold text-white flex-1 text-center">GARAGE EDMOND</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Preview panel */}
        {previewCar && (
          <div
            className="mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6"
            style={{ animation: "fadeInUp 0.4s ease-out" }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Car 3D-ish preview */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <div
                  className="relative w-40 h-24 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${previewCar.bodyColor}40, ${previewCar.accentColor}40)`,
                    border: `2px solid ${previewCar.bodyColor}`,
                  }}
                >
                  <div style={{ animation: "carFloat 3s ease-in-out infinite" }}>
                    <Car3DPreview color={previewCar.bodyColor} accent={previewCar.accentColor} />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{previewCar.name}</h2>
                <p className="text-sm text-gray-400 mb-4">{previewCar.description}</p>

                <div className="space-y-2">
                  <StatBar label="Vitesse" value={previewCar.stats.topSpeed} color="#ff6600" />
                  <StatBar label="Accélération" value={previewCar.stats.acceleration} color="#00ccff" />
                  <StatBar label="Freinage" value={previewCar.stats.braking} color="#00ff88" />
                  <StatBar label="Maniabilité" value={previewCar.stats.handling} color="#ffcc00" />
                </div>

                <div className="flex items-center gap-3 mt-4">
                  {isCarUnlocked(previewCar) ? (
                    previewCar.id === selectedCarId ? (
                      <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold text-sm">
                        <Check size={18} /> VOITURE SÉLECTIONNÉE
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelect(previewCar.id)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all active:scale-95"
                      >
                        SÉLECTIONNER
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-bold text-sm">
                      <Lock size={16} /> Niveau {previewCar.requiredLevel} requis
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Car grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CARS.map((car) => {
            const unlocked = isCarUnlocked(car);
            const isSelected = car.id === selectedCarId;
            return (
              <button
                key={car.id}
                onClick={() => unlocked && setPreviewCar(car)}
                className={`
                  relative rounded-xl p-3 border-2 transition-all duration-200
                  ${isSelected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : unlocked
                    ? "border-white/10 bg-white/5 hover:border-white/30"
                    : "border-white/5 bg-white/5 opacity-50"
                  }
                `}
                style={{ animation: "fadeInUp 0.3s ease-out" }}
              >
                <div
                  className="aspect-video rounded-lg mb-2 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${car.bodyColor}30, ${car.accentColor}30)` }}
                >
                  <Car3DPreview color={car.bodyColor} accent={car.accentColor} small />
                </div>
                <p className="text-xs font-bold text-white truncate">{car.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {!unlocked && <Lock size={10} className="text-red-400" />}
                  {isSelected && <Check size={10} className="text-green-400" />}
                  <span className={`text-[10px] ${unlocked ? "text-gray-400" : "text-red-400"}`}>
                    {unlocked ? `Niv. ${car.requiredLevel}+` : `Niv. ${car.requiredLevel}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs text-white w-8 text-right">{value}</span>
    </div>
  );
}

function Car3DPreview({ color, accent, small }: { color: string; accent: string; small?: boolean }) {
  const scale = small ? 0.7 : 1;
  return (
    <div style={{ transform: `scale(${scale})` }} className="flex flex-col items-center">
      {/* Car body - CSS art */}
      <div className="relative" style={{ width: 80, height: 50 }}>
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: color, bottom: 10, top: 15, borderRadius: "8px 12px 8px 8px" }}
        />
        <div
          className="absolute rounded-md"
          style={{
            background: accent,
            left: 18,
            right: 18,
            top: 5,
            height: 18,
            borderRadius: "10px 10px 0 0",
          }}
        />
        {/* Wheels */}
        <div
          className="absolute rounded-full bg-black border border-gray-600"
          style={{ width: 14, height: 14, left: 8, bottom: 0 }}
        />
        <div
          className="absolute rounded-full bg-black border border-gray-600"
          style={{ width: 14, height: 14, right: 8, bottom: 0 }}
        />
        {/* Headlight */}
        <div
          className="absolute rounded-full"
          style={{ width: 6, height: 6, right: 2, top: 22, background: "#ffffcc" }}
        />
      </div>
    </div>
  );
}
