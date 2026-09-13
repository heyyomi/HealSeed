import React from 'react';
import { ArrowRight, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import type { MealData } from '../types/onboarding';
import { getMenuIcon, isWeekend } from '../services/mealService';
import './TodayMealCard.css';

interface TodayMealCardProps {
  meal: MealData;
  formattedDateLabel: string;
  onOpenDetail: () => void;
}

export const TodayMealCard: React.FC<TodayMealCardProps> = ({
  meal,
  formattedDateLabel,
  onOpenDetail,
}) => {
  const isNoMeal = meal.isNoMealDay || isWeekend(meal.date);

  return (
    <div className="today-meal-card animate-pop-in">
      {/* Header */}
      <div className="meal-card-header">
        <div className="meal-card-title-group">
          <div className="meal-badge">
            <UtensilsCrossed size={14} />
            <span>오늘의 급식</span>
          </div>
          <span className="neis-live-badge-card" title="교육부 NEIS 공공데이터 실시간 연동">
            <ShieldCheck size={12} className="shield-icon" />
            <span>NEIS 실시간 연동</span>
          </span>
          <span className="meal-school-tag">{meal.schoolName}</span>
        </div>
        <span className="meal-date-label">{formattedDateLabel}</span>
      </div>

      {/* Menu Preview or Weekend No-Meal Display */}
      {isNoMeal ? (
        <div className="today-no-meal-card-content">
          <div className="today-no-meal-body">
            <div className="no-meal-emoji-badge">🏖️</div>
            <div className="no-meal-text-group">
              <strong className="no-meal-title">오늘은 급식이 없는 날이에요</strong>
              <p className="no-meal-desc">
                {meal.noMealReason || '주말(토·일요일)에는 학교 급식이 운영되지 않아요.'}
              </p>
            </div>
          </div>
          <div className="no-meal-weekend-tip">
            <span className="tip-emoji">🌱</span>
            <span className="tip-text">주말에도 규칙적인 식사와 충분한 물 마시기를 잊지 마세요!</span>
          </div>
        </div>
      ) : (
        <div className="meal-menu-preview-grid">
          {meal.menu.map((item, idx) => (
            <div key={idx} className="menu-preview-chip">
              <span className="menu-item-icon">{getMenuIcon(item)}</span>
              <span className="menu-item-text">{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Action Area */}
      <div className="meal-card-footer">
        <button
          className="btn-view-meal-detail"
          onClick={onOpenDetail}
          id="btn-open-meal-detail"
        >
          <span>{isNoMeal ? '주말 한 끼 습관 실천하기' : '급식 자세히 보기'}</span>
          <ArrowRight size={16} />
        </button>
        <p className="meal-card-hint">
          {isNoMeal
            ? '주말에도 골고루 먹기, 물 마시기 등 건강습관을 체크하고 Seed를 모을 수 있어요. 🌱'
            : '오늘 급식을 확인하고 건강한 한 끼 습관을 실천해보세요. 🌱'}
        </p>
      </div>
    </div>
  );
};
