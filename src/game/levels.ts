import type { LevelConfig, EnvironmentType } from "./types";

const LEVEL_DATA: Array<{
  name: string;
  env: EnvironmentType;
  time: number;
  length: number;
  diff: number;
  curve: number;
  traffic: number;
  obstacle: number;
  desc: string;
  weather: "clear" | "rain" | "fog" | "night";
}> = [
  { name: "Route Simple", env: "day", time: 120, length: 800, diff: 1, curve: 0.1, traffic: 0.1, obstacle: 0.05, desc: "Route facile pour débuter.", weather: "clear" },
  { name: "Premiers Virages", env: "day", time: 110, length: 900, diff: 2, curve: 0.25, traffic: 0.15, obstacle: 0.08, desc: "Route avec plusieurs virages.", weather: "clear" },
  { name: "Circulation Urbaine", env: "day", time: 110, length: 1000, diff: 3, curve: 0.2, traffic: 0.35, obstacle: 0.1, desc: "Attention aux autres véhicules.", weather: "clear" },
  { name: "Virages Serrés", env: "day", time: 100, length: 1100, diff: 4, curve: 0.45, traffic: 0.2, obstacle: 0.12, desc: "Maniabilité mise à l'épreuve.", weather: "clear" },
  { name: "Route de Montagne", env: "day", time: 100, length: 1200, diff: 5, curve: 0.5, traffic: 0.2, obstacle: 0.15, desc: "Virages en altitude.", weather: "clear" },
  { name: "En Ville", env: "day", time: 95, length: 1300, diff: 6, curve: 0.35, traffic: 0.4, obstacle: 0.18, desc: "Densité urbaine et traffic.", weather: "clear" },
  { name: "Autoroute", env: "day", time: 90, length: 1400, diff: 7, curve: 0.2, traffic: 0.45, obstacle: 0.15, desc: "Haute vitesse, haute circulation.", weather: "clear" },
  { name: "Route de Campagne", env: "day", time: 90, length: 1300, diff: 7, curve: 0.4, traffic: 0.25, obstacle: 0.2, desc: "Campage paisible mais piégeuse.", weather: "clear" },
  { name: "Route de Nuit", env: "night", time: 85, length: 1400, diff: 8, curve: 0.35, traffic: 0.3, obstacle: 0.18, desc: "Conduite nocturne, visibilité réduite.", weather: "night" },
  { name: "Sous la Pluie", env: "rain", time: 85, length: 1400, diff: 8, curve: 0.4, traffic: 0.3, obstacle: 0.2, desc: "Route glissante, prudence.", weather: "rain" },
  { name: "Brouillard", env: "fog", time: 80, length: 1500, diff: 9, curve: 0.45, traffic: 0.25, obstacle: 0.22, desc: "Visibilité très réduite.", weather: "fog" },
  { name: "Circuit Sinueux", env: "day", time: 80, length: 1600, diff: 9, curve: 0.6, traffic: 0.3, obstacle: 0.2, desc: "Virages enchaînés à haute vitesse.", weather: "clear" },
  { name: "Nuit Pluvieuse", env: "night", time: 75, length: 1700, diff: 10, curve: 0.5, traffic: 0.35, obstacle: 0.25, desc: "Nuit + pluie = défi extrême.", weather: "rain" },
  { name: "Désert Rapide", env: "desert", time: 75, length: 1800, diff: 10, curve: 0.3, traffic: 0.4, obstacle: 0.2, desc: "Longues lignes droites, haute vitesse.", weather: "clear" },
  { name: "Neige et Verglas", env: "snow", time: 70, length: 1800, diff: 10, curve: 0.55, traffic: 0.3, obstacle: 0.28, desc: "Route gelée, contrôle difficile.", weather: "clear" },
  { name: "Grand Prix", env: "day", time: 70, length: 2000, diff: 10, curve: 0.55, traffic: 0.45, obstacle: 0.25, desc: "Circuit de compétition intensif.", weather: "clear" },
  { name: "Tempête Nocturne", env: "night", time: 65, length: 2100, diff: 10, curve: 0.6, traffic: 0.4, obstacle: 0.3, desc: "Nuit, pluie, et virages.", weather: "rain" },
  { name: "Canyon Mortel", env: "desert", time: 65, length: 2200, diff: 10, curve: 0.65, traffic: 0.35, obstacle: 0.32, desc: "Canyon étroit et dangereux.", weather: "clear" },
  { name: "Blizzard", env: "snow", time: 60, length: 2300, diff: 10, curve: 0.6, traffic: 0.3, obstacle: 0.35, desc: "Blizzard aveuglant.", weather: "fog" },
  { name: "Course Finale", env: "day", time: 60, length: 2500, diff: 10, curve: 0.65, traffic: 0.5, obstacle: 0.35, desc: "Le défi ultime de JEUX BY EDMOND.", weather: "clear" },
];

export const LEVELS: LevelConfig[] = LEVEL_DATA.map((d, i) => ({
  id: i + 1,
  name: d.name,
  timeLimit: d.time,
  trackLength: d.length,
  difficulty: d.diff,
  environment: d.env,
  curveIntensity: d.curve,
  trafficDensity: d.traffic,
  obstacleDensity: d.obstacle,
  description: d.desc,
  weather: d.weather,
}));

export function getLevelById(id: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

export const TOTAL_LEVELS = LEVELS.length;
