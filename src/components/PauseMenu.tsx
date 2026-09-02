import { Play, RotateCcw, Settings as SettingsIcon, Home } from "lucide-react";

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResume, onRestart, onMainMenu }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 p-8 w-full max-w-xs mx-4">
        <h2 className="text-3xl font-black text-white text-center mb-6">PAUSE</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-green-400 hover:to-green-500 transition-all active:scale-95"
          >
            <Play size={20} /> CONTINUER
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all active:scale-95"
          >
            <RotateCcw size={18} /> RECOMMENCER
          </button>
          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all active:scale-95"
          >
            <Home size={18} /> MENU PRINCIPAL
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          EDMOND NYISHUYIMANA — ITN CAMPUS KAMENGE
        </p>
      </div>
    </div>
  );
}
