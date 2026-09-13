import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  Sparkles,
  Users,
  Play,
  Pause,
  Trash2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SchoolChallenge, HabitCategory } from '../../types/admin';
import {
  createChallenge,
  toggleChallengeActive,
  deleteChallenge,
} from '../../services/challengeService';

interface AdminChallengeScreenProps {
  challenges: SchoolChallenge[];
  onRefreshChallenges: () => void;
  schoolName: string;
}

const HABIT_TYPE_OPTIONS: { type: HabitCategory; label: string; icon: string }[] = [
  { type: 'water', label: '수분', icon: '💧' },
  { type: 'meal', label: '식사', icon: '🍽️' },
  { type: 'activity', label: '움직임', icon: '🏃' },
  { type: 'mind', label: '마음', icon: '💚' },
  { type: 'rest', label: '휴식', icon: '😴' },
];

export const AdminChallengeScreen: React.FC<AdminChallengeScreenProps> = ({
  challenges,
  onRefreshChallenges,
  schoolName,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'ended'>('all');

  // New challenge form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitType, setHabitType] = useState<HabitCategory>('water');
  const [startDate, setStartDate] = useState('2026-09-14');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [goalSeed, setGoalSeed] = useState(1000);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredChallenges = challenges.filter((c) => {
    if (filterTab === 'active') return c.isActive;
    if (filterTab === 'ended') return !c.isActive;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('챌린지 제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      setFormError('챌린지 설명을 입력해주세요.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('시작일과 종료일을 입력해주세요.');
      return;
    }
    if (goalSeed <= 0) {
      setFormError('목표 Seed는 0보다 커야 합니다.');
      return;
    }

    createChallenge({
      title: title.trim(),
      description: description.trim(),
      habitType,
      startDate,
      endDate,
      goalSeed,
      isActive: true,
      createdBy: '보건교사',
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#38BDF8', '#FACC15'],
      });
    } catch {}

    // Reset & close
    setTitle('');
    setDescription('');
    setHabitType('water');
    setFormError(null);
    setShowCreateModal(false);
    onRefreshChallenges();
  };

  const handleToggle = (id: string) => {
    toggleChallengeActive(id);
    onRefreshChallenges();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 챌린지를 삭제하시겠습니까?')) {
      deleteChallenge(id);
      onRefreshChallenges();
    }
  };

  return (
    <div className="admin-content-container animate-fade-in-up">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="header-action-row">
          <div>
            <div className="admin-title-badge-row">
              <span className="admin-school-badge">🏫 {schoolName}</span>
              <span className="admin-date-badge">공동 챌린지</span>
            </div>
            <h2 className="admin-main-title">학교 공동 챌린지 관리</h2>
            <p className="admin-main-subtitle">
              우리 학교 친구들과 함께 달성할 건강습관 챌린지를 개설하고 운영해요.
            </p>
          </div>

          <button
            type="button"
            className="btn-admin-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span>새 챌린지 만들기</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="challenge-filter-tabs">
        <button
          type="button"
          className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          전체 ({challenges.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterTab === 'active' ? 'active' : ''}`}
          onClick={() => setFilterTab('active')}
        >
          진행 중 ({challenges.filter((c) => c.isActive).length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterTab === 'ended' ? 'active' : ''}`}
          onClick={() => setFilterTab('ended')}
        >
          종료/대기 ({challenges.filter((c) => !c.isActive).length})
        </button>
      </div>

      {/* Challenges List */}
      <div className="admin-challenges-list">
        {filteredChallenges.length === 0 ? (
          <div className="admin-empty-card">
            <Trophy size={40} className="empty-icon" />
            <strong className="empty-title">해당하는 챌린지가 없습니다</strong>
            <p className="empty-desc">[새 챌린지 만들기] 버튼을 눌러 학교 공동 목표를 개설해보세요.</p>
          </div>
        ) : (
          filteredChallenges.map((ch) => {
            const pct = Math.min(100, Math.round((ch.currentSeed / ch.goalSeed) * 100));
            const isCompleted = ch.currentSeed >= ch.goalSeed;

            return (
              <div key={ch.id} className={`admin-challenge-item-card ${ch.isActive ? 'active' : ''}`}>
                <div className="item-card-top">
                  <div className="item-tags-wrap">
                    <span className={`status-pill ${ch.isActive ? 'running' : 'stopped'}`}>
                      {ch.isActive ? '🔥 진행 중' : isCompleted ? '🎉 달성 완료' : '종료 / 대기'}
                    </span>
                    <span className="type-tag">
                      {ch.habitType === 'water' && '💧 수분'}
                      {ch.habitType === 'meal' && '🍽️ 식사'}
                      {ch.habitType === 'activity' && '🏃 움직임'}
                      {ch.habitType === 'mind' && '💚 마음'}
                      {ch.habitType === 'rest' && '😴 휴식'}
                    </span>
                    <span className="date-tag">
                      <Calendar size={12} />
                      <span>{ch.startDate} ~ {ch.endDate}</span>
                    </span>
                  </div>

                  <div className="item-actions-row">
                    <button
                      type="button"
                      className="btn-action-icon toggle"
                      onClick={() => handleToggle(ch.id)}
                      title={ch.isActive ? '챌린지 일시정지' : '챌린지 재시작'}
                    >
                      {ch.isActive ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon delete"
                      onClick={() => handleDelete(ch.id)}
                      title="챌린지 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="challenge-item-title">{ch.title}</h3>
                <p className="challenge-item-desc">{ch.description}</p>

                {/* Progress bar */}
                <div className="challenge-bar-wrap">
                  <div className="challenge-bar-track">
                    <div className="challenge-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="challenge-bar-sub">
                    <span className="current-stat">
                      달성: <strong>{ch.currentSeed.toLocaleString()}</strong> / {ch.goalSeed.toLocaleString()} Seed ({pct}%)
                    </span>
                    <span className="participants-stat">
                      <Users size={13} />
                      <span>참여 {ch.participantCount}명</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================================================== */}
      {/* 9. 새 챌린지 만들기 Modal */}
      {/* ================================================== */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-badge-row">
              <div className="modal-emoji">🏆</div>
              <span className="modal-category-badge">공동 건강습관 챌린지</span>
            </div>
            <h3 className="modal-title">새 챌린지 만들기</h3>
            <p className="modal-desc">
              학교 친구들이 함께 참여할 즐거운 건강 목표를 설정해주세요.
            </p>

            {formError && (
              <div className="form-error-alert animate-pop-in">
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="admin-challenge-form">
              {/* Habit Type selector */}
              <div className="form-group">
                <label className="form-label">건강습관 유형</label>
                <div className="habit-type-pill-group">
                  {HABIT_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      className={`type-select-btn ${habitType === opt.type ? 'active' : ''}`}
                      onClick={() => setHabitType(opt.type)}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">챌린지 제목</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 우리 학교 물 마시기 챌린지"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">챌린지 설명</label>
                <textarea
                  className="form-textarea"
                  placeholder="예: 이번 주에는 물 마시기 습관을 함께 키워봐요! 틈틈이 물 한 잔으로 상쾌하게!"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Dates */}
              <div className="form-dates-row">
                <div className="form-group half">
                  <label className="form-label">시작일</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label className="form-label">종료일</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Goal Seed */}
              <div className="form-group">
                <label className="form-label">공동 목표 Seed</label>
                <div className="seed-input-row">
                  <input
                    type="number"
                    className="form-input"
                    step={100}
                    min={100}
                    value={goalSeed}
                    onChange={(e) => setGoalSeed(Number(e.target.value))}
                  />
                  <span className="seed-input-unit">Seed</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="modal-btn-row">
                <button type="submit" className="btn-primary">
                  <Sparkles size={16} />
                  <span>챌린지 시작하기</span>
                </button>
                <button
                  type="button"
                  className="btn-subtle"
                  onClick={() => setShowCreateModal(false)}
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
