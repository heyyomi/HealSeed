import React, { useState } from 'react';
import { ChevronLeft, School, Sparkles, Check, Building2 } from 'lucide-react';
import type { SchoolType } from '../types/onboarding';
import './SchoolSelectScreen.css';

interface SchoolSelectScreenProps {
  initialSchoolName: string;
  initialSchoolType: SchoolType;
  onBack: () => void;
  onSubmit: (schoolName: string, schoolType: SchoolType) => void;
}

const SCHOOL_TYPES: { id: SchoolType; label: string; icon: string }[] = [
  { id: 'elementary', label: '초등학교', icon: '🎒' },
  { id: 'middle', label: '중학교', icon: '🏫' },
  { id: 'high', label: '고등학교', icon: '🎓' },
];

export const SchoolSelectScreen: React.FC<SchoolSelectScreenProps> = ({
  initialSchoolName,
  initialSchoolType,
  onBack,
  onSubmit,
}) => {
  const [schoolName, setSchoolName] = useState(initialSchoolName || '숭곡중학교');
  const [schoolType, setSchoolType] = useState<SchoolType>(initialSchoolType || 'middle');

  const trimmed = schoolName.trim();
  const isValid = trimmed.length >= 2;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid) return;
    onSubmit(trimmed, schoolType);
  };

  return (
    <div className="school-screen screen-container">
      {/* Top Navigation */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 이동">
          <ChevronLeft size={22} />
        </button>
        <div className="step-indicator">
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot active" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="screen-title-section animate-fade-in-up">
        <div className="school-badge">
          <School size={14} />
          <span>학교 급식 맞춤 설정</span>
        </div>
        <h2 className="screen-main-title">
          어느 학교의<br />급식을 볼까요?
        </h2>
        <p className="screen-subtitle">
          학교를 설정하면 매일 오늘의 급식을 자동으로 확인할 수 있어요.
        </p>
      </div>

      {/* School Setup Form */}
      <form className="school-form-section animate-fade-in-up" onSubmit={handleSubmit}>
        {/* School Type Selector */}
        <div className="form-group">
          <label className="form-label">학교급 선택</label>
          <div className="school-type-grid">
            {SCHOOL_TYPES.map((type) => {
              const isSelected = schoolType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  id={`btn-school-type-${type.id}`}
                  className={`school-type-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSchoolType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                  {isSelected && (
                    <div className="type-check-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* School Name Input */}
        <div className="form-group">
          <label htmlFor="school-name-input" className="form-label">
            학교명
          </label>
          <div className={`school-input-box ${isValid ? 'valid' : ''}`}>
            <Building2 size={20} className="input-prefix-icon" />
            <input
              id="school-name-input"
              type="text"
              placeholder="예: 숭곡중학교"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="school-input"
              autoComplete="off"
            />
          </div>
          <p className="form-helper-text">
            학교명을 입력하면 오늘의 따뜻하고 균형 잡힌 급식을 불러와요.
          </p>
        </div>

        {/* Informative School Meal Tip Card */}
        <div className="school-info-card">
          <div className="info-icon-bubble">🍱</div>
          <div className="info-text">
            <strong>건강한 학교 급식과 함께해요!</strong>
            <p>
              HealSeed는 학교 급식을 출발점으로 식사, 물 마시기, 활동 등의 작은 건강습관을 만들어갑니다.
            </p>
          </div>
        </div>

        {/* Bottom Submit Button */}
        <div className="bottom-action-area">
          <button
            type="submit"
            className="btn-primary"
            disabled={!isValid}
            id="btn-school-submit"
          >
            <Sparkles size={18} />
            <span>학교 설정 완료</span>
          </button>
        </div>
      </form>
    </div>
  );
};
