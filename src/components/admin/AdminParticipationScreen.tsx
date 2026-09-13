import React, { useState } from 'react';
import {
  Calendar,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { getFilteredParticipationData } from '../../services/adminService';

interface AdminParticipationScreenProps {
  schoolName: string;
}

export const AdminParticipationScreen: React.FC<AdminParticipationScreenProps> = ({ schoolName }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week'>('today');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'student' | 'staff'>('all');

  const data = getFilteredParticipationData(timeRange, userTypeFilter);

  return (
    <div className="admin-content-container animate-fade-in-up">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-title-badge-row">
          <span className="admin-school-badge">🏫 {schoolName}</span>
          <span className="admin-date-badge">참여 데이터 상세</span>
        </div>
        <h2 className="admin-main-title">학교 참여현황 상세</h2>
        <p className="admin-main-subtitle">
          기간 및 대상별로 필터링하여 학교 구성원의 건강습관 실천 추이를 확인해요.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="admin-filter-bar-card">
        {/* Time Range Filter */}
        <div className="filter-group">
          <span className="filter-group-label">
            <Calendar size={14} />
            <span>조회 기간</span>
          </span>
          <div className="filter-toggle-pills">
            <button
              type="button"
              className={`filter-btn ${timeRange === 'today' ? 'active' : ''}`}
              onClick={() => setTimeRange('today')}
            >
              오늘
            </button>
            <button
              type="button"
              className={`filter-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              이번 주
            </button>
          </div>
        </div>

        {/* User Type Filter */}
        <div className="filter-group">
          <span className="filter-group-label">
            <Filter size={14} />
            <span>사용자 유형</span>
          </span>
          <div className="filter-toggle-pills">
            <button
              type="button"
              className={`filter-btn ${userTypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setUserTypeFilter('all')}
            >
              전체
            </button>
            <button
              type="button"
              className={`filter-btn ${userTypeFilter === 'student' ? 'active' : ''}`}
              onClick={() => setUserTypeFilter('student')}
            >
              학생
            </button>
            <button
              type="button"
              className={`filter-btn ${userTypeFilter === 'staff' ? 'active' : ''}`}
              onClick={() => setUserTypeFilter('staff')}
            >
              교직원
            </button>
          </div>
        </div>
      </div>

      {/* Filtered 4 Metric Cards */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <span className="metric-label">총 가입 대상</span>
          <div className="metric-value-row">
            <strong className="metric-number">{data.totalUsers}</strong>
            <span className="metric-unit">명</span>
          </div>
          <span className="metric-sub-detail">
            {userTypeFilter === 'all' ? '전체 학교 구성원' : userTypeFilter === 'student' ? '전체 학생' : '전체 교직원'}
          </span>
        </div>

        <div className="admin-metric-card highlight-card">
          <span className="metric-label">{timeRange === 'today' ? '오늘 참여자' : '주간 참여자'}</span>
          <div className="metric-value-row">
            <strong className="metric-number">{data.participants}</strong>
            <span className="metric-unit">명</span>
          </div>
          <span className="metric-sub-detail">참여율 {data.participationRate}%</span>
        </div>

        <div className="admin-metric-card">
          <span className="metric-label">{timeRange === 'today' ? '오늘 획득 Seed' : '주간 누적 Seed'}</span>
          <div className="metric-value-row">
            <strong className="metric-number">{data.totalSeed.toLocaleString()}</strong>
            <span className="metric-unit">Seed</span>
          </div>
          <span className="metric-sub-detail">건강습관 완료 누적 포인트</span>
        </div>

        <div className="admin-metric-card">
          <span className="metric-label">주간 목표 실천율</span>
          <div className="metric-value-row">
            <strong className="metric-number">{data.weeklyGoalCompletionRate}</strong>
            <span className="metric-unit">%</span>
          </div>
          <span className="metric-sub-detail">15 Seed 목표 도달률</span>
        </div>
      </div>

      {/* Habit Breakdown for filtered selection */}
      <section className="admin-section-card">
        <div className="section-card-header">
          <div className="header-title-wrap">
            <span className="header-icon-bubble">📈</span>
            <div>
              <h3 className="card-section-title">
                {timeRange === 'today' ? '오늘의' : '이번 주'} 건강습관별 실천율
              </h3>
              <span className="card-section-desc">
                {userTypeFilter === 'all' ? '전체' : userTypeFilter === 'student' ? '학생' : '교직원'} 대상 집계 ({data.participants}명 참여)
              </span>
            </div>
          </div>
        </div>

        <div className="admin-habit-progress-list">
          {data.habits.map((h) => (
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

      {/* Privacy Guarantee Note */}
      <div className="admin-privacy-promise-card">
        <div className="promise-icon-wrap">
          <ShieldCheck size={20} color="#16A34A" />
        </div>
        <div className="promise-text-wrap">
          <strong className="promise-title">안심 익명 통계 보호 원칙</strong>
          <p className="promise-desc">
            학생 개개인의 식사 내역, 급식판 사진, 개인 랭킹은 관리자 화면에 노출되지 않으며 안전한 집계 지표로만 제공됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
