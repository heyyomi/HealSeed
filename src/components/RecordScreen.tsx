import React from 'react';
import { CalendarDays, Sparkles, Check, X, UtensilsCrossed } from 'lucide-react';
import type { DailyRecord, MealData } from '../types/onboarding';
import { isWeekend } from '../services/mealService';
import { getFormattedDate } from '../utils/seedRules';
import './RecordScreen.css';

interface RecordScreenProps {
  currentDateString: string;
  dailyRecords: Record<string, DailyRecord>;
  mealsByDate: Record<string, MealData>;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({
  currentDateString,
  dailyRecords,
  mealsByDate,
}) => {
  const realToday = getFormattedDate();

  // Generate list of dates to display (e.g. today and past 4 days)
  const displayDates: string[] = [];
  const curr = new Date(currentDateString);
  for (let i = 0; i < 5; i++) {
    const d = new Date(curr);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    displayDates.push(`${y}-${m}-${day}`);
  }

  const formatHeaderDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(dateStr).getDay()];
    return `${m}월 ${d}일 (${dayOfWeek})`;
  };

  return (
    <div className="record-screen-container animate-fade-in-up">
      {/* Title */}
      <div className="record-header">
        <div className="record-badge">
          <CalendarDays size={14} />
          <span>건강습관 & 급식 아카이브</span>
        </div>
        <h2 className="record-title">나의 건강 기록</h2>
        <p className="record-subtitle">
          날마다 차곡차곡 쌓아온 건강한 급식과 생활습관의 발자국이에요.
        </p>
      </div>

      {/* Date-by-date Cards List */}
      <div className="record-date-list">
        {displayDates.map((dateStr) => {
          const rec = dailyRecords[dateStr] || {
            date: dateStr,
            balancedMeal: false,
            water: false,
            activity: false,
            mindCare: false,
            slowEating: false,
            listenToBody: false,
          };

          const meal = mealsByDate[dateStr];
          const isWeekendDay = isWeekend(dateStr);
          let mealPreview = '급식 정보 확인 중...';

          if (isWeekendDay || meal?.isNoMealDay) {
            mealPreview = '🏖️ 급식 없는 날 (주말/휴업일)';
          } else if (meal && meal.menu.length > 0) {
            mealPreview = meal.menu.slice(0, 4).join(' · ') + (meal.menu.length > 4 ? ' 외' : '');
          } else {
            mealPreview = '급식 일정 없음';
          }

          // Calculate earned seed today (4 core habits each gives 1 Seed)
          const earnedSeed =
            (rec.balancedMeal ? 1 : 0) +
            (rec.water ? 1 : 0) +
            (rec.activity ? 1 : 0) +
            (rec.mindCare ? 1 : 0);

          const isToday = dateStr === realToday;

          return (
            <div key={dateStr} className={`record-card ${isToday ? 'today-card' : ''}`}>
              <div className="record-card-top">
                <div className="record-date-row">
                  <strong className="record-date-label">{formatHeaderDate(dateStr)}</strong>
                  {isToday && <span className="today-badge">오늘</span>}
                </div>
                <div className="record-seed-pill">
                  <Sparkles size={13} className="seed-sparkle-icon" />
                  <strong>{earnedSeed} Seed</strong>
                </div>
              </div>

              {/* Meal Summary */}
              <div className="record-meal-box">
                <div className="meal-box-label">
                  <UtensilsCrossed size={14} />
                  <span>오늘의 급식</span>
                </div>
                <p className="meal-box-content">{mealPreview}</p>
              </div>

              {/* 4 Health Habits Status */}
              <div className="record-habits-grid">
                <div className={`habit-status-chip ${rec.balancedMeal ? 'done' : ''}`}>
                  {rec.balancedMeal ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                  <span>골고루 먹기</span>
                </div>
                <div className={`habit-status-chip ${rec.water ? 'done' : ''}`}>
                  {rec.water ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                  <span>물 마시기</span>
                </div>
                <div className={`habit-status-chip ${rec.activity ? 'done' : ''}`}>
                  {rec.activity ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                  <span>몸 움직이기</span>
                </div>
                <div className={`habit-status-chip ${rec.mindCare ? 'done' : ''}`}>
                  {rec.mindCare ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                  <span>마음 돌보기</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
