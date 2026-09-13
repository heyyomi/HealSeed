import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Apple,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Lock,
  Activity,
  Smile,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MealData, DailyRecord, MealRecord } from '../types/onboarding';
import { getMenuIcon, isWeekend } from '../services/mealService';
import { compressAndConvertToBase64 } from '../services/photoService';
import './MealDetailScreen.css';

interface MealDetailScreenProps {
  meal: MealData;
  formattedDateLabel: string;
  dailyRecord: DailyRecord;
  mealRecord?: MealRecord;
  onBack: () => void;
  onToggleHabit: (key: keyof DailyRecord, isPrimarySeedHabit: boolean) => void;
  onSaveMealRecord?: (record: { mealImageUrl: string; mealMemo: string }) => void;
}

const MEMO_PRESETS = [
  '새로운 반찬도 먹어봤어요. 🥢',
  '천천히 먹으려고 노력했어요. ⏳',
  '오늘은 물도 함께 마셨어요. 💧',
  '내 몸의 기분 좋은 배부름을 느꼈어요. 🥗',
];

interface MovementOption {
  id: string;
  icon: string;
  name: string;
  desc: string;
  defaultMinutes: number;
  intensity: string;
}

const MOVEMENT_OPTIONS: MovementOption[] = [
  {
    id: 'walk-10',
    icon: '🚶',
    name: '10분 가볍게 걷기',
    desc: '운동장 또는 복도 10분 걷기',
    defaultMinutes: 10,
    intensity: '가볍게',
  },
  {
    id: 'stretch-5',
    icon: '🧘',
    name: '5분 스트레칭',
    desc: '목과 어깨, 허리를 시원하게 펴주는 스트레칭',
    defaultMinutes: 5,
    intensity: '편안하게',
  },
  {
    id: 'stairs',
    icon: '🪜',
    name: '가까운 층 계단 이용하기',
    desc: '엘리베이터 대신 가까운 층 계단으로 오르기',
    defaultMinutes: 5,
    intensity: '활기차게',
  },
  {
    id: 'break-walk',
    icon: '🌳',
    name: '쉬는 시간에 잠깐 걷기',
    desc: '친구와 함께 복도나 교정 거닐기',
    defaultMinutes: 10,
    intensity: '가볍게',
  },
  {
    id: 'fun-move',
    icon: '🏃',
    name: '10분 즐겁게 움직이기',
    desc: '신나는 음악과 함께 활력 충전하기',
    defaultMinutes: 10,
    intensity: '신나게',
  },
];

const DURATION_PRESETS = [5, 10, 15];

