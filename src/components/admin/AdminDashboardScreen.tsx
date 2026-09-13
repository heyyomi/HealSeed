import React from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import type { AdminDashboardStats, SchoolChallenge } from '../../types/admin';

interface AdminDashboardScreenProps {
  stats: AdminDashboardStats;
  activeChallenge: SchoolChallenge | undefined;
  onNavigateToChallenges: () => void;
  onNavigateToParticipation: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  stats,
  activeChallenge,
  onNavigateToChallenges,
  onNavigateToParticipation,
}) => {
  return (
    <div className="admin-content-container animate-fade-in-up">
      {/* Title section */}
      <div className="admin-page-header">
        <div className="admin-title-badge-row">
          <span className="admin-school-badge">🏫 {stats.schoolName}</span>
          <span className="admin-date-badge">{stats.date} 기준</span>
        </div>
        <h2 className="admin-main-title">우리 학교 건강습관 현황</h2>
        <p className="admin-main-subtitle">
          학생과 교직원의 긍정적인 건강 생활습관 실천 지표를 한눈에 확인해요.
        </p>
      </div>

      {/* ================================================== */}
      {/* 3. 상단 핵심 지표 카드 4종 */}
      {/* ================================================== */}
      <div className="admin-metrics-grid">
        {/* Metric 1: 전체 가입자 */}
        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">전체 가입자</span>
            <div className="metric-icon-box users-icon">
              <Users size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <strong className="metric-number">{stats.totalUsers}</strong>
            <span className="metric-unit">명</span>
          </div>
          <span className="metric-sub-detail">
            학생 {stats.studentStats.totalUsers}명 · 교직원 {stats.staffStats.totalUsers}명
          </span>
        </div>

        {/* Metric 2: 오늘 참여자 */}
        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">오늘 참여자</span>
            <div className="metric-icon-box check-icon">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <strong className="metric-number">{stats.todayParticipants}</strong>
            <span className="metric-unit">명</span>
          </div>
          <span className="metric-sub-detail">
            학생 {stats.studentStats.todayParticipants}명 · 교직원 {stats.staffStats.todayParticipants}명
          </span>
        </div>

        {/* Metric 3: 오늘 참여율 */}
        <div className="admin-metric-card highlight-card">
          <div className="metric-header">
            <span className="metric-label">오늘 참여율</span>
            <div className="metric-icon-box rate-icon">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <strong className="metric-number">{stats.participationRate}</strong>
            <span className="metric-unit">%</span>
          </div>
          <span className="metric-sub-detail">전교생 및 교직원 중 1개 이상 실천</span>
        </div>

        {/* Metric 4: 오늘 심은 Seed */}
        <div className="admin-metric-card">
          <div className="metric-header">
            <span className="metric-label">오늘 심은 Seed</span>
            <div className="metric-icon-box seed-icon">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <strong className="metric-number">{stats.todaySeed}</strong>
            <span className="metric-unit">Seed</span>
          </div>
          <span className="metric-sub-detail">학교 전체 건강 포인트 누적</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 8. 진행 중인 학교 공동 챌린지 배너 (Active Challenge) */}
      {/* ================================================== */}
      {activeChallenge && (
        <div
          className="admin-challenge-highlight-card animate-pop-in"
          onClick={onNavigateToChallenges}
          role="button"
          tabIndex={0}
        >
          <div className="challenge-highlight-top">
            <div className="challenge-tag-group">
              <span className="challenge-active-badge">🔥 진행 중인 챌린지</span>
              <span className="challenge-type-pill">
                {activeChallenge.habitType === 'water' && '💧 수분 습관'}
                {activeChallenge.habitType === 'activity' && '🏃 움직임 습관'}
                {activeChallenge.habitType === 'meal' && '🍽️ 식사 습관'}
                {activeChallenge.habitType === 'mind' && '💚 마음 습관'}
              </span>
            </div>
            <div className="challenge-detail-link">
              <span>챌린지 관리</span>
              <ChevronRight size={15} />
            </div>
          </div>

          <h3 className="challenge-highlight-title">{activeChallenge.title}</h3>
          <p className="challenge-highlight-desc">{activeChallenge.description}</p>

          <div className="challenge-progress-bar-wrap">
            <div className="challenge-bar-track">
              <div
                className="challenge-bar-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((activeChallenge.currentSeed / activeChallenge.goalSeed) * 100)
                  )}%`,
                }}
              />
            </div>
            <div className="challenge-bar-labels">
              <span className="challenge-bar-text">
                달성: <strong>{activeChallenge.currentSeed.toLocaleString()}</strong> /{' '}
                {activeChallenge.goalSeed.toLocaleString()} Seed (
                {Math.round((activeChallenge.currentSeed / activeChallenge.goalSeed) * 100)}%)
              </span>
              <span className="challenge-participant-text">
                참여 인원 {activeChallenge.participantCount}명
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. 건강습관별 실천 현황 (Habit Rates) */}
      {/* ================================================== */}
      <section className="admin-section-card">
        <div className="section-card-header">
          <div className="header-title-wrap">
            <span className="header-icon-bubble">📊</span>
            <div>
              <h3 className="card-section-title">오늘의 건강습관별 실천율</h3>
              <span className="card-section-desc">오늘 참여자({stats.todayParticipants}명) 기준 각 습관 실천 현황</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-text-link"
            onClick={onNavigateToParticipation}
          >
            상세보기
          </button>
        </div>

        <div className="admin-habit-progress-list">
          {stats.habits.map((h) => (
            <div key={h.id} className="habit-progress-row">
              <div className="habit-row-info">
                <span className="habit-row-icon">{h.icon}</span>
                <span className="habit-row-name">{h.name}</span>
                <span className="habit-row-count">
                  {h.completedCount}명 / {h.totalCount}명
                </span>
                <strong className="habit-row-percentage">{h.percentage}%</strong>
              </div>

              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill"
                  style={{
                    width: `${h.percentage}%`,
                    background:
                      h.id === 'meal'
                        ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                        : h.id === 'water'
                        ? 'linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)'
                        : h.id === 'activity'
                        ? 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)'
                        : 'linear-gradient(90deg, #C084FC 0%, #9333EA 100%)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. 학생 / 교직원 참여 현황 (Student vs Staff) */}
      {/* ================================================== */}
      <section className="admin-section-card">
        <div className="section-card-header">
          <div className="header-title-wrap">
            <span className="header-icon-bubble">👥</span>
            <div>
              <h3 className="card-section-title">학생 / 교직원 참여 현황</h3>
              <span className="card-section-desc">사용자 그룹별 균형 잡힌 참여 추이</span>
            </div>
          </div>
        </div>

        <div className="user-group-stats-grid">
          {/* Student */}
          <div className="user-group-box student-box">
            <div className="user-group-title-row">
              <strong className="user-group-name">🎒 학생</strong>
              <span className="user-group-rate-badge">{stats.studentStats.rate}%</span>
            </div>
            <div className="user-group-details">
              <div className="group-detail-item">
                <span className="detail-item-label">가입자</span>
                <strong className="detail-item-value">{stats.studentStats.totalUsers}명</strong>
              </div>
              <div className="group-detail-item">
                <span className="detail-item-label">오늘 참여</span>
                <strong className="detail-item-value">{stats.studentStats.todayParticipants}명</strong>
              </div>
            </div>
            <div className="group-bar-track">
              <div
                className="group-bar-fill student-fill"
                style={{ width: `${stats.studentStats.rate}%` }}
              />
            </div>
          </div>

          {/* Staff */}
          <div className="user-group-box staff-box">
            <div className="user-group-title-row">
              <strong className="user-group-name">👩‍🏫 교직원</strong>
              <span className="user-group-rate-badge staff">{stats.staffStats.rate}%</span>
            </div>
            <div className="user-group-details">
              <div className="group-detail-item">
                <span className="detail-item-label">가입자</span>
                <strong className="detail-item-value">{stats.staffStats.totalUsers}명</strong>
              </div>
              <div className="group-detail-item">
                <span className="detail-item-label">오늘 참여</span>
                <strong className="detail-item-value">{stats.staffStats.todayParticipants}명</strong>
              </div>
            </div>
            <div className="group-bar-track">
              <div
                className="group-bar-fill staff-fill"
                style={{ width: `${stats.staffStats.rate}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Row for Character & Goal Distribution */}
      <div className="admin-double-cards-row">
        {/* ================================================== */}
        {/* 6. 캐릭터 선택 현황 (선호도 & 재미 파악용) */}
        {/* ================================================== */}
        <section className="admin-section-card half-card">
          <div className="section-card-header">
            <div className="header-title-wrap">
              <span className="header-icon-bubble">🐣</span>
              <div>
                <h3 className="card-section-title">메이트 선호도</h3>
                <span className="card-section-desc">서비스 참여 재미 요소 통계</span>
              </div>
            </div>
          </div>

          <div className="character-stats-list">
            {stats.characterPreferences.map((c) => (
              <div key={c.characterId} className="char-stat-row">
                <span className="char-name">{c.name}</span>
                <div className="char-bar-track">
                  <div
                    className="char-bar-fill"
                    style={{ width: `${c.percentage * 3}%`, backgroundColor: c.color }}
                  />
                </div>
                <span className="char-count">{c.count}명</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* 7. 주간 건강목표 현황 (Goal Distribution) */}
        {/* ================================================== */}
        <section className="admin-section-card half-card">
          <div className="section-card-header">
            <div className="header-title-wrap">
              <span className="header-icon-bubble">🎯</span>
              <div>
                <h3 className="card-section-title">주간 목표 씨앗 분포</h3>
                <span className="card-section-desc">사용자들이 설정한 목표 카테고리</span>
              </div>
            </div>
          </div>

          <div className="goal-dist-grid">
            {stats.goalDistributions.map((g, idx) => (
              <div key={idx} className="goal-dist-chip">
                <span className="goal-dist-icon">{g.icon}</span>
                <span className="goal-dist-cat">{g.category}</span>
                <strong className="goal-dist-pct">{g.percentage}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================================================== */}
      {/* 14. 개인정보 보호 원칙 안내 배너 */}
      {/* ================================================== */}
      <div className="admin-privacy-promise-card">
        <div className="promise-icon-wrap">
          <ShieldCheck size={20} color="#16A34A" />
        </div>
        <div className="promise-text-wrap">
          <strong className="promise-title">HealSeed 학생 개인정보 보호 원칙</strong>
          <p className="promise-desc">
            관리자 화면은 학교 전체의 건강습관 증진을 위한 <strong>익명 집계 데이터</strong>만 제공하며,
            개별 학생의 체중, BMI, 칼로리, 개인 건강 랭킹 및 급식판 사진은 일체 노출되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
