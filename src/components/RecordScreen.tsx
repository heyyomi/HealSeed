import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Check,
  X,
  UtensilsCrossed,
  Camera,
  X as CloseIcon,
  ShieldCheck,
  Heart,
  Droplets,
  Activity,
  Award
} from 'lucide-react';
import type { DailyRecord, MealData, MealRecord } from '../types/onboarding';
import { isWeekend } from '../services/mealService';
import { getFormattedDate } from '../utils/seedRules';
import './RecordScreen.css';

interface RecordScreenProps {
  currentDateString: string;
  dailyRecords: Record<string, DailyRecord>;
  mealsByDate: Record<string, MealData>;
  mealRecords?: Record<string, MealRecord>;
  schoolName?: string;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({
  currentDateString,
  dailyRecords,
  mealsByDate,
  mealRecords = {},
  schoolName = '학교 급식',
}) => {
  const realToday = getFormattedDate();
  const [selectedArchiveDate, setSelectedArchiveDate] = useState<string | null>(null);

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

  // Selected date modal details
  const selectedMealRecord = selectedArchiveDate ? mealRecords[selectedArchiveDate] : null;
  const selectedDailyRecord = selectedArchiveDate ? dailyRecords[selectedArchiveDate] : null;
  const selectedMeal = selectedArchiveDate ? mealsByDate[selectedArchiveDate] : null;
  const selectedEarnedSeed = selectedDailyRecord
    ? (selectedDailyRecord.balancedMeal ? 1 : 0) +
      (selectedDailyRecord.water ? 1 : 0) +
      (selectedDailyRecord.activity ? 1 : 0) +
      (selectedDailyRecord.mindCare ? 1 : 0)
    : 0;

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
          const mealRec = mealRecords[dateStr];
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

              {/* Photo Thumbnail Banner (Section 13) */}
              {mealRec?.mealImageUrl && (
                <div
                  className="record-photo-thumb-banner"
                  onClick={() => setSelectedArchiveDate(dateStr)}
                  role="button"
                  tabIndex={0}
                  title="나의 한 끼 기록 상세 보기"
                >
                  <div className="thumb-img-box">
                    <img
                      src={mealRec.mealImageUrl}
                      alt={`${dateStr} 급식판 사진`}
                      className="record-thumb-img"
                    />
                    <span className="thumb-cam-tag">
                      <Camera size={11} />
                      <span>급식판 📸</span>
                    </span>
                  </div>
                  <div className="thumb-info-wrap">
                    <span className="thumb-info-title">나의 한 끼 기록 보기</span>
                    <span className="thumb-info-memo">
                      {mealRec.mealMemo || '소중한 한 끼가 기록되어 있어요.'}
                    </span>
                  </div>
                </div>
              )}

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

      {/* ================================================== */}
      {/* 13. 나의 한 끼 기록 상세 모달 (Section 13 Modal) */}
      {/* ================================================== */}
      {selectedArchiveDate && selectedMealRecord && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedArchiveDate(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="meal-archive-modal animate-pop-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="archive-modal-header">
              <div className="archive-modal-title-col">
                <div className="archive-modal-badge-row">
                  <span className="archive-modal-badge">📸 나의 한 끼 기록</span>
                  <span className="archive-school-tag">{schoolName}</span>
                </div>
                <h3 className="archive-modal-date">{formatHeaderDate(selectedArchiveDate)}</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedArchiveDate(null)}
                aria-label="닫기"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Meal Photo */}
            <div className="archive-photo-frame">
              <img
                src={selectedMealRecord.mealImageUrl}
                alt={`${selectedArchiveDate} 급식판 사진`}
                className="archive-full-photo"
              />
            </div>

            {/* User Memo */}
            {selectedMealRecord.mealMemo && (
              <div className="archive-memo-card">
                <span className="archive-memo-label">💬 나의 한 끼 메모</span>
                <p className="archive-memo-text">"{selectedMealRecord.mealMemo}"</p>
              </div>
            )}

            {/* NEIS Meal Menu on that date */}
            <div className="archive-section-card">
              <div className="archive-section-header">
                <UtensilsCrossed size={15} />
                <strong>그날의 NEIS 급식 식단</strong>
              </div>
              {selectedMeal && selectedMeal.menu && selectedMeal.menu.length > 0 ? (
                <div className="archive-menu-chips">
                  {selectedMeal.menu.map((dish, i) => (
                    <span key={i} className="archive-dish-chip">
                      {dish}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="archive-no-menu">급식 식단 정보가 없습니다.</p>
              )}
            </div>

            {/* Habits and Seed Earned */}
            <div className="archive-section-card">
              <div className="archive-section-header">
                <Award size={15} />
                <strong>그날 실천한 건강습관 & 획득 Seed</strong>
              </div>

              <div className="archive-habits-row">
                <div className={`archive-habit-pill ${selectedDailyRecord?.balancedMeal ? 'done' : ''}`}>
                  <UtensilsCrossed size={12} />
                  <span>골고루 먹기</span>
                </div>
                <div className={`archive-habit-pill ${selectedDailyRecord?.water ? 'done' : ''}`}>
                  <Droplets size={12} />
                  <span>물 마시기</span>
                </div>
                <div className={`archive-habit-pill ${selectedDailyRecord?.activity ? 'done' : ''}`}>
                  <Activity size={12} />
                  <span>몸 움직이기</span>
                </div>
                <div className={`archive-habit-pill ${selectedDailyRecord?.mindCare ? 'done' : ''}`}>
                  <Heart size={12} />
                  <span>마음 돌보기</span>
                </div>
              </div>

              <div className="archive-seed-result-row">
                <span>획득한 건강 포인트:</span>
                <strong className="archive-seed-count">+{selectedEarnedSeed} Seed 🌱</strong>
              </div>
            </div>

            {/* Privacy Safe Note */}
            <div className="archive-privacy-note">
              <ShieldCheck size={14} color="#16A34A" />
              <span>이 기록은 본인만 열람 가능한 안전한 개인 아카이브입니다.</span>
            </div>

            {/* Modal Bottom Button */}
            <div className="archive-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSelectedArchiveDate(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