export const MealDetailScreen: React.FC<MealDetailScreenProps> = ({
  meal,
  formattedDateLabel,
  dailyRecord,
  mealRecord,
  onBack,
  onToggleHabit,
  onSaveMealRecord,
}) => {
  const isNoMeal = meal.isNoMealDay || isWeekend(meal.date);

  // Section 2: Nutrition & Allergy Accordions
  const [showMoreNutrition, setShowMoreNutrition] = useState<boolean>(false);
  const [showAllergies, setShowAllergies] = useState<boolean>(false);

  // Section 3: Photo State
  const [photoDataUrl, setPhotoDataUrl] = useState<string>(mealRecord?.mealImageUrl || '');
  const [memo, setMemo] = useState<string>(mealRecord?.mealMemo || '');
  const [isPhotoSaved, setIsPhotoSaved] = useState<boolean>(!!mealRecord?.mealImageUrl);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPhotoChoiceModal, setShowPhotoChoiceModal] = useState<boolean>(false);

  // Section 4: Movement Selection & Duration Logging
  const [selectedMovementId, setSelectedMovementId] = useState<string>('walk-10');
  const [showOtherMovements, setShowOtherMovements] = useState<boolean>(false);
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(10);
  const [customMinutes, setCustomMinutes] = useState<string>('10');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  // Parse Core Nutrients vs Additional Nutrients
  const carbsItem = meal.nutritionList?.find((n) => n.name === '탄수화물');
  const proteinItem = meal.nutritionList?.find((n) => n.name === '단백질');
  // 지방: ONLY present if actual NEIS OpenAPI response provides it!
  const fatItem = meal.nutritionList?.find((n) => n.name === '지방');

  const coreNutrients: { name: string; amount: string; icon?: string }[] = [];

  // 1. 열량 (Calorie)
  if (meal.calories) {
    coreNutrients.push({ name: '열량', amount: meal.calories });
  }

  // 2. 탄수화물
  if (carbsItem) {
    coreNutrients.push(carbsItem);
  }

  // 3. 단백질
  if (proteinItem) {
    coreNutrients.push(proteinItem);
  }

  // 4. 지방 (NEIS 실제값 제공 시에만 추가)
  if (fatItem) {
    coreNutrients.push(fatItem);
  }

  // 나머지 영양소 (비타민A, 티아민, 리보플라빈, 비타민C, 칼슘, 철분 등)
  const moreNutrients = (meal.nutritionList || []).filter(
    (n) => !['열량', '탄수화물', '단백질', '지방'].includes(n.name)
  );

  // Selected movement object
  const activeMovement =
    MOVEMENT_OPTIONS.find((m) => m.id === selectedMovementId) || MOVEMENT_OPTIONS[0];

  // Calculated effective minutes
  const effectiveMinutes =
    durationPreset === 'custom'
      ? Math.max(1, parseInt(customMinutes, 10) || 10)
      : durationPreset;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsCompressing(true);
    setErrorMessage(null);
    setShowPhotoChoiceModal(false);

    try {
      const base64 = await compressAndConvertToBase64(file);
      setPhotoDataUrl(base64);
      setIsPhotoSaved(false);
    } catch (err: any) {
      setErrorMessage(err?.message || '사진을 읽어오는데 실패했습니다.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSaveMealPhoto = () => {
    if (!photoDataUrl) return;
    onSaveMealRecord?.({
      mealImageUrl: photoDataUrl,
      mealMemo: memo.trim(),
    });
    setIsPhotoSaved(true);
    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#22C55E', '#38BDF8', '#FACC15'],
      });
    } catch {}
  };

  const handleResetPhoto = () => {
    setPhotoDataUrl('');
    setMemo('');
    setIsPhotoSaved(false);
    onSaveMealRecord?.({
      mealImageUrl: '',
      mealMemo: '',
    });
  };

  const handleSelectPresetMemo = (preset: string) => {
    if (memo.includes(preset)) return;
    setMemo((prev) => (prev ? `${prev} ${preset}` : preset));
    setIsPhotoSaved(false);
  };

  // Activity Habit Sync (+1 Seed, preventing duplicate seed)
  const handleCompleteMovement = () => {
    if (dailyRecord.activity) {
      // 이미 오늘 몸 움직이기로 Seed를 받았으면 중복 지급하지 않음
      return;
    }

    onToggleHabit('activity', true);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#22C55E', '#38BDF8', '#FACC15'],
      });
    } catch {}
  };

  return (
    <div className="meal-detail-screen screen-container">
      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 돌아가기">
          <ChevronLeft size={22} />
        </button>
        <div className="header-school-info">
          <span className="school-pill">{meal.schoolName}</span>
          <span className="header-date">{formattedDateLabel}</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Title */}
      <div className="screen-title-section animate-fade-in-up">
        <div className="meal-badge-group">
          <div className="meal-badge">
            <UtensilsCrossed size={14} />
            <span>학교 급식 식단표</span>
          </div>
          <span className="neis-live-badge">
            <ShieldCheck size={13} />
            <span>NEIS 실시간 연동</span>
          </span>
        </div>
        <h2 className="screen-main-title">
          {isNoMeal ? '급식 일정 안내' : '오늘의 급식 메뉴'}
        </h2>
        <p className="screen-subtitle">
          {isNoMeal
            ? `오늘(${formattedDateLabel})은 학교 급식이 운영되지 않는 날이에요.`
            : '정성껏 준비된 오늘의 건강하고 균형 잡힌 식단이에요.'}
        </p>
      </div>

      {/* ================================================== */}
      {/* 1. 오늘의 급식 영역 (Dish Cards) */}
      {/* ================================================== */}
      {isNoMeal ? (
        <div className="detail-no-meal-banner animate-pop-in">
          <div className="detail-no-meal-header">
            <span className="detail-no-meal-emoji">🏖️</span>
            <div className="detail-no-meal-titles">
              <strong className="detail-no-meal-main">오늘은 급식이 없는 날이에요</strong>
              <span className="detail-no-meal-sub">
                {meal.noMealReason || '주말(토·일요일) 및 공휴일에는 학교 급식이 운영되지 않아요.'}
              </span>
            </div>
          </div>
          <div className="detail-no-meal-box">
            <strong className="notice-title">💡 주말 식사 & 건강 습관 가이드</strong>
            <ul className="notice-list">
              <li>학교 급식이 없어도 규칙적인 식사 시간을 지켜보세요.</li>
              <li>좋아하는 음식과 함께 신선한 채소와 물도 골고루 챙겨보세요.</li>
              <li>아래에서 오늘의 건강한 한 끼 기록과 움직임을 실천해보세요!</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="detail-menu-grid animate-pop-in">
          {meal.menu.map((dish, index) => (
            <div key={index} className="detail-dish-card">
              <span className="dish-icon">{getMenuIcon(dish)}</span>
              <div className="dish-info">
                <span className="dish-index">메뉴 {index + 1}</span>
                <strong className="dish-name">{dish}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================== */}
      {/* 2. 영양 · 알레르기 정보 영역 (단순화 및 아코디언) */}
      {/* ================================================== */}
      {!isNoMeal && (
        <section className="meal-simplified-nutrition-section animate-fade-in-up">
          {/* Header */}
          <div className="section-title-row">
            <div className="section-title-wrap">
              <Apple size={16} className="nutrition-section-icon" />
              <h3 className="section-title">영양 · 알레르기 정보</h3>
            </div>
            <span className="info-live-source">NEIS 공식 정보</span>
          </div>

          {/* 2-1. 핵심 영양정보 4개 기본 표시 (열량, 탄수화물, 단백질, 지방) */}
          <div className="core-nutrition-grid">
            {coreNutrients.length > 0 ? (
              coreNutrients.map((item, idx) => (
                <div key={idx} className={`core-nutrient-card ${item.name === '열량' ? 'calorie-card' : ''}`}>
                  <div className="nutrient-label-row">
                    {item.name === '열량' && <Flame size={13} className="calorie-icon" />}
                    <span className="nutrient-label">{item.name}</span>
                  </div>
                  <strong className="nutrient-val">{item.amount}</strong>
                </div>
              ))
            ) : (
              <p className="nutrition-empty-note">
                {meal.nutritionInfo || '영양 정보가 제공되지 않았습니다.'}
              </p>
            )}
          </div>

          {/* 2-2. [영양정보 더보기 ▼] 아코디언 */}
          {moreNutrients.length > 0 && (
            <div className="nutrition-more-container">
              <button
                type="button"
                className="btn-nutrition-toggle"
                onClick={() => setShowMoreNutrition(!showMoreNutrition)}
                aria-expanded={showMoreNutrition}
              >
                <span>{showMoreNutrition ? '영양정보 접기' : '영양정보 더보기'}</span>
                {showMoreNutrition ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showMoreNutrition && (
                <div className="expanded-nutrition-chips animate-fade-in-up">
                  {moreNutrients.map((n, idx) => (
                    <div key={idx} className="sub-nutrition-chip">
                      <span className="sub-ntr-name">{n.name}</span>
                      <strong className="sub-ntr-amount">{n.amount}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2-3. 알레르기 정보 한 줄 카드 및 접기/펼치기 */}
          <div className="allergy-accordion-wrapper">
            <button
              type="button"
              className={`allergy-single-line-card ${showAllergies ? 'expanded' : ''}`}
              onClick={() => setShowAllergies(!showAllergies)}
              aria-expanded={showAllergies}
            >
              <div className="allergy-card-left">
                <span className="allergy-alert-emoji">⚠️</span>
                <span className="allergy-card-title">
                  {meal.allergyList && meal.allergyList.length > 0
                    ? `알레르기 정보 ${meal.allergyList.length}종 확인하기`
                    : '알레르기 정보 확인 (특이 유발물질 없음)'}
                </span>
              </div>
              <div className="allergy-card-right">
                <span className="allergy-arrow-text">
                  {showAllergies ? '접기' : ''}
                </span>
                {showAllergies ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>

            {showAllergies && (
              <div className="allergy-detail-expanded animate-fade-in-up">
                {meal.allergyList && meal.allergyList.length > 0 ? (
                  <div className="allergy-tags-wrap">
                    {meal.allergyList.map((allergy, idx) => (
                      <span key={idx} className="allergy-tag">
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="allergy-safe-text">
                    오늘 급식에는 특이 알레르기 유발 물질이 포함되어 있지 않습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 3. 오늘의 한 끼 기록 📸 (콤팩트 카드 및 사진/메모) */}
      {/* ================================================== */}
      <section className="meal-photo-record-section animate-fade-in-up">
        <div className="section-title-row">
          <div className="section-title-wrap">
            <span className="photo-section-emoji">📸</span>
            <h3 className="section-title">오늘의 한 끼 기록</h3>
          </div>
          <span className="private-secure-pill">
            <Lock size={12} />
            <span>나만의 비공개 기록</span>
          </span>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="photo-error-alert animate-pop-in">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3-1. 사진이 이미 첨부되었거나 선택된 경우 */}
        {photoDataUrl ? (
          <div className="meal-photo-preview-card animate-pop-in">
            <div className="photo-img-wrapper">
              <img src={photoDataUrl} alt="오늘의 급식판 사진" className="meal-preview-img" />
              {isPhotoSaved && (
                <div className="photo-saved-tag">
                  <Check size={13} />
                  <span>저장 완료</span>
                </div>
              )}
            </div>

            {/* 한 줄 메모 입력 영역 */}
            <div className="meal-memo-box">
              <label className="memo-label">
                <Smile size={14} />
                <span>한 줄 메모 (선택사항)</span>
              </label>

              {/* 긍정 메모 칩 */}
              <div className="memo-presets-row">
                {MEMO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="memo-preset-chip"
                    onClick={() => handleSelectPresetMemo(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                className="meal-memo-input"
                placeholder="“오늘은 새로운 반찬도 먹어봤어요.” “천천히 먹으려고 노력했어요.”"
                rows={2}
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                  setIsPhotoSaved(false);
                }}
              />

              <div className="photo-card-actions">
                <button
                  type="button"
                  className={`btn-save-photo ${isPhotoSaved ? 'saved' : ''}`}
                  onClick={handleSaveMealPhoto}
                >
                  <Check size={16} />
                  <span>{isPhotoSaved ? '수정 저장' : '저장'}</span>
                </button>

                <button
                  type="button"
                  className="btn-retake-photo"
                  onClick={() => setShowPhotoChoiceModal(true)}
                  title="사진 다시 찍기"
                >
                  <RotateCcw size={14} />
                  <span>다시 선택</span>
                </button>

                <button
                  type="button"
                  className="btn-remove-photo"
                  onClick={handleResetPhoto}
                  title="사진 삭제"
                >
                  <span>삭제</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 3-2. 기본 화면: 간결한 콤팩트 카드 (“오늘의 급식판을 기록해볼까요?” + [사진 남기기]) */
          <div className="compact-photo-invite-card animate-pop-in">
            <div className="invite-content-row">
              <div className="invite-icon-wrap">
                <Camera size={22} className="invite-cam-icon" />
              </div>
              <div className="invite-texts">
                <strong className="invite-main-text">오늘의 급식판을 기록해볼까요?</strong>
                <span className="invite-sub-text">
                  식사량이나 칼로리 평가 대신, 나만의 건강한 한 끼를 담아보세요.
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-compact-photo-action"
              onClick={() => setShowPhotoChoiceModal(true)}
              disabled={isCompressing}
            >
              <Camera size={15} />
              <span>사진 남기기</span>
            </button>

            {isCompressing && (
              <div className="photo-compressing-text animate-pulse">
                <span>사진을 최적화하는 중...</span>
              </div>
            )}
          </div>
        )}

        {/* 비공개 알림 안내 */}
        <div className="photo-private-notice">
          <ShieldCheck size={14} color="#16A34A" />
          <span>
            급식판 사진은 개인 기록이며 함께하기 화면이나 친구들에게 공개되지 않습니다.
          </span>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. 오늘의 10분 움직임 🏃 (단순화, 추천 1개, 시간 기록) */}
      {/* ================================================== */}
      <section className="movement-recommend-section animate-fade-in-up">
        {/* Section Header */}
        <div className="section-title-row">
          <div className="section-title-wrap">
            <span className="movement-section-emoji">🏃</span>
            <div className="movement-title-column">
              <h3 className="section-title">오늘의 10분 움직임</h3>
              <span className="movement-subtitle">쉬는 시간, 가볍게 몸을 움직여볼까요?</span>
            </div>
          </div>
          <span className={`movement-sync-pill ${dailyRecord.activity ? 'done' : ''}`}>
            {dailyRecord.activity ? '실천 완료 ✓' : '+1 Seed'}
          </span>
        </div>

        {/* 4-1. 기본 화면: 추천 움직임 1개만 표시 */}
        <div className="featured-movement-card animate-pop-in">
          <div className="featured-header-row">
            <span className="featured-badge">🚶 오늘의 추천</span>
            <span className="featured-intensity-tag">{effectiveMinutes}분 · {activeMovement.intensity}</span>
          </div>
          <div className="featured-main-body">
            <span className="featured-icon">{activeMovement.icon}</span>
            <div className="featured-texts">
              <strong className="featured-name">{activeMovement.desc}</strong>
              <span className="featured-desc">{activeMovement.name}</span>
            </div>
          </div>
        </div>

        {/* 4-2. [다른 움직임 보기 ▼] 아코디언 토글 */}
        <div className="other-movements-toggle-wrap">
          <button
            type="button"
            className="btn-toggle-other-movements"
            onClick={() => setShowOtherMovements(!showOtherMovements)}
            aria-expanded={showOtherMovements}
          >
            <span>{showOtherMovements ? '다른 움직임 접기' : '다른 움직임 보기'}</span>
            {showOtherMovements ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showOtherMovements && (
            <div className="other-movements-list animate-fade-in-up">
              {MOVEMENT_OPTIONS.map((mov) => {
                const isSelected = mov.id === selectedMovementId;
                return (
                  <div
                    key={mov.id}
                    className={`movement-choice-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedMovementId(mov.id);
                      if (durationPreset !== 'custom') {
                        setDurationPreset(mov.defaultMinutes);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="movement-choice-left">
                      <span className="choice-icon">{mov.icon}</span>
                      <div className="choice-texts">
                        <strong className="choice-title">{mov.name}</strong>
                        <span className="choice-desc">{mov.desc}</span>
                      </div>
                    </div>
                    <div className={`choice-radio ${isSelected ? 'selected' : ''}`}>
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4-3. 실제 움직인 시간 기록 */}
        <div className="movement-duration-box">
          <label className="duration-question-label">
            <span>오늘 얼마나 움직였나요?</span>
          </label>

          <div className="duration-chips-row">
            {DURATION_PRESETS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={`duration-chip ${durationPreset === minutes ? 'active' : ''}`}
                onClick={() => {
                  setDurationPreset(minutes);
                  setCustomMinutes(String(minutes));
                }}
              >
                {minutes}분
              </button>
            ))}

            <button
              type="button"
              className={`duration-chip ${durationPreset === 'custom' ? 'active' : ''}`}
              onClick={() => setDurationPreset('custom')}
            >
              직접 입력
            </button>
          </div>

          {/* 직접 입력 시 분 단위 숫자 입력창 */}
          {durationPreset === 'custom' && (
            <div className="custom-duration-input-row animate-pop-in">
              <input
                type="number"
                min={1}
                max={180}
                className="custom-duration-input"
                placeholder="예: 20"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
              />
              <span className="input-unit">분 동안 움직였어요</span>
            </div>
          )}

          {/* 선택 요약 배너 */}
          <div className="movement-selection-summary">
            <span className="summary-title">오늘의 움직임</span>
            <div className="summary-content">
              <span className="summary-icon">{activeMovement.icon}</span>
              <strong className="summary-name">{activeMovement.name}</strong>
              <span className="summary-time">· {effectiveMinutes}분</span>
            </div>
          </div>
        </div>

        {/* 4-4. 실천 완료 버튼 (+1 Seed 양방향 연동 & 중복 방지) */}
        <div className="movement-action-container">
          {dailyRecord.activity ? (
            <div className="movement-done-badge-card animate-pop-in">
              <CheckCircle2 size={22} className="done-check-icon" />
              <div className="done-banner-texts">
                <strong>오늘의 움직임 실천 완료! 👏</strong>
                <span>오늘 이미 몸 움직이기 습관(+1 Seed)을 받았습니다.</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-complete-movement animate-pop-in"
              onClick={handleCompleteMovement}
            >
              <Activity size={18} />
              <span>실천 완료 +1 Seed</span>
            </button>
          )}
        </div>

        {/* 7. 건강한 일상 습관 철학 배너 (칼로리 상쇄 금지 메시지) */}
        <div className="movement-philosophy-banner">
          <strong className="philosophy-quote">
            “잘 먹고, 즐겁게 움직이고, 건강한 습관을 키워요 🌱”
          </strong>
          <span className="philosophy-detail">
            HealSeed는 칼로리를 운동으로 없애거나 상쇄하지 않고, 활기찬 일상을 위한 기분 좋은 움직임을 권장합니다.
          </span>
        </div>
      </section>

      {/* Bottom Back Button */}
      <div className="bottom-action-area">
        <button className="btn-primary" onClick={onBack} id="btn-meal-detail-back">
          <span>확인 완료</span>
        </button>
      </div>

      {/* Photo Choice Modal (카메라 / 앨범) */}
      {showPhotoChoiceModal && (
        <div className="photo-choice-overlay animate-fade-in" onClick={() => setShowPhotoChoiceModal(false)}>
          <div className="photo-choice-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="choice-sheet-header">
              <strong className="choice-sheet-title">급식판 사진 남기기</strong>
              <button
                type="button"
                className="btn-close-sheet"
                onClick={() => setShowPhotoChoiceModal(false)}
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <p className="choice-sheet-desc">
              오늘 맛있게 먹은 식판 사진을 나만의 건강 기록장에 담아보세요.
            </p>

            <div className="choice-sheet-buttons">
              <button
                type="button"
                className="btn-sheet-action camera-btn"
                onClick={() => {
                  setShowPhotoChoiceModal(false);
                  cameraInputRef.current?.click();
                }}
              >
                <Camera size={18} />
                <span>📷 급식판 사진 찍기</span>
              </button>

              <button
                type="button"
                className="btn-sheet-action album-btn"
                onClick={() => {
                  setShowPhotoChoiceModal(false);
                  albumInputRef.current?.click();
                }}
              >
                <ImageIcon size={18} />
                <span>🖼️ 앨범에서 선택</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
