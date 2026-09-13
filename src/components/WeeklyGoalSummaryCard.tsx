import React from 'react';
import { ArrowRight, Check, Edit3, Sparkles } from 'lucide-react';
import type { WeeklyGoal } from '../types/onboarding';
import { getGoalIcon } from '../utils/weeklyGoalUtils';
import './WeeklyGoalSummaryCard.css';

interface WeeklyGoalSummaryCardProps {
  goal: WeeklyGoal;
  currentDateString: string;
  onOpenEdit: () => void;
  onToggleCustomPractice?: (dateStr: string) => void;
  onPracticePreset?: () => void;
}

export const WeeklyGoalSummaryCard: React.FC<WeeklyGoalSummaryCardProps> = ({
  goal,
  currentDateString,
  onOpenEdit,
  onToggleCustomPractice,
  onPracticePreset,
}) => {
  const icon = getGoalIcon(goal);
  const isCustom = goal.type === 'custom';
  const practicedCount = goal.completedDates.length;
  const targetDays = goal.targetDays || 3;
  const isTargetAchieved = practicedCount >= targetDays;
  const isDoneToday = goal.completedDates.includes(currentDateString);

  // Generate dots representing targetDays
  const dots = Array.from({ length: targetDays }).map((_, idx) => idx < practicedCount);

  return (
    <div className="weekly-goal-summary-card animate-fade-in-up">
      <div className="goal-card-top-row">
        <div className="goal-label-wrap">
          <span className="goal-leaf-icon">🌱</span>
          <span className="goal-badge-title">이번 주 나의 건강목표</span>
          {isTargetAchieved && (
            <span className="goal-achieved-pill">
              <Sparkles size={11} />
              목표 달성!
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-goal-modify"
          onClick={onOpenEdit}
          aria-label="목표 수정"
        >
          <Edit3 size={12} />
          <span>목표 수정</span>
        </button>
      </div>

      <div className="goal-content-row">
        <div className="goal-icon-badge">
          <span>{icon}</span>
        </div>
        <div className="goal-details-col">
          <h4 className="goal-title-text">
            {isCustom ? `"${goal.title}"` : goal.title}
          </h4>
          <div className="goal-progress-meta">
            <span className="goal-target-sub">이번 주 목표 {targetDays}일</span>
            <div className="goal-dots-wrap">
              {dots.map((isDone, idx) => (
                <span
                  key={idx}
                  className={`goal-dot-symbol ${isDone ? 'filled' : 'unfilled'}`}
                >
                  {isDone ? '●' : '○'}
                </span>
              ))}
            </div>
            <strong className={`goal-count-label ${isTargetAchieved ? 'success' : ''}`}>
              {practicedCount} / {targetDays}일 실천
            </strong>
          </div>
        </div>
      </div>

      {/* For custom goals: Dedicated "오늘 실천했어요 ✓" button (Section 7) */}
      {isCustom && onToggleCustomPractice && (
        <div className="custom-practice-action-box">
          <button
            type="button"
            id="btn-custom-goal-practice"
            className={`btn-custom-practice ${isDoneToday ? 'done' : ''}`}
            onClick={() => onToggleCustomPractice(currentDateString)}
          >
            <Check size={16} strokeWidth={isDoneToday ? 3 : 2} />
            <span>{isDoneToday ? '오늘 실천 완료 ✓ (실천 취소하기)' : '오늘 실천했어요 ✓'}</span>
          </button>
          <span className="custom-practice-hint">
            * 직접 작성한 건강목표는 추가 Seed 없이 이번 주 실천 기록으로만 안전하게 누적돼요.
          </span>
        </div>
      )}

      {!isCustom && onPracticePreset && (
        <div className="preset-practice-action-box">
          <span className="preset-practice-hint">
            {goal.habitType === 'water' && '홈에서 물 5컵을 채우면 오늘 1일 실천으로 기록돼요.'}
            {goal.habitType === 'meal' && '급식 탭에서 골고루 먹기를 완료하면 오늘 1일 실천으로 기록돼요.'}
            {goal.habitType === 'activity' && '운동 탭에서 움직임을 완료하면 오늘 1일 실천으로 기록돼요.'}
            {goal.habitType === 'mind' && '마음 탭에서 챕터를 완료하면 오늘 1일 실천으로 기록돼요.'}
          </span>
          <button type="button" className={`btn-preset-practice ${isDoneToday ? 'done' : ''}`} onClick={onPracticePreset}>
            <span>{isDoneToday ? '오늘 목표 완료' : '오늘 실천하기'}</span>
            {isDoneToday ? <Check size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      )}
    </div>
  );
};
