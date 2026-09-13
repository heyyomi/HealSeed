import type { SchoolChallenge } from '../types/admin';

const STORAGE_KEY = 'healseed_admin_challenges_v1';

const INITIAL_CHALLENGES: SchoolChallenge[] = [
  {
    id: 'ch-water-01',
    title: '우리 학교 물 마시기 챌린지',
    description: '이번 주에는 물 마시기 습관을 함께 키워봐요! 틈틈이 물 한 잔으로 상쾌한 하루를 보내요.',
    habitType: 'water',
    startDate: '2026-09-14',
    endDate: '2026-09-20',
    goalSeed: 1000,
    currentSeed: 728,
    participantCount: 184,
    isActive: true,
    createdBy: '보건교사',
    createdAt: '2026-09-13T09:00:00.000Z',
  },
  {
    id: 'ch-walk-02',
    title: '점심시간 10분 가벼운 산책 챌린지',
    description: '식사 후 친구와 함께 복도나 운동장을 기분 좋게 10분 거닐며 활력을 충전해요.',
    habitType: 'activity',
    startDate: '2026-09-07',
    endDate: '2026-09-13',
    goalSeed: 800,
    currentSeed: 800,
    participantCount: 192,
    isActive: false,
    createdBy: '보건교사',
    createdAt: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'ch-meal-03',
    title: '새로운 반찬 한 입 맛보기 챌린지',
    description: '평소 먹지 않던 채소나 반찬도 호기심을 갖고 한 입씩 맛보는 건강한 식사 경험을 함께해요.',
    habitType: 'meal',
    startDate: '2026-09-21',
    endDate: '2026-09-27',
    goalSeed: 1200,
    currentSeed: 0,
    participantCount: 0,
    isActive: false,
    createdBy: '보건교사',
    createdAt: '2026-09-13T10:00:00.000Z',
  },
];

/**
 * Challenge Service: LocalStorage implementation ready for Firestore migration.
 * 
 * Future Firestore Integration:
 * - Read: `collection(firestore, 'challenges')`
 * - Write: `addDoc(collection(firestore, 'challenges'), data)`
 * - Update: `updateDoc(doc(firestore, 'challenges', id), { isActive: ... })`
 */
export const getChallenges = (): SchoolChallenge[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_CHALLENGES;
};

export const saveChallenges = (challenges: SchoolChallenge[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  } catch {
    // ignore
  }
};

export const createChallenge = (
  input: Omit<SchoolChallenge, 'id' | 'currentSeed' | 'participantCount' | 'createdAt'>
): SchoolChallenge => {
  const current = getChallenges();
  const newChallenge: SchoolChallenge = {
    ...input,
    id: `ch-${Date.now()}`,
    currentSeed: 0,
    participantCount: 0,
    createdAt: new Date().toISOString(),
  };

  const updated = [newChallenge, ...current];
  saveChallenges(updated);
  return newChallenge;
};

export const toggleChallengeActive = (id: string): SchoolChallenge[] => {
  const current = getChallenges();
  const updated = current.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
  saveChallenges(updated);
  return updated;
};

export const deleteChallenge = (id: string): SchoolChallenge[] => {
  const current = getChallenges();
  const updated = current.filter((c) => c.id !== id);
  saveChallenges(updated);
  return updated;
};
