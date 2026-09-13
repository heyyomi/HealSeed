import type { MovementActivity } from '../types/onboarding';

const STORAGE_KEY = 'healseed_movement_activities_v1';

export const INITIAL_MOVEMENT_ACTIVITIES: MovementActivity[] = [
  {
    id: 'stretch-wake',
    icon: '🧘',
    name: '온몸 깨우기 스트레칭',
    type: '서서 하는 전신 스트레칭',
    durationMinutes: 5,
    durationText: '5분',
    location: '교실',
    description: '서서 가볍게 기지개를 켜며 굳어있던 온몸의 감각을 깨워봐요.',
    youtubeUrl: 'https://www.youtube.com/watch?v=0h94hT66tLg',
    videoSource: '국민건강보험공단',
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'stretch-chair',
    icon: '🪑',
    name: '앉아서 리프레시',
    type: '목·어깨·허리 스트레칭',
    durationMinutes: 5,
    durationText: '5분',
    location: '교실',
    description: '의자에 바르게 앉아 굳은 목과 어깨, 허리를 시원하게 풀어줘요.',
    youtubeUrl: 'https://www.youtube.com/watch?v=2L2lnxIcG18',
    videoSource: '대한스트레칭협회',
    isActive: true,
    isFeatured: false,
  },
  {
    id: 'walk-light',
    icon: '🚶',
    name: '가볍게 걷기',
    type: '가벼운 걷기',
    durationMinutes: 10,
    durationText: '10분',
    location: '운동장 또는 복도',
    description: '휴대폰은 잠시 내려놓고 운동장이나 복도를 가볍게 걸어볼까요?',
    youtubeUrl: '',
    videoSource: '',
    isActive: true,
    isFeatured: false,
  },
  {
    id: 'rhythm-dance',
    icon: '🎵',
    name: '신나는 리듬 움직임',
    type: '저강도 리듬·댄스',
    durationMinutes: 7,
    durationText: '5~10분',
    location: '넓은 공간',
    description: '신나는 음악 리듬에 맞춰 가볍게 스텝을 밟으며 활력을 충전해요.',
    youtubeUrl: 'https://www.youtube.com/watch?v=gCzgc_RelBA',
    videoSource: '학교체육진흥회',
    isActive: true,
    isFeatured: false,
  },
  {
    id: 'bodyweight-power',
    icon: '💪',
    name: '튼튼 전신 움직임',
    type: '가벼운 맨몸 전신 활동',
    durationMinutes: 10,
    durationText: '10분',
    location: '체육공간 또는 안전한 넓은 공간',
    description: '가벼운 맨몸 체조와 스트레칭으로 몸 전체에 생기를 불어넣어요.',
    youtubeUrl: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
    videoSource: '청소년건강체력교실',
    isActive: true,
    isFeatured: false,
  },
];

/**
 * Extract YouTube video ID from various YouTube URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export const extractYouTubeId = (url?: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // 1. youtu.be/ID
  const shortMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // 2. youtube.com/watch?v=ID or &v=ID
  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // 3. youtube.com/embed/ID
  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // 4. youtube.com/shorts/ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  return null;
};

/**
 * Validate whether input is a recognizable YouTube URL
 */
export const isValidYouTubeUrl = (url?: string): boolean => {
  return extractYouTubeId(url) !== null;
};

/**
 * Generate standard YouTube embed iframe URL
 */
export const getYouTubeEmbedUrl = (url?: string): string | null => {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
};

/**
 * Movement Service: LocalStorage implementation ready for Firestore migration.
 *
 * Future Firestore Integration:
 * - Read all: `collection(firestore, 'movementActivities')`
 * - Read active: `query(collection(firestore, 'movementActivities'), where('isActive', '==', true))`
 * - Update: `updateDoc(doc(firestore, 'movementActivities', activityId), data)`
 */
export const getMovementActivities = (): MovementActivity[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to initial
  }
  return INITIAL_MOVEMENT_ACTIVITIES;
};

export const saveAllMovementActivities = (activities: MovementActivity[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // ignore
  }
};

/**
 * Get active movement activities (used in student/staff view)
 */
export const getActiveMovementActivities = (): MovementActivity[] => {
  const all = getMovementActivities();
  const active = all.filter((a) => a.isActive);
  return active.length > 0 ? active : all;
};

/**
 * Get the single featured movement activity for today.
 * Prioritizes the active item with `isFeatured: true`.
 * If none is featured, falls back to the first active activity.
 */
export const getFeaturedMovement = (): MovementActivity => {
  const active = getActiveMovementActivities();
  const featured = active.find((a) => a.isFeatured);
  return featured || active[0] || INITIAL_MOVEMENT_ACTIVITIES[0];
};

/**
 * Update a specific movement activity (e.g. from Admin console)
 */
export const saveMovementActivity = (activity: MovementActivity): MovementActivity[] => {
  const all = getMovementActivities();
  let updated: MovementActivity[];

  // If this activity is set to featured, unset other featured activities
  if (activity.isFeatured) {
    updated = all.map((item) =>
      item.id === activity.id
        ? { ...activity }
        : { ...item, isFeatured: false }
    );
  } else {
    // If it was the only featured one and turned off, keep at least one featured if possible
    updated = all.map((item) => (item.id === activity.id ? { ...activity } : item));
    const hasFeatured = updated.some((a) => a.isFeatured && a.isActive);
    if (!hasFeatured) {
      const firstActiveIdx = updated.findIndex((a) => a.isActive);
      if (firstActiveIdx >= 0) {
        updated[firstActiveIdx].isFeatured = true;
      }
    }
  }

  saveAllMovementActivities(updated);
  return updated;
};

/**
 * Reset all movements to system defaults
 */
export const resetToDefaultMovements = (): MovementActivity[] => {
  saveAllMovementActivities(INITIAL_MOVEMENT_ACTIVITIES);
  return INITIAL_MOVEMENT_ACTIVITIES;
};
