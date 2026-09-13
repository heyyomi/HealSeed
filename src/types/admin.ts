export type HabitCategory = 'meal' | 'water' | 'activity' | 'mind' | 'rest';

export interface HabitProgressItem {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  completedCount: number;
  totalCount: number;
}

export interface UserTypeParticipation {
  totalUsers: number;
  todayParticipants: number;
  rate: number;
}

export interface CharacterPreference {
  characterId: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GoalDistribution {
  category: string;
  icon: string;
  percentage: number;
}

export interface AdminDashboardStats {
  schoolName: string;
  date: string;
  totalUsers: number;
  todayParticipants: number;
  participationRate: number;
  todaySeed: number;
  habits: HabitProgressItem[];
  studentStats: UserTypeParticipation;
  staffStats: UserTypeParticipation;
  characterPreferences: CharacterPreference[];
  goalDistributions: GoalDistribution[];
}

export interface SchoolChallenge {
  id: string;
  title: string;
  description: string;
  habitType: HabitCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  goalSeed: number;
  currentSeed: number;
  participantCount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export type AdminTab = 'dashboard' | 'participation' | 'challenges' | 'settings';
