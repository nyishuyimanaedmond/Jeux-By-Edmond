import { useState, useEffect, useCallback } from "react";
import type { Screen, GameProgress, GameStats, GameSettings } from "@/game/types";
import {
  loadProgress,
  saveProgress,
  resetProgress,
  DEFAULT_PROGRESS,
} from "@/game/storage";
import { getAudioManager } from "@/game/audio";
import { TOTAL_LEVELS } from "@/game/levels";
import { Intro } from "@/components/Intro";
import { MainMenu } from "@/components/MainMenu";
import { Garage } from "@/components/Garage";
import { Levels } from "@/components/Levels";
import { Settings } from "@/components/Settings";
import { About } from "@/components/About";
import { GameScreen } from "@/components/GameScreen";

function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [progress, setProgress] = useState<GameProgress>(DEFAULT_PROGRESS);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [gameKey, setGameKey] = useState(0); // forces remount of GameScreen on restart/next level

  // Load saved progress on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Persist progress on change
  useEffect(() => {
    if (progress !== DEFAULT_PROGRESS) {
      saveProgress(progress);
    }
  }, [progress]);

  const updateSettings = (settings: GameSettings) => {
    setProgress((p) => ({ ...p, settings }));
    getAudioManager(settings).updateSettings(settings);
  };

  const handleIntroComplete = () => {
    setScreen("menu");
  };

  const handlePlay = () => {
    // Play the highest unlocked, not-yet-completed level
    const nextLevel = progress.unlockedLevels.find(
      (id) => !progress.completedLevels.includes(id),
    );
    setCurrentLevelId(nextLevel || 1);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  const handlePlayLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  const handleVictory = (levelId: number, stats: GameStats) => {
    setProgress((prev) => {
      const newCompleted = [...prev.completedLevels];
      if (!newCompleted.includes(levelId)) newCompleted.push(levelId);

      const prevResult = prev.levelResults[levelId];
      const newResult = {
        stars: Math.max(prevResult?.stars || 0, stats.stars),
        bestTime: Math.min(prevResult?.bestTime || Infinity, stats.timeUsed),
        bestScore: Math.max(prevResult?.bestScore || 0, stats.score),
        completed: true,
      };

      const newUnlocked = [...prev.unlockedLevels];
      const nextLevel = levelId + 1;
      if (nextLevel <= TOTAL_LEVELS && !newUnlocked.includes(nextLevel)) {
        newUnlocked.push(nextLevel);
      }

      return {
        ...prev,
        completedLevels: newCompleted,
        levelResults: { ...prev.levelResults, [levelId]: newResult },
        unlockedLevels: newUnlocked.sort((a, b) => a - b),
      };
    });

    // Play unlock sound if new level unlocked
    if (levelId + 1 <= TOTAL_LEVELS && !progress.unlockedLevels.includes(levelId + 1)) {
      setTimeout(() => getAudioManager(progress.settings).playSfx("unlock"), 500);
    }
  };

  const handleDefeat = (_levelId: number, _stats: GameStats) => {
    // No progress change on defeat - player keeps previous progress
  };

  const handleNextLevel = (nextLevelId: number) => {
    if (nextLevelId > TOTAL_LEVELS) {
      setScreen("levels");
      return;
    }
    setCurrentLevelId(nextLevelId);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  const handleSelectCar = (carId: string) => {
    setProgress((p) => ({ ...p, selectedCarId: carId }));
  };

  const handleResetProgress = () => {
    const fresh = resetProgress();
    setProgress(fresh);
    setScreen("menu");
  };

  const playClick = useCallback(() => {
    getAudioManager(progress.settings).init();
    getAudioManager(progress.settings).playSfx("click");
  }, [progress.settings]);

  // Menu music management
  useEffect(() => {
    const audio = getAudioManager(progress.settings);
    audio.init();
    if (screen === "menu" || screen === "garage" || screen === "levels" || screen === "settings" || screen === "about") {
      if (progress.settings.musicEnabled) {
        audio.playMusic("menu");
      }
    } else if (screen === "game") {
      // GameScreen handles its own music
    }
  }, [screen, progress.settings]);

  // Apply fullscreen setting
  useEffect(() => {
    if (progress.settings.isFullscreen) {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => {});
    }
  }, [progress.settings.isFullscreen]);

  switch (screen) {
    case "intro":
      return <Intro onComplete={handleIntroComplete} />;

    case "menu":
      return (
        <MainMenu
          onPlay={() => { playClick(); handlePlay(); }}
          onGarage={() => { playClick(); setScreen("garage"); }}
          onLevels={() => { playClick(); setScreen("levels"); }}
          onSettings={() => { playClick(); setScreen("settings"); }}
          onAbout={() => { playClick(); setScreen("about"); }}
          unlockedCount={progress.unlockedLevels.length}
          completedCount={progress.completedLevels.length}
        />
      );

    case "garage":
      return (
        <Garage
          selectedCarId={progress.selectedCarId}
          unlockedLevels={progress.unlockedLevels}
          onSelect={handleSelectCar}
          onBack={() => { playClick(); setScreen("menu"); }}
        />
      );

    case "levels":
      return (
        <Levels
          progress={progress}
          onPlay={(id) => { playClick(); handlePlayLevel(id); }}
          onBack={() => { playClick(); setScreen("menu"); }}
        />
      );

    case "settings":
      return (
        <Settings
          settings={progress.settings}
          onChange={updateSettings}
          onBack={() => { playClick(); setScreen("menu"); }}
          onResetProgress={handleResetProgress}
        />
      );

    case "about":
      return <About onBack={() => { playClick(); setScreen("menu"); }} />;

    case "game":
      return (
        <GameScreen
          key={gameKey}
          levelId={currentLevelId}
          carId={progress.selectedCarId}
          settings={progress.settings}
          onVictory={handleVictory}
          onDefeat={handleDefeat}
          onExitToLevels={() => setScreen("levels")}
          onExitToMenu={() => setScreen("menu")}
          onNextLevel={handleNextLevel}
        />
      );

    default:
      return <MainMenu
        onPlay={() => { playClick(); handlePlay(); }}
        onGarage={() => { playClick(); setScreen("garage"); }}
        onLevels={() => { playClick(); setScreen("levels"); }}
        onSettings={() => { playClick(); setScreen("settings"); }}
        onAbout={() => { playClick(); setScreen("about"); }}
        unlockedCount={progress.unlockedLevels.length}
        completedCount={progress.completedLevels.length}
      />;
  }
}

export default App;
