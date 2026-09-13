import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, Sparkles, Award } from 'lucide-react';
import type { CharacterId, LevelNumber } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import { BASE_GROWTH_LEVELS, CHARACTER_GROWTH_STORIES } from '../data/growthStages';
import { CharacterGrowthImage } from './common/CharacterGrowthImage';
import './GrowthPreviewScreen.css';

interface GrowthPreviewScreenProps {
  characterId: CharacterId;
  onBack: () => void;
  onNext: () => void;
}

export const GrowthPreviewScreen: React.FC<GrowthPreviewScreenProps> = ({
  characterId,
  onBack,
  onNext,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber>(3); // Default show mid-level preview

  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const story = CHARACTER_GROWTH_STORIES[characterId]?.[selectedLevel] || CHARACTER_GROWTH_STORIES.sprout[1];

  return (
    <div className="growth-screen screen-container">
      {/* Top Navigation */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 이동">
          <ChevronLeft size={22} />
        </button>
        <div className="step-indicator">
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot active" />
          <span className="step-dot" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="screen-title-section animate-fade-in-up">
        <div className="growth-badge">
          <Sparkles size={14} />
          <span>성장 미리보기</span>
        </div>
        <h2 className="screen-main-title">
          건강한 습관을 실천할수록<br />
          <span className="highlight-text">{character.name}</span>도 함께 성장해요!
        </h2>
        <p className="screen-subtitle">
          Seed가 쌓이면 메이트의 모습과 행동이 실제로 성장해요.
        </p>
      </div>

      {/* Interactive Growth Character Showcase Card */}
      <div className="growth-showcase-card animate-pop-in">
        {/* Level & Seed Range Badge Top */}
        <div className="stage-top-pill">
          <span className="level-label">Lv.{story.level} {story.levelName}</span>
          <span className="seed-badge">
            <img src="/assets/seed_icon.jpg" alt="Seed" className="mini-seed-img" />
            <strong>{story.seedRange}</strong>
          </span>
        </div>

        {/* Character Stage Image (changes dynamically per level) */}
        <div className="character-stage-stage">
          <div className="character-growth-wrapper">
            {/* Glow Aura */}
            <div
              className="growth-aura"
              style={{
                backgroundColor: character.themeColor,
                opacity: 0.12 + selectedLevel * 0.05,
              }}
            />

            {/* Authentic Character Growth Image with Auto Level Detection */}
            <CharacterGrowthImage
              key={`growth-char-${characterId}-${selectedLevel}`}
              characterId={characterId}
              level={selectedLevel}
              alt={`${character.name} Lv.${selectedLevel} ${story.storyTitle}`}
              className="growth-character-img animate-pop-in"
              fallbackSrc={character.image}
            />
          </div>
        </div>

        {/* Dynamic Story Description for This Level */}
        <div className="growth-story-box animate-fade-in-up">
          <div className="story-header-row">
            <span className="growth-step-tag">성장 스토리</span>
            <strong className="story-title">{story.storyTitle}</strong>
          </div>
          <p className="story-description">{story.storyDescription}</p>
        </div>
      </div>

      {/* 5 Stages Interactive Step Selector */}
      <div className="stages-selector-group animate-fade-in-up">
        <div className="stages-timeline">
          <div
            className="timeline-fill"
            style={{ width: `${((selectedLevel - 1) / 4) * 100}%` }}
          />
          {BASE_GROWTH_LEVELS.map((stage) => {
            const isActive = selectedLevel === stage.level;
            const isPassed = selectedLevel >= stage.level;

            return (
              <button
                key={stage.level}
                id={`btn-growth-level-${stage.level}`}
                className={`stage-step-btn ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => setSelectedLevel(stage.level)}
              >
                <div className="step-circle">
                  <span>{stage.level}</span>
                </div>
                <span className="step-name">{stage.levelName}</span>
                <span className="step-seed">{stage.seedRange}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seed Meaning Helper Callout */}
      <div className="seed-info-callout">
        <Award size={16} className="seed-callout-icon" />
        <div className="seed-callout-text">
          <strong>Seed 성장 규칙:</strong> 건강습관 1개 실천 = <strong>+1 Seed</strong> (하루 최대 4 Seed). Seed가 모일수록 메이트가 더 크고 씩씩하게 자라나요!
        </div>
      </div>

      {/* Bottom Action */}
      <div className="bottom-action-area">
        <button
          className="btn-primary"
          onClick={onNext}
          id="btn-preview-confirm"
        >
          <span>이 친구와 시작하기</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
