import type { MealData, SchoolType } from '../types/onboarding';

/**
 * Mock Meal Repository for School Meals
 * Keyed by date (YYYY-MM-DD)
 */
const MOCK_MEALS_BY_DATE: Record<string, string[]> = {
  '2026-09-13': ['현미밥', '미역국', '불고기', '채소샐러드', '김치', '과일'],
  '2026-09-14': ['차조밥', '얼갈이배추된장국', '닭볶음탕', '시금치나물', '깍두기', '요거트'],
  '2026-09-15': ['흑미밥', '콩나물맑은국', '연어스테이크구이', '단호박샐러드', '열무김치', '방울토마토'],
  '2026-09-16': ['보리밥', '쇠고기무국', '두부조림', '오이도라지생채', '배추김치', '사과'],
  '2026-09-17': ['기장밥', '황태미역국', '돼지갈비찜', '브로콜리숙회', '총각김치', '포도'],
};

const DEFAULT_MENU = ['현미밥', '미역국', '불고기', '채소샐러드', '김치', '과일'];

/**
 * Service function to retrieve school meal for a given school and date.
 * Currently serves mock data, ready for NEIS OpenAPI integration in future steps.
 *
 * @param schoolName Name of the school (e.g., "숭곡중학교")
 * @param date Date formatted as YYYY-MM-DD
 * @param _schoolType Optional School type ('elementary' | 'middle' | 'high')
 * @returns Promise<MealData>
 */
export async function getMealBySchoolAndDate(
  schoolName: string,
  date: string,
  _schoolType?: SchoolType
): Promise<MealData> {
  // Simulate network latency if needed
  await new Promise((resolve) => setTimeout(resolve, 50));

  const menu = MOCK_MEALS_BY_DATE[date] || DEFAULT_MENU;

  return {
    date,
    schoolName: schoolName || '우리학교',
    menu,
    nutritionInfo: null, // "급식 정보 연결 준비 중"
    allergyInfo: null,   // "급식 정보 연결 준비 중"
  };
}

/**
 * Helper to get matching food emoji icon for menu items
 */
export function getMenuIcon(item: string): string {
  if (item.includes('밥') || item.includes('라이스')) return '🍚';
  if (item.includes('국') || item.includes('탕') || item.includes('찌개')) return '🥣';
  if (item.includes('고기') || item.includes('불고기') || item.includes('갈비') || item.includes('닭') || item.includes('돈가스')) return '🥩';
  if (item.includes('샐러드') || item.includes('채소') || item.includes('나물') || item.includes('숙회') || item.includes('생채')) return '🥗';
  if (item.includes('김치') || item.includes('깍두기')) return '🥬';
  if (item.includes('과일') || item.includes('사과') || item.includes('포도') || item.includes('토마토') || item.includes('바나나')) return '🍎';
  if (item.includes('생선') || item.includes('연어') || item.includes('구이')) return '🐟';
  if (item.includes('두부') || item.includes('달걀') || item.includes('계란')) return '🍳';
  if (item.includes('우유') || item.includes('요거트') || item.includes('주스')) return '🥛';
  return '🍽️';
}
