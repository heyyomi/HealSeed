import React from 'react';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import type { MealData } from '../types/onboarding';
import { getMenuIcon } from '../services/mealService';
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
  return (
    <div className="today-meal-card animate-pop-in">
      {/* Header */}
      <div className="meal-card-header">
        <div className="meal-card-title-group">
          <div className="meal-badge">
            <UtensilsCrossed size={14} />
            <span>오늘의 급식</span>
          </div>
          <span className="meal-school-tag">{meal.schoolName}</span>
        </div>
        <span className="meal-date-label">{formattedDateLabel}</span>
      </div>

      {/* Menu Preview Chips */}
      <div className="meal-menu-preview-grid">
        {meal.menu.map((item, idx) => (
          <div key={idx} className="menu-preview-chip">
            <span className="menu-item-icon">{getMenuIcon(item)}</span>
            <span className="menu-item-text">{item}</span>
          </div>
        ))}
      </div>

      {/* Bottom Action Area */}
      <div className="meal-card-footer">
        <button
          className="btn-view-meal-detail"
          onClick={onOpenDetail}
          id="btn-open-meal-detail"
        >
          <span>급식 자세히 보기</span>
          <ArrowRight size={16} />
        </button>
        <p className="meal-card-hint">
          오늘 급식을 확인하고 건강한 한 끼 습관을 실천해보세요. 🌱
        </p>
      </div>
    </div>
  );
};
