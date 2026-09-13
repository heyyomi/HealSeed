import React, { useState } from 'react';
import {
  Activity,
  Video,
  CheckCircle2,
  XCircle,
  Sparkles,
  Edit3,
  RotateCcw,
  Check,
  X,
  Clock,
  MapPin,
  Flame,
  Info,
  Play
} from 'lucide-react';
import type { MovementActivity } from '../../types/onboarding';
import {
  getMovementActivities,
  saveMovementActivity,
  resetToDefaultMovements,
  getYouTubeEmbedUrl,
  isValidYouTubeUrl
} from '../../services/movementService';

interface AdminMovementScreenProps {
  schoolName: string;
}

export const AdminMovementScreen: React.FC<AdminMovementScreenProps> = ({ schoolName }) => {
  const [activities, setActivities] = useState<MovementActivity[]>(() => getMovementActivities());
  const [editingActivity, setEditingActivity] = useState<MovementActivity | null>(null);

  // Form states for modal
  const [formData, setFormData] = useState<Partial<MovementActivity>>({});
  const [urlError, setUrlError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenEdit = (act: MovementActivity) => {
    setEditingActivity(act);
    setFormData({
      ...act,
      youtubeUrl: act.youtubeUrl || '',
      videoSource: act.videoSource || '',
    });
    setUrlError(null);
  };

  const handleToggleActive = (act: MovementActivity) => {
    const updated = saveMovementActivity({
      ...act,
      isActive: !act.isActive,
    });
    setActivities(updated);
    showToast(`'${act.name}' 활동이 ${!act.isActive ? '활성화' : '비활성화'}되었습니다.`);
  };

  const handleSetFeatured = (act: MovementActivity) => {
    if (!act.isActive) {
      showToast('비활성화된 활동은 오늘의 추천으로 지정할 수 없습니다.');
      return;
    }
    const updated = saveMovementActivity({
      ...act,
      isFeatured: true,
    });
    setActivities(updated);
    showToast(`'${act.name}' 활동이 오늘의 추천으로 설정되었습니다. 🌱`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('기본 5종 움직임 설정을 초기화하시겠습니까?')) {
      const reset = resetToDefaultMovements();
      setActivities(reset);
      showToast('기본 움직임 5종이 초기 설정으로 복원되었습니다.');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    const trimmedUrl = (formData.youtubeUrl || '').trim();
    if (trimmedUrl && !isValidYouTubeUrl(trimmedUrl)) {
      setUrlError('올바른 YouTube 영상 URL 형식(youtu.be 또는 youtube.com)을 입력해주세요.');
      return;
    }

    const updatedActivity: MovementActivity = {
      ...editingActivity,
      name: (formData.name || editingActivity.name).trim(),
      type: (formData.type || editingActivity.type).trim(),
      durationMinutes: Number(formData.durationMinutes) || editingActivity.durationMinutes,
      durationText: (formData.durationText || editingActivity.durationText || `${formData.durationMinutes}분`).trim(),
      location: (formData.location || editingActivity.location).trim(),
      description: (formData.description || editingActivity.description).trim(),
      youtubeUrl: trimmedUrl,
      videoSource: (formData.videoSource || '').trim(),
      isActive: formData.isActive ?? editingActivity.isActive,
      isFeatured: formData.isFeatured ?? editingActivity.isFeatured,
    };

    const updatedList = saveMovementActivity(updatedActivity);
    setActivities(updatedList);
    setEditingActivity(null);
    showToast(`'${updatedActivity.name}' 활동 정보가 저장되었습니다.`);
  };

  const activeCount = activities.filter((a) => a.isActive).length;
  const featuredActivity = activities.find((a) => a.isFeatured);
  const previewEmbedUrl = getYouTubeEmbedUrl(formData.youtubeUrl);

  return (
    <div className="admin-movement-container animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-banner animate-pop-in">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title Banner */}
      <div className="admin-section-header-banner">
        <div className="header-titles">
          <div className="section-pill-tag">
            <Activity size={13} />
            <span>신체활동 추천 시스템</span>
          </div>
          <h2 className="section-main-heading">추천 움직임 관리</h2>
          <p className="section-sub-heading">
            {schoolName} 학생과 교직원이 급식 후 실천할 수 있는 5가지 기본 움직임과 영상을 관리합니다.
          </p>
        </div>

        <button
          type="button"
          className="btn-admin-secondary btn-reset-movements"
          onClick={handleResetDefaults}
          title="초기 5종 데이터로 복원"
        >
          <RotateCcw size={14} />
          <span>기본값 복원</span>
        </button>
      </div>

      {/* Philosophy Banner */}
      <div className="movement-admin-philosophy-card">
        <div className="philosophy-icon-col">
          <Flame size={20} className="philosophy-flame" />
        </div>
        <div className="philosophy-text-col">
          <strong>💡 HealSeed 움직임 추천 원칙</strong>
          <p>
            칼로리를 소모하거나 상쇄하기 위한 운동이 아닌,
            <strong> “잘 먹고 즐겁게 몸을 움직이는 건강한 일상 습관”</strong>을 심어줍니다.
            검증된 기관(국민건강보험공단, 체육회 등)의 안전한 YouTube 영상을 연결해주세요.
          </p>
        </div>
      </div>

      {/* Status Summary Bar */}
      <div className="movement-status-summary-bar">
        <div className="summary-stat-item">
          <span className="summary-stat-label">등록된 기본 움직임</span>
          <strong className="summary-stat-value">{activities.length}종</strong>
        </div>
        <div className="summary-stat-divider" />
        <div className="summary-stat-item">
          <span className="summary-stat-label">현재 사용자 노출 (활성)</span>
          <strong className="summary-stat-value highlight">{activeCount}종 활성</strong>
        </div>
        <div className="summary-stat-divider" />
        <div className="summary-stat-item">
          <span className="summary-stat-label">오늘의 추천 움직임</span>
          <strong className="summary-stat-value featured-text">
            {featuredActivity ? `${featuredActivity.icon} ${featuredActivity.name}` : '지정 필요'}
          </strong>
        </div>
      </div>

      {/* Movement List Grid */}
      <div className="movement-cards-grid">
        {activities.map((act) => {
          const hasVideo = !!act.youtubeUrl;
          return (
            <div
              key={act.id}
              className={`movement-admin-card ${act.isActive ? 'active' : 'inactive'} ${
                act.isFeatured ? 'is-featured' : ''
              }`}
            >
              {/* Card Header */}
              <div className="card-top-row">
                <div className="card-identity">
                  <span className="movement-icon-badge">{act.icon}</span>
                  <div className="movement-name-col">
                    <div className="name-with-badge">
                      <strong className="movement-title">{act.name}</strong>
                      {act.isFeatured && <span className="badge-today-featured">⭐ 오늘의 추천</span>}
                    </div>
                    <span className="movement-type-label">{act.type}</span>
                  </div>
                </div>

                <div className="card-header-actions">
                  <button
                    type="button"
                    className={`btn-active-toggle ${act.isActive ? 'on' : 'off'}`}
                    onClick={() => handleToggleActive(act)}
                    title={act.isActive ? '클릭하여 비활성화' : '클릭하여 활성화'}
                  >
                    {act.isActive ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>활성 (ON)</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        <span>비활성 (OFF)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card Meta Specs */}
              <div className="card-specs-row">
                <span className="spec-pill">
                  <Clock size={12} />
                  <span>{act.durationText || `${act.durationMinutes}분`}</span>
                </span>
                <span className="spec-pill">
                  <MapPin size={12} />
                  <span>{act.location}</span>
                </span>
              </div>

              {/* Description */}
              <p className="card-description">{act.description}</p>

              {/* Video Status Box */}
              <div className="card-video-info-box">
                {hasVideo ? (
                  <div className="video-registered-line">
                    <Video size={14} className="video-icon active" />
                    <span className="video-status-text">YouTube 영상 등록됨</span>
                    {act.videoSource && (
                      <span className="video-source-pill">출처: {act.videoSource}</span>
                    )}
                  </div>
                ) : (
                  <div className="video-unregistered-line">
                    <Info size={14} className="video-icon muted" />
                    <span className="video-status-text">
                      {act.id === 'walk-light' ? '영상 없이 바로 실천 (걷기)' : '등록된 영상 없음'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Action Buttons */}
              <div className="card-actions-row">
                {!act.isFeatured && act.isActive && (
                  <button
                    type="button"
                    className="btn-set-featured"
                    onClick={() => handleSetFeatured(act)}
                  >
                    <span>오늘의 추천으로 설정</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-edit-movement"
                  onClick={() => handleOpenEdit(act)}
                >
                  <Edit3 size={14} />
                  <span>영상 및 정보 수정</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Movement & Video Registration Modal */}
      {editingActivity && (
        <div className="admin-modal-overlay animate-fade-in" onClick={() => setEditingActivity(null)}>
          <div className="admin-modal-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon">{formData.icon || editingActivity.icon}</span>
                <div>
                  <h3 className="modal-title">{editingActivity.name} 수정</h3>
                  <span className="modal-subtitle">YouTube 영상 등록 및 추천 세부설정</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setEditingActivity(null)}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="modal-form-body">
              {/* 1. YouTube 영상 등록 섹션 */}
              <div className="form-section-box">
                <div className="form-section-header">
                  <Video size={16} className="text-primary" />
                  <strong>YouTube 따라하기 영상 등록</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">YouTube 동영상 URL</label>
                  <input
                    type="text"
                    className={`form-input ${urlError ? 'input-error' : ''}`}
                    placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                    value={formData.youtubeUrl || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, youtubeUrl: e.target.value });
                      setUrlError(null);
                    }}
                  />
                  {urlError ? (
                    <span className="field-error-text">{urlError}</span>
                  ) : (
                    <span className="field-hint-text">
                      * 학생과 교직원이 따라할 수 있는 YouTube 영상 주소를 입력해주세요.
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">영상 출처명</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="예: 국민건강보험공단, 대한스트레칭협회, 학교체육진흥회"
                    value={formData.videoSource || ''}
                    onChange={(e) => setFormData({ ...formData, videoSource: e.target.value })}
                  />
                  <span className="field-hint-text">
                    * 사용자 화면 하단에 '영상 출처: ○○' 형태로 신뢰성 있게 노출됩니다.
                  </span>
                </div>

                {/* Video Preview Box */}
                {previewEmbedUrl ? (
                  <div className="youtube-preview-container">
                    <span className="preview-tag">
                      <Play size={12} /> 실시간 미리보기
                    </span>
                    <div className="iframe-responsive-wrapper">
                      <iframe
                        src={previewEmbedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : formData.youtubeUrl ? (
                  <div className="preview-invalid-box">
                    <span>유효한 YouTube URL을 입력하면 영상 미리보기가 나타납니다.</span>
                  </div>
                ) : null}
              </div>

              {/* 2. 세부 정보 섹션 */}
              <div className="form-section-box">
                <div className="form-section-header">
                  <Info size={16} className="text-primary" />
                  <strong>활동 세부 정보</strong>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">활동명</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">활동 유형</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">권장시간 표시 (분)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      className="form-input"
                      value={formData.durationMinutes || 5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: Number(e.target.value),
                          durationText: `${e.target.value}분`,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">권장 장소</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">간단한 설명</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Checkboxes: 활성 & 오늘의 추천 */}
                <div className="form-checkboxes-row">
                  <label className="checkbox-item-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>일반 사용자에게 노출 (활성화)</span>
                  </label>

                  <label className="checkbox-item-label">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured ?? false}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>⭐ 오늘의 추천 움직임으로 지정</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={() => setEditingActivity(null)}
                >
                  취소
                </button>
                <button type="submit" className="btn-admin-primary">
                  <Check size={16} />
                  <span>설정 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
