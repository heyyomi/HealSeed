import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Heart, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import type { DailyRecord } from '../types/onboarding';
import './LifestyleTabs.css';
import './LifestyleTabsPolish.css';
import './MindCareScreen.css';

interface MindCareScreenProps {
  date: string;
  dailyRecord: DailyRecord;
  dailyRecords: Record<string, DailyRecord>;
  onShiftDate: (days: number) => void;
  onSelectDate: (date: string) => void;
  onComplete: (record: { date: string; chapterId: string; chapterName: string; durationMinutes: number }) => void;
}

const CHAPTERS = [
  { id: 'belly-breath', icon: '🌿', name: '복식호흡', minutes: 2, summary: '배의 움직임을 느끼며 천천히 숨 쉬어요.', steps: ['편안하게 앉아 배 위에 손을 올려요.', '코로 4초 동안 천천히 숨을 들이마셔요.', '입으로 6초 동안 길게 내쉬며 반복해요.'] },
  { id: 'butterfly-hug', icon: '🦋', name: '나비포옹', minutes: 2, summary: '두 팔로 나를 감싸고 번갈아 토닥여요.', steps: ['두 팔을 가슴 앞에서 교차해 어깨에 올려요.', '왼손과 오른손을 천천히 번갈아 두드려요.', '편안한 호흡과 함께 내 마음을 살펴봐요.'] },
  { id: 'nature-sound', icon: '🌊', name: '자연의 소리 듣기', minutes: 3, summary: '주변의 자연 소리에 조용히 귀 기울여요.', steps: ['편안한 자세로 눈을 감거나 한 곳을 바라봐요.', '바람·빗소리·새소리 같은 편안한 소리를 찾아요.', '소리의 높낮이와 멀고 가까움을 느껴봐요.'] },
  { id: 'five-senses', icon: '✨', name: '감각 돌아보기', minutes: 3, summary: '지금 느껴지는 감각으로 현재에 머물러요.', steps: ['보이는 것 5가지와 만져지는 것 4가지를 찾아요.', '들리는 것 3가지와 맡을 수 있는 것 2가지를 느껴요.', '지금 나에게 필요한 따뜻한 말 1가지를 떠올려요.'] },
] as const;

const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${value}T12:00:00`));

export const MindCareScreen: React.FC<MindCareScreenProps> = ({ date, dailyRecord, dailyRecords, onShiftDate, onSelectDate, onComplete }) => {
  const initialId = dailyRecord.mindCareRecord?.chapterId || CHAPTERS[0].id;
  const [selectedId, setSelectedId] = useState(initialId);
  const selected = CHAPTERS.find((chapter) => chapter.id === selectedId) || CHAPTERS[0];
  const [secondsLeft, setSecondsLeft] = useState(selected.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const recentDates = useMemo(() => Array.from({ length: 7 }, (_, index) => { const item = new Date(`${date}T12:00:00`); item.setDate(item.getDate() - index); return item.toISOString().slice(0, 10); }), [date]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => {
      if (value <= 1) { window.clearInterval(timer); setIsRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const selectChapter = (id: typeof CHAPTERS[number]['id']) => {
    const chapter = CHAPTERS.find((item) => item.id === id) || CHAPTERS[0];
    setSelectedId(id); setSecondsLeft(chapter.minutes * 60); setIsRunning(false);
  };
  const resetTimer = () => { setSecondsLeft(selected.minutes * 60); setIsRunning(false); };
  const timerText = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <main className="lifestyle-screen mind-lifestyle-screen animate-fade-in-up">
      <header className="lifestyle-header mind-theme"><div className="lifestyle-badge"><Heart size={14} /><span>잠시 멈추고 나를 돌보는 시간</span></div><h2>마음돌봄</h2><p>짧고 편안한 활동으로 지금의 마음을 살펴봐요.</p></header>
      <div className="lifestyle-date-nav"><button onClick={() => onShiftDate(-1)} aria-label="이전 날짜"><ChevronLeft /></button><strong>{dateLabel(date)}</strong><button onClick={() => onShiftDate(1)} aria-label="다음 날짜"><ChevronRight /></button></div>

      {dailyRecord.mindCareRecord?.completed && <section className="mind-complete-banner"><CheckCircle2 /><div><strong>오늘의 마음돌봄 완료</strong><span>{dailyRecord.mindCareRecord.chapterName} · {dailyRecord.mindCareRecord.durationMinutes}분</span></div></section>}

      <section className="lifestyle-card lifestyle-feature-card">
        <div className="lifestyle-section-head"><div className="lifestyle-card-title"><span className="lifestyle-icon-box"><Sparkles size={18} /></span><h3>마음돌봄 챕터</h3></div><span className="lifestyle-status-pill">4가지</span></div>
        <div className="mind-chapter-grid">{CHAPTERS.map((chapter) => <button key={chapter.id} className={selectedId === chapter.id ? 'selected' : ''} onClick={() => selectChapter(chapter.id)}><span>{chapter.icon}</span><strong>{chapter.name}</strong><small>{chapter.minutes}분</small></button>)}</div>
      </section>

      <section className="lifestyle-card mind-guide-card">
        <div className="mind-guide-heading"><span>{selected.icon}</span><div><h3>{selected.name}</h3><p>{selected.summary}</p></div></div>
        <ol>{selected.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className="mind-timer"><span>{timerText}</span><div><button onClick={() => { if (secondsLeft === 0) setSecondsLeft(selected.minutes * 60); setIsRunning((value) => !value); }}>{isRunning ? <Pause size={18} /> : <Play size={18} />}{isRunning ? '잠시 멈춤' : secondsLeft === 0 ? '다시 시작' : '시작'}</button><button onClick={resetTimer} aria-label="타이머 초기화"><RotateCcw size={17} /></button></div></div>
        <button className="primary-action" onClick={() => onComplete({ date, chapterId: selected.id, chapterName: selected.name, durationMinutes: selected.minutes })}>{dailyRecord.mindCareRecord?.completed ? '마음돌봄 기록 업데이트' : dailyRecord.mindCare ? '오늘 마음을 돌봤어요' : '오늘 마음을 돌봤어요 +1 Seed'}</button>
        <p className="mind-safety-note">불편함이 느껴지면 언제든 멈추고, 믿을 수 있는 어른이나 전문가에게 도움을 요청하세요.</p>
      </section>

      <section className="lifestyle-card compact-history"><h3>최근 마음돌봄 기록</h3>{recentDates.map((itemDate) => { const record = dailyRecords[itemDate]?.mindCareRecord; return <button key={itemDate} onClick={() => onSelectDate(itemDate)}><span><strong>{dateLabel(itemDate)}</strong><small>{record?.chapterName || '마음돌봄 미기록'}</small></span><b>{record ? `${record.durationMinutes}분` : '미기록'}</b></button>; })}</section>
    </main>
  );
};
