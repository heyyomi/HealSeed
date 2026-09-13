import React from 'react';
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
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MealData, DailyRecord } from '../types/onboarding';
import { getMenuIcon } from '../services/mealService';
import './MealDetailScreen.css';

interface MealDetailScreenProps {
  meal: MealData;
  formattedDateLabel: string;
  dailyRecord: DailyRecord;
  onBack: () => void;
  onToggleHabit: (key: keyof DailyRecord, isPrimarySeedHabit: boolean) => void;
}

export const MealDetailScreen: React.FC<MealDetailScreenProps> = ({
  meal,
  formattedDateLabel,
  dailyRecord,
  onBack,
  onToggleHabit,
}) => {
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

  return (
    <div className="meal-detail-screen screen-container">
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
          {meal.isNoMealDay ? '급식 일정 안내' : '오늘의 급식 메뉴'}
        </h2>
        <p className="screen-subtitle">
          {meal.isNoMealDay
            ? `오늘(${formattedDateLabel})은 학교 급식이 운영되지 않는 날이에요.`
            : '정성껏 준비된 오늘의 건강하고 균형 잡힌 식단이에요.'}
        </p>
      </div>

      {/* Weekend or Holiday No-Meal Banner */}
      {meal.isNoMealDay ? (
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
              <li>아래에서 오늘의 건강한 한 끼 습관을 실천하고 Seed를 모아보세요!</li>
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

      {/* Today's Meal Habits Checklist Section */}
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

      {/* Bottom Complete / Back Button */}
      <div className="bottom-action-area">
        <button className="btn-primary" onClick={onBack} id="btn-meal-detail-back">
          <span>확인 완료</span>
        </button>
      </div>
    </div>
  );
};
