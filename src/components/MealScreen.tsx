import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import type { DailyRecord, MealData, MealRecord } from '../types/onboarding';
import { compressAndConvertToBase64 } from '../services/photoService';
import './LifestyleTabs.css';

interface MealScreenProps {
  date: string;
  meal: MealData | null;
  dailyRecord: DailyRecord;
  mealRecord?: MealRecord;
  mealsByDate: Record<string, MealData>;
  mealRecords: Record<string, MealRecord>;
  onShiftDate: (days: number) => void;
  onSelectDate: (date: string) => void;
  onToggleHabit: (key: keyof DailyRecord, givesSeed: boolean) => void;
  onSaveMealRecord: (record: { mealImageUrl: string; mealMemo: string }) => void;
}

const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short',
}).format(new Date(`${value}T12:00:00`));

export const MealScreen: React.FC<MealScreenProps> = ({
  date, meal, dailyRecord, mealRecord, mealsByDate, mealRecords,
  onShiftDate, onSelectDate, onToggleHabit, onSaveMealRecord,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(mealRecord?.mealImageUrl || '');
  const [memo, setMemo] = useState(mealRecord?.mealMemo || '');

  const recentDates = Array.from({ length: 5 }, (_, index) => {
    const item = new Date(`${date}T12:00:00`);
    item.setDate(item.getDate() - index);
    return item.toISOString().slice(0, 10);
  });

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUrl(await compressAndConvertToBase64(file));
  };

  return (
    <main className="lifestyle-screen">
      <header className="lifestyle-header">
        <span className="lifestyle-kicker">오늘의 식사 생활</span>
        <h2>급식</h2>
        <p>급식을 확인하고, 내 식사 습관과 한 끼를 기록해요.</p>
      </header>

      <div className="lifestyle-date-nav">
        <button type="button" onClick={() => onShiftDate(-1)} aria-label="이전 날짜"><ChevronLeft /></button>
        <strong>{dateLabel(date)}</strong>
        <button type="button" onClick={() => onShiftDate(1)} aria-label="다음 날짜"><ChevronRight /></button>
      </div>

      <section className="lifestyle-card meal-menu-card">
        <div className="lifestyle-card-title"><Utensils size={19} /><h3>오늘의 급식</h3></div>
        <span className="school-label">{meal?.schoolName || '학교 급식'}</span>
        {meal?.isNoMealDay ? (
          <p className="empty-copy">{meal.noMealReason || '등록된 급식 정보가 없어요.'}</p>
        ) : meal ? (
          <>
            <div className="meal-menu-list">{meal.menu.map((item) => <span key={item}>{item}</span>)}</div>
            {meal.calories && <p className="meal-meta">{meal.calories}</p>}
          </>
        ) : <p className="empty-copy">급식 정보를 불러오는 중이에요.</p>}
      </section>

      <section className="lifestyle-card">
        <div className="lifestyle-card-title"><CheckCircle2 size={19} /><h3>식사 습관</h3></div>
        <div className="meal-habit-list">
          <button className={dailyRecord.balancedMeal ? 'done' : ''} onClick={() => onToggleHabit('balancedMeal', true)}>
            <span>🥗 골고루 먹기</span><b>{dailyRecord.balancedMeal ? '완료' : '+1 Seed'}</b>
          </button>
          <button className={dailyRecord.slowEating ? 'done' : ''} onClick={() => onToggleHabit('slowEating', false)}>
            <span>천천히 식사하기</span><b>{dailyRecord.slowEating ? '완료' : '기록'}</b>
          </button>
          <button className={dailyRecord.listenToBody ? 'done' : ''} onClick={() => onToggleHabit('listenToBody', false)}>
            <span>몸의 배부름에 귀 기울이기</span><b>{dailyRecord.listenToBody ? '완료' : '기록'}</b>
          </button>
        </div>
      </section>

      <section className="lifestyle-card">
        <div className="lifestyle-card-title"><Camera size={19} /><h3>나의 한 끼 기록</h3></div>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handlePhoto} />
        {imageUrl ? <img className="meal-photo-preview" src={imageUrl} alt="기록한 한 끼" /> : <div className="meal-photo-empty">사진이 아직 없어요</div>}
        <button type="button" className="secondary-action" onClick={() => inputRef.current?.click()}><Camera size={16} /> 사진 선택</button>
        <textarea maxLength={100} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="오늘 식사는 어땠나요?" />
        <button type="button" className="primary-action" disabled={!imageUrl} onClick={() => onSaveMealRecord({ mealImageUrl: imageUrl, mealMemo: memo })}>한 끼 기록 저장</button>
      </section>

      <section className="lifestyle-card compact-history">
        <h3>최근 급식 기록</h3>
        {recentDates.map((itemDate) => (
          <button key={itemDate} type="button" onClick={() => onSelectDate(itemDate)}>
            <span><strong>{dateLabel(itemDate)}</strong><small>{mealsByDate[itemDate]?.isNoMealDay ? '급식 없음' : '급식 정보'}</small></span>
            <b>{mealRecords[itemDate]?.mealImageUrl ? '📸 한 끼 기록 있음' : '미기록'}</b>
          </button>
        ))}
      </section>
    </main>
  );
};
