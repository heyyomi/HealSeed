import React, { useState, useEffect, useRef } from 'react';
import {
  School,
  User,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit3,
  ShieldCheck,
  Award,
  Search,
  Loader2,
  Check,
  Lock,
} from 'lucide-react';
import type { OnboardingState, SchoolType, SchoolSearchResult, WeeklyGoal } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import { calculateLevelInfo, getFormattedDate } from '../utils/seedRules';
import { searchSchoolsFromNEIS } from '../services/mealService';
import { CharacterGrowthImage } from './common/CharacterGrowthImage';
import { ensureWeeklyGoal, PRESET_GOAL_OPTIONS, getGoalIcon } from '../utils/weeklyGoalUtils';
import { WeeklyGoalEditModal } from './WeeklyGoalEditModal';
import './MyScreen.css';

interface MyScreenProps {
  data: OnboardingState;
  onUpdateSchool: (schoolName: string, schoolType: SchoolType) => void;
  onUpdateWeeklyGoal?: (updatedGoal: Partial<WeeklyGoal>) => void;
  onResetAll: () => void;
  onSwitchToAdmin?: () => void;
}

const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  elementary: '초등학교',
  middle: '중학교',
  high: '고등학교',
};

const QUICK_PRESETS = [
  { name: '숭곡중학교', type: 'middle' as SchoolType },
  { name: '진선여자중학교', type: 'middle' as SchoolType },
  { name: '서울고등학교', type: 'high' as SchoolType },
  { name: '서울초등학교', type: 'elementary' as SchoolType },
];

