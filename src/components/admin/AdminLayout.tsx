import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  Settings,
  LogOut
} from 'lucide-react';
import type { AdminTab, SchoolChallenge } from '../../types/admin';
import type { OnboardingState, UserRole } from '../../types/onboarding';
import { getMockAdminStats } from '../../services/adminService';
import { getChallenges } from '../../services/challengeService';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { AdminParticipationScreen } from './AdminParticipationScreen';
import { AdminChallengeScreen } from './AdminChallengeScreen';
import { AdminSettingsScreen } from './AdminSettingsScreen';
import './AdminLayout.css';

interface AdminLayoutProps {
  data: OnboardingState;
  onSwitchRole: (role: UserRole) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ data, onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [challenges, setChallenges] = useState<SchoolChallenge[]>(() => getChallenges());

  const stats = getMockAdminStats(data.schoolName || '숭곡중학교');
  const activeChallenge = challenges.find((c) => c.isActive);

  const handleRefreshChallenges = () => {
    setChallenges(getChallenges());
  };

  return (
    <div className="admin-app-layout">
      {/* Admin Top Header */}
      <header className="admin-top-bar">
        <div className="admin-brand-wrap">
          <img src="/assets/seed_icon.jpg" alt="HealSeed Logo" className="admin-brand-logo" />
          <div className="admin-brand-titles">
            <div className="brand-badge-row">
              <span className="admin-brand-main">HealSeed</span>
              <span className="admin-pill-badge">관리자</span>
            </div>
            <span className="admin-school-name">{data.schoolName || '숭곡중학교'}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-exit-admin"
          onClick={() => onSwitchRole('user')}
          title="학생/교직원 화면으로 전환"
          id="btn-admin-exit-top"
        >
          <LogOut size={14} />
          <span>사용자 모드</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="admin-main-viewport">
        {activeTab === 'dashboard' && (
          <AdminDashboardScreen
            stats={stats}
            activeChallenge={activeChallenge}
            onNavigateToChallenges={() => setActiveTab('challenges')}
            onNavigateToParticipation={() => setActiveTab('participation')}
          />
        )}

        {activeTab === 'participation' && (
          <AdminParticipationScreen schoolName={data.schoolName || '숭곡중학교'} />
        )}

        {activeTab === 'challenges' && (
          <AdminChallengeScreen
            challenges={challenges}
            onRefreshChallenges={handleRefreshChallenges}
            schoolName={data.schoolName || '숭곡중학교'}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsScreen
            schoolName={data.schoolName || '숭곡중학교'}
            onSwitchToUserMode={() => onSwitchRole('user')}
          />
        )}
      </main>

      {/* 10. 관리자 Dashboard 4개 메뉴 하단 네비게이션 */}
      <nav className="admin-bottom-nav" role="navigation" aria-label="관리자 내비게이션">
        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          id="admin-tab-dashboard"
        >
          <LayoutDashboard size={20} />
          <span>대시보드</span>
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'participation' ? 'active' : ''}`}
          onClick={() => setActiveTab('participation')}
          id="admin-tab-participation"
        >
          <BarChart3 size={20} />
          <span>참여현황</span>
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
          id="admin-tab-challenges"
        >
          <Trophy size={20} />
          <span>챌린지</span>
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          id="admin-tab-settings"
        >
          <Settings size={20} />
          <span>설정</span>
        </button>
      </nav>
    </div>
  );
};
