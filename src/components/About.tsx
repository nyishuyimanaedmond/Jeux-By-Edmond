import { ArrowLeft, User, Building2, Heart } from "lucide-react";

interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
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
          <h1 className="text-xl font-bold text-white flex-1 text-center">À PROPOS</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Title */}
        <div className="text-center mb-8" style={{ animation: "fadeInUp 0.5s ease-out" }}>
          <h2
            className="text-3xl font-black mb-2"
            style={{
              background: "linear-gradient(90deg, #ffcc00, #ff6600)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            JEUX BY EDMOND
          </h2>
          <p className="text-sm text-gray-400">Jeu de course automobile</p>
        </div>

        {/* Description */}
        <div
          className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-4"
          style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}
        >
          <p className="text-sm text-gray-300 leading-relaxed">
            Jeux by Edmond est un projet de jeu automobile développé dans le but de créer une
            expérience de conduite amusante, interactive et progressive. Le jeu propose 20 niveaux
            de difficulté croissante, 10 voitures différentes, des environnements variés (jour, nuit,
            pluie, brouillard, désert, neige) et un système de score avec étoiles.
          </p>
        </div>

        {/* Developer info */}
        <div
          className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-4"
          style={{ animation: "fadeInUp 0.5s ease-out 0.2s both" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <User size={20} className="text-yellow-400" />
            <div>
              <p className="text-xs text-gray-500">Développeur</p>
              <p className="text-sm font-bold text-white">Edmond NYISHUYIMANA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-blue-400" />
            <div>
              <p className="text-xs text-gray-500">Institution</p>
              <p className="text-sm font-bold text-white">ITN — Campus Kamenge</p>
            </div>
          </div>
        </div>

        {/* Thanks */}
        <div
          className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6"
          style={{ animation: "fadeInUp 0.5s ease-out 0.3s both" }}
        >
          <div className="flex items-start gap-3">
            <Heart size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-300 leading-relaxed">
              Merci à tous les joueurs qui participent et jouent correctement à Jeux by Edmond.
              Votre soutien et vos commentaires sont grandement appréciés.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-gray-500">JEUX BY EDMOND</p>
          <p className="text-xs text-gray-500">EDMOND NYISHUYIMANA</p>
          <p className="text-xs text-gray-500">ITN — CAMPUS KAMENGE</p>
        </div>
      </div>
    </div>
  );
}
