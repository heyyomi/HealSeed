import type { WeeklyGoal, WeeklyGoalHabitType, PrimaryHabitKey } from '../types/onboarding';

export interface PresetGoalOption {
  habitType: 'meal' | 'water' | 'activity' | 'mind';
  primaryHabitKey: PrimaryHabitKey;
  icon: string;
  title: string;
  subtitle: string;
}

export const PRESET_GOAL_OPTIONS: PresetGoalOption[] = [
  {
    habitType: 'meal',
    primaryHabitKey: 'balancedMeal',
    icon: '🥗',
    title: '골고루 먹기',
    subtitle: '급식 반찬과 밥을 골고루 섭취해요',
  },
  {
    habitType: 'water',
    primaryHabitKey: 'water',
    icon: '💧',
    title: '물 자주 마시기',
    subtitle: '하루 동안 틈틈이 물을 충분히 마셔요',
  },
  {
    habitType: 'activity',
    primaryHabitKey: 'activity',
    icon: '🏃',
    title: '하루 한 번 몸 움직이기',
    subtitle: '가벼운 스트레칭과 산책으로 활력을 얻어요',
  },
  {
    habitType: 'mind',
    primaryHabitKey: 'mindCare',
    icon: '💚',
    title: '내 마음 돌보기',
    subtitle: '잠깐의 심호흡과 휴식으로 마음을 다독여요',
  },
];

/**
 * Returns Monday date of the week in YYYY-MM-DD format
 */
export function getWeekStartDate(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dateNum = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dateNum}`;
}

export function mapHabitTypeToKey(type: WeeklyGoalHabitType): PrimaryHabitKey | null {
  switch (type) {
    case 'meal':
      return 'balancedMeal';
    case 'water':
      return 'water';
    case 'activity':
      return 'activity';
    case 'mind':
      return 'mindCare';
    default:
      return null;
  }
}

export function mapKeyToHabitType(key: PrimaryHabitKey): WeeklyGoalHabitType {
  switch (key) {
    case 'balancedMeal':
      return 'meal';
    case 'water':
      return 'water';
    case 'activity':
      return 'activity';
    case 'mindCare':
      return 'mind';
  }
}

/**
 * Validates and ensures weekly goal is set up for current week,
 * rolling over completedDates when week changes.
 */
export function ensureWeeklyGoal(goal?: Partial<WeeklyGoal>, now: Date = new Date()): WeeklyGoal {
  const currentWeekStart = getWeekStartDate(now);

  const defaultGoal: WeeklyGoal = {
    type: 'preset',
    habitType: 'water',
    title: '물 자주 마시기',
    targetDays: 3,
    completedDates: [],
    weekStartDate: currentWeekStart,
  };

  if (!goal) return defaultGoal;

  const type = goal.type || 'preset';
  const legacyGoal = goal as Partial<WeeklyGoal> & {
    habitKey?: PrimaryHabitKey;
    habitName?: string;
  };
  const habitType: WeeklyGoalHabitType = type === 'custom'
    ? null
    : goal.habitType || (legacyGoal.habitKey ? mapKeyToHabitType(legacyGoal.habitKey) : 'water');
  const targetDays = [2, 3, 5].includes(goal.targetDays as number) ? (goal.targetDays as number) : 3;

  let title = goal.title || '물 자주 마시기';
  if (type === 'preset' && habitType) {
    const preset = PRESET_GOAL_OPTIONS.find((p) => p.habitType === habitType);
    if (preset) title = preset.title;
  }

  const completedDates = goal.weekStartDate === currentWeekStart && Array.isArray(goal.completedDates)
    ? [...new Set(goal.completedDates)].filter((date) => {
      const parsed = new Date(`${date}T00:00:00`);
      return !Number.isNaN(parsed.getTime()) && getWeekStartDate(parsed) === currentWeekStart;
    }).sort()
    : [];

  return {
    type,
    habitType,
    title,
    targetDays,
    completedDates,
    weekStartDate: currentWeekStart,
  };
}

export function getGoalIcon(goal: WeeklyGoal): string {
  if (goal.type === 'preset' && goal.habitType) {
    const preset = PRESET_GOAL_OPTIONS.find((p) => p.habitType === goal.habitType);
    if (preset) return preset.icon;
  }
  return '🌱';
}
