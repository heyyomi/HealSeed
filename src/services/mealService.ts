import type { MealData, SchoolType, NutritionItem, SchoolSearchResult } from '../types/onboarding';

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

// Known school presets for instant matching
const PRESET_SCHOOLS: SchoolSearchResult[] = [
  {
    schoolName: '숭곡중학교',
    schoolType: 'middle',
    officeCode: 'B10',
    schoolCode: '7121370',
    location: '서울특별시 성북구',
  },
  {
    schoolName: '진선여자중학교',
    schoolType: 'middle',
    officeCode: 'B10',
    schoolCode: '7091456',
    location: '서울특별시 강남구',
  },
  {
    schoolName: '서울고등학교',
    schoolType: 'high',
    officeCode: 'B10',
    schoolCode: '7010084',
    location: '서울특별시 서초구',
  },
  {
    schoolName: '서울초등학교',
    schoolType: 'elementary',
    officeCode: 'B10',
    schoolCode: '7021111',
    location: '서울특별시',
  },
];

/**
 * Parse NEIS school type string to application SchoolType
 */
function parseSchoolType(typeName: string): SchoolType {
  if (typeName?.includes('초등')) return 'elementary';
  if (typeName?.includes('고등')) return 'high';
  return 'middle';
}

/**
 * Search official schools in real-time from NEIS OpenAPI
 * Handles partial inputs like "숭곡중", "서울고", etc.
 */
export async function searchSchoolsFromNEIS(keyword: string): Promise<SchoolSearchResult[]> {
  const trimmed = keyword.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const url = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pSize=8&SCHUL_NM=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('NEIS school API response not ok');
    const data = await res.json();
    const rows = data?.schoolInfo?.[1]?.row;

    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map((r: any) => ({
        schoolName: r.SCHUL_NM,
        schoolType: parseSchoolType(r.SCHUL_KND_SC_NM),
        officeCode: r.ATPT_OFCDC_SC_CODE,
        schoolCode: r.SD_SCHUL_CODE,
        location: r.ORG_RDNMA || r.LCTN_SC_NM || '전국',
      }));
    }
  } catch (err) {
    console.warn('Realtime NEIS school search error:', err);
  }

  // Fallback to presets matching
  return PRESET_SCHOOLS.filter(
    (p) => p.schoolName.includes(trimmed) || trimmed.includes(p.schoolName.replace('학교', ''))
  );
}

/**
 * Check if the given date is a weekend (Saturday or Sunday)
 */
export function isWeekend(dateStr: string): boolean {
  try {
    if (!dateStr) return false;
    const clean = dateStr.replace(/[^\d]/g, '');
    if (clean.length === 8) {
      const y = parseInt(clean.slice(0, 4), 10);
      const m = parseInt(clean.slice(4, 6), 10);
      const d = parseInt(clean.slice(6, 8), 10);
      const dateObj = new Date(y, m - 1, d);
      const day = dateObj.getDay();
      return day === 0 || day === 6; // 0: Sunday, 6: Saturday
    }
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 || day === 6;
  } catch {
    return false;
  }
}

/**
 * Parse NEIS dish string to clean menu items and extract allergy food list
 */
function parseDishes(dishRaw: string): { menu: string[]; allergyList: string[] } {
  const rawItems = dishRaw.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
  const menu: string[] = [];
  const allergyCodes = new Set<string>();

  for (const item of rawItems) {
    const match = item.match(/\(?([\d.]+)\)?$/);
    if (match) {
      const nums = match[1].split('.').filter(Boolean);
      nums.forEach((n) => allergyCodes.add(n));
    }
    const cleanName = item
      .replace(/\(?[\d.]+\)?/g, '')
      .replace(/\((중|석|초|고)\)/g, '')
      .replace(/&amp;/g, '&')
      .replace(/[\*\/\#]+$/g, '')
      .trim();

    if (cleanName && !menu.includes(cleanName)) {
      menu.push(cleanName);
    }
  }

  const allergyList = Array.from(allergyCodes)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((code) => ALLERGY_NAMES[code])
    .filter(Boolean);

  return { menu, allergyList };
}

/**
 * Parse NEIS nutrition info string into structured NutritionItem array
 * Supports 탄수화물, 단백질, 지방, 칼슘, 비타민C, 철분, 비타민A, 티아민, 리보플라빈
 */
function parseNutrition(ntrRaw: string): NutritionItem[] {
  if (!ntrRaw) return [];
  return ntrRaw
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, amountPart] = line.split(':').map((s) => s.trim());
      let name = namePart || '';
      let unit = '';
      const unitMatch = name.match(/\((g|mg|R\.E)\)/i);
      if (unitMatch) {
        unit = unitMatch[1];
      }
      name = name.replace(/\(g\)|\(mg\)|\(R\.E\)/gi, '').trim();
      let amount = amountPart || '';
      if (amount && unit && !amount.toLowerCase().includes(unit.toLowerCase())) {
        amount = `${amount} ${unit}`.trim();
      }
      return {
        name: name || '영양소',
        amount: amount,
      };
    })
    .filter((n) => ['열량', '탄수화물', '단백질', '지방', '칼슘', '비타민C', '철분', '비타민A', '티아민', '리보플라빈'].includes(n.name));
}

