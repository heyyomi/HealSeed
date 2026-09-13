import type { LevelNumber } from '../types/onboarding';

export interface ConditionOption {
  level: LevelNumber;
  label: string;
  emoji: string;
  description: string;
  expressionHint: string;
}

export const CONDITION_OPTIONS: ConditionOption[] = [
  {
    level: 1,
    label: '아주 좋아요',
    emoji: '😄',
    description: '에너지가 넘치고 기분이 아주 좋아요',
    expressionHint: '활짝 웃는 표정',
  },
  {
    level: 2,
    label: '좋아요',
    emoji: '🙂',
    description: '편안하고 기분 좋은 상태예요',
    expressionHint: '따뜻하게 미소 짓는 표정',
  },
  {
    level: 3,
    label: '보통이에요',
    emoji: '😐',
    description: '무난하고 평온한 하루예요',
    expressionHint: '차분하고 편안한 표정',
  },
  {
    level: 4,
    label: '조금 지쳐요',
    emoji: '😮💨',
    description: '몸이나 마음이 조금 지쳐서 휴식이 필요해요',
    expressionHint: '후~ 하고 숨을 내쉬는 표정',
  },
  {
    level: 5,
    label: '많이 피곤해요',
    emoji: '😴',
    description: '충분한 수면과 따뜻한 쉼이 필요해요',
    expressionHint: '눈을 감고 잠든 편안한 표정',
  },
];

export const getConditionByLevel = (level?: number): ConditionOption | undefined => {
  if (!level) return undefined;
  return CONDITION_OPTIONS.find((c) => c.level === level);
};
