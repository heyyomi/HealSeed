import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DailyRecord } from '../types/onboarding';
import { getActiveMovementActivities, getFeaturedMovement } from '../services/movementService';
import './LifestyleTabs.css';
import './LifestyleTabsPolish.css';

interface MovementScreenProps {
  date: string;
  dailyRecord: DailyRecord;
  dailyRecords: Record<string, DailyRecord>;
  onShiftDate: (days: number) => void;
  onSelectDate: (date: string) => void;
  onSave: (record: { date: string; activityId: string; activityName: string; durationMinutes: number }) => void;
}

const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short',
}).format(new Date(`${value}T12:00:00`));

export const MovementScreen: React.FC<MovementScreenProps> = ({ date, dailyRecord, dailyRecords, onShiftDate, onSelectDate, onSave }) => {
  const activities = useMemo(() => getActiveMovementActivities(), []);
  const featured = useMemo(() => getFeaturedMovement(), []);
  const initial = activities.find((item) => item.id === dailyRecord.movementRecord?.activityId) || featured;
  const [selectedId, setSelectedId] = useState(initial.id);
  const [duration, setDuration] = useState(dailyRecord.movementRecord?.durationMinutes || initial.durationMinutes);
  const selected = activities.find((item) => item.id === selectedId) || featured;
  const recentDates = Array.from({ length: 7 }, (_, index) => {
    const item = new Date(`${date}T12:00:00`); item.setDate(item.getDate() - index); return item.toISOString().slice(0, 10);
  });

  return (
    <main className="lifestyle-screen movement-lifestyle-screen animate-fade-in-up">
      <header className="lifestyle-header movement-theme"><div className="lifestyle-badge"><Activity size={14} /><span>작게 시작하는 건강한 움직임</span></div><h2>운동</h2><p>오늘 할 움직임을 고르고, 실천 시간을 기록해요.</p></header>
      <div className="lifestyle-date-nav">
        <button type="button" onClick={() => onShiftDate(-1)} aria-label="이전 날짜"><ChevronLeft /></button><strong>{dateLabel(date)}</strong><button type="button" onClick={() => onShiftDate(1)} aria-label="다음 날짜"><ChevronRight /></button>
      </div>

      {dailyRecord.movementRecord?.completed && (
        <section className="movement-complete-banner"><CheckCircle2 /><div><strong>오늘의 움직임 완료</strong><span>{dailyRecord.movementRecord.activityName} · {dailyRecord.movementRecord.durationMinutes}분</span></div></section>
      )}

      <section className="lifestyle-card lifestyle-feature-card">
        <div className="lifestyle-section-head"><div className="lifestyle-card-title"><span className="lifestyle-icon-box"><Activity size={18} /></span><h3>오늘의 추천 움직임</h3></div><span className="lifestyle-status-pill">추천</span></div>
        <div className="movement-choice-list">
          {activities.map((item) => <button key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => { setSelectedId(item.id); setDuration(item.durationMinutes); }}><span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.location} · {item.durationText || `${item.durationMinutes}분`}</small></div></button>)}
        </div>
      </section>

      <section className="lifestyle-card movement-action-card">
        <div className="lifestyle-section-head"><h3>{selected.name}</h3><span className="lifestyle-status-pill neutral">{selected.location}</span></div><p>{selected.description}</p>
        <div className="duration-options">{[5, 10, 15].map((minutes) => <button key={minutes} className={duration === minutes ? 'selected' : ''} onClick={() => setDuration(minutes)}>{minutes}분</button>)}</div>
        <button type="button" className="primary-action" onClick={() => onSave({ date, activityId: selected.id, activityName: selected.name, durationMinutes: duration })}>{dailyRecord.activity ? '움직임 기록 업데이트' : '오늘 실천했어요 +1 Seed'}</button>
      </section>

      <section className="lifestyle-card compact-history"><h3>최근 움직임 기록</h3>{recentDates.map((itemDate) => { const record = dailyRecords[itemDate]?.movementRecord; return <button key={itemDate} onClick={() => onSelectDate(itemDate)}><span><strong>{dateLabel(itemDate)}</strong><small>{record?.activityName || '움직임 미기록'}</small></span><b>{record ? `${record.durationMinutes}분` : '미기록'}</b></button>; })}</section>
    </main>
  );
};