/**
 * Retrieve school meal strictly following academic schedule:
 * - Saturday / Sunday: No meal ("주말에는 급식이 없는 날이에요")
 * - Weekday: Fetches real NEIS OpenAPI meal, or clear "No meal" status if holiday/vacation.
 */
export async function getMealBySchoolAndDate(
  schoolName: string,
  date: string,
  _schoolType?: SchoolType
): Promise<MealData> {
  const targetDateStr = date || '2026-09-13';

  // Resolve official school name and codes
  let officialName = schoolName || '숭곡중학교';
  let officeCode = 'B10';
  let schoolCode = '7121370';

  try {
    const schools = await searchSchoolsFromNEIS(schoolName || '숭곡중학교');
    if (schools && schools.length > 0) {
      officialName = schools[0].schoolName;
      officeCode = schools[0].officeCode;
      schoolCode = schools[0].schoolCode;
    }
  } catch {
    // fallback
  }

  // 1. Check Weekend (Saturday or Sunday)
  if (isWeekend(targetDateStr)) {
    return {
      date: targetDateStr,
      schoolName: officialName,
      menu: [],
      calories: null,
      nutritionInfo: null,
      allergyInfo: null,
      allergyList: [],
      nutritionList: [],
      isRealNeis: true,
      isNoMealDay: true,
      noMealReason: '주말(토·일요일)에는 학교 급식이 운영되지 않아요',
    };
  }

  // 2. Weekday - Fetch from NEIS OpenAPI
  const ymd = targetDateStr.replace(/-/g, '');

  try {
    const directUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=1&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${ymd}`;
    const res = await fetch(directUrl);
    const data = await res.json();
    const row = data?.mealServiceDietInfo?.[1]?.row?.[0];

    if (row && row.DDISH_NM) {
      const { menu, allergyList } = parseDishes(row.DDISH_NM);
      const nutritionList = parseNutrition(row.NTR_INFO || '');

      const allergyInfoText = allergyList.length > 0
        ? allergyList.join(', ') + ' 포함'
        : '특이 알레르기 유발 물질 없음';

      const nutritionInfoText = nutritionList.length > 0
        ? nutritionList.slice(0, 3).map((n) => `${n.name} ${n.amount}`).join(' · ')
        : '필수 영양소 고루 포함';

      const calorieText = row.CAL_INFO ? row.CAL_INFO.trim() : null;

      return {
        date: targetDateStr,
        schoolName: officialName || schoolName,
        menu,
        calories: calorieText,
        nutritionInfo: nutritionInfoText,
        allergyInfo: allergyInfoText,
        allergyList,
        nutritionList,
        isRealNeis: true,
        isNoMealDay: false,
      };
    }

    // If weekday but no record (e.g. school anniversary, exam period, or semester break)
    // Try to get latest semester meal for preview if user wants to see sample, or report no meal scheduled
    return {
      date: targetDateStr,
      schoolName: officialName || schoolName,
      menu: [],
      calories: null,
      nutritionInfo: null,
      allergyInfo: null,
      allergyList: [],
      nutritionList: [],
      isRealNeis: true,
      isNoMealDay: true,
      noMealReason: '오늘 학교 급식 일정이 없습니다 (휴업일 또는 방학)',
    };
  } catch (err) {
    console.warn('NEIS weekday meal fetch error:', err);
  }

  // Safe fallback if network failure
  return {
    date: targetDateStr,
    schoolName: schoolName || '숭곡중학교',
    menu: [],
    calories: null,
    nutritionInfo: null,
    allergyInfo: null,
    allergyList: [],
    nutritionList: [],
    isRealNeis: true,
    isNoMealDay: true,
    noMealReason: '급식 정보를 불러오는 중입니다',
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
