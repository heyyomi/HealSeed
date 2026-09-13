import type { AdminDashboardStats, HabitProgressItem } from '../types/admin';
import { getFormattedDate } from '../utils/seedRules';

/**
 * Admin Service: Provides school-level aggregated wellness statistics.
 * 
 * Future Firestore Integration:
 * - Aggregate queries on `/schools/{schoolCode}/dailyAggregates/{date}`
 * - Aggregated count on `/users` where schoolCode == schoolCode
 * - Sensitive personal health information (weight, BMI, calorie burned, personal photos)
 *   are strictly NEVER aggregated or exposed to admin dashboard.
 */

export const getMockAdminStats = (schoolName: string = '숭곡중학교'): AdminDashboardStats => {
  return {
    schoolName,
    date: getFormattedDate(),
    totalUsers: 324,
    todayParticipants: 184,
    participationRate: 57,
    todaySeed: 328,
    habits: [
      {
        id: 'meal',
        name: '식사습관 (골고루 먹기)',
        icon: '🍽️',
        percentage: 82,
        completedCount: 151,
        totalCount: 184,
      },
      {
        id: 'mind',
        name: '마음 돌보기 (기분 체크)',
        icon: '💚',
        percentage: 76,
        completedCount: 140,
        totalCount: 184,
      },
      {
        id: 'water',
        name: '물 마시기 (수분 섭취)',
        icon: '💧',
        percentage: 71,
        completedCount: 131,
        totalCount: 184,
      },
      {
        id: 'activity',
        name: '몸 움직이기 (신체활동)',
        icon: '🏃',
        percentage: 64,
        completedCount: 118,
        totalCount: 184,
      },
    ],
    studentStats: {
      totalUsers: 280,
      todayParticipants: 160,
      rate: 57,
    },
    staffStats: {
      totalUsers: 44,
      todayParticipants: 24,
      rate: 55,
    },
    characterPreferences: [
      { characterId: 'rabbit', name: '토끼', count: 81, percentage: 25, color: '#EC4899' },
      { characterId: 'sprout', name: '새싹', count: 74, percentage: 23, color: '#22C55E' },
      { characterId: 'chick', name: '삐약', count: 62, percentage: 19, color: '#F59E0B' },
      { characterId: 'cat', name: '냥', count: 56, percentage: 17, color: '#8B5CF6' },
      { characterId: 'bear', name: '곰', count: 51, percentage: 16, color: '#3B82F6' },
    ],
    goalDistributions: [
      { category: '수분', icon: '💧', percentage: 31 },
      { category: '식사', icon: '🍽️', percentage: 22 },
      { category: '움직임', icon: '🏃', percentage: 18 },
      { category: '마음', icon: '💚', percentage: 15 },
      { category: '휴식', icon: '😴', percentage: 14 },
    ],
  };
};

export interface ParticipationFilteredData {
  timeRange: 'today' | 'week';
  userTypeFilter: 'all' | 'student' | 'staff';
  totalUsers: number;
  participants: number;
  participationRate: number;
  totalSeed: number;
  weeklyGoalCompletionRate: number;
  habits: HabitProgressItem[];
}

export const getFilteredParticipationData = (
  timeRange: 'today' | 'week',
  userTypeFilter: 'all' | 'student' | 'staff'
): ParticipationFilteredData => {
  const isWeek = timeRange === 'week';

  let totalUsers = 324;
  let participants = isWeek ? 312 : 184;
  let totalSeed = isWeek ? 2180 : 328;
  let weeklyGoalCompletionRate = 84;

  if (userTypeFilter === 'student') {
    totalUsers = 280;
    participants = isWeek ? 270 : 160;
    totalSeed = isWeek ? 1890 : 285;
  } else if (userTypeFilter === 'staff') {
    totalUsers = 44;
    participants = isWeek ? 42 : 24;
    totalSeed = isWeek ? 290 : 43;
  }

  const rate = Math.round((participants / totalUsers) * 100);

  const habits: HabitProgressItem[] = [
    {
      id: 'meal',
      name: '골고루 식사하기',
      icon: '🍽️',
      percentage: isWeek ? 85 : 82,
      completedCount: Math.round(participants * (isWeek ? 0.85 : 0.82)),
      totalCount: participants,
    },
    {
      id: 'mind',
      name: '마음 돌보기',
      icon: '💚',
      percentage: isWeek ? 79 : 76,
      completedCount: Math.round(participants * (isWeek ? 0.79 : 0.76)),
      totalCount: participants,
    },
    {
      id: 'water',
      name: '수분 충분히 섭취하기',
      icon: '💧',
      percentage: isWeek ? 74 : 71,
      completedCount: Math.round(participants * (isWeek ? 0.74 : 0.71)),
      totalCount: participants,
    },
    {
      id: 'activity',
      name: '가볍게 몸 움직이기',
      icon: '🏃',
      percentage: isWeek ? 68 : 64,
      completedCount: Math.round(participants * (isWeek ? 0.68 : 0.64)),
      totalCount: participants,
    },
  ];

  return {
    timeRange,
    userTypeFilter,
    totalUsers,
    participants,
    participationRate: rate,
    totalSeed,
    weeklyGoalCompletionRate,
    habits,
  };
};
