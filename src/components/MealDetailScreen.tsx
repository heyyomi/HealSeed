import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  Droplets,
  Clock,
  Apple,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Lock,
  Activity,
  Smile
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

const RECOMMENDED_MOVEMENTS = [
  { id: 'walk', icon: '🚶', title: '식사 후 10분 가볍게 걷기', desc: '소화를 돕고 나른함을 깨우는 기분 좋은 발걸음' },
  { id: 'stretch', icon: '🧘', title: '5분 스트레칭하기', desc: '목과 어깨, 허리를 시원하게 펴주는 편안한 스트레칭' },
  { id: 'stairs', icon: '🪜', title: '가까운 층은 계단 이용하기', desc: '엘리베이터 대신 한두 층 계단으로 튼튼하게 오르기' },
  { id: 'break-walk', icon: '🌳', title: '쉬는 시간에 잠깐 걸어보기', desc: '친구와 함께 복도나 운동장을 여유롭게 거닐기' },
  { id: 'fun-move', icon: '🏃', title: '오늘 10분 즐겁게 움직여보기', desc: '신나는 음악에 맞춰 가볍게 몸을 흔들고 활력 충전' },
];

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

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState<string>(mealRecord?.mealImageUrl || '');
  const [memo, setMemo] = useState<string>(mealRecord?.mealMemo || '');
  const [isPhotoSaved, setIsPhotoSaved] = useState<boolean>(!!mealRecord?.mealImageUrl);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Movement multi-selection
  const [selectedMovementIds, setSelectedMovementIds] = useState<string[]>(['walk']);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const handleHabitClick = (key: keyof DailyRecord, isPrimarySeedHabit: boolean) => {
    const willBeDone = !dailyRecord[key];
    onToggleHabit(key, isPrimarySeedHabit);

    if (willBeDone && isPrimarySeedHabit) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#22C55E', '#38BDF8', '#FACC15'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleToggleMovement = (id: string) => {
    setSelectedMovementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsCompressing(true);
    setErrorMessage(null);

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
        particleCount: 45,
        spread: 60,
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
  };

  const handleCompleteMovement = () => {
    if (!dailyRecord.activity) {
      onToggleHabit('activity', true);
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#22C55E', '#38BDF8', '#FACC15'],
        });
      } catch {}
    }
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

      {/* Weekend or Holiday No-Meal Banner */}
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
        <>
          {/* Menu Cards 2-Column Grid */}
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

          {/* Real NEIS Nutritional & Allergy Info Area */}
          <div className="meal-extra-info-section animate-fade-in-up">
            {/* Nutrition Info Card */}
            <div className="info-box-item nutrition-box">
              <div className="info-box-header">
                <Apple size={16} className="info-box-icon apple-icon" />
                <span className="info-box-title">성장 영양 정보</span>
              </div>
              {meal.nutritionList && meal.nutritionList.length > 0 ? (
                <div className="nutrition-chips-wrap">
                  {meal.nutritionList.map((n, idx) => (
                    <div key={idx} className="nutrition-chip">
                      <span className="ntr-name">{n.name}</span>
                      <strong className="ntr-amount">{n.amount}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="info-box-status">{meal.nutritionInfo || '영양소 고루 포함'}</p>
              )}
            </div>

            {/* Allergy Info Card */}
            <div className="info-box-item allergy-box">
              <div className="info-box-header">
                <AlertCircle size={16} className="info-box-icon alert-icon" />
                <span className="info-box-title">알레르기 유발 물질 안내</span>
              </div>
              {meal.allergyList && meal.allergyList.length > 0 ? (
                <div className="allergy-chips-wrap">
                  {meal.allergyList.map((allergy, idx) => (
                    <span key={idx} className="allergy-tag">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="info-box-status">{meal.allergyInfo || '특이 유발물질 없음'}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================================================== */}
      {/* 12. 오늘의 한 끼 기록 📸 (Meal Photo Section) */}
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
        <p className="habits-section-desc">
          식사량이나 칼로리 평가 대신, 오늘 내가 마주한 건강하고 즐거운 한 끼를 담아보세요.
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="photo-error-alert animate-pop-in">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Photo Container or Upload Buttons */}
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

            {/* Memo input section */}
            <div className="meal-memo-box">
              <label className="memo-label">
                <Smile size={14} />
                <span>나의 긍정 식사 메모 (선택사항)</span>
              </label>

              {/* Memo Presets */}
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
                placeholder="“새로운 반찬도 먹어봤어요.” “천천히 즐겁게 먹었어요.”"
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
                  <span>{isPhotoSaved ? '수정 내용 저장' : '급식판 기록 저장하기'}</span>
                </button>

                <button
                  type="button"
                  className="btn-retake-photo"
                  onClick={() => cameraInputRef.current?.click()}
                  title="사진 다시 찍기"
                >
                  <RotateCcw size={14} />
                  <span>다시 촬영</span>
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
          <div className="photo-upload-container">
            <div className="photo-upload-placeholder">
              <div className="upload-icon-circle">
                <Camera size={28} />
              </div>
              <strong className="upload-placeholder-title">오늘의 급식판을 사진으로 남겨보세요</strong>
              <p className="upload-placeholder-desc">
                사진은 친구들이나 피드에 공개되지 않고, 오직 나의 건강 기록장에만 안전하게 보관됩니다.
              </p>

              <div className="photo-btn-group">
                <button
                  type="button"
                  className="btn-camera-trigger"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isCompressing}
                >
                  <Camera size={16} />
                  <span>급식판 사진 찍기</span>
                </button>

                <button
                  type="button"
                  className="btn-album-trigger"
                  onClick={() => albumInputRef.current?.click()}
                  disabled={isCompressing}
                >
                  <ImageIcon size={16} />
                  <span>앨범에서 선택</span>
                </button>
              </div>

              {isCompressing && (
                <div className="photo-compressing-text animate-pulse">
                  <span>사진을 건강 기록용으로 최적화하는 중...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Safety & Anti-Evaluation Banner */}
        <div className="photo-philosophy-banner">
          <ShieldCheck size={14} color="#16A34A" />
          <span>
            HealSeed는 식사량·칼로리·외모를 평가하지 않으며, 나만의 기분 좋은 식사 경험을 응원합니다.
          </span>
        </div>
      </section>

      {/* ================================================== */}
      {/* Today's Meal Habits Checklist Section */}
      {/* ================================================== */}
      <div className="meal-habits-section animate-fade-in-up">
        <div className="section-title-row">
          <div className="section-title-wrap">
            <Sparkles size={16} className="section-sparkle" />
            <h3 className="section-title">오늘의 한 끼 습관</h3>
          </div>
          <span className="section-hint">즐거운 식사 실천</span>
        </div>
        <p className="habits-section-desc">
          먹은 양이나 칼로리 대신, 건강한 식사 태도와 기분 좋은 실천에 귀 기울여보세요.
        </p>

        <div className="meal-habit-card-list">
          {/* 1. 골고루 먹어보았어요 (balancedMeal -> +1 Seed 양방향 동기화) */}
          <div
            id="habit-balanced-meal"
            className={`meal-habit-card ${dailyRecord.balancedMeal ? 'checked' : ''}`}
            onClick={() => handleHabitClick('balancedMeal', true)}
          >
            <div className="habit-card-left">
              <div className="habit-badge-icon meal-icon">
                <UtensilsCrossed size={18} />
              </div>
              <div className="habit-text-wrap">
                <div className="habit-name-row">
                  <strong className="habit-name">골고루 먹어보았어요</strong>
                  <span className="seed-reward-badge">+1 Seed</span>
                </div>
                <span className="habit-subtext">채소와 단백질 등 다양한 반찬을 골고루 맛보았어요</span>
              </div>
            </div>
            <div className={`habit-check-circle ${dailyRecord.balancedMeal ? 'active' : ''}`}>
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* 2. 천천히 식사했어요 (slowEating) */}
          <div
            id="habit-slow-eating"
            className={`meal-habit-card ${dailyRecord.slowEating ? 'checked' : ''}`}
            onClick={() => handleHabitClick('slowEating', false)}
          >
            <div className="habit-card-left">
              <div className="habit-badge-icon time-icon">
                <Clock size={18} />
              </div>
              <div className="habit-text-wrap">
                <strong className="habit-name">천천히 식사했어요</strong>
                <span className="habit-subtext">급하게 먹지 않고 여유 있게 씹으며 식사를 음미했어요</span>
              </div>
            </div>
            <div className={`habit-check-circle ${dailyRecord.slowEating ? 'active' : ''}`}>
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* 3. 물을 함께 마셨어요 (water -> +1 Seed 양방향 동기화) */}
          <div
            id="habit-water-drink"
            className={`meal-habit-card ${dailyRecord.water ? 'checked' : ''}`}
            onClick={() => handleHabitClick('water', true)}
          >
            <div className="habit-card-left">
              <div className="habit-badge-icon water-icon">
                <Droplets size={18} />
              </div>
              <div className="habit-text-wrap">
                <div className="habit-name-row">
                  <strong className="habit-name">물을 함께 마셨어요</strong>
                  <span className="seed-reward-badge">+1 Seed</span>
                </div>
                <span className="habit-subtext">식사 전후로 물을 마시며 수분을 상쾌하게 보충했어요</span>
              </div>
            </div>
            <div className={`habit-check-circle ${dailyRecord.water ? 'active' : ''}`}>
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* 4. 내 몸의 배고픔과 포만감에 귀 기울였어요 (listenToBody) */}
          <div
            id="habit-listen-body"
            className={`meal-habit-card ${dailyRecord.listenToBody ? 'checked' : ''}`}
            onClick={() => handleHabitClick('listenToBody', false)}
          >
            <div className="habit-card-left">
              <div className="habit-badge-icon mind-icon">
                <Heart size={18} />
              </div>
              <div className="habit-text-wrap">
                <strong className="habit-name">내 몸의 배고픔과 포만감에 귀 기울였어요</strong>
                <span className="habit-subtext">배부름의 신호를 알아차리고 내 몸에 맞게 편안하게 먹었어요</span>
              </div>
            </div>
            <div className={`habit-check-circle ${dailyRecord.listenToBody ? 'active' : ''}`}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 14 & 15. 오늘의 움직임 추천 🏃 (Movement Section) */}
      {/* ================================================== */}
      <section className="movement-recommend-section animate-fade-in-up">
        <div className="section-title-row">
          <div className="section-title-wrap">
            <span className="movement-section-emoji">🏃</span>
            <h3 className="section-title">오늘도 기분 좋게 움직여볼까요?</h3>
          </div>
          <span className={`movement-sync-pill ${dailyRecord.activity ? 'done' : ''}`}>
            {dailyRecord.activity ? '실천 완료됨 ✓' : '+1 Seed 연결'}
          </span>
        </div>
        <p className="habits-section-desc">
          식사 후 실천하고 싶은 움직임을 자유롭게 골라보세요. (여러 개 중복 선택 가능 🌱)
        </p>

        {/* Gentle Movement Suggestion Cards (Multi-Select) */}
        <div className="movement-cards-list">
          {RECOMMENDED_MOVEMENTS.map((mov) => {
            const isSelected = selectedMovementIds.includes(mov.id);
            return (
              <div
                key={mov.id}
                className={`movement-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleMovement(mov.id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
              >
                <div className="movement-card-left">
                  <span className="movement-card-icon">{mov.icon}</span>
                  <div className="movement-card-texts">
                    <strong className="movement-card-title">{mov.title}</strong>
                    <span className="movement-card-desc">{mov.desc}</span>
                  </div>
                </div>
                <div className={`movement-checkbox ${isSelected ? 'active' : ''}`}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button: Dual-screen Activity Sync */}
        <div className="movement-action-box">
          {dailyRecord.activity ? (
            <div className="movement-already-done-card animate-pop-in">
              <CheckCircle2 size={22} className="done-icon" />
              <div className="done-text-wrap">
                <strong>
                  {selectedMovementIds.length > 0
                    ? `오늘 ${selectedMovementIds.length}가지 움직임을 실천 중이에요! 👏`
                    : '오늘의 몸 움직이기 습관을 이미 완료했어요!'}
                </strong>
                <span>홈 화면의 "몸 움직이기" 습관(+1 Seed)과 함께 연동되었습니다.</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-complete-movement animate-pop-in"
              onClick={handleCompleteMovement}
              disabled={selectedMovementIds.length === 0}
            >
              <Activity size={18} />
              <span>
                {selectedMovementIds.length > 0
                  ? `선택한 ${selectedMovementIds.length}가지 움직임 오늘 실천하기 (+1 Seed)`
                  : '실천할 움직임을 1개 이상 선택해주세요 (+1 Seed)'}
              </span>
            </button>
          )}
        </div>

        {/* Section 15 Non-Compensatory / Health Advice Notice */}
        <div className="movement-advice-banner">
          <p className="advice-main-quote">
            “식후 10분 산책은 가볍게 몸을 움직이는 좋은 습관이에요.” 🍃
          </p>
          <span className="advice-sub-text">
            HealSeed는 칼로리를 운동으로 소모하거나 상쇄하지 않고, 활기찬 일상을 위한 기분 좋은 움직임을 제안합니다.
          </span>
        </div>
      </section>

      {/* Bottom Complete / Back Button */}
      <div className="bottom-action-area">
        <button className="btn-primary" onClick={onBack} id="btn-meal-detail-back">
          <span>확인 완료</span>
        </button>
      </div>
    </div>
  );
};
