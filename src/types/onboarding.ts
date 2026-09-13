export type UserType = 'student' | 'staff';

export type CharacterId = 'chick' | 'sprout' | 'rabbit' | 'bear' | 'cat';

export type SchoolType = 'elementary' | 'middle' | 'high';

export type LevelNumber = 1 | 2 | 3 | 4 | 5;

export interface CharacterItem {
  id: CharacterId;
  name: string;
  tagline: string;
  description: string;
  image: string;
  themeColor: string;
  bgColor: string;
  accentColor: string;
  keywords: string[];
}

export interface CharacterGrowthStory {
  level: LevelNumber;
  levelName: string;
  seedRange: string;
  storyTitle: string;
  storyDescription: string;
  itemBadge: string;
  unlockedItem: string;
}

export interface NutritionItem {
  name: string;
  amount: string;
}

export interface SchoolSearchResult {
  schoolName: string;
  schoolType: SchoolType;
  officeCode: string;
  schoolCode: string;
  location: string;
}

export interface MealData {
  date: string; // YYYY-MM-DD
  schoolName: string;
  menu: string[];
  calories?: string | null;
  nutritionInfo: string | null;
  allergyInfo: string | null;
  allergyList?: string[];
  nutritionList?: NutritionItem[];
  isRealNeis: boolean;
  isNoMealDay: boolean;
  noMealReason?: string;
}

export interface DailyRecord {
  date: string;
  // 4 Primary Seed Habits (Each +1 Seed, Max 4 Seed/day)
  balancedMeal: boolean; // 급식 골고루 먹기 / 골고루 먹어보았어요
  water: boolean;        // 물 충분히 마시기 / 물을 함께 마셨어요
  activity: boolean;     // 몸 움직이기
  mindCare: boolean;     // 마음 돌보기
  // Meal Specific Mindful Eating Habits
  slowEating: boolean;   // 천천히 식사했어요
  listenToBody: boolean; // 내 몸의 배고픔과 포만감에 귀 기울였어요
}

export interface UserProfile {
  nickname: string;
  userType: UserType;
  characterId: CharacterId;
  schoolName: string;
  schoolType: SchoolType;
  schoolCode: string | null;
  officeCode: string | null;
}

export interface MealRecord {
  date: string;
  mealImageUrl: string; // Compressed base64 dataURL / blob URL
  mealMemo?: string;
  createdAt: string;
}

export interface WeeklyGoal {
  targetSeed: number; // e.g. 15 Seed
  title: string;
}

export type UserRole = 'user' | 'admin';

export interface OnboardingState {
  step: 'welcome' | 'role' | 'character' | 'preview' | 'nickname' | 'school' | 'home';
  userType: UserType | null;
  role: UserRole; // 'user' (학생/교직원) | 'admin' (학교 보건교사/운영자)
  characterId: CharacterId | null;
  nickname: string;
  schoolName: string;
  schoolType: SchoolType;
  schoolCode: string | null;
  officeCode: string | null;
  seed: number;
  level: LevelNumber;
  dailyRecords: Record<string, DailyRecord>; // key: YYYY-MM-DD
  mealRecords: Record<string, MealRecord>;   // key: YYYY-MM-DD
  weeklyGoal: WeeklyGoal;
}
