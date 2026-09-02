export interface CarStats {
  topSpeed: number; // 0-100
  acceleration: number; // 0-100
  braking: number; // 0-100
  handling: number; // 0-100
}

export interface Car {
  id: string;
  name: string;
  bodyColor: string;
  accentColor: string;
  requiredLevel: number;
  stats: CarStats;
  description: string;
}

export type EnvironmentType = "day" | "night" | "rain" | "fog" | "desert" | "snow";

export interface LevelConfig {
  id: number;
  name: string;
  timeLimit: number; // seconds
  trackLength: number; // meters
  difficulty: number; // 1-10
  environment: EnvironmentType;
  curveIntensity: number; // 0-1, how curvy
  trafficDensity: number; // 0-1
  obstacleDensity: number; // 0-1
  description: string;
  weather: "clear" | "rain" | "fog" | "night";
}

export type Screen =
  | "intro"
  | "menu"
  | "garage"
  | "levels"
  | "settings"
  | "about"
  | "game"
  | "victory"
  | "gameover";

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  graphicsQuality: "low" | "medium" | "high";
  isFullscreen: boolean;
}

export interface LevelResult {
  stars: number;
  bestTime: number; // seconds
  bestScore: number;
  completed: boolean;
}

export interface GameProgress {
  unlockedLevels: number[]; // list of level ids unlocked
  completedLevels: number[];
  levelResults: Record<number, LevelResult>;
  selectedCarId: string;
  settings: GameSettings;
}

export interface GameStats {
  timeUsed: number;
  timeRemaining: number;
  distancePercent: number;
  speed: number; // current km/h
  topSpeed: number; // max km/h reached
  collisions: number;
  score: number;
  stars: number;
}

export type GameStatus = "playing" | "won" | "lost" | "paused";
