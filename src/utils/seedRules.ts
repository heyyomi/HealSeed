import type { CharacterId, LevelNumber } from '../types/onboarding';

export interface LevelInfo {
  level: LevelNumber;
  levelName: string;
  minSeed: number;
  maxSeed: number;
  nextLevelSeed: number | null;
  progressPercent: number; // 0 ~ 100
  progressLabel: string;   // e.g. "6 / 10 Seed", "완전체가 되었어요!"
  levelRangeLabel: string; // e.g. "0~9 Seed"
}

export const LEVEL_CONFIGS: Record<LevelNumber, {
  level: LevelNumber;
  levelName: string;
  minSeed: number;
  maxSeed: number;
  nextLevelTarget: number | null;
  rangeLabel: string;
}> = {
  1: {
    level: 1,
    levelName: '시작',
    minSeed: 0,
    maxSeed: 9,
    nextLevelTarget: 10,
    rangeLabel: '0~9 Seed',
  },
  2: {
    level: 2,
    levelName: '반짝',
    minSeed: 10,
    maxSeed: 29,
    nextLevelTarget: 30,
    rangeLabel: '10~29 Seed',
  },
  3: {
    level: 3,
    levelName: '쑥쑥',
    minSeed: 30,
    maxSeed: 59,
    nextLevelTarget: 60,
    rangeLabel: '30~59 Seed',
  },
  4: {
    level: 4,
    levelName: '튼튼',
    minSeed: 60,
    maxSeed: 99,
    nextLevelTarget: 100,
    rangeLabel: '60~99 Seed',
  },
  5: {
    level: 5,
    levelName: '완전체',
    minSeed: 100,
    maxSeed: Infinity,
    nextLevelTarget: null,
    rangeLabel: '100 Seed 이상',
  },
};

/**
 * Calculate level, next stage target, and progress bar info strictly based on accumulated Seed.
 */
export function calculateLevelInfo(seed: number): LevelInfo {
  const safeSeed = Math.max(0, Math.floor(seed));

  if (safeSeed <= 9) {
    const target = 10;
    const percent = Math.min(100, Math.round((safeSeed / target) * 100));
    return {
      level: 1,
      levelName: '시작',
      minSeed: 0,
      maxSeed: 9,
      nextLevelSeed: target,
      progressPercent: percent,
      progressLabel: `${safeSeed} / ${target} Seed`,
      levelRangeLabel: '0~9 Seed',
    };
  }

  if (safeSeed <= 29) {
    const target = 30;
    const percent = Math.min(100, Math.round((safeSeed / target) * 100));
    return {
      level: 2,
      levelName: '반짝',
      minSeed: 10,
      maxSeed: 29,
      nextLevelSeed: target,
      progressPercent: percent,
      progressLabel: `${safeSeed} / ${target} Seed`,
      levelRangeLabel: '10~29 Seed',
    };
  }

  if (safeSeed <= 59) {
    const target = 60;
    const percent = Math.min(100, Math.round((safeSeed / target) * 100));
    return {
      level: 3,
      levelName: '쑥쑥',
      minSeed: 30,
      maxSeed: 59,
      nextLevelSeed: target,
      progressPercent: percent,
      progressLabel: `${safeSeed} / ${target} Seed`,
      levelRangeLabel: '30~59 Seed',
    };
  }

  if (safeSeed <= 99) {
    const target = 100;
    const percent = Math.min(100, Math.round((safeSeed / target) * 100));
    return {
      level: 4,
      levelName: '튼튼',
      minSeed: 60,
      maxSeed: 99,
      nextLevelSeed: target,
      progressPercent: percent,
      progressLabel: `${safeSeed} / ${target} Seed`,
      levelRangeLabel: '60~99 Seed',
    };
  }

  return {
    level: 5,
    levelName: '완전체',
    minSeed: 100,
    maxSeed: Infinity,
    nextLevelSeed: null,
    progressPercent: 100,
    progressLabel: '완전체가 되었어요!',
    levelRangeLabel: '100 Seed 이상',
  };
}

/**
 * Return specific growth stage image path for given character and level.
 * Path format: /assets/characters/${characterId}/level${level}.png
 */
export function getCharacterGrowthImage(characterId: CharacterId, level: LevelNumber): string {
  return `/assets/characters/${characterId}/level${level}.png`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function getFormattedDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
