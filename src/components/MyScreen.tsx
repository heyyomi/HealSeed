import React, { useState } from 'react';
import { School, User, Sparkles, ChevronRight, Edit3, ShieldCheck, Award } from 'lucide-react';
import type { OnboardingState, SchoolType } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import { calculateLevelInfo, getCharacterGrowthImage } from '../utils/seedRules';
import './MyScreen.css';

interface MyScreenProps {
  data: OnboardingState;
  onUpdateSchool: (schoolName: string, schoolType: SchoolType) => void;
  onResetAll: () => void;
}

const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  elementary: '초등학교',
  middle: '중학교',
  high: '고등학교',
};

export const MyScreen: React.FC<MyScreenProps> = ({
  data,
  onUpdateSchool,
  onResetAll,
}) => {
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [editSchoolName, setEditSchoolName] = useState(data.schoolName);
  const [editSchoolType, setEditSchoolType] = useState<SchoolType>(data.schoolType);

  const character = CHARACTERS.find((c) => c.id === data.characterId) || CHARACTERS[0];
  const levelInfo = calculateLevelInfo(data.seed);
  const growthImage = getCharacterGrowthImage(character.id, levelInfo.level);

  const handleSaveSchool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editSchoolName.trim().length >= 2) {
      onUpdateSchool(editSchoolName.trim(), editSchoolType);
      setShowEditSchoolModal(false);
    }
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
            <div className="modal-emoji">🏫</div>
            <h3 className="modal-title">학교 설정 변경</h3>
            <p className="modal-desc">
              매일 확인할 학교 급식 기준을 설정해주세요.
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

              <input
                type="text"
                className="edit-school-input"
                placeholder="예: 숭곡중학교"
                value={editSchoolName}
                onChange={(e) => setEditSchoolName(e.target.value)}
                autoFocus
              />

              <div className="modal-btn-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editSchoolName.trim().length < 2}
                  id="btn-save-school"
                >
                  <Sparkles size={16} />
                  <span>설정 저장</span>
                </button>
                <button
                  type="button"
                  className="btn-subtle"
                  onClick={() => setShowEditSchoolModal(false)}
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
