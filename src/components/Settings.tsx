import { ArrowLeft, Volume2, VolumeX, Music, Music2, Monitor, Smartphone } from "lucide-react";
import type { GameSettings } from "@/game/types";

interface SettingsProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onBack: () => void;
  onResetProgress: () => void;
}

export function Settings({ settings, onChange, onBack, onResetProgress }: SettingsProps) {
  const update = (partial: Partial<GameSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: "linear-gradient(135deg, #0a0a1a, #0f1a2a, #0a1a1a)" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Retour</span>
          </button>
          <h1 className="text-xl font-bold text-white flex-1 text-center">PARAMÈTRES</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Audio section */}
        <Section title="Audio">
          <ToggleRow
            icon={settings.musicEnabled ? <Music size={18} /> : <Music2 size={18} />}
            label="Musique"
            value={settings.musicEnabled}
            onToggle={() => update({ musicEnabled: !settings.musicEnabled })}
          />
          <SliderRow
            icon={<Volume2 size={18} />}
            label="Volume Musique"
            value={settings.musicVolume}
            onChange={(v) => update({ musicVolume: v })}
            disabled={!settings.musicEnabled}
          />
          <ToggleRow
            icon={settings.sfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            label="Effets sonores"
            value={settings.sfxEnabled}
            onToggle={() => update({ sfxEnabled: !settings.sfxEnabled })}
          />
          <SliderRow
            icon={<Volume2 size={18} />}
            label="Volume Effets"
            value={settings.sfxVolume}
            onChange={(v) => update({ sfxVolume: v })}
            disabled={!settings.sfxEnabled}
          />
        </Section>

        {/* Graphics section */}
        <Section title="Graphismes">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Qualité graphique</span>
            </div>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => update({ graphicsQuality: q })}
                  className={`
                    flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95
                    ${settings.graphicsQuality === q
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }
                  `}
                >
                  {q === "low" ? "Bas" : q === "medium" ? "Moyen" : "Haut"}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Controls section */}
        <Section title="Contrôles">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Monitor size={18} className="text-blue-400" />
              <span>PC: ↑↓←→ / WASD, Espace = frein, P = pause</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Smartphone size={18} className="text-green-400" />
              <span>Mobile: boutons tactiles à l'écran</span>
            </div>
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Données">
          <div className="px-4 py-3">
            <button
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir effacer toute la progression ?")) {
                  onResetProgress();
                }
              }}
              className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-sm py-3 rounded-lg transition-all active:scale-95"
            >
              EFFACER LA PROGRESSION
            </button>
          </div>
        </Section>

        <p className="text-center text-xs text-gray-500 pt-4">
          EDMOND NYISHUYIMANA — ITN CAMPUS KAMENGE
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <h2 className="px-4 py-2 text-sm font-bold text-gray-400 border-b border-white/5">{title}</h2>
      {children}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-200">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-all ${value ? "bg-green-500" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? "left-6" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function SliderRow({
  icon,
  label,
  value,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`px-4 py-3 border-b border-white/5 last:border-0 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-200 flex-1">{label}</span>
        <span className="text-xs text-gray-400">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-yellow-500"
      />
    </div>
  );
}
