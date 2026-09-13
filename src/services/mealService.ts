import type { MealData, SchoolType, NutritionItem } from '../types/onboarding';

/**
 * Standard Korea Food Allergy Index Mapping (1 ~ 19)
 */
export const ALLERGY_NAMES: Record<string, string> = {
  '1': '난류(달걀)',
  '2': '우유',
  '3': '메밀',
  '4': '땅콩',
  '5': '대두(콩)',
  '6': '밀',
  '7': '고등어',
  '8': '게',
  '9': '새우',
  '10': '돼지고기',
  '11': '복숭아',
  '12': '토마토',
  '13': '아황산류',
  '14': '호두',
  '15': '닭고기',
  '16': '쇠고기',
  '17': '오징어',
  '18': '조개류(굴,전복,홍합)',
  '19': '잣',
};

// In-memory cache for school NEIS codes
const SCHOOL_CACHE: Record<string, { officeCode: string; schoolCode: string }> = {
  '숭곡중학교': { officeCode: 'B10', schoolCode: '7121370' },
  '진선여자중학교': { officeCode: 'B10', schoolCode: '7091456' },
};

/**
 * Search school information from NEIS OpenAPI
 */
export async function searchSchoolFromNEIS(schoolName: string): Promise<{ officeCode: string; schoolCode: string } | null> {
  const cached = SCHOOL_CACHE[schoolName];
  if (cached) return cached;

  try {
    const url = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pSize=5&SCHUL_NM=${encodeURIComponent(schoolName)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.schoolInfo?.[1]?.row?.[0]) {
      const row = data.schoolInfo[1].row[0];
      const result = {
        officeCode: row.ATPT_OFCDC_SC_CODE,
        schoolCode: row.SD_SCHUL_CODE,
      };
      SCHOOL_CACHE[schoolName] = result;
      return result;
    }
  } catch (err) {
    console.warn('Failed to search school from NEIS:', err);
  }
  return null;
}

/**
 * Parse NEIS dish string to clean menu items and extract allergy food list
 */
function parseDishes(dishRaw: string): { menu: string[]; allergyList: string[] } {
  const rawItems = dishRaw.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
  const menu: string[] = [];
  const allergyCodes = new Set<string>();

  for (const item of rawItems) {
    // Extract allergy numbers (e.g. "보리밥", "냉이된장국5.6.13.", "홍합살미역국 (5.6.18)")
    const match = item.match(/\(?([\d.]+)\)?$/);
    if (match) {
      const nums = match[1].split('.').filter(Boolean);
      nums.forEach((n) => allergyCodes.add(n));
    }
    // Clean dish name by removing allergy numbers and brackets
    const cleanName = item
      .replace(/\(?[\d.]+\)?/g, '')
      .replace(/\((중|석|초|고)\)/g, '')
      .replace(/&amp;/g, '&')
      .trim();

    if (cleanName && !menu.includes(cleanName)) {
      menu.push(cleanName);
    }
  }

  // Convert collected allergy numbers to friendly Korean names
  const allergyList = Array.from(allergyCodes)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((code) => ALLERGY_NAMES[code])
    .filter(Boolean);

  return { menu, allergyList };
}

/**
 * Parse NEIS nutrition info string into structured NutritionItem array
 */
function parseNutrition(ntrRaw: string): NutritionItem[] {
  if (!ntrRaw) return [];
  return ntrRaw
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, amountPart] = line.split(':').map((s) => s.trim());
      // Friendly rename
      let name = namePart || '';
      name = name.replace(/\(g\)|\(mg\)|\(R\.E\)/g, '').trim();
      return {
        name: name || '영양소',
        amount: amountPart || '',
      };
    })
    .filter((n) => ['단백질', '칼슘', '비타민C', '철분', '비타민A', '티아민', '리보플라빈', '탄수화물'].includes(n.name));
}

/**
 * Default fallback meal when no online data available
 */
const DEFAULT_FALLBACK_MEAL: MealData = {
  date: '2026-09-13',
  schoolName: '숭곡중학교',
  menu: ['현미밥', '미역국', '불고기', '채소샐러드', '김치', '과일'],
  nutritionInfo: '단백질 35.2g · 칼슘 420mg · 비타민C 25mg',
  allergyInfo: '대두, 밀, 쇠고기, 아황산류 포함',
  allergyList: ['대두(콩)', '밀', '쇠고기', '아황산류'],
  nutritionList: [
    { name: '단백질', amount: '35.2g' },
    { name: '칼슘', amount: '420.0mg' },
    { name: '비타민C', amount: '25.0mg' },
    { name: '철분', amount: '4.8mg' },
  ],
  isRealNeis: false,
};

