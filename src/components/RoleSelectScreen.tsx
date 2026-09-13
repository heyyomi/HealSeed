import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, CheckCircle2, GraduationCap, Briefcase } from 'lucide-react';
import type { UserType } from '../types/onboarding';
import './RoleSelectScreen.css';

interface RoleSelectScreenProps {
  initialRole: UserType | null;
  onBack: () => void;
  onNext: (role: UserType) => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  initialRole,
  onBack,
  onNext,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserType | null>(initialRole || 'student');

  const handleNext = () => {
    if (selectedRole) {
      onNext(selectedRole);
    }
  };

  return (
    <div className="role-screen screen-container">
      {/* Top Navigation */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 이동">
          <ChevronLeft size={22} />
        </button>
        <div className="step-indicator">
          <span className="step-dot active" />
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="screen-title-section animate-fade-in-up">
        <h2 className="screen-main-title">
          어떤 계정으로<br />시작할까요?
        </h2>
        <p className="screen-subtitle">
          나에게 맞는 방식으로 건강한 습관을 시작해보세요.
        </p>
      </div>

      {/* Role Cards List */}
      <div className="role-cards-container animate-fade-in-up">
        {/* Student Card */}
        <div
          id="role-card-student"
          className={`role-select-card ${selectedRole === 'student' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('student')}
        >
          <div className="role-card-icon-wrapper student-theme">
            <GraduationCap size={32} />
          </div>

          <div className="role-card-content">
            <div className="role-card-badge-row">
              <span className="role-title">학생</span>
              <span className="role-tag student-tag">즐거운 학교생활</span>
            </div>
            <p className="role-desc">
              친구들과 함께 건강한 습관을 키워요!
            </p>
          </div>

          <div className="role-check-indicator">
            <CheckCircle2
              size={24}
              className={`check-icon ${selectedRole === 'student' ? 'checked' : ''}`}
            />
          </div>
        </div>

        {/* Staff Card */}
        <div
          id="role-card-staff"
          className={`role-select-card ${selectedRole === 'staff' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('staff')}
        >
          <div className="role-card-icon-wrapper staff-theme">
            <Briefcase size={30} />
          </div>

          <div className="role-card-content">
            <div className="role-card-badge-row">
              <span className="role-title">교직원</span>
              <span className="role-tag staff-tag">활기찬 교직생활</span>
            </div>
            <p className="role-desc">
              학교에서 건강한 하루를 함께 만들어요!
            </p>
          </div>

          <div className="role-check-indicator">
            <CheckCircle2
              size={24}
              className={`check-icon ${selectedRole === 'staff' ? 'checked' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Role Tip */}
      <div className="role-info-note">
        💡 학생과 교직원 모두 나만의 헬씨드 메이트와 함께 작은 건강습관을 가꿔갈 수 있어요.
      </div>

      {/* Bottom Button */}
      <div className="bottom-action-area">
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!selectedRole}
          id="btn-role-next"
        >
          <span>다음</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
