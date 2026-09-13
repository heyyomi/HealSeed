import React, { useState } from 'react';
import { X, Check, Edit3 } from 'lucide-react';
import type { WeeklyGoal, WeeklyGoalHabitType, WeeklyGoalType } from '../types/onboarding';
import { PRESET_GOAL_OPTIONS } from '../utils/weeklyGoalUtils';
import './WeeklyGoalEditModal.css';

interface WeeklyGoalEditModalProps {
  currentGoal: WeeklyGoal;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGoal: Partial<WeeklyGoal>) => void;
  initialMode?: 'preset' | 'custom';
}

export const WeeklyGoalEditModal: React.FC<WeeklyGoalEditModalProps> = ({
  currentGoal,
  isOpen,
  onClose,
  onSave,
  initialMode,
}) => {
  const [goalType, setGoalType] = useState<WeeklyGoalType>(initialMode || currentGoal.type || 'preset');
  const [selectedHabitType, setSelectedHabitType] = useState<WeeklyGoalHabitType>(
    currentGoal.habitType || 'water'
  );
  const [customTitle, setCustomTitle] = useState<string>(
    currentGoal.type === 'custom' ? currentGoal.title : ''
  );
  const [targetDays, setTargetDays] = useState<number>(currentGoal.targetDays || 3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (hType: WeeklyGoalHabitType) => {
    setGoalType('preset');
    setSelectedHabitType(hType);
    setErrorMsg(null);
  };

  const handleSelectCustom = () => {
    setGoalType('custom');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (goalType === 'custom') {
      const trimmed = customTitle.trim();
      if (!trimmed) {
        setErrorMsg('직접 실천할 건강습관을 입력해주세요.');
        return;
      }
      if (trimmed.length > 30) {
        setErrorMsg('목표는 30자 이내로 간결하게 입력해주세요.');
        return;
      }

      onSave({
        type: 'custom',
        habitType: null,
        title: trimmed,
        targetDays,
      });
    } else {
      const preset = PRESET_GOAL_OPTIONS.find((p) => p.habitType === selectedHabitType) || PRESET_GOAL_OPTIONS[1];
      onSave({
        type: 'preset',
        habitType: preset.habitType,
        title: preset.title,
        targetDays,
      });
    }

    onClose();
  };

  return (
    <div className="goal-modal-overlay" onClick={onClose}>
      <div
        className="goal-modal-container animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="goal-modal-header">
          <div className="modal-title-col">
            <div className="modal-title-row">
              <span className="modal-leaf">🌱</span>
              <h3 className="modal-main-title">나의 주간 건강목표</h3>
            </div>
            <p className="modal-subtitle">이번 주 내가 꾸준히 실천할 건강습관을 정해보세요.</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="goal-modal-body">
          {/* 1. 추천 목표 선택 */}
          <div className="goal-section">
            <div className="section-label-row">
              <span className="section-step-num">1</span>
              <span className="section-label-text">추천 건강목표 선택</span>
            </div>

            <div className="preset-options-grid">
              {PRESET_GOAL_OPTIONS.map((preset) => {
                const isSelected = goalType === 'preset' && selectedHabitType === preset.habitType;
                return (
                  <button
                    key={preset.habitType}
                    type="button"
                    className={`preset-goal-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset.habitType)}
                  >
                    <div className="preset-card-icon">{preset.icon}</div>
                    <div className="preset-card-content">
                      <strong className="preset-card-title">{preset.title}</strong>
                      <span className="preset-card-sub">{preset.subtitle}</span>
                    </div>
                    <div className={`preset-check-circle ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 직접 목표 작성 기능 */}
          <div className="goal-section">
            <div className="section-label-row">
              <span className="section-step-num">2</span>
              <span className="section-label-text">또는 직접 목표 작성하기</span>
            </div>

            <button
              type="button"
              className={`btn-toggle-custom-mode ${goalType === 'custom' ? 'active' : ''}`}
              onClick={handleSelectCustom}
            >
              <Edit3 size={16} />
              <span>✏️ 직접 목표 정하기</span>
              {goalType === 'custom' && <span className="custom-mode-badge">작성 중</span>}
            </button>

            {goalType === 'custom' && (
              <div className="custom-input-box animate-fade-in-up">
                <label className="custom-input-label" htmlFor="custom-goal-input">
                  이번 주 어떤 건강습관을 실천하고 싶나요?
                </label>
                <div className="input-wrapper">
                  <input
                    id="custom-goal-input"
                    type="text"
                    value={customTitle}
                    onChange={(e) => {
                      setCustomTitle(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="예: 쉬는 시간마다 물 마시기, 하루에 10분 걷기"
                    maxLength={30}
                    className="custom-text-input"
                    autoFocus
                  />
                  <span className="char-counter">{customTitle.length}/30자</span>
                </div>
                {errorMsg && <p className="custom-error-text">{errorMsg}</p>}
                <p className="custom-helper-text">
                  💡 체중이나 외모 변화가 아닌, 내가 실천 가능한 건강행동 중심으로 작성해주세요.
                </p>
              </div>
            )}
          </div>

          {/* 3. 주간 실천 횟수 설정 */}
          <div className="goal-section">
            <div className="section-label-row">
              <span className="section-step-num">3</span>
              <span className="section-label-text">일주일에 몇 번 실천할까요?</span>
            </div>

            <div className="target-days-row">
              {[
                { days: 2, label: '2일', desc: '가볍게 시작' },
                { days: 3, label: '3일 추천', desc: '꾸준한 습관', isRecommended: true },
                { days: 5, label: '5일', desc: '자신있게 도전' },
              ].map((item) => {
                const isSelected = targetDays === item.days;
                return (
                  <button
                    key={item.days}
                    type="button"
                    className={`target-day-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setTargetDays(item.days)}
                  >
                    <strong className="day-label-main">{item.label}</strong>
                    <span className="day-desc-sub">{item.desc}</span>
                    {isSelected && (
                      <div className="day-check-indicator">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="days-philosophy-note">
              작게 시작해서 꾸준히 실천하는 것이 HealSeed의 가장 소중한 가치예요.
            </p>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              id="btn-save-weekly-goal"
              className="btn-modal-save"
            >
              <span>목표 저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
