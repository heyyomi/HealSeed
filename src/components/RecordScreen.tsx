import React, { useState } from 'react';
import {
  Activity,
  Award,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Droplets,
  Heart,
  ShieldCheck,
  Smile,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import type { DailyRecord, MealData, MealRecord } from '../types/onboarding';
import { isWeekend } from '../services/mealService';
import { getFormattedDate } from '../utils/seedRules';
import './RecordScreen.css';

interface RecordScreenProps {
  dailyRecords: Record<string, DailyRecord>;
  mealsByDate: Record<string, MealData>;
  mealRecords?: Record<string, MealRecord>;
  schoolName?: string;
  onRecordToday?: () => void;
}

const HABITS = [
  { key: 'balancedMeal', label: '골고루 먹기', icon: UtensilsCrossed },
  { key: 'water', label: '물 마시기', icon: Droplets },
  { key: 'activity', label: '몸 움직이기', icon: Activity },
  { key: 'mindCare', label: '마음 돌보기', icon: Heart },
] as const;

const getEarnedSeed = (record?: DailyRecord) =>
  record
    ? HABITS.reduce((total, habit) => total + (record[habit.key] ? 1 : 0), 0)
    : 0;

const formatHeaderDate = (dateStr: string) => {
  const [, month, day] = dateStr.split('-');
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(`${dateStr}T00:00:00`).getDay()];
  return `${Number(month)}월 ${Number(day)}일 ${dayOfWeek}요일`;
};

