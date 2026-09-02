import { useEffect, useRef, useState, useCallback } from "react";
import { Pause } from "lucide-react";
import { GameEngine } from "@/game/engine";
import { getCarById } from "@/game/cars";
import { getLevelById } from "@/game/levels";
import { AudioManager, getAudioManager } from "@/game/audio";
import type { GameStats, GameStatus, GameSettings } from "@/game/types";
import { HUD } from "./HUD";
import { TouchControls } from "./TouchControls";
import type { TouchInputState } from "./TouchControls";
import { PauseMenu } from "./PauseMenu";
import { Victory } from "./Victory";
import { GameOver } from "./GameOver";

interface GameScreenProps {
  levelId: number;
  carId: string;
  settings: GameSettings;
  onVictory: (levelId: number, stats: GameStats) => void;
  onDefeat: (levelId: number, stats: GameStats) => void;
  onExitToLevels: () => void;
  onExitToMenu: () => void;
  onNextLevel: (nextLevelId: number) => void;
}

const INITIAL_STATS: GameStats = {
  timeUsed: 0,
  timeRemaining: 0,
  distancePercent: 0,
  speed: 0,
  topSpeed: 0,
  collisions: 0,
  score: 0,
  stars: 0,
};

export function GameScreen({
  levelId,
  carId,
  settings,
  onVictory,
  onDefeat,
  onExitToLevels,
  onExitToMenu,
  onNextLevel,
}: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [isTouch, setIsTouch] = useState(false);
  const [defeatReason, setDefeatReason] = useState<"crash" | "time">("crash");
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);

  const level = getLevelById(levelId)!;
  const car = getCarById(carId)!;

  const handleVictory = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const finalStats = engine.getFinalStats();
    setStats(finalStats);
    setStatus("won");
    setNextLevelUnlocked(levelId + 1 <= 20);
    audioRef.current?.stopEngineSound();
    audioRef.current?.stopMusic();
    audioRef.current?.playSfx("win");
    audioRef.current?.playMusic("victory");
    onVictory(levelId, finalStats);
  }, [levelId, onVictory]);

  const handleDefeat = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const finalStats = engine.getFinalStats();
    setStats(finalStats);
    setDefeatReason(finalStats.timeRemaining <= 0 ? "time" : "crash");
    setStatus("lost");
    audioRef.current?.stopEngineSound();
    audioRef.current?.stopMusic();
    audioRef.current?.playSfx("lose");
    audioRef.current?.playMusic("gameover");
    onDefeat(levelId, finalStats);
  }, [levelId, onDefeat]);

  const handleCollision = useCallback((type: "crash" | "traffic") => {
    audioRef.current?.playSfx("crash");
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
    // Update engine sound
    const engine = engineRef.current;
    const audio = audioRef.current;
    if (engine && audio) {
      audio.updateEngine(engine.getEngineSpeedRatio());
    }
  }, []);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const audio = getAudioManager(settings);
    audioRef.current = audio;
    audio.init();
    audio.resume();
    audio.updateSettings(settings);
    audio.stopMusic();
    audio.playMusic("race");
    audio.startEngineSound();

    const engine = new GameEngine(containerRef.current, level, car, {
      onStatsUpdate: handleStatsUpdate,
      onCollision: handleCollision,
      onVictory: handleVictory,
      onDefeat: handleDefeat,
    });
    engineRef.current = engine;
    engine.init();

    // Keyboard pause
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyP" || e.code === "Escape") {
        setStatus((prev) => {
          if (prev === "playing") {
            engine.setPaused(true);
            return "paused";
          } else if (prev === "paused") {
            engine.setPaused(false);
            return "playing";
          }
          return prev;
        });
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      audio.stopEngineSound();
      audio.stopMusic();
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, carId]);

  const handlePause = () => {
    engineRef.current?.setPaused(true);
    setStatus("paused");
  };

  const handleResume = () => {
    engineRef.current?.setPaused(false);
    setStatus("playing");
  };

  const handleRestart = () => {
    audioRef.current?.stopEngineSound();
    audioRef.current?.stopMusic();
    engineRef.current?.dispose();
    setStats(INITIAL_STATS);
    setStatus("playing");

    setTimeout(() => {
      if (!containerRef.current) return;
      const audio = audioRef.current!;
      audio.playMusic("race");
      audio.startEngineSound();
      const engine = new GameEngine(containerRef.current, level, car, {
        onStatsUpdate: handleStatsUpdate,
        onCollision: handleCollision,
        onVictory: handleVictory,
        onDefeat: handleDefeat,
      });
      engineRef.current = engine;
      engine.init();
    }, 50);
  };

  const handleTouchInput = (input: Partial<TouchInputState>) => {
    engineRef.current?.setTouchInput(input);
  };

  const nextLevelId = levelId + 1;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ touchAction: "none" }}>
      {/* 3D canvas container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* HUD */}
      {(status === "playing" || status === "paused") && <HUD stats={stats} level={level} />}

      {/* Pause button */}
      {status === "playing" && (
        <button
          onClick={handlePause}
          className="absolute top-3 right-3 z-30 md:top-4 md:right-4 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-black/70 transition-all active:scale-90"
          style={{ display: status === "playing" ? "flex" : "none" }}
        >
          <Pause size={18} />
        </button>
      )}

      {/* Touch controls */}
      {status === "playing" && isTouch && <TouchControls onInput={handleTouchInput} />}

      {/* Pause menu */}
      {status === "paused" && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={onExitToMenu}
        />
      )}

      {/* Victory */}
      {status === "won" && (
        <Victory
          stats={stats}
          level={level}
          nextLevelUnlocked={nextLevelUnlocked}
          onNextLevel={() => onNextLevel(nextLevelId)}
          onLevels={onExitToLevels}
          onMainMenu={onExitToMenu}
        />
      )}

      {/* Game over */}
      {status === "lost" && (
        <GameOver
          stats={stats}
          level={level}
          reason={defeatReason}
          onRestart={handleRestart}
          onLevels={onExitToLevels}
          onMainMenu={onExitToMenu}
        />
      )}
    </div>
  );
}