export const MyScreen: React.FC<MyScreenProps> = ({
  data,
  onUpdateSchool,
  onUpdateWeeklyGoal,
  onResetAll,
  onSwitchToAdmin,
}) => {
  const [activeSection, setActiveSection] = useState<'practice' | 'goal' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [editSchoolName, setEditSchoolName] = useState(data.schoolName);
  const [editSchoolType, setEditSchoolType] = useState<SchoolType>(data.schoolType);
  const [searchResults, setSearchResults] = useState<SchoolSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const trimmed = editSchoolName.trim();
    if (!showEditSchoolModal || trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const list = await searchSchoolsFromNEIS(trimmed);
        setSearchResults(list);
        setShowDropdown(list.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [editSchoolName, showEditSchoolModal]);

  const character = CHARACTERS.find((c) => c.id === data.characterId) || CHARACTERS[0];
  const levelInfo = calculateLevelInfo(data.seed);

  // Meal photos count

  const weeklyGoal = ensureWeeklyGoal(data.weeklyGoal);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState<'preset' | 'custom'>('preset');

  const currentTargetDays = weeklyGoal.targetDays || 3;
  const completedDaysCount = weeklyGoal.completedDates?.length || 0;
  const goalIcon = getGoalIcon(weeklyGoal);

  // Practice Status Calculations (Recent 7 days & Month calendar)
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDays = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarStartDay = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const calendarEntries = Array.from({ length: calendarStartDay + calendarDays }, (_, index) => {
    if (index < calendarStartDay) return null;
    const day = index - calendarStartDay + 1;
    const date = new Date(calendarYear, calendarMonthIndex, day);
    const key = getFormattedDate(date);
    const record = data.dailyRecords[key];
    const count = record
      ? Number(record.balancedMeal) + Number(record.water) + Number(record.activity) + Number(record.mindCare)
      : 0;
    return { day, key, count, isFuture: key > getFormattedDate(), isToday: key === getFormattedDate() };
  });
  const completedCalendarDays = calendarEntries.filter((entry) => entry && !entry.isFuture && entry.count > 0).length;

  const weekBarEntries = Array.from({ length: 7 }, (_, index) => {
    const value = new Date();
    value.setDate(value.getDate() - (6 - index));
    const key = getFormattedDate(value);
    const record = data.dailyRecords[key];
    const count = record
      ? Number(record.balancedMeal) + Number(record.water) + Number(record.activity) + Number(record.mindCare)
      : 0;
    return {
      key,
      dayName: ['일', '월', '화', '수', '목', '금', '토'][value.getDay()],
      count,
      heightPercent: Math.max(8, count * 25),
    };
  });

  const handleSelectResult = (item: SchoolSearchResult) => {
    setEditSchoolName(item.schoolName);
    setEditSchoolType(item.schoolType);
    setShowDropdown(false);
  };

  const handleSaveSchool = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editSchoolName.trim();
    if (trimmed.length < 2) return;

    // Auto-resolve shorthand e.g. "숭곡중"
    try {
      const list = await searchSchoolsFromNEIS(trimmed);
      if (list && list.length > 0) {
        const matched = list[0];
        onUpdateSchool(matched.schoolName, matched.schoolType);
        setShowEditSchoolModal(false);
        return;
      }
    } catch {
      // fallback
    }

    onUpdateSchool(trimmed, editSchoolType);
    setShowEditSchoolModal(false);
  };

  return (
    <div className="my-screen-container animate-fade-in-up">
      {/* Title */}
      <div className="my-header">
        <div className="my-badge">
          <User size={14} />
          <span>내 프로필 & 설정</span>
        </div>
        <h2 className="my-title">마이 페이지</h2>
      </div>

      {/* Profile Card */}
      <div className="my-profile-card animate-pop-in">
        <div className="my-avatar-col">
          <div className="my-avatar-bubble" style={{ borderColor: character.themeColor }}>
            <CharacterGrowthImage
              characterId={character.id}
              level={levelInfo.level}
              alt={character.name}
              fallbackSrc={character.image}
            />
          </div>
          <span className="my-level-pill">Lv.{levelInfo.level} {levelInfo.levelName}</span>
        </div>

        <div className="my-profile-info">
          <div className="my-name-row">
            <strong className="my-user-name">{data.nickname}</strong>
            <span className="my-role-badge">
              {data.userType === 'student' ? '학생' : '교직원'}
            </span>
          </div>
          <p className="my-character-desc">
            헬씨드 메이트 <strong>{character.name}</strong>와 함께하는 중 🌱
          </p>
          <div className="my-seed-stat">
            <Award size={15} className="seed-badge-icon" />
            <span>누적 건강 포인트:</span>
            <strong>{data.seed} Seed</strong>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* MY 주요 메뉴 버튼: [ 📊 실천현황 ] [ 🌱 나의 주간 건강목표 ] */}
      {/* ================================================== */}
      <div className="my-feature-buttons-card animate-fade-in-up">
        <div className="my-feature-buttons-row">
          <button
            type="button"
            className={`my-feature-tab-btn ${activeSection === 'practice' ? 'active' : ''}`}
            onClick={() => setActiveSection((prev) => (prev === 'practice' ? null : 'practice'))}
            aria-expanded={activeSection === 'practice'}
          >
            <div className="my-tab-btn-header">
              <span className="my-tab-btn-icon">📊</span>
              <div className="my-tab-btn-texts">
                <strong className="my-tab-btn-title">실천현황</strong>
                <span className="my-tab-btn-desc">최근 7일 &amp; 월간 달성</span>
              </div>
            </div>
            <div className="my-tab-btn-meta">
              <span className="my-tab-status-pill">{completedCalendarDays}일 실천</span>
              <span className="my-tab-chevron-wrap">
                {activeSection === 'practice' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </button>

          <button
            type="button"
            className={`my-feature-tab-btn ${activeSection === 'goal' ? 'active' : ''}`}
            onClick={() => setActiveSection((prev) => (prev === 'goal' ? null : 'goal'))}
            aria-expanded={activeSection === 'goal'}
          >
            <div className="my-tab-btn-header">
              <span className="my-tab-btn-icon">🌱</span>
              <div className="my-tab-btn-texts">
                <strong className="my-tab-btn-title">나의 주간 건강목표</strong>
                <span className="my-tab-btn-desc">
                  {weeklyGoal.type === 'custom' ? `"${weeklyGoal.title}"` : weeklyGoal.title}
                </span>
              </div>
            </div>
            <div className="my-tab-btn-meta">
              <span className="my-tab-status-pill">{completedDaysCount}/{currentTargetDays}일</span>
              <span className="my-tab-chevron-wrap">
                {activeSection === 'goal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </button>
        </div>

        {!activeSection && (
          <p className="my-feature-guide-hint">
            💡 위의 버튼을 누르면 <strong>실천현황</strong>과 <strong>주간 건강목표</strong> 상세 내용을 바로 확인할 수 있어요.
          </p>
        )}
      </div>

      {/* ================================================== */}
      {/* 1. 실천현황 상세 내용 펼침 (최근 7일 실천 흐름 + 한 달 실천 달성 현황) */}
      {/* ================================================== */}
      {activeSection === 'practice' && (
        <div className="my-practice-unfolded-wrapper animate-fade-in-up">
          <div className="my-unfolded-section-head">
            <div className="my-unfolded-title-wrap">
              <span className="my-unfolded-icon">📊</span>
              <div>
                <strong className="my-unfolded-main-title">나의 건강생활 실천현황</strong>
                <span className="my-unfolded-sub-title">최근 7일 실천 추이와 이번 달 달성 현황을 확인해요</span>
              </div>
            </div>
            <button
              type="button"
              className="my-section-collapse-btn"
              onClick={() => setActiveSection(null)}
              aria-label="실천현황 접기"
            >
              <ChevronUp size={14} />
              <span>접기</span>
            </button>
          </div>

          {/* 최근 7일 실천 흐름 */}
          <section className="home-week-chart">
            <div className="home-week-chart-heading">
              <h3>최근 7일 실천 흐름</h3>
              <span>하루 최대 4가지</span>
            </div>
            <div className="home-week-bars">
              {weekBarEntries.map((bar) => (
                <div key={bar.key}>
                  <span className="week-bar-track">
                    <i style={{ height: `${bar.heightPercent}%` }} />
                  </span>
                  <b>{bar.dayName}</b>
                  <small>{bar.count}</small>
                </div>
              ))}
            </div>
          </section>

          {/* 한 달 실천 달성 현황 */}
          <section className="home-month-calendar" style={{ marginTop: '12px' }}>
            <div className="month-calendar-header">
              <div>
                <span>월간 건강습관</span>
                <h3>한 달 실천 달성 현황</h3>
              </div>
              <div className="month-calendar-nav">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))}
                  aria-label="이전 달"
                >
                  <ChevronLeft size={17} />
                </button>
                <strong>{calendarYear}년 {calendarMonthIndex + 1}월</strong>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))}
                  aria-label="다음 달"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
            <div className="month-calendar-summary">
              <strong>{completedCalendarDays}일</strong>
              <span>건강습관을 하나 이상 실천했어요</span>
            </div>
            <div className="month-calendar-weekdays">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="month-calendar-grid">
              {calendarEntries.map((entry, index) =>
                entry ? (
                  <div
                    key={entry.key}
                    className={`${entry.isToday ? 'today' : ''} ${entry.isFuture ? 'future' : ''}`}
                    title={`${entry.key}: ${entry.count}/4 실천`}
                  >
                    <span>{entry.day}</span>
                    <i data-count={entry.isFuture ? 0 : entry.count} />
                  </div>
                ) : (
                  <div key={`empty-${index}`} className="empty" />
                )
              )}
            </div>
            <div className="month-calendar-legend">
              <span><i data-count="0" /> 미기록</span>
              <span><i data-count="1" /> 1~2개</span>
              <span><i data-count="3" /> 3개</span>
              <span><i data-count="4" /> 모두 완료</span>
            </div>
          </section>

          <button
            type="button"
            className="my-bottom-collapse-bar"
            onClick={() => setActiveSection(null)}
          >
            <ChevronUp size={14} />
            <span>실천현황 접기</span>
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. 나의 주간 건강목표 상세 내용 펼침 (Screenshot 1 내용 100% 유지) */}
      {/* ================================================== */}
      {activeSection === 'goal' && (
        <div className="my-goal-unfolded-wrapper animate-fade-in-up">
          <div className="my-goal-setting-card">
            {/* Card Header */}
            <div className="goal-card-header">
              <div className="goal-card-title-row">
                <div className="goal-icon-circle">
                  <span style={{ fontSize: '18px' }}>🌱</span>
                </div>
                <div>
                  <strong className="goal-main-title">나의 주간 건강목표</strong>
                  <span className="goal-sub-title">이번 주 내가 꾸준히 실천할 건강습관을 정해보세요.</span>
                </div>
              </div>
              <div className="my-goal-header-actions">
                <button
                  type="button"
                  className="my-goal-edit-btn"
                  onClick={() => {
                    setGoalModalMode(weeklyGoal.type);
                    setShowGoalModal(true);
                  }}
                >
                  <Edit3 size={13} />
                  <span>목표 수정</span>
                </button>
                <button
                  type="button"
                  className="my-section-collapse-btn"
                  onClick={() => setActiveSection(null)}
                  aria-label="주간 건강목표 접기"
                >
                  <ChevronUp size={14} />
                  <span>접기</span>
                </button>
              </div>
            </div>

            {/* Current Active Goal Banner */}
            <div className="my-goal-status-banner">
              <div className="my-goal-banner-header">
                <div className="my-goal-badge-wrap">
                  <span className="my-goal-icon-badge">{goalIcon}</span>
                  <strong className="my-goal-active-title">
                    {weeklyGoal.type === 'custom' ? `"${weeklyGoal.title}"` : weeklyGoal.title}
                  </strong>
                </div>
                <span className={`my-goal-type-pill ${weeklyGoal.type}`}>
                  {weeklyGoal.type === 'custom' ? '직접 정한 목표' : '추천 건강목표'}
                </span>
              </div>

              <div className="my-goal-progress-row">
                <span className="my-goal-target-label">이번 주 목표 {currentTargetDays}일</span>
                <div className="my-goal-dots" aria-label={`실천 진행도 ${completedDaysCount} / ${currentTargetDays}일`}>
                  {Array.from({ length: currentTargetDays }).map((_, i) => (
                    <span
                      key={i}
                      className={`my-goal-dot ${i < completedDaysCount ? 'filled' : ''}`}
                      title={`${i + 1}일차`}
                    />
                  ))}
                </div>
                <span className="my-goal-count-label">
                  <strong>{completedDaysCount}</strong> / {currentTargetDays}일 실천
                </span>
              </div>

              <div className="my-goal-tip-box">
                {weeklyGoal.type === 'preset' ? (
                  <span>💡 [홈] 화면의 <strong>오늘의 건강습관</strong> 실천 시 자동으로 실천일수가 기록돼요 (+1 Seed)</span>
                ) : (
                  <span>💡 [홈] 화면의 <strong>오늘 실천했어요 ✓</strong> 버튼으로 실천일수를 기록해요 (Seed 중복 없음)</span>
                )}
              </div>
            </div>

            {/* 1. 추천 건강목표 4종 선택 */}
            <div className="my-goal-sub-section">
              <div className="my-goal-sub-header">
                <span className="my-goal-sub-label">🌱 추천 건강목표 선택</span>
                <span className="my-goal-sub-hint">오늘의 4대 건강습관과 연동</span>
              </div>
              <div className="goal-habit-choice-grid">
                {PRESET_GOAL_OPTIONS.map((item) => {
                  const isSelected =
                    weeklyGoal.type === 'preset' && weeklyGoal.habitType === item.habitType;
                  return (
                    <button
                      key={item.habitType}
                      type="button"
                      className={`habit-select-chip ${isSelected ? 'active' : ''}`}
                      onClick={() =>
                        onUpdateWeeklyGoal?.({
                          type: 'preset',
                          habitType: item.habitType,
                          title: item.title,
                        })
                      }
                    >
                      <span className="habit-chip-label">
                        <span className="habit-chip-icon">{item.icon}</span>
                        <span>{item.title}</span>
                      </span>
                      {isSelected && <Check size={14} strokeWidth={3} className="habit-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 직접 목표 작성 기능 */}
            <div className="my-goal-sub-section">
              <div className="my-goal-sub-header">
                <span className="my-goal-sub-label">✏️ 직접 목표 작성 기능</span>
                <span className="my-goal-sub-hint">나만의 구체적인 실천 행동</span>
              </div>
              <button
                type="button"
                className={`my-custom-goal-btn ${weeklyGoal.type === 'custom' ? 'active' : ''}`}
                onClick={() => {
                  setGoalModalMode('custom');
                  setShowGoalModal(true);
                }}
              >
                <div className="my-custom-btn-left">
                  <Edit3 size={15} />
                  <span>
                    {weeklyGoal.type === 'custom'
                      ? `✏️ 직접 작성 목표: "${weeklyGoal.title}"`
                      : '✏️ 직접 목표 정하기'}
                  </span>
                </div>
                <span className="my-custom-btn-badge">
                  {weeklyGoal.type === 'custom' ? '수정하기' : '작성하기'}
                </span>
              </button>
              <p className="my-goal-helper-note">
                ※ 체중이나 외모 변화가 아니라 쉬는 시간 물 마시기, 10분 걷기 등 실천 가능한 행동 중심으로 정해보세요 (최대 30자)
              </p>
            </div>

            {/* 3. 주간 실천 횟수 설정 */}
            <div className="my-goal-sub-section">
              <div className="my-goal-sub-header">
                <span className="my-goal-sub-label">📅 일주일에 몇 번 실천할까요?</span>
                <span className="my-goal-sub-hint">작게 시작해서 꾸준히</span>
              </div>
              <div className="goal-preset-buttons">
                {[2, 3, 5].map((days) => {
                  const isSelected = currentTargetDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      className={`goal-preset-btn ${isSelected ? 'active' : ''}`}
                      onClick={() =>
                        onUpdateWeeklyGoal?.({
                          targetDays: days,
                        })
                      }
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                      <span>
                        {days}일 {days === 3 ? '(추천)' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="my-bottom-collapse-bar"
            onClick={() => setActiveSection(null)}
          >
            <ChevronUp size={14} />
            <span>주간 건강목표 접기</span>
          </button>
        </div>
      )}

      {/* Settings Menu List */}
      <div className="settings-group">
        <span className="settings-group-title">학교 및 서비스 설정</span>

        {/* School Setup Item */}
        <div
          id="btn-open-school-setting"
          className="setting-menu-item"
          onClick={() => {
            setEditSchoolName(data.schoolName);
            setEditSchoolType(data.schoolType);
            setShowEditSchoolModal(true);
          }}
        >
          <div className="setting-icon-box school-icon">
            <School size={20} />
          </div>
          <div className="setting-item-content">
            <strong className="setting-item-title">학교 설정</strong>
            <span className="setting-item-subtitle">
              현재 설정: <strong>{data.schoolName}</strong> ({SCHOOL_TYPE_LABELS[data.schoolType]})
            </span>
          </div>
          <div className="setting-action-wrap">
            <Edit3 size={16} className="edit-pen-icon" />
            <ChevronRight size={18} className="chevron-icon" />
          </div>
        </div>

        {/* School Admin Mode Switch Item (Password Protected) */}
        {onSwitchToAdmin && (
          <div
            id="btn-open-admin-mode"
            className="setting-menu-item"
            onClick={onSwitchToAdmin}
            style={{ cursor: 'pointer' }}
          >
            <div className="setting-icon-box" style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>
              <Lock size={18} />
            </div>
            <div className="setting-item-content">
              <strong className="setting-item-title">학교 관리자(보건교사) 모드</strong>
              <span className="setting-item-subtitle">
                대시보드 및 학교 챌린지 관리 (보안 암호 필요)
              </span>
            </div>
            <div className="setting-action-wrap">
              <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '100px' }}>
                암호 인증
              </span>
              <ChevronRight size={18} className="chevron-icon" />
            </div>
          </div>
        )}

        {/* Wellness Promise Info */}
        <div className="setting-info-box">
          <div className="setting-info-header">
            <ShieldCheck size={16} color="#16A34A" />
            <strong>HealSeed 건강 철학</strong>
          </div>
          <p>
            HealSeed는 체중 감량이나 외모 비교가 아닌, 건강한 생활 행동과 기분 좋은 급식 습관을 소중히 여깁니다.
          </p>
        </div>

        {/* Reset All Onboarding Data */}
        <div className="setting-reset-box">
          <button className="btn-reset-entire" onClick={onResetAll}>
            온보딩 및 초기 설정 다시하기
          </button>
        </div>
      </div>

      {/* Edit School Modal */}
      {showEditSchoolModal && (
        <div className="modal-backdrop" onClick={() => setShowEditSchoolModal(false)}>
          <div className="modal-card animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-badge-row">
              <div className="modal-emoji">🏫</div>
              <span className="neis-live-badge">
                <ShieldCheck size={12} /> NEIS 실시간 연동
              </span>
            </div>
            <h3 className="modal-title">학교 설정 변경</h3>
            <p className="modal-desc">
              학교명 또는 약칭(예: 숭곡중)을 입력하면 교육부 NEIS 급식을 연동해요.
            </p>

            <form onSubmit={handleSaveSchool} className="edit-school-form">
              <div className="edit-type-row">
                {(['elementary', 'middle', 'high'] as SchoolType[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`edit-type-btn ${editSchoolType === st ? 'active' : ''}`}
                    onClick={() => setEditSchoolType(st)}
                  >
                    {SCHOOL_TYPE_LABELS[st]}
                  </button>
                ))}
              </div>

              {/* School Input with NEIS Real-time Search */}
              <div className="modal-search-box-wrap">
                <div className="modal-input-row">
                  <input
                    type="text"
                    className="edit-school-input"
                    placeholder="학교명 검색 (예: 숭곡중)"
                    value={editSchoolName}
                    onChange={(e) => {
                      setEditSchoolName(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    autoFocus
                  />
                  {isSearching ? (
                    <Loader2 size={16} className="modal-search-spinner" />
                  ) : (
                    <Search size={16} className="modal-search-icon" />
                  )}
                </div>

                {/* Dropdown Results */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="modal-dropdown-results animate-pop-in">
                    <div className="dropdown-results-head">
                      <span>NEIS 학교 검색 결과</span>
                      <button
                        type="button"
                        className="modal-dropdown-close"
                        onClick={() => setShowDropdown(false)}
                      >
                        닫기
                      </button>
                    </div>
                    <div className="modal-dropdown-items">
                      {searchResults.map((item, idx) => (
                        <button
                          key={`${item.schoolCode}-${idx}`}
                          type="button"
                          className="modal-result-btn"
                          onClick={() => handleSelectResult(item)}
                        >
                          <div className="modal-res-top">
                            <strong>{item.schoolName}</strong>
                            <span className="modal-res-badge">
                              {item.schoolType === 'elementary' ? '초등' : item.schoolType === 'middle' ? '중학' : '고등'}
                            </span>
                          </div>
                          <span className="modal-res-loc">{item.location}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div className="modal-quick-presets">
                <span className="modal-preset-tag">추천:</span>
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className={`modal-preset-chip ${editSchoolName === p.name ? 'active' : ''}`}
                    onClick={() => {
                      setEditSchoolName(p.name);
                      setEditSchoolType(p.type);
                      setShowDropdown(false);
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="modal-btn-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editSchoolName.trim().length < 2 || isSearching}
                  id="btn-save-school"
                >
                  <Sparkles size={16} />
                  <span>설정 저장</span>
                </button>
                <button
                  type="button"
                  className="btn-subtle"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowEditSchoolModal(false);
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Goal Edit Modal */}
      {showGoalModal && (
        <WeeklyGoalEditModal
          isOpen
          onClose={() => setShowGoalModal(false)}
          currentGoal={weeklyGoal}
          onSave={(updated) => onUpdateWeeklyGoal?.(updated)}
          initialMode={goalModalMode}
        />
      )}
    </div>
  );
};