export const RecordScreen: React.FC<RecordScreenProps> = ({
  dailyRecords,
  mealsByDate,
  mealRecords = {},
  schoolName = '학교 급식',
  onRecordToday,
}) => {
  const today = getFormattedDate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayRecord = dailyRecords[today];
  const todayMealRecord = mealRecords[today];
  const todaySeed = getEarnedSeed(todayRecord);

  const recentDates = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(`${today}T00:00:00`);
    date.setDate(date.getDate() - index - 1);
    return getFormattedDate(date);
  });

  const selectedDailyRecord = selectedDate ? dailyRecords[selectedDate] : undefined;
  const selectedMealRecord = selectedDate ? mealRecords[selectedDate] : undefined;
  const selectedMeal = selectedDate ? mealsByDate[selectedDate] : undefined;
  const selectedSeed = getEarnedSeed(selectedDailyRecord);

  return (
    <div className="record-screen-container animate-fade-in-up">
      <header className="record-header">
        <div className="record-badge">
          <CalendarDays size={14} />
          <span>나의 건강생활 돌아보기</span>
        </div>
        <h2 className="record-title">나의 건강 기록</h2>
        <p className="record-subtitle">오늘의 건강생활을 기록하고, 지난 실천을 천천히 돌아봐요.</p>
      </header>

      <section className="today-record-card" aria-labelledby="today-record-title">
        <div className="today-record-heading">
          <div>
            <h3 id="today-record-title">🌱 오늘의 기록</h3>
            <span>{formatHeaderDate(today)}</span>
          </div>
          <strong className="today-seed-value">+{todaySeed} Seed</strong>
        </div>

        <div className="today-summary-grid">
          <div className="summary-item">
            <span>🙂 컨디션</span>
            <strong>{todayRecord?.condition ? `${todayRecord.condition.emoji} ${todayRecord.condition.label}` : '미기록'}</strong>
          </div>
          <div className="summary-item">
            <span>🌱 건강습관</span>
            <strong>{todayRecord ? `${todaySeed}/4` : '미기록'}</strong>
          </div>
          <div className="summary-item">
            <span>🏃 움직임</span>
            <strong>{todayRecord?.movementRecord?.completed ? `${todayRecord.movementRecord.durationMinutes}분` : '미기록'}</strong>
          </div>
          <div className="summary-item">
            <span>📸 한 끼 기록</span>
            <strong>{todayMealRecord?.mealImageUrl ? '완료' : '미기록'}</strong>
          </div>
          <div className="summary-item seed-summary-item">
            <span>🌱 Seed</span>
            <strong>+{todaySeed}</strong>
          </div>
        </div>

        <button type="button" className="btn-record-today" onClick={onRecordToday}>
          오늘 기록하기
          <ChevronRight size={17} />
        </button>
      </section>

      <section className="recent-record-section" aria-labelledby="recent-record-title">
        <div className="recent-record-heading">
          <h3 id="recent-record-title">최근 건강기록</h3>
          <span>최근 4일</span>
        </div>

        <div className="record-date-list">
          {recentDates.map((dateStr) => {
            const record = dailyRecords[dateStr];
            const mealRecord = mealRecords[dateStr];
            const meal = mealsByDate[dateStr];
            const earnedSeed = getEarnedSeed(record);
            const hasMealInfo = Boolean(meal?.menu?.length) && !meal?.isNoMealDay && !isWeekend(dateStr);

            return (
              <button
                key={dateStr}
                type="button"
                className="record-card"
                onClick={() => setSelectedDate(dateStr)}
                aria-label={`${formatHeaderDate(dateStr)} 건강기록 자세히 보기`}
              >
                <div className="record-card-top">
                  <strong className="record-date-label">{formatHeaderDate(dateStr)}</strong>
                  <span className="record-seed-pill">
                    <Sparkles size={13} />
                    +{earnedSeed} Seed
                  </span>
                </div>

                <div className="record-compact-summary">
                  <span>{record?.condition ? `${record.condition.emoji} ${record.condition.label}` : '🙂 컨디션 미기록'}</span>
                  <span>🌱 건강습관 {record ? `${earnedSeed}/4` : '미기록'}</span>
                  <span>🏃 {record?.movementRecord?.completed ? `${record.movementRecord.durationMinutes}분 움직임` : '움직임 미기록'}</span>
                  <span>📸 {mealRecord?.mealImageUrl ? '한 끼 기록 있음' : '한 끼 기록 미기록'}</span>
                </div>

                <div className="record-card-footer">
                  <span className={`meal-presence-tag ${hasMealInfo ? 'has-meal' : ''}`}>
                    🍱 {hasMealInfo ? '급식 정보 있음' : '급식 정보 없음'}
                  </span>
                  <span className="record-detail-link">자세히 보기 <ChevronRight size={14} /></span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedDate && (
        <div className="modal-backdrop" onClick={() => setSelectedDate(null)} role="dialog" aria-modal="true">
          <div className="meal-archive-modal animate-pop-in" onClick={(event) => event.stopPropagation()}>
            <div className="archive-modal-header">
              <div className="archive-modal-title-col">
                <span className="archive-modal-badge">🌱 나의 건강 기록</span>
                <h3 className="archive-modal-date">{formatHeaderDate(selectedDate)}</h3>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setSelectedDate(null)} aria-label="닫기">
                <X size={20} />
              </button>
            </div>

            <div className="archive-section-card archive-condition-card">
              <div className="archive-section-header"><Smile size={15} /><strong>① 그날의 컨디션</strong></div>
              {selectedDailyRecord?.condition ? (
                <div className="archive-condition-body">
                  <span className="archive-cond-emoji">{selectedDailyRecord.condition.emoji}</span>
                  <strong className="archive-cond-label">{selectedDailyRecord.condition.label}</strong>
                </div>
              ) : <p className="archive-empty-value">미기록</p>}
            </div>

            <div className="archive-section-card">
              <div className="archive-section-header"><Heart size={15} /><strong>② 실천한 건강습관</strong></div>
              {selectedDailyRecord ? (
                <div className="archive-habits-row">
                  {HABITS.map(({ key, label, icon: Icon }) => (
                    <span key={key} className={`archive-habit-pill ${selectedDailyRecord[key] ? 'done' : ''}`}>
                      {selectedDailyRecord[key] ? <Check size={12} /> : <X size={12} />}
                      <Icon size={12} /> {label}
                    </span>
                  ))}
                </div>
              ) : <p className="archive-empty-value">미기록</p>}
            </div>

            <div className="archive-section-card archive-movement-card">
              <div className="archive-section-header"><Activity size={15} /><strong>③ 오늘의 움직임</strong></div>
              {selectedDailyRecord?.movementRecord?.completed ? (
                <div className="archive-movement-detail-box">
                  <span>🏃</span>
                  <div className="movement-detail-texts">
                    <strong>{selectedDailyRecord.movementRecord.activityName}</strong>
                    <span>{selectedDailyRecord.movementRecord.durationMinutes}분 실천</span>
                  </div>
                  <span className="movement-detail-badge">완료</span>
                </div>
              ) : <p className="archive-empty-value">미기록</p>}
            </div>

            <div className="archive-section-card">
              <div className="archive-section-header"><Camera size={15} /><strong>④ 한 끼 사진 기록</strong></div>
              {selectedMealRecord?.mealImageUrl ? (
                <>
                  <img src={selectedMealRecord.mealImageUrl} alt={`${selectedDate} 한 끼 사진`} className="archive-full-photo" />
                  {selectedMealRecord.mealMemo && <p className="archive-memo-text">“{selectedMealRecord.mealMemo}”</p>}
                </>
              ) : <p className="archive-empty-value">미기록</p>}
            </div>

            <div className="archive-section-card">
              <div className="archive-section-header"><Award size={15} /><strong>⑤ 그날 획득한 Seed</strong></div>
              <strong className="archive-seed-count">+{selectedSeed} Seed 🌱</strong>
            </div>

            <div className="archive-section-card archive-meal-detail-card">
              <div className="archive-section-header"><UtensilsCrossed size={15} /><strong>⑥ 그날의 학교 급식</strong></div>
              <span className="archive-school-tag">{schoolName}</span>
              {selectedMeal?.menu?.length ? (
                <div className="archive-menu-chips">
                  {selectedMeal.menu.map((dish, index) => <span key={index} className="archive-dish-chip">{dish}</span>)}
                </div>
              ) : <p className="archive-empty-value">급식 정보 없음</p>}
            </div>

            <div className="archive-privacy-note">
              <ShieldCheck size={14} />
              <span>이 기록은 본인만 확인할 수 있는 개인 건강기록입니다.</span>
            </div>
            <button type="button" className="btn-primary" onClick={() => setSelectedDate(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};
