import React, { useState, useEffect } from 'react';
import {
  Home,
  CalendarDays,
  Users,
  User,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Utensils,
  Droplets,
  Activity,
  Heart,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { OnboardingState, DailyRecord, MealData, SchoolType } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import { CHARACTER_GROWTH_STORIES } from '../data/growthStages';
import { calculateLevelInfo, getCharacterGrowthImage, getFormattedDate } from '../utils/seedRules';
import { getMealBySchoolAndDate } from '../services/mealService';
import { TodayMealCard } from './TodayMealCard';
import { MealDetailScreen } from './MealDetailScreen';
import { RecordScreen } from './RecordScreen';
import { MyScreen } from './MyScreen';
import './TempHomeScreen.css';

interface TempHomeScreenProps {
  data: OnboardingState;
  onUpdateState: (updater: (prev: OnboardingState) => OnboardingState) => void;
  onReset: () => void;
}

export const TempHomeScreen: React.FC<TempHomeScreenProps> = ({
  data,
  onUpdateState,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'together' | 'my'>('home');
  const [currentDateString, setCurrentDateString] = useState<string>(getFormattedDate());
  const [currentMeal, setCurrentMeal] = useState<MealData | null>(null);
  const [mealsArchive, setMealsArchive] = useState<Record<string, MealData>>({});
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Fetch meal data for current date & school
  useEffect(() => {
    let isMounted = true;
    getMealBySchoolAndDate(data.schoolName, currentDateString, data.schoolType).then((meal) => {
      if (isMounted) {
        setCurrentMeal(meal);
        setMealsArchive((prev) => ({ ...prev, [currentDateString]: meal }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [data.schoolName, data.schoolType, currentDateString]);

  // Pre-fetch surrounding dates for archive
  useEffect(() => {
    const curr = new Date(currentDateString);
    for (let i = 1; i <= 4; i++) {
      const d = new Date(curr);
      d.setDate(d.getDate() - i);
      const pastDateStr = getFormattedDate(d);
      getMealBySchoolAndDate(data.schoolName, pastDateStr, data.schoolType).then((m) => {
        setMealsArchive((prev) => ({ ...prev, [pastDateStr]: m }));
      });
    }
  }, [data.schoolName, data.schoolType, currentDateString]);

  // Character and dynamic level calculation based strictly on accumulated seed
  const character = CHARACTERS.find((c) => c.id === data.characterId) || CHARACTERS[0];
  const levelInfo = calculateLevelInfo(data.seed);
  const currentGrowthStory = CHARACTER_GROWTH_STORIES[character.id]?.[levelInfo.level];
  const currentGrowthImage = getCharacterGrowthImage(character.id, levelInfo.level);

  // Current date daily record
  const todayRecord: DailyRecord = data.dailyRecords[currentDateString] || {
    date: currentDateString,
    balancedMeal: false,
    water: false,
    activity: false,
    mindCare: false,
    slowEating: false,
    listenToBody: false,
  };

  // Completed count for 4 primary habits
  const completedTodayCount =
    (todayRecord.balancedMeal ? 1 : 0) +
    (todayRecord.water ? 1 : 0) +
    (todayRecord.activity ? 1 : 0) +
    (todayRecord.mindCare ? 1 : 0);

  const isAllCompletedToday = completedTodayCount === 4;

  // Toggle habit with strict anti-duplication & dual-screen state sharing
  const handleToggleHabit = (habitKey: keyof DailyRecord, isPrimarySeedHabit: boolean) => {
    const isCurrentlyDone = !!todayRecord[habitKey];

    if (!isCurrentlyDone) {
      // Mark as done (+1 Seed if primary habit)
      onUpdateState((prev) => {
        const prevRec = prev.dailyRecords[currentDateString] || {
          date: currentDateString,
          balancedMeal: false,
          water: false,
          activity: false,
          mindCare: false,
          slowEating: false,
          listenToBody: false,
        };

        const nextRec: DailyRecord = {
          ...prevRec,
          [habitKey]: true,
        };

        const nextSeed = isPrimarySeedHabit ? prev.seed + 1 : prev.seed;
        const nextLvl = calculateLevelInfo(nextSeed).level;

        return {
          ...prev,
          seed: nextSeed,
          level: nextLvl,
          dailyRecords: {
            ...prev.dailyRecords,
            [currentDateString]: nextRec,
          },
        };
      });

      // Show friendly +1 Seed feedback toast
      if (isPrimarySeedHabit) {
        setToastMessage({
          title: '+1 Seed 🌱',
          subtitle: '오늘도 건강한 습관 하나를 심었어요!',
        });
        setTimeout(() => setToastMessage(null), 2500);

        if (completedTodayCount + 1 === 4) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#22C55E', '#FACC15', '#38BDF8', '#EC4899'],
            });
          } catch {
            // ignore
          }
        }
      }
    } else {
      // Cancel completion (-1 Seed if primary habit)
      onUpdateState((prev) => {
        const prevRec = prev.dailyRecords[currentDateString] || {
          date: currentDateString,
          balancedMeal: false,
          water: false,
          activity: false,
          mindCare: false,
          slowEating: false,
          listenToBody: false,
        };

        const nextRec: DailyRecord = {
          ...prevRec,
          [habitKey]: false,
        };

        const nextSeed = isPrimarySeedHabit ? Math.max(0, prev.seed - 1) : prev.seed;
        const nextLvl = calculateLevelInfo(nextSeed).level;

        return {
          ...prev,
          seed: nextSeed,
          level: nextLvl,
          dailyRecords: {
            ...prev.dailyRecords,
            [currentDateString]: nextRec,
          },
        };
      });
    }
  };

  // Date Navigator Helpers
  const handleShiftDate = (days: number) => {
    const d = new Date(currentDateString);
    d.setDate(d.getDate() + days);
    setCurrentDateString(getFormattedDate(d));
  };

  const isToday = currentDateString === getFormattedDate();

  // Test Helper to adjust Seed for demonstration
  const handleAddTestSeed = (amount: number) => {
    onUpdateState((prev) => {
      const nextSeed = Math.max(0, prev.seed + amount);
      const nextLvl = calculateLevelInfo(nextSeed).level;
      return {
        ...prev,
        seed: nextSeed,
        level: nextLvl,
      };
    });
  };

  // Handle updating school from MyScreen
  const handleUpdateSchool = (schoolName: string, schoolType: SchoolType) => {
    onUpdateState((prev) => ({
      ...prev,
      schoolName,
      schoolType,
    }));
    setToastMessage({
      title: '학교 설정 변경 완료 🏫',
      subtitle: `${schoolName} 급식으로 업데이트되었습니다.`,
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Format Korean date string: e.g. "9월 13일 금요일"
  const getFormattedDateLabel = (dateStr: string) => {
    const parts = dateStr.split('-');
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(dateStr).getDay()];
    return `${m}월 ${d}일 ${dayOfWeek}요일`;
  };

  // If Meal Detail view is open, render MealDetailScreen
  if (isDetailOpen && currentMeal) {
    return (
      <MealDetailScreen
        meal={currentMeal}
        formattedDateLabel={getFormattedDateLabel(currentDateString)}
        dailyRecord={todayRecord}
        onBack={() => setIsDetailOpen(false)}
        onToggleHabit={handleToggleHabit}
      />
    );
  }

  return (
    <div className="home-screen-wrapper">
      {/* Top App Bar */}
      <header className="home-top-bar">
        <div className="home-brand">
          <img src="/assets/seed_icon.jpg" alt="HealSeed Logo" className="home-logo-seed" />
          <span className="home-brand-title">HealSeed</span>
          <span className="home-user-type-tag">
            {data.schoolName || (data.userType === 'student' ? '학생' : '교직원')}
          </span>
        </div>

        <div className="top-action-group">
          <button
            className="test-toggle-btn"
            onClick={() => setShowTestPanel(!showTestPanel)}
            title="Seed 레벨 테스트 도구"
          >
            <Sparkles size={13} />
            <span>테스트</span>
          </button>

          <button
            className="reset-flow-btn"
            onClick={onReset}
            title="온보딩 설정 다시하기"
            id="btn-home-reset"
          >
            <RotateCcw size={13} />
            <span>다시 설정</span>
          </button>
        </div>
      </header>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="habit-toast-popup animate-pop-in">
          <div className="toast-icon-bubble">🌱</div>
          <div className="toast-content">
            <strong className="toast-title">{toastMessage.title}</strong>
            <span className="toast-subtitle">{toastMessage.subtitle}</span>
          </div>
        </div>
      )}

      {/* Seed Testing Panel (Expandable) */}
      {showTestPanel && (
        <div className="seed-test-panel animate-fade-in-up">
          <div className="test-panel-title-row">
            <span className="test-panel-title">🌱 Seed 레벨 테스트 (빠른 성장 확인용)</span>
            <button className="test-panel-close" onClick={() => setShowTestPanel(false)}>✕</button>
          </div>
          <div className="test-chips-row">
            <button onClick={() => handleAddTestSeed(10)}>+10 Seed (Lv.2)</button>
            <button onClick={() => handleAddTestSeed(30)}>+30 Seed (Lv.3)</button>
            <button onClick={() => handleAddTestSeed(60)}>+60 Seed (Lv.4)</button>
            <button onClick={() => handleAddTestSeed(100)}>+100 Seed (Lv.5)</button>
            <button onClick={() => onUpdateState((p) => ({ ...p, seed: 0, level: 1 }))}>0 리셋</button>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === 'home' && (
        <main className="home-scroll-area">
          {/* Welcome Greeting Banner */}
          <section className="welcome-greeting-section animate-fade-in-up">
            <h2 className="greeting-title">
              안녕하세요, <span className="user-nickname">{data.nickname}</span>님!
            </h2>
            <p className="greeting-subtitle">
              오늘도 건강한 급식과 습관 하나를 심어볼까요? 🌱
            </p>
          </section>

          {/* Character Companion Status Card */}
          <section className="companion-status-card animate-pop-in">
            <div className="companion-visual-col">
              <div className="companion-circle" style={{ borderColor: character.themeColor }}>
                <img
                  key={`home-char-${character.id}-${levelInfo.level}`}
                  src={currentGrowthImage}
                  alt={`${character.name} Lv.${levelInfo.level}`}
                  className="companion-photo animate-pop-in"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = character.image;
                  }}
                />
                <div className="level-mini-badge">
                  Lv.{levelInfo.level}
                </div>
              </div>
              <div className="mate-name-badge">
                <span>{character.name} ({currentGrowthStory?.storyTitle || character.tagline})</span>
              </div>
            </div>

            <div className="companion-stats-col">
              <div className="level-status-row">
                <span className="status-badge-level">현재 단계</span>
                <strong className="level-highlight">
                  Lv.{levelInfo.level} {levelInfo.levelName}
                </strong>
              </div>

              <div className="seed-status-row">
                <span className="status-badge-seed">현재 Seed</span>
                <div className="seed-counter-pill">
                  <img src="/assets/seed_icon.jpg" alt="Seed" className="stat-seed-icon" />
                  <span className="seed-number">{data.seed}</span>
                  <span className="seed-unit">Seed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="level-progress-bar-wrap">
                <div className="progress-labels">
                  <span className="progress-target-text">
                    {levelInfo.nextLevelSeed
                      ? `다음 단계 (Lv.${levelInfo.level + 1})`
                      : '최고 단계'}
                  </span>
                  <strong className="progress-value-text">{levelInfo.progressLabel}</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Date Selector Row */}
          <div className="date-navigator-card">
            <button
              className="date-nav-btn"
              onClick={() => handleShiftDate(-1)}
              aria-label="어제 날짜로 이동"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="date-display-info">
              <CalendarDays size={16} className="date-icon" />
              <strong className="date-text">{currentDateString}</strong>
              {isToday && <span className="today-tag">오늘</span>}
            </div>
            <button
              className="date-nav-btn"
              onClick={() => handleShiftDate(1)}
              aria-label="다음 날짜로 이동"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 1. TODAY'S SCHOOL MEAL CARD (NEW FEATURE) */}
          {currentMeal && (
            <TodayMealCard
              meal={currentMeal}
              formattedDateLabel={getFormattedDateLabel(currentDateString)}
              onOpenDetail={() => setIsDetailOpen(true)}
            />
          )}

          {/* 2. 4 HEALTH HABITS CHECKLIST */}
          <section className="habit-preview-section animate-fade-in-up">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <Sparkles size={16} className="section-sparkle" />
                <h3 className="section-title">오늘의 건강습관</h3>
              </div>
              <span className="section-hint">
                완료 {completedTodayCount}/4 (최대 4 Seed)
              </span>
            </div>

            {/* 4 Completed Celebration Alert */}
            {isAllCompletedToday && (
              <div className="all-completed-banner animate-pop-in">
                <PartyPopper size={20} className="party-icon" />
                <div className="all-completed-text">
                  <strong>오늘의 건강습관을 모두 실천했어요!</strong>
                  <span>오늘 총 4개의 Seed를 심었어요 🌱</span>
                </div>
              </div>
            )}

            <div className="habit-card-list">
              {/* 1. 급식 골고루 먹기 (balancedMeal) */}
              <div
                id="habit-card-meal"
                className={`habit-action-card ${todayRecord.balancedMeal ? 'done' : ''}`}
                onClick={() => handleToggleHabit('balancedMeal', true)}
              >
                <div
                  className="habit-icon-circle"
                  style={{
                    backgroundColor: todayRecord.balancedMeal ? '#DCFCE7' : '#FFF0E9',
                    color: todayRecord.balancedMeal ? '#16A34A' : '#FB923C',
                  }}
                >
                  <Utensils size={18} />
                </div>
                <div className="habit-info">
                  <span className="habit-category">식사 습관</span>
                  <span className="habit-title">급식 골고루 먹기</span>
                </div>
                <div className="habit-check-action">
                  <div className={`habit-check-btn ${todayRecord.balancedMeal ? 'checked' : ''}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <span className={`habit-point-pill ${todayRecord.balancedMeal ? 'done-pill' : ''}`}>
                    +1 Seed
                  </span>
                </div>
              </div>

              {/* 2. 물 충분히 마시기 (water) */}
              <div
                id="habit-card-water"
                className={`habit-action-card ${todayRecord.water ? 'done' : ''}`}
                onClick={() => handleToggleHabit('water', true)}
              >
                <div
                  className="habit-icon-circle"
                  style={{
                    backgroundColor: todayRecord.water ? '#DCFCE7' : '#E0F2FE',
                    color: todayRecord.water ? '#16A34A' : '#38BDF8',
                  }}
                >
                  <Droplets size={18} />
                </div>
                <div className="habit-info">
                  <span className="habit-category">수분 섭취</span>
                  <span className="habit-title">물 충분히 마시기</span>
                </div>
                <div className="habit-check-action">
                  <div className={`habit-check-btn ${todayRecord.water ? 'checked' : ''}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <span className={`habit-point-pill ${todayRecord.water ? 'done-pill' : ''}`}>
                    +1 Seed
                  </span>
                </div>
              </div>

              {/* 3. 몸 움직이기 (activity) */}
              <div
                id="habit-card-movement"
                className={`habit-action-card ${todayRecord.activity ? 'done' : ''}`}
                onClick={() => handleToggleHabit('activity', true)}
              >
                <div
                  className="habit-icon-circle"
                  style={{
                    backgroundColor: todayRecord.activity ? '#DCFCE7' : '#F0FDF4',
                    color: todayRecord.activity ? '#16A34A' : '#4ADE80',
                  }}
                >
                  <Activity size={18} />
                </div>
                <div className="habit-info">
                  <span className="habit-category">신체활동</span>
                  <span className="habit-title">몸 움직이기</span>
                </div>
                <div className="habit-check-action">
                  <div className={`habit-check-btn ${todayRecord.activity ? 'checked' : ''}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <span className={`habit-point-pill ${todayRecord.activity ? 'done-pill' : ''}`}>
                    +1 Seed
                  </span>
                </div>
              </div>

              {/* 4. 마음 돌보기 (mindCare) */}
              <div
                id="habit-card-mind"
                className={`habit-action-card ${todayRecord.mindCare ? 'done' : ''}`}
                onClick={() => handleToggleHabit('mindCare', true)}
              >
                <div
                  className="habit-icon-circle"
                  style={{
                    backgroundColor: todayRecord.mindCare ? '#DCFCE7' : '#F3E8FF',
                    color: todayRecord.mindCare ? '#16A34A' : '#C084FC',
                  }}
                >
                  <Heart size={18} />
                </div>
                <div className="habit-info">
                  <span className="habit-category">마음돌봄</span>
                  <span className="habit-title">마음 돌보기</span>
                </div>
                <div className="habit-check-action">
                  <div className={`habit-check-btn ${todayRecord.mindCare ? 'checked' : ''}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <span className={`habit-point-pill ${todayRecord.mindCare ? 'done-pill' : ''}`}>
                    +1 Seed
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Level Threshold Guide Note */}
          <section className="seed-growth-rules-card">
            <div className="rules-card-header">
              <Info size={16} className="info-icon" />
              <h4 className="rules-card-title">Seed & 메이트 성장 기준</h4>
            </div>
            <div className="growth-rules-grid">
              <div className={`rule-chip ${levelInfo.level === 1 ? 'current' : ''}`}>
                <span>Lv.1 시작</span>
                <strong>0~9 Seed</strong>
              </div>
              <div className={`rule-chip ${levelInfo.level === 2 ? 'current' : ''}`}>
                <span>Lv.2 반짝</span>
                <strong>10~29 Seed</strong>
              </div>
              <div className={`rule-chip ${levelInfo.level === 3 ? 'current' : ''}`}>
                <span>Lv.3 쑥쑥</span>
                <strong>30~59 Seed</strong>
              </div>
              <div className={`rule-chip ${levelInfo.level === 4 ? 'current' : ''}`}>
                <span>Lv.4 튼튼</span>
                <strong>60~99 Seed</strong>
              </div>
              <div className={`rule-chip ${levelInfo.level === 5 ? 'current' : ''}`}>
                <span>Lv.5 완전체</span>
                <strong>100+ Seed</strong>
              </div>
            </div>
          </section>

          {/* School Wellness Guide Card */}
          <section className="wellness-philosophy-card">
            <h4 className="guide-card-title">🍎 HealSeed와 함께하는 건강 약속</h4>
            <ul className="guide-list">
              <li>체중이나 칼로리에 얽매이지 않고 기분 좋은 식사를 즐겨요.</li>
              <li>내 몸의 목소리에 귀 기울이며 물과 휴식을 선물해요.</li>
              <li>친구들과 함께 응원하며 즐겁게 건강 습관을 키워가요!</li>
            </ul>
          </section>
        </main>
      )}

      {/* RECORD TAB */}
      {activeTab === 'record' && (
        <RecordScreen
          currentDateString={currentDateString}
          dailyRecords={data.dailyRecords}
          mealsByDate={mealsArchive}
        />
      )}

      {/* TOGETHER TAB */}
      {activeTab === 'together' && (
        <div className="screen-container animate-fade-in-up" style={{ padding: '24px 20px' }}>
          <div className="record-header">
            <div className="record-badge" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              <Users size={14} />
              <span>친구와 함께</span>
            </div>
            <h2 className="record-title">함께하기</h2>
            <p className="record-subtitle">우리 반, 우리 학교 친구들과 건강한 한 끼 습관을 나눠요.</p>
          </div>
          <div className="together-card-placeholder" style={{
            marginTop: '20px',
            backgroundColor: '#FFFFFF',
            border: '2px dashed #CBD5E1',
            borderRadius: '24px',
            padding: '36px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🤝🌱</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>
              학교 그룹 챌린지 준비 중
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
              {data.schoolName} 친구들과 함께 급식을 맛있게 먹고 작은 건강습관을 함께 키워갈 그룹 기능이 곧 열려요!
            </p>
          </div>
        </div>
      )}

      {/* MY TAB */}
      {activeTab === 'my' && (
        <MyScreen
          data={data}
          onUpdateSchool={handleUpdateSchool}
          onResetAll={onReset}
        />
      )}

      {/* Bottom 4 Tabs Navigation */}
      <nav className="bottom-nav-bar" role="navigation" aria-label="메인 네비게이션">
        <button
          className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          id="tab-home"
        >
          <Home size={22} />
          <span>홈</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => setActiveTab('record')}
          id="tab-record"
        >
          <CalendarDays size={22} />
          <span>기록</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'together' ? 'active' : ''}`}
          onClick={() => setActiveTab('together')}
          id="tab-together"
        >
          <Users size={22} />
          <span>함께하기</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
          id="tab-my"
        >
          <User size={22} />
          <span>MY</span>
        </button>
      </nav>
    </div>
  );
};
