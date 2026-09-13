import React, { useState } from 'react';
import {
  LogOut,
  CheckCircle2,
  Lock,
  Check,
  KeyRound
} from 'lucide-react';
import { getStoredAdminPassword, setAdminPassword } from '../../services/adminAuthService';

interface AdminSettingsScreenProps {
  schoolName: string;
  onSwitchToUserMode: () => void;
}

export const AdminSettingsScreen: React.FC<AdminSettingsScreenProps> = ({
  schoolName,
  onSwitchToUserMode,
}) => {
  const [currentPassword, setCurrentPassword] = useState<string>(() => getStoredAdminPassword());
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPassword.trim();
    if (trimmed.length >= 4) {
      setAdminPassword(trimmed);
      setCurrentPassword(trimmed);
      setNewPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };
  return (
    <div className="admin-content-container animate-fade-in-up">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-title-badge-row">
          <span className="admin-school-badge">🏫 {schoolName}</span>
          <span className="admin-date-badge">관리자 설정</span>
        </div>
        <h2 className="admin-main-title">관리자 정보 & 서비스 설정</h2>
        <p className="admin-main-subtitle">
          학교 보건교사 권한 및 시스템 운영 정책을 확인해요.
        </p>
      </div>

      {/* Admin Profile Card */}
      <div className="admin-section-card">
        <div className="admin-profile-row">
          <div className="admin-avatar-bubble">
            👩‍🏫
          </div>
          <div className="admin-profile-texts">
            <div className="admin-name-badge-row">
              <strong className="admin-profile-name">보건교사 운영자</strong>
              <span className="admin-role-pill">ROLE: ADMIN</span>
            </div>
            <span className="admin-school-desc">
              담당 학교: <strong>{schoolName}</strong>
            </span>
            <span className="admin-notice-desc">
              학교 전체 건강습관 증진 프로그램 총괄 관리
            </span>
          </div>
        </div>
      </div>

      {/* Role Architecture Information */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <div className="header-title-wrap">
            <span className="header-icon-bubble">🔐</span>
            <div>
              <h3 className="card-section-title">HealSeed 사용자 역할 구조</h3>
              <span className="card-section-desc">Firebase Authentication & 권한 매핑 설계</span>
            </div>
          </div>
        </div>

        <div className="role-spec-list">
          <div className="role-spec-item">
            <div className="spec-item-left">
              <strong>학생 일반 사용자</strong>
              <code>userType: "student" | role: "user"</code>
            </div>
            <span className="spec-badge">홈/기록/함께/MY</span>
          </div>

          <div className="role-spec-item">
            <div className="spec-item-left">
              <strong>교직원 일반 사용자</strong>
              <code>userType: "staff" | role: "user"</code>
            </div>
            <span className="spec-badge">홈/기록/함께/MY</span>
          </div>

          <div className="role-spec-item active-role">
            <div className="spec-item-left">
              <strong>학교 보건교사 (현재 권한)</strong>
              <code>userType: "staff" | role: "admin"</code>
            </div>
            <span className="spec-badge admin">대시보드/참여/챌린지/설정</span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Compliance Card */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <div className="header-title-wrap">
            <span className="header-icon-bubble">🛡️</span>
            <div>
              <h3 className="card-section-title">개인정보 보호 규정 준수 현황</h3>
              <span className="card-section-desc">민감 정보 비노출 원칙</span>
            </div>
          </div>
        </div>

        <div className="compliance-checklist">
          <div className="compliance-item">
            <CheckCircle2 size={16} color="#16A34A" />
            <span>체중 및 BMI 지표 일체 비노출 준수</span>
          </div>
          <div className="compliance-item">
            <CheckCircle2 size={16} color="#16A34A" />
            <span>개인별 건강 랭킹 및 순위 비교 금지 준수</span>
          </div>
          <div className="compliance-item">
            <CheckCircle2 size={16} color="#16A34A" />
            <span>개인 급식판 사진 1인 비공개 아카이브 준수</span>
          </div>
          <div className="compliance-item">
            <CheckCircle2 size={16} color="#16A34A" />
            <span>익명 기반 학교 집계 통계만 관리자 제공</span>
          </div>
        </div>
      </div>

      {/* Admin Password Security Settings */}
      <div className="admin-section-card">
        <div className="section-card-header">
          <div className="header-title-wrap">
            <span className="header-icon-bubble">
              <Lock size={18} />
            </span>
            <div>
              <h3 className="card-section-title">관리자 접속 암호 관리</h3>
              <span className="card-section-desc">관리자 모드 진입 시 확인하는 보안 비밀번호를 변경해요.</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새로운 관리자 암호 (4자리 이상)"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '13.5px',
                  backgroundColor: '#F8FAFC',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={newPassword.trim().length < 4}
              style={{
                height: '42px',
                padding: '0 16px',
                backgroundColor: newPassword.trim().length >= 4 ? '#0F172A' : '#94A3B8',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                cursor: newPassword.trim().length >= 4 ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <KeyRound size={15} />
              <span>암호 변경</span>
            </button>
          </div>

          {passwordSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '12.5px', fontWeight: 700 }}>
              <Check size={16} />
              <span>관리자 암호가 성공적으로 변경되었습니다.</span>
            </div>
          )}

          <span style={{ fontSize: '11.5px', color: '#64748B' }}>
            * 현재 암호: <strong>{currentPassword}</strong> (초기 기본값: <code>healseed2026</code> 또는 <code>1234</code>)
          </span>
        </form>
      </div>

      {/* Mode Switch Button */}
      <div className="admin-section-card switch-mode-card">
        <div className="switch-card-texts">
          <strong className="switch-card-title">일반 사용자(학생/교직원) 모드로 돌아가기</strong>
          <span className="switch-card-desc">
            일반 학생들이 사용하는 메이트 성장, 급식판 기록, 건강습관 실천 화면으로 즉시 전환합니다.
          </span>
        </div>
        <button
          type="button"
          className="btn-switch-user-mode"
          onClick={onSwitchToUserMode}
          id="btn-admin-switch-to-user"
        >
          <LogOut size={16} />
          <span>일반 사용자 화면으로 전환</span>
        </button>
      </div>
    </div>
  );
};