/**
 * Primary Service function to retrieve school meal from actual NEIS Open API
 */
export async function getMealBySchoolAndDate(
  schoolName: string,
  date: string,
  _schoolType?: SchoolType
): Promise<MealData> {
  const targetDateStr = date || '2026-09-13';
  const ymd = targetDateStr.replace(/-/g, '');

  try {
    // 1. Get School NEIS Codes
    const schoolCodes = await searchSchoolFromNEIS(schoolName || '숭곡중학교');
    const officeCode = schoolCodes?.officeCode || 'B10';
    const schoolCode = schoolCodes?.schoolCode || '7121370';

    // 2. Fetch Meal from NEIS API for this specific date
    const directUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=1&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${ymd}`;
    let res = await fetch(directUrl);
    let data = await res.json();
    let row = data?.mealServiceDietInfo?.[1]?.row?.[0];

    // 3. If no meal on this date (weekend/vacation), fetch recent semester meal for this school
    if (!row) {
      const recentUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=5&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}`;
      res = await fetch(recentUrl);
      data = await res.json();
      row = data?.mealServiceDietInfo?.[1]?.row?.[0];
    }

    if (row && row.DDISH_NM) {
      const { menu, allergyList } = parseDishes(row.DDISH_NM);
      const nutritionList = parseNutrition(row.NTR_INFO || '');

      const allergyInfoText = allergyList.length > 0
        ? allergyList.join(', ') + ' 포함'
        : '특이 알레르기 유발 물질 없음';

      const nutritionInfoText = nutritionList.length > 0
        ? nutritionList.slice(0, 3).map((n) => `${n.name} ${n.amount}`).join(' · ')
        : '필수 영양소 고루 포함';

      return {
        date: targetDateStr,
        schoolName: row.SCHUL_NM || schoolName,
        menu: menu.length > 0 ? menu : DEFAULT_FALLBACK_MEAL.menu,
        nutritionInfo: nutritionInfoText,
        allergyInfo: allergyInfoText,
        allergyList,
        nutritionList,
        isRealNeis: true,
      };
    }
  } catch (err) {
    console.warn('NEIS meal fetch error, fallback applied:', err);
  }

  // Fallback if network fails
  return {
    ...DEFAULT_FALLBACK_MEAL,
    date: targetDateStr,
    schoolName: schoolName || DEFAULT_FALLBACK_MEAL.schoolName,
  };
}

/**
 * Helper to get matching food emoji icon for menu items
 */
export function getMenuIcon(item: string): string {
  if (item.includes('밥') || item.includes('라이스') || item.includes('덮밥')) return '🍚';
  if (item.includes('국') || item.includes('탕') || item.includes('찌개') || item.includes('사발')) return '🥣';
  if (item.includes('고기') || item.includes('불고기') || item.includes('갈비') || item.includes('닭') || item.includes('돈가스') || item.includes('제육') || item.includes('수육')) return '🥩';
  if (item.includes('샐러드') || item.includes('채소') || item.includes('나물') || item.includes('숙회') || item.includes('생채') || item.includes('무침') || item.includes('쌈')) return '🥗';
  if (item.includes('김치') || item.includes('깍두기') || item.includes('겉절이')) return '🥬';
  if (item.includes('과일') || item.includes('사과') || item.includes('포도') || item.includes('토마토') || item.includes('바나나') || item.includes('딸기') || item.includes('오렌지')) return '🍎';
  if (item.includes('생선') || item.includes('구이') || item.includes('조림') || item.includes('삼치')) return '🐟';
  if (item.includes('두부') || item.includes('달걀') || item.includes('계란') || item.includes('프라이') || item.includes('전')) return '🍳';
  if (item.includes('우유') || item.includes('요거트') || item.includes('요구르트') || item.includes('주스')) return '🥛';
  if (item.includes('떡') || item.includes('케이크') || item.includes('빵')) return '🧁';
  return '🍽️';
}
