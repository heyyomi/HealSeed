import React, { useState, useEffect, useRef } from 'react';
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
  Target,
  Award,
  X,
  Camera,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { OnboardingState, DailyRecord, MealData, SchoolType, WeeklyGoal, UserCondition, CharacterId } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import { CHARACTER_GROWTH_STORIES } from '../data/growthStages';
import { CONDITION_OPTIONS, type ConditionOption } from '../data/conditionLevels';
import { calculateLevelInfo, getFormattedDate } from '../utils/seedRules';
import { getMealBySchoolAndDate } from '../services/mealService';
import { getRandomHealthQuote } from '../data/greetingQuotes';
import { TodayMealCard } from './TodayMealCard';
import { MealScreen } from './MealScreen';
import { MovementScreen } from './MovementScreen';
import { TogetherScreen } from './TogetherScreen';
import { MyScreen } from './MyScreen';
import { CharacterGrowthImage } from './common/CharacterGrowthImage';
import { AdminPasswordModal } from './admin/AdminPasswordModal';
import { WeeklyGoalSummaryCard } from './WeeklyGoalSummaryCard';
import { WeeklyGoalEditModal } from './WeeklyGoalEditModal';
import { ensureWeeklyGoal, mapHabitTypeToKey } from '../utils/weeklyGoalUtils';
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
  const [activeTab, setActiveTab] = useState<'home' | 'meal' | 'movement' | 'together' | 'my'>('home');
  const [currentDateString, setCurrentDateString] = useState<string>(getFormattedDate());
  const [currentMeal, setCurrentMeal] = useState<MealData | null>(null);
  const [mealsArchive, setMealsArchive] = useState<Record<string, MealData>>({});
  const [, setIsDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showGrowthSheet, setShowGrowthSheet] = useState(false);
  const [dynamicQuote, setDynamicQuote] = useState<string>(() => getRandomHealthQuote());
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [showWeeklyGoalModal, setShowWeeklyGoalModal] = useState(false);
  const [openLegalDocument, setOpenLegalDocument] = useState<'privacy' | 'terms' | null>(null);
  const [levelUpCelebration, setLevelUpCelebration] = useState<{
    prevLevel: number;
    newLevel: number;
    characterName: string;
    characterId: CharacterId;
    levelName: string;
    storyTitle: string;
    storyDescription: string;
  } | null>(null);

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
  const weeklyGoal = ensureWeeklyGoal(data.weeklyGoal);

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

  // Watch for Level-Up moment to trigger gentle celebratory modal (Section 11)
  const prevLevelRef = useRef<number>(levelInfo.level);
  useEffect(() => {
    if (levelInfo.level > prevLevelRef.current) {
      const nextLvl = levelInfo.level;
      const targetStory = CHARACTER_GROWTH_STORIES[character.id]?.[nextLvl];
      setLevelUpCelebration({
        prevLevel: prevLevelRef.current,
        newLevel: nextLvl,
        characterName: character.name,
        characterId: character.id,
        levelName: levelInfo.levelName,
        storyTitle: targetStory?.storyTitle || '',
        storyDescription: targetStory?.storyDescription || '',
      });

      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22C55E', '#FACC15', '#38BDF8', '#EC4899', '#A855F7'],
        });
      } catch {
        // ignore
      }
    }
    prevLevelRef.current = levelInfo.level;
  }, [levelInfo.level, character.id, character.name, levelInfo.levelName]);

  // Handle Condition Selection (Section 1 & 2 & 4: Strictly +0 Seed, per date storage)
  const handleSelectCondition = (opt: ConditionOption) => {
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

      const nextCondition: UserCondition = {
        level: opt.level,
        label: opt.label,
        emoji: opt.emoji,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        // Strictly no seed alteration (+0 Seed)
        dailyRecords: {
          ...prev.dailyRecords,
          [currentDateString]: {
            ...prevRec,
            condition: nextCondition,
          },
        },
      };
    });

    setToastMessage({
      title: `${opt.emoji} ${opt.label}`,
      subtitle: '오늘의 몸과 마음 상태를 기록했어요.',
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

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

        // Synchronize with weekly goal if this habit matches the active preset goal
        const curGoal = ensureWeeklyGoal(prev.weeklyGoal);
        let nextGoal = curGoal;
        if (curGoal.type === 'preset' && mapHabitTypeToKey(curGoal.habitType) === habitKey) {
          if (!curGoal.completedDates.includes(currentDateString)) {
            nextGoal = {
              ...curGoal,
              completedDates: [...curGoal.completedDates, currentDateString],
            };
          }
        }

        return {
          ...prev,
          seed: nextSeed,
          level: nextLvl,
          weeklyGoal: nextGoal,
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

        // Synchronize with weekly goal if this habit matches the active preset goal
        const curGoal = ensureWeeklyGoal(prev.weeklyGoal);
        let nextGoal = curGoal;
        if (curGoal.type === 'preset' && mapHabitTypeToKey(curGoal.habitType) === habitKey) {
          nextGoal = {
            ...curGoal,
            completedDates: curGoal.completedDates.filter((d) => d !== currentDateString),
          };
        }

        return {
          ...prev,
          seed: nextSeed,
          level: nextLvl,
          weeklyGoal: nextGoal,
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

  // Save meal photo and memo (Section 12)
  const handleSaveMealRecord = (record: { mealImageUrl: string; mealMemo: string }) => {
    onUpdateState((prev) => ({
      ...prev,
      mealRecords: {
        ...prev.mealRecords,
        [currentDateString]: {
          date: currentDateString,
          mealImageUrl: record.mealImageUrl,
          mealMemo: record.mealMemo,
          createdAt: new Date().toISOString(),
        },
      },
    }));
    setToastMessage({
      title: '급식판 기록 완료 📸',
      subtitle: '나만의 건강한 한 끼 아카이브에 안전하게 보관되었어요.',
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Update weekly health behavior goal (Section 1 & 9)
  const handleUpdateWeeklyGoal = (updatedGoal: Partial<WeeklyGoal>) => {
    onUpdateState((prev) => {
      const currentGoal = ensureWeeklyGoal(prev.weeklyGoal);
      const nextType = updatedGoal.type ?? currentGoal.type;
      const nextHabitType = updatedGoal.habitType !== undefined
        ? updatedGoal.habitType
        : currentGoal.habitType;
      const nextTitle = updatedGoal.title ?? currentGoal.title;
      const identityChanged = nextType !== currentGoal.type
        || nextHabitType !== currentGoal.habitType
        || (nextType === 'custom' && nextTitle !== currentGoal.title);

      let completedDates = currentGoal.completedDates;
      if (identityChanged && nextType === 'preset') {
        const habitKey = mapHabitTypeToKey(nextHabitType);
        completedDates = habitKey
          ? Object.entries(prev.dailyRecords)
              .filter(([date, record]) =>
                date >= currentGoal.weekStartDate
                && date <= currentDateString
                && Boolean(record[habitKey])
              )
              .map(([date]) => date)
              .sort()
          : [];
      } else if (identityChanged) {
        completedDates = [];
      }

      return {
        ...prev,
        weeklyGoal: ensureWeeklyGoal({
          ...currentGoal,
          ...updatedGoal,
          type: nextType,
          habitType: nextType === 'custom' ? null : nextHabitType,
          title: nextTitle,
          completedDates,
        }),
      };
    });
    setToastMessage({
      title: '건강목표 설정 완료 🌱',
      subtitle: '이번 주 나의 건강습관 목표가 업데이트되었습니다.',
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle practice for custom written goal (Section 7: No extra Seed added to prevent duplication)
  const handleToggleCustomPractice = (dateStr: string) => {
    onUpdateState((prev) => {
      const goal = ensureWeeklyGoal(prev.weeklyGoal);
      const isDone = goal.completedDates.includes(dateStr);
      const nextDates = isDone
        ? goal.completedDates.filter((d) => d !== dateStr)
        : [...goal.completedDates, dateStr];

      return {
        ...prev,
        weeklyGoal: {
          ...goal,
          completedDates: nextDates,
        },
      };
    });

    const isAlreadyDone = weeklyGoal.completedDates.includes(dateStr);
    setToastMessage({
      title: isAlreadyDone ? '실천 기록 취소' : '오늘의 실천 완료! 🎯',
      subtitle: isAlreadyDone
        ? '오늘의 실천 기록이 취소되었습니다.'
        : '이번 주 나의 건강목표 실천일이 기록되었어요.',
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Save movement record (Section 6 & 7)
  const handleSaveMovementRecord = (record: {
    date: string;
    activityId: string;
    activityName: string;
    durationMinutes: number;
  }) => {
    onUpdateState((prev) => {
      const prevRec = prev.dailyRecords[record.date] || {
        date: record.date,
        balancedMeal: false,
        water: false,
        activity: false,
        mindCare: false,
        slowEating: false,
        listenToBody: false,
      };

      const wasAlreadyDone = !!prevRec.activity;

      const nextRec: DailyRecord = {
        ...prevRec,
        activity: true, // 몸 움직이기 실천 완료
        movementRecord: {
          date: record.date,
          activityId: record.activityId,
          activityName: record.activityName,
          durationMinutes: record.durationMinutes,
          completed: true,
          completedAt: new Date().toISOString(),
        },
      };

      // 1일 1 Seed 제한: 오늘 아직 몸 움직이기로 Seed를 받지 않은 경우에만 +1 Seed
      const nextSeed = !wasAlreadyDone ? prev.seed + 1 : prev.seed;
      const nextLvl = calculateLevelInfo(nextSeed).level;
      const currentGoal = ensureWeeklyGoal(prev.weeklyGoal);
      const nextGoal = currentGoal.type === 'preset'
        && currentGoal.habitType === 'activity'
        && !currentGoal.completedDates.includes(record.date)
        ? { ...currentGoal, completedDates: [...currentGoal.completedDates, record.date] }
        : currentGoal;

      return {
        ...prev,
        seed: nextSeed,
        level: nextLvl,
        weeklyGoal: nextGoal,
        dailyRecords: {
          ...prev.dailyRecords,
          [record.date]: nextRec,
        },
      };
    });

    setToastMessage({
      title: '움직임 실천 완료 🏃',
      subtitle: `${record.activityName} ${record.durationMinutes}분 완료! +1 Seed가 적립되었습니다.`,
    });
    setTimeout(() => setToastMessage(null), 2500);
  };

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
          <div className="test-admin-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>역할 권한 테스트:</span>
            <button
              type="button"
              style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '100px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => setShowAdminAuthModal(true)}
              id="btn-test-switch-admin"
            >
              👩‍🏫 보건교사 관리자 모드로 전환 (암호 필요)
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === 'home' && (
        <main className="home-scroll-area">
          {/* Welcome Greeting Banner */}
          <section className="welcome-greeting-section animate-fade-in-up">
            <div className="greeting-header-row">
              <h2 className="greeting-title">
                안녕하세요, <span className="user-nickname">{data.nickname}</span>님!
              </h2>
              <button
                type="button"
                className="btn-refresh-quote"
                onClick={() => setDynamicQuote(getRandomHealthQuote())}
                title="새로운 응원 문구 보기"
                aria-label="응원 문구 새로고침"
              >
                <Sparkles size={14} />
              </button>
            </div>
            <p className="greeting-subtitle animate-fade-in" key={dynamicQuote}>
              {dynamicQuote}
            </p>
          </section>

          {/* Character Companion Status Card */}
          <section className="companion-status-card animate-pop-in">
            <div className="companion-visual-col">
              <div className="companion-circle" style={{ borderColor: character.themeColor }}>
                <CharacterGrowthImage
                  key={`home-char-${character.id}-${levelInfo.level}`}
                  characterId={character.id}
                  level={levelInfo.level}
                  alt={`${character.name} Lv.${levelInfo.level}`}
                  className="companion-photo animate-pop-in"
                  fallbackSrc={character.image}
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

            {/* 성장 정보 보기 버튼 */}
            <div className="companion-card-action-bar">
              <button
                type="button"
                className="btn-view-growth-info"
                onClick={() => setShowGrowthSheet(true)}
              >
                <span>성장 정보 보기 &gt;</span>
              </button>
            </div>
          </section>

          <WeeklyGoalSummaryCard
            goal={weeklyGoal}
            currentDateString={getFormattedDate()}
            onOpenEdit={() => setShowWeeklyGoalModal(true)}
            onToggleCustomPractice={handleToggleCustomPractice}
          />

          <section className="home-overview-card animate-fade-in-up">
            <div className="home-overview-heading">
              <div><span>오늘의 건강생활</span><h3>{getFormattedDateLabel(getFormattedDate())}</h3></div>
              <strong>+{completedTodayCount} Seed</strong>
            </div>
            <div className="home-condition-row">
              <span>컨디션</span>
              <div>{CONDITION_OPTIONS.map((option) => <button key={option.level} type="button" className={todayRecord.condition?.level === option.level ? 'selected' : ''} onClick={() => handleSelectCondition(option)} aria-label={option.label}>{option.emoji}</button>)}</div>
            </div>
            <div className="home-summary-grid">
              <button type="button" onClick={() => setActiveTab('meal')}><Utensils /><span>급식·한 끼</span><b>{todayRecord.balancedMeal ? '실천 완료' : '기록하기'}</b></button>
              <button type="button" className={todayRecord.water ? 'done' : ''} onClick={() => handleToggleHabit('water', true)}><Droplets /><span>물 마시기</span><b>{todayRecord.water ? '완료' : '+1 Seed'}</b></button>
              <button type="button" onClick={() => setActiveTab('movement')}><Activity /><span>오늘의 운동</span><b>{todayRecord.movementRecord ? `${todayRecord.movementRecord.durationMinutes}분` : '시작하기'}</b></button>
              <button type="button" className={todayRecord.mindCare ? 'done' : ''} onClick={() => handleToggleHabit('mindCare', true)}><Heart /><span>마음 돌보기</span><b>{todayRecord.mindCare ? '완료' : '+1 Seed'}</b></button>
            </div>
          </section>

          <section className="home-week-chart animate-fade-in-up">
            <div className="home-week-chart-heading"><h3>최근 7일 실천 흐름</h3><span>하루 최대 4가지</span></div>
            <div className="home-week-bars">
              {Array.from({ length: 7 }, (_, index) => {
                const value = new Date(); value.setDate(value.getDate() - (6 - index));
                const key = getFormattedDate(value);
                const record = data.dailyRecords[key];
                const count = record ? Number(record.balancedMeal) + Number(record.water) + Number(record.activity) + Number(record.mindCare) : 0;
                return <div key={key}><span className="week-bar-track"><i style={{ height: `${Math.max(8, count * 25)}%` }} /></span><b>{['일','월','화','수','목','금','토'][value.getDay()]}</b><small>{count}</small></div>;
              })}
            </div>
          </section>

          <div className="legacy-home-details" aria-hidden="true">
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

          {/* 🌱 나의 주간 건강목표 컴팩트 카드 (Section 5 & 8) */}
          <WeeklyGoalSummaryCard
            goal={weeklyGoal}
            currentDateString={currentDateString}
            onOpenEdit={() => setShowWeeklyGoalModal(true)}
            onToggleCustomPractice={handleToggleCustomPractice}
          />

          {/* 1. TODAY'S SCHOOL MEAL CARD (NEW FEATURE) */}
          {currentMeal && (
            <TodayMealCard
              meal={currentMeal}
              formattedDateLabel={getFormattedDateLabel(currentDateString)}
              onOpenDetail={() => setIsDetailOpen(true)}
            />
          )}

          {/* ================================================== */}
          {/* 📋 오늘의 기록 흐름 (Section 3) */}
          {/* 오늘의 기록 -> 오늘의 컨디션 -> 오늘의 건강습관 -> 오늘의 움직임 -> 오늘의 한 끼 기록 -> 오늘 심은 Seed */}
          {/* ================================================== */}
          <section className="daily-record-container animate-fade-in-up">
            <div className="daily-record-main-header">
              <div className="daily-record-title-wrap">
                <CalendarDays size={18} className="daily-title-icon" />
                <h3 className="daily-record-main-title">오늘의 기록</h3>
              </div>
              <span className="daily-record-date-tag">{getFormattedDateLabel(currentDateString)}</span>
            </div>

            {/* 1. “오늘의 컨디션은 어때요?” (Section 1 & 2) */}
            <div className="daily-flow-card condition-flow-card animate-fade-in-up">
              <div className="condition-card-header">
                <div className="condition-titles">
                  <h4 className="condition-question-title">오늘의 컨디션은 어때요?</h4>
                  <p className="condition-question-sub">지금 내 몸과 마음의 상태를 골라보세요.</p>
                </div>
                <span className="condition-badge-exempt">기록용 · +0 Seed</span>
              </div>

              {/* 5-Level Condition Selector */}
              <div className="condition-options-list">
                {CONDITION_OPTIONS.map((opt) => {
                  const isSelected = todayRecord.condition?.level === opt.level;
                  return (
                    <button
                      key={opt.level}
                      type="button"
                      id={`btn-condition-${opt.level}`}
                      className={`condition-select-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectCondition(opt)}
                      aria-pressed={isSelected}
                      title={opt.description}
                    >
                      <span className="condition-btn-emoji">{opt.emoji}</span>
                      <span className="condition-btn-label">{opt.label}</span>
                      {isSelected && <span className="condition-active-badge">선택됨</span>}
                    </button>
                  );
                })}
              </div>

              {todayRecord.condition && (
                <div className="condition-feedback-msg animate-fade-in">
                  <span className="feedback-icon">{todayRecord.condition.emoji}</span>
                  <span className="feedback-text">
                    오늘 나의 컨디션은 <strong>"{todayRecord.condition.label}"</strong> 상태예요.
                  </span>
                </div>
              )}
            </div>

            {/* 2. 오늘의 건강습관 */}
            <div className="daily-flow-card habits-flow-card animate-fade-in-up">
              <div className="flow-card-sub-header">
                <div className="section-title-wrap">
                  <Sparkles size={16} className="section-sparkle" />
                  <h4 className="flow-card-sub-title">오늘의 건강습관</h4>
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
                    <div className="habit-category-row">
                      <span className="habit-category">식사 습관</span>
                      {weeklyGoal.type === 'preset' && weeklyGoal.habitType === 'meal' && (
                        <span className="my-goal-mini-badge">🌱 이번 주 나의 목표</span>
                      )}
                    </div>
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
                    <div className="habit-category-row">
                      <span className="habit-category">수분 섭취</span>
                      {weeklyGoal.type === 'preset' && weeklyGoal.habitType === 'water' && (
                        <span className="my-goal-mini-badge">🌱 이번 주 나의 목표</span>
                      )}
                    </div>
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
                    <div className="habit-category-row">
                      <span className="habit-category">신체활동</span>
                      {weeklyGoal.type === 'preset' && weeklyGoal.habitType === 'activity' && (
                        <span className="my-goal-mini-badge">🌱 이번 주 나의 목표</span>
                      )}
                    </div>
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
                    <div className="habit-category-row">
                      <span className="habit-category">마음돌봄</span>
                      {weeklyGoal.type === 'preset' && weeklyGoal.habitType === 'mind' && (
                        <span className="my-goal-mini-badge">🌱 이번 주 나의 목표</span>
                      )}
                    </div>
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
            </div>

            {/* 3. 오늘의 움직임 */}
            <div className="daily-flow-card movement-flow-card animate-fade-in-up">
              <div className="flow-card-sub-header">
                <div className="section-title-wrap">
                  <Activity size={16} className="section-activity-icon" />
                  <h4 className="flow-card-sub-title">오늘의 움직임</h4>
                </div>
                {todayRecord.movementRecord?.completed ? (
                  <span className="movement-status-badge completed">✓ 실천 완료</span>
                ) : (
                  <span className="movement-status-badge pending">추천 활동</span>
                )}
              </div>

              {todayRecord.movementRecord?.completed ? (
                <div className="movement-completed-box">
                  <div className="movement-completed-left">
                    <span className="movement-done-icon">🏃</span>
                    <div className="movement-done-info">
                      <strong className="movement-done-title">{todayRecord.movementRecord.activityName}</strong>
                      <span className="movement-done-time">실제 움직인 시간: {todayRecord.movementRecord.durationMinutes}분</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-re-movement"
                    onClick={() => setIsDetailOpen(true)}
                  >
                    영상 다시보기 &gt;
                  </button>
                </div>
              ) : (
                <div className="movement-recommend-box">
                  <div className="movement-recommend-texts">
                    <strong className="recommend-title">식후 10분 가벼운 스트레칭 & 산책</strong>
                    <span className="recommend-desc">몸을 편안하게 펴고 맑은 활력을 채워보세요.</span>
                  </div>
                  <button
                    type="button"
                    className="btn-start-movement"
                    onClick={() => setIsDetailOpen(true)}
                  >
                    <span>움직임 실천하기 &gt;</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. 오늘의 한 끼 기록 */}
            <div className="daily-flow-card meal-record-flow-card animate-fade-in-up">
              <div className="flow-card-sub-header">
                <div className="section-title-wrap">
                  <Camera size={16} className="section-camera-icon" />
                  <h4 className="flow-card-sub-title">오늘의 한 끼 기록</h4>
                </div>
                {data.mealRecords[currentDateString]?.mealImageUrl ? (
                  <span className="meal-record-badge completed">기록 완료</span>
                ) : (
                  <span className="meal-record-badge pending">미기록</span>
                )}
              </div>

              {data.mealRecords[currentDateString]?.mealImageUrl ? (
                <div className="meal-record-preview-box" onClick={() => setIsDetailOpen(true)}>
                  <img
                    src={data.mealRecords[currentDateString].mealImageUrl}
                    alt="오늘의 급식판"
                    className="meal-record-thumb"
                  />
                  <div className="meal-record-info">
                    <strong className="meal-record-title">나의 소중한 한 끼</strong>
                    <p className="meal-record-memo">
                      "{data.mealRecords[currentDateString].mealMemo || '건강하게 잘 먹었습니다!'}"
                    </p>
                    <span className="meal-record-edit-link">기록 확인 / 수정 &gt;</span>
                  </div>
                </div>
              ) : (
                <div className="meal-record-empty-box">
                  <p className="meal-record-empty-text">
                    오늘 먹은 급식판 사진과 간단한 소감을 남겨보세요.
                  </p>
                  <button
                    type="button"
                    className="btn-start-meal-record"
                    onClick={() => setIsDetailOpen(true)}
                  >
                    <Camera size={15} />
                    <span>급식판 사진 찍기 / 앨범에서 선택</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. 오늘 심은 Seed */}
            <div className="daily-flow-card seed-summary-flow-card animate-fade-in-up">
              <div className="seed-summary-header">
                <div className="seed-summary-title-row">
                  <img src="/assets/seed_icon.jpg" alt="Seed" className="seed-summary-icon" />
                  <h4 className="seed-summary-title">오늘 심은 Seed</h4>
                </div>
                <div className="seed-summary-score">
                  <strong>+{completedTodayCount}</strong>
                  <span>/ 4 Seed</span>
                </div>
              </div>
              <div className="seed-summary-content">
                <p className="seed-summary-desc">
                  {completedTodayCount === 4
                    ? '🎉 오늘 심을 수 있는 모든 건강 Seed를 심었어요! 메이트가 쑥쑥 자라나요.'
                    : completedTodayCount > 0
                    ? `오늘 ${completedTodayCount}개의 건강습관을 실천했어요. 매일의 작은 실천이 큰 성장을 만들어요!`
                    : '오늘의 건강습관을 실천하고 건강 Seed를 모아보세요.'}
                </p>
                <div className="seed-progress-dots">
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className={`seed-dot-step ${num <= completedTodayCount ? 'filled' : 'empty'}`}
                      title={`${num}번째 Seed`}
                    >
                      {num <= completedTodayCount ? '🌱' : '○'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          </div>

          {/* School Wellness Guide Card */}
          <section className="wellness-philosophy-card">
            <h4 className="guide-card-title">🍎 HealSeed와 함께하는 건강 약속</h4>
            <ul className="guide-list">
              <li>체중이나 칼로리에 얽매이지 않고 기분 좋은 식사를 즐겨요.</li>
              <li>내 몸의 목소리에 귀 기울이며 물과 휴식을 선물해요.</li>
              <li>친구들과 함께 응원하며 즐겁게 건강 습관을 키워가요!</li>
            </ul>
          </section>

          <footer className="home-legal-footer" aria-label="서비스 정책">
            <div className="home-legal-links">
              <button type="button" onClick={() => setOpenLegalDocument('privacy')}>
                개인정보처리방침
              </button>
              <span aria-hidden="true">·</span>
              <button type="button" onClick={() => setOpenLegalDocument('terms')}>
                이용약관
              </button>
            </div>
            <span className="home-legal-caption">HealSeed 정책 예시</span>
          </footer>
        </main>
      )}

      {activeTab === 'meal' && (
        <MealScreen
          key={currentDateString}
          date={currentDateString}
          meal={currentMeal}
          dailyRecord={todayRecord}
          mealRecord={data.mealRecords[currentDateString]}
          mealsByDate={mealsArchive}
          mealRecords={data.mealRecords}
          onShiftDate={handleShiftDate}
          onSelectDate={setCurrentDateString}
          onToggleHabit={handleToggleHabit}
          onSaveMealRecord={handleSaveMealRecord}
        />
      )}

      {activeTab === 'movement' && (
        <MovementScreen
          key={currentDateString}
          date={currentDateString}
          dailyRecord={todayRecord}
          dailyRecords={data.dailyRecords}
          onShiftDate={handleShiftDate}
          onSelectDate={setCurrentDateString}
          onSave={handleSaveMovementRecord}
        />
      )}

      {/* TOGETHER TAB (2순위) */}
      {activeTab === 'together' && (
        <TogetherScreen data={data} />
      )}

      {/* MY TAB (3순위) */}
      {activeTab === 'my' && (
        <MyScreen
          data={data}
          onUpdateSchool={handleUpdateSchool}
          onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
          onResetAll={onReset}
          onSwitchToAdmin={() => setShowAdminAuthModal(true)}
        />
      )}

      {/* Bottom 5 Tabs Navigation */}
      <nav className="bottom-nav-bar" role="navigation" aria-label="메인 네비게이션">
        <button
          className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setCurrentDateString(getFormattedDate());
            setActiveTab('home');
          }}
          id="tab-home"
        >
          <Home size={22} />
          <span>홈</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'meal' ? 'active' : ''}`}
          onClick={() => setActiveTab('meal')}
          id="tab-meal"
        >
          <Utensils size={22} />
          <span>급식</span>
        </button>

        <button
          className={`nav-tab-item ${activeTab === 'movement' ? 'active' : ''}`}
          onClick={() => setActiveTab('movement')}
          id="tab-movement"
        >
          <Activity size={22} />
          <span>운동</span>
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

      {/* ================================================== */}
      {/* 🌱 나의 HealSeed 성장 Bottom Sheet Modal */}
      {/* ================================================== */}
      {showGrowthSheet && (
        <div
          className="growth-sheet-overlay animate-fade-in"
          onClick={() => setShowGrowthSheet(false)}
        >
          <div
            className="growth-sheet-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="sheet-handle-bar" />

            {/* Header */}
            <div className="growth-sheet-header">
              <div className="sheet-title-row">
                <span className="sheet-title-emoji">🌱</span>
                <h3 className="sheet-main-title">나의 HealSeed 성장</h3>
              </div>
              <button
                type="button"
                className="btn-sheet-close-x"
                onClick={() => setShowGrowthSheet(false)}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="growth-sheet-content">
              {/* 1. Seed & 메이트 성장 기준 */}
              <div className="growth-sheet-box">
                <div className="sheet-box-title-row">
                  <Award size={16} className="box-title-icon" />
                  <strong className="sheet-box-title">Seed & 메이트 성장 기준</strong>
                </div>
                <div className="growth-rules-grid">
                  <div className={`rule-chip ${levelInfo.level === 1 ? 'current' : ''}`}>
                    <span className="rule-lv-tag">Lv.1 시작</span>
                    <strong className="rule-seed-val">0~9 Seed</strong>
                  </div>
                  <div className={`rule-chip ${levelInfo.level === 2 ? 'current' : ''}`}>
                    <span className="rule-lv-tag">Lv.2 반짝</span>
                    <strong className="rule-seed-val">10~29 Seed</strong>
                  </div>
                  <div className={`rule-chip ${levelInfo.level === 3 ? 'current' : ''}`}>
                    <span className="rule-lv-tag">Lv.3 쑥쑥</span>
                    <strong className="rule-seed-val">30~59 Seed</strong>
                  </div>
                  <div className={`rule-chip ${levelInfo.level === 4 ? 'current' : ''}`}>
                    <span className="rule-lv-tag">Lv.4 튼튼</span>
                    <strong className="rule-seed-val">60~99 Seed</strong>
                  </div>
                  <div className={`rule-chip ${levelInfo.level === 5 ? 'current' : ''}`}>
                    <span className="rule-lv-tag">Lv.5 완전체</span>
                    <strong className="rule-seed-val">100+ Seed</strong>
                  </div>
                </div>
              </div>

              {/* 2. 주간 건강목표: 이번 주 나의 건강목표 */}
              <div className="growth-sheet-box personal-goal-box">
                <div className="sheet-box-title-row">
                  <Target size={16} className="box-title-icon" />
                  <strong className="sheet-box-title">🌱 나의 주간 건강목표</strong>
                </div>

                <WeeklyGoalSummaryCard
                  goal={weeklyGoal}
                  currentDateString={currentDateString}
                  onOpenEdit={() => {
                    setShowGrowthSheet(false);
                    setShowWeeklyGoalModal(true);
                  }}
                  onToggleCustomPractice={handleToggleCustomPractice}
                />

                {/* Seed vs 나의 주간 건강목표 개념 구분 안내 (Section 1) */}
                <div className="role-distinction-card">
                  <div className="distinction-row">
                    <strong className="distinction-badge">🌱 Seed:</strong>
                    <span className="distinction-desc">
                      건강습관을 실천할 때마다 누적되어 메이트가 5단계로 성장하는 전체 성장 포인트
                    </span>
                  </div>
                  <div className="distinction-row">
                    <strong className="distinction-badge">🎯 주간 건강목표:</strong>
                    <span className="distinction-desc">
                      이번 주 내가 꾸준히 실천하고 싶은 구체적인 건강행동을 정하고 실천하는 기능
                    </span>
                  </div>
                </div>

                {/* 목표 변경 버튼 */}
                <button
                  type="button"
                  className="btn-sheet-link-my"
                  onClick={() => {
                    setShowGrowthSheet(false);
                    setShowWeeklyGoalModal(true);
                  }}
                >
                  <span>주간 건강목표 변경하기 &gt;</span>
                </button>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="growth-sheet-footer">
              <button
                type="button"
                className="btn-sheet-close-action"
                onClick={() => setShowGrowthSheet(false)}
              >
                <span>닫기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 🌟 캐릭터 레벨업 축하 연출 모달 (Section 11) */}
      {/* ================================================== */}
      {levelUpCelebration && (
        <div className="modal-backdrop celebration-backdrop" onClick={() => setLevelUpCelebration(null)}>
          <div className="levelup-celebration-card animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-badge-top">
              <Sparkles size={14} />
              <span>성장 축하</span>
            </div>

            <h3 className="celebration-main-title">🌱 건강습관이 자라났어요!</h3>
            <p className="celebration-sub-title">
              <strong>{levelUpCelebration.characterName}</strong>이가{' '}
              <span className="celebration-highlight-level">
                Lv.{levelUpCelebration.newLevel} {levelUpCelebration.levelName}
              </span>
              (으)로 성장했어요!
            </p>

            {/* Growing Character Stage Visual */}
            <div className="celebration-avatar-stage">
              <div className="celebration-glow-circle" style={{ borderColor: character.themeColor }} />
              <CharacterGrowthImage
                characterId={levelUpCelebration.characterId}
                level={levelUpCelebration.newLevel as any}
                alt={`${levelUpCelebration.characterName} Lv.${levelUpCelebration.newLevel}`}
                className="celebration-char-img animate-pop-in"
                fallbackSrc={CHARACTERS.find((c) => c.id === levelUpCelebration.characterId)?.image}
              />
            </div>

            {/* Growth Story Snippet */}
            <div className="celebration-story-box">
              <strong className="celebration-story-title">{levelUpCelebration.storyTitle}</strong>
              <p className="celebration-story-desc">{levelUpCelebration.storyDescription}</p>
            </div>

            {/* Action Button */}
            <div className="celebration-action-row">
              <button
                type="button"
                className="btn-primary btn-view-growth"
                onClick={() => {
                  setLevelUpCelebration(null);
                  setShowGrowthSheet(true);
                }}
              >
                <span>성장한 모습 보기</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Health Behavior Goal Edit Modal (Section 1~4) */}
      {showWeeklyGoalModal && (
        <WeeklyGoalEditModal
          isOpen
          onClose={() => setShowWeeklyGoalModal(false)}
          currentGoal={weeklyGoal}
          onSave={handleUpdateWeeklyGoal}
        />
      )}

      {openLegalDocument && (
        <div
          className="legal-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          onClick={() => setOpenLegalDocument(null)}
        >
          <div className="legal-modal-sheet animate-pop-in" onClick={(event) => event.stopPropagation()}>
            <div className="legal-modal-header">
              <div>
                <span className="legal-example-badge">예시 문서</span>
                <h3 id="legal-modal-title">
                  {openLegalDocument === 'privacy' ? '개인정보처리방침' : '이용약관'}
                </h3>
              </div>
              <button
                type="button"
                className="legal-modal-close"
                onClick={() => setOpenLegalDocument(null)}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            <div className="legal-modal-content">
              {openLegalDocument === 'privacy' ? (
                <>
                  <p className="legal-intro">
                    아래 내용은 HealSeed 서비스 구성을 설명하기 위한 예시입니다. 실제 운영 전 학교와 운영 주체의 정책에 맞게 검토·확정해야 합니다.
                  </p>
                  <section><h4>1. 수집하는 정보</h4><p>닉네임, 사용자 유형, 선택한 캐릭터, 학교 정보, 건강습관·컨디션·움직임 기록, 사용자가 직접 등록한 한 끼 사진과 메모를 수집할 수 있습니다.</p></section>
                  <section><h4>2. 이용 목적</h4><p>개인별 건강습관 기록 제공, 캐릭터 성장과 Seed 현황 표시, 학교 급식 정보 제공, 서비스 품질 개선을 위해 이용합니다.</p></section>
                  <section><h4>3. 보관 및 삭제</h4><p>정보는 서비스 제공에 필요한 기간 동안 보관하며, 이용자가 초기화 또는 삭제를 요청하면 관련 법령상 보관 의무가 있는 경우를 제외하고 삭제합니다.</p></section>
                  <section><h4>4. 제3자 제공</h4><p>법령에 근거가 있거나 이용자의 동의를 받은 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. NEIS 급식정보 조회에는 사용자가 선택한 학교 정보가 활용될 수 있습니다.</p></section>
                  <section><h4>5. 이용자의 권리</h4><p>이용자는 자신의 기록을 확인·수정·삭제하거나 개인정보 처리에 관한 문의를 할 수 있습니다. 아동·청소년 이용자의 경우 필요한 보호 절차를 마련합니다.</p></section>
                  <section><h4>6. 안전성 확보</h4><p>접근 권한 관리, 안전한 저장과 전송 등 개인정보 보호에 필요한 조치를 적용합니다.</p></section>
                  <p className="legal-effective-date">예시 시행일: 2026년 9월 13일</p>
                </>
              ) : (
                <>
                  <p className="legal-intro">
                    아래 내용은 HealSeed 서비스 구성을 설명하기 위한 예시이며 법률 자문을 대신하지 않습니다. 실제 운영 조건에 맞게 검토·확정해야 합니다.
                  </p>
                  <section><h4>1. 서비스 목적</h4><p>HealSeed는 사용자가 일상 속 건강행동을 기록하고 긍정적인 습관을 이어가도록 돕는 교육·건강습관 지원 서비스입니다.</p></section>
                  <section><h4>2. 이용자의 약속</h4><p>이용자는 정확한 정보를 사용하고, 다른 사람의 권리를 침해하거나 서비스 운영을 방해하는 행위를 하지 않아야 합니다.</p></section>
                  <section><h4>3. 건강정보 안내</h4><p>서비스의 콘텐츠와 기록은 일반적인 건강습관 형성을 위한 참고 정보이며 의학적 진단이나 치료를 대신하지 않습니다.</p></section>
                  <section><h4>4. 사진과 기록</h4><p>이용자는 자신이 이용 권한을 가진 사진과 내용만 등록해야 하며, 민감하거나 다른 사람을 식별할 수 있는 정보가 포함되지 않도록 주의해야 합니다.</p></section>
                  <section><h4>5. 서비스 변경 및 중단</h4><p>안전한 운영과 기능 개선을 위해 서비스 일부가 변경되거나 일시 중단될 수 있으며, 중요한 변경은 적절한 방법으로 안내합니다.</p></section>
                  <section><h4>6. 이용 종료</h4><p>이용자는 제공되는 초기화·삭제 기능 또는 운영자 문의를 통해 서비스 이용 종료를 요청할 수 있습니다.</p></section>
                  <p className="legal-effective-date">예시 시행일: 2026년 9월 13일</p>
                </>
              )}
            </div>

            <button type="button" className="legal-confirm-button" onClick={() => setOpenLegalDocument(null)}>
              확인했어요
            </button>
          </div>
        </div>
      )}

      {/* Admin Password Authentication Modal */}
      <AdminPasswordModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={() => {
          setShowAdminAuthModal(false);
          onUpdateState((p) => ({ ...p, role: 'admin', userType: 'staff' }));
        }}
      />
    </div>
  );
};
