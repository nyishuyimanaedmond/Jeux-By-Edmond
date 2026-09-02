import { useEffect, useState } from "react";
import { Car as CarIcon } from "lucide-react";

interface IntroProps {
  onComplete: () => void;
}

export function Intro({ onComplete }: IntroProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase(1), 800));
    timers.push(window.setTimeout(() => setPhase(2), 1800));
    timers.push(window.setTimeout(() => setPhase(3), 2800));
    timers.push(window.setTimeout(() => onComplete(), 4200));
    return () => timers.forEach((t) => clearTimeout(t));
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #0f1a3a 50%, #1a0a2e 100%)",
      }}
      onClick={onComplete}
    >
      {/* Animated road lines */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 h-2 w-1 bg-yellow-300"
            style={{
              transform: `translateX(-50%) translateY(${(i * 50) % 100}vh)`,
              animation: `roadLine 1s linear infinite`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes roadLine {
          from { transform: translateX(-50%) translateY(-10vh) scale(0.5); opacity: 0; }
          to { transform: translateX(-50%) translateY(110vh) scale(1.5); opacity: 0.8; }
        }
        @keyframes carDrive {
          0% { left: -200px; }
          100% { left: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,200,50,0.5), 0 0 40px rgba(255,200,50,0.3); }
          50% { text-shadow: 0 0 30px rgba(255,200,50,0.8), 0 0 60px rgba(255,200,50,0.5); }
        }
      `}</style>

      {/* Animated car */}
      <div
        className="absolute bottom-20 z-10"
        style={{ animation: "carDrive 3s ease-in-out infinite" }}
      >
        <CarIcon size={48} color="#ffcc00" />
      </div>

      <div className="relative z-20 text-center px-4">
        <div
          className="transition-all duration-700"
          style={{
            opacity: phase >= 0 ? 1 : 0,
            animation: "glow 2s ease-in-out infinite",
          }}
        >
          <h1
            className="text-4xl md:text-6xl font-black tracking-tight mb-2"
            style={{
              background: "linear-gradient(90deg, #ffcc00, #ff6600, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
            }}
          >
            JEUX BY EDMOND
          </h1>
        </div>

        {phase >= 1 && (
          <p
            className="text-xl md:text-2xl text-blue-200 font-semibold mt-4"
            style={{ animation: "fadeInUp 0.6s ease-out" }}
          >
            EDMOND NYISHUYIMANA
          </p>
        )}

        {phase >= 2 && (
          <p
            className="text-base md:text-lg text-gray-300 mt-2"
            style={{ animation: "fadeInUp 0.6s ease-out" }}
          >
            ITN — CAMPUS KAMENGE
          </p>
        )}

        {phase >= 3 && (
          <p
            className="text-sm text-gray-400 mt-8"
            style={{ animation: "fadeInUp 0.6s ease-out" }}
          >
            Cliquez pour continuer...
          </p>
        )}
      </div>
    </div>
  );
}
