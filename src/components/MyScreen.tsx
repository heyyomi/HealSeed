import React, { useState, useEffect, useRef } from 'react';
import {
  School,
  User,
  Sparkles,
  ChevronRight,
  Edit3,
  ShieldCheck,
  Award,
  Search,
  Loader2,
  Target,
  Camera,
  Lock,
  Check
} from 'lucide-react';
import type { OnboardingState, SchoolType, SchoolSearchResult } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import { calculateLevelInfo, getCharacterGrowthImage } from '../utils/seedRules';
import { searchSchoolsFromNEIS } from '../services/mealService';
import './MyScreen.css';

interface MyScreenProps {
  data: OnboardingState;
  onUpdateSchool: (schoolName: string, schoolType: SchoolType) => void;
  onUpdateWeeklyGoal?: (targetSeed: number) => void;
  onResetAll: () => void;
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
}) => {
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
  const growthImage = getCharacterGrowthImage(character.id, levelInfo.level);

  // Meal photos count
  const photoCount = Object.keys(data.mealRecords || {}).length;

  const currentWeeklyTarget = data.weeklyGoal?.targetSeed || 15;

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
            <img src={growthImage} alt={character.name} />
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
      {/* 1순위: 나의 주간 건강목표 관리 카드 */}
      {/* ================================================== */}
      <div className="my-goal-setting-card animate-fade-in-up">
        <div className="goal-card-header">
          <div className="goal-card-title-row">
            <div className="goal-icon-circle">
              <Target size={18} />
            </div>
            <div>
              <strong className="goal-main-title">나의 주간 건강목표</strong>
              <span className="goal-sub-title">일주일 동안 심을 목표 Seed를 설정해요</span>
            </div>
          </div>
          <div className="goal-current-badge">
            <span>목표: <strong>{currentWeeklyTarget} Seed</strong></span>
          </div>
        </div>

        <div className="goal-preset-buttons">
          {[10, 15, 20].map((tSeed) => (
            <button
              key={tSeed}
              type="button"
              className={`goal-preset-btn ${currentWeeklyTarget === tSeed ? 'active' : ''}`}
              onClick={() => onUpdateWeeklyGoal?.(tSeed)}
            >
              {currentWeeklyTarget === tSeed && <Check size={14} />}
              <span>{tSeed} Seed {tSeed === 15 ? '(추천)' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 3순위 & 16: 나만의 급식판 보관함 (비공개 안심 아카이브) */}
      {/* ================================================== */}
      <div className="my-vault-card animate-fade-in-up">
        <div className="vault-header">
          <div className="vault-title-row">
            <div className="vault-icon-circle">
              <Camera size={18} />
            </div>
            <div>
              <strong className="vault-title">나만의 급식판 보관함</strong>
              <span className="vault-sub">내 건강한 식사 기록 아카이브</span>
            </div>
          </div>
          <span className="vault-count-pill">{photoCount}장의 기록</span>
        </div>

        <div className="vault-privacy-box">
          <div className="vault-privacy-header">
            <Lock size={14} color="#16A34A" />
            <strong>안전한 1인 비공개 보관 원칙</strong>
          </div>
          <p className="vault-privacy-text">
            등록하신 급식판 사진은 친구들이나 외부 피드에 공개되지 않으며, 오직 학생 본인만 볼 수 있는 안전한 개인 아카이브로 보관됩니다.
          </p>
        </div>
      </div>

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
    </div>
  );
};
