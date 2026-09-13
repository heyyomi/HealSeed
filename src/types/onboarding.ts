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

export interface MovementActivity {
  id: string;
  icon: string;
  name: string;
  type: string;            // 활동 유형 (e.g. '서서 하는 전신 스트레칭', '목·어깨·허리 스트레칭', '가벼운 걷기', '저강도 리듬·댄스', '가벼운 맨몸 전신 활동')
  durationMinutes: number; // 기본 권장시간 (분)
  durationText?: string;   // 권장시간 텍스트 (e.g. '5분', '10분', '5~10분')
  location: string;        // 권장 장소 (e.g. '교실', '운동장 또는 복도', '넓은 공간', '체육공간')
  description: string;     // 활동 설명
  youtubeUrl?: string;     // 관리자 등록 YouTube URL
  videoSource?: string;    // 영상 출처명 (e.g. '국민건강보험공단')
  isActive: boolean;       // 활성/비활성 여부
  isFeatured: boolean;     // 오늘의 추천 여부
}

export interface MovementRecord {
  date: string;
  activityId: string;
  activityName: string;
  durationMinutes: number;
  completed: boolean;
  completedAt: string;
}

export interface UserCondition {
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  emoji: string;
  updatedAt: string;
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
  // Movement Record
  movementRecord?: MovementRecord;
  // Today's Condition
  condition?: UserCondition;
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

export type PrimaryHabitKey = 'balancedMeal' | 'water' | 'activity' | 'mindCare';

export interface WeeklyGoal {
  habitKey: PrimaryHabitKey; // 'water' (기본값)
  habitName: string;         // '물 자주 마시기'
  targetDays: number;        // e.g. 3
  targetSeed?: number;       // 레거시 호환
  title?: string;
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
