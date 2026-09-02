import { Car as CarIcon, Play, Car, Layers, Settings, Info, Trophy } from "lucide-react";

interface MainMenuProps {
  onPlay: () => void;
  onGarage: () => void;
  onLevels: () => void;
  onSettings: () => void;
  onAbout: () => void;
  unlockedCount: number;
  completedCount: number;
}

export function MainMenu({
  onPlay,
  onGarage,
  onLevels,
  onSettings,
  onAbout,
  unlockedCount,
  completedCount,
}: MainMenuProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #0f1a3a 40%, #1a0a2e 100%)",
      }}
    >
      <style>{`
        @keyframes carDriveMenu {
          0% { transform: translateX(-300px) rotate(0deg); }
          50% { transform: translateX(50vw) rotate(0deg); }
          50.01% { transform: translateX(50vw) rotate(180deg); }
          100% { transform: translateX(calc(100vw + 300px)) rotate(180deg); }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(255,200,50,0.5), 0 0 40px rgba(255,200,50,0.2); }
          50% { text-shadow: 0 0 30px rgba(255,200,50,0.8), 0 0 60px rgba(255,200,50,0.4); }
        }
        @keyframes roadScroll {
          from { background-position: 0 0; }
          to { background-position: 0 200px; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Road background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30"
        style={{
          background: "linear-gradient(to bottom, transparent, #1a1a2e 60%, #222)",
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 38px, #ffcc00 38px, #ffcc00 42px, transparent 42px, transparent 80px)",
          backgroundSize: "100% 80px",
          animation: "roadScroll 0.4s linear infinite",
        }}
      />

      {/* Animated car */}
      <div
        className="absolute bottom-[22%] z-10"
        style={{ animation: "carDriveMenu 8s linear infinite" }}
      >
        <CarIcon size={40} color="#ffcc00" />
      </div>

      {/* Speed lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/5 h-0.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 80}px`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center px-4 py-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" style={{ animation: "float 3s ease-in-out infinite" }}>
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight mb-1"
            style={{
              background: "linear-gradient(90deg, #ffcc00, #ff6600, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "glowPulse 2s ease-in-out infinite",
            }}
          >
            JEUX BY EDMOND
          </h1>
          <p className="text-sm text-blue-200 font-semibold tracking-wide">
            EDMOND NYISHUYIMANA
          </p>
          <p className="text-xs text-gray-400 mt-1">ITN — CAMPUS KAMENGE</p>
        </div>

        {/* Progress badge */}
        <div className="flex gap-4 mb-6 text-xs">
          <div className="bg-white/10 rounded-full px-4 py-1.5 flex items-center gap-1.5 text-gray-200">
            <Layers size={14} className="text-yellow-400" />
            {unlockedCount} / 20 niveaux
          </div>
          <div className="bg-white/10 rounded-full px-4 py-1.5 flex items-center gap-1.5 text-gray-200">
            <Trophy size={14} className="text-green-400" />
            {completedCount} terminés
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <MenuButton onClick={onPlay} icon={<Play size={22} />} label="JOUER" primary />
          <MenuButton onClick={onGarage} icon={<Car size={20} />} label="CHOISIR UNE VOITURE" />
          <MenuButton onClick={onLevels} icon={<Layers size={20} />} label="NIVEAUX" />
          <MenuButton onClick={onSettings} icon={<Settings size={20} />} label="PARAMÈTRES" />
          <MenuButton onClick={onAbout} icon={<Info size={20} />} label="À PROPOS" />
        </div>

        <p className="text-xs text-gray-500 mt-8 text-center">
          EDMOND NYISHUYIMANA — ITN CAMPUS KAMENGE
        </p>
      </div>
    </div>
  );
}

function MenuButton({
  onClick,
  icon,
  label,
  primary,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 w-full px-6 py-4 rounded-xl
        font-bold text-lg transition-all duration-300
        active:scale-95
        ${primary
          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-orange-500/30"
          : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
        }
      `}
    >
      <span className="flex items-center justify-center w-8">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {primary && (
        <span className="text-xs bg-black/20 rounded-full px-2 py-0.5">GO</span>
      )}
    </button>
  );
}
