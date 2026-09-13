import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, Check } from 'lucide-react';
import type { CharacterId } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import './CharacterSelectScreen.css';

interface CharacterSelectScreenProps {
  initialCharacterId: CharacterId | null;
  onBack: () => void;
  onNext: (characterId: CharacterId) => void;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  initialCharacterId,
  onBack,
  onNext,
}) => {
  const [selectedId, setSelectedId] = useState<CharacterId | null>(
    initialCharacterId || 'sprout'
  );

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedId);

  const handleNext = () => {
    if (selectedId) {
      onNext(selectedId);
    }
  };

  return (
    <div className="character-screen screen-container">
      {/* Top Navigation */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 이동">
          <ChevronLeft size={22} />
        </button>
        <div className="step-indicator">
          <span className="step-dot" />
          <span className="step-dot active" />
          <span className="step-dot" />
          <span className="step-dot" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="screen-title-section animate-fade-in-up">
        <h2 className="screen-main-title">
          나와 함께할<br />헬씨드 메이트를 골라주세요!
        </h2>
        <p className="screen-subtitle">
          언제나 곁에서 건강한 습관을 응원해줄 친구예요.
        </p>
      </div>

      {/* 5 Characters Grid (2 Columns) */}
      <div className="character-grid animate-fade-in-up">
        {CHARACTERS.map((char) => {
          const isSelected = selectedId === char.id;
          return (
            <div
              key={char.id}
              id={`character-card-${char.id}`}
              className={`character-card ${isSelected ? 'selected' : ''}`}
              style={{
                '--theme-color': char.themeColor,
                '--theme-bg': char.bgColor,
              } as React.CSSProperties}
              onClick={() => setSelectedId(char.id)}
            >
              {/* Check Badge on Top Right */}
              {isSelected && (
                <div className="check-badge animate-pop-in">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Character Illustration */}
              <div className="card-image-box">
                <img
                  src={char.image}
                  alt={char.name}
                  className="character-img"
                  loading="eager"
                />
              </div>

              {/* Character Info */}
              <div className="card-text-box">
                <div className="name-row">
                  <span className="char-name">{char.name}</span>
                </div>
                <p className="char-tagline">{char.tagline}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Character Mini Summary Box */}
      {selectedCharacter && (
        <div className="selected-summary-banner animate-fade-in-up">
          <div className="summary-avatar">
            <img src={selectedCharacter.image} alt={selectedCharacter.name} />
          </div>
          <div className="summary-text">
            <div className="summary-title">
              <strong>{selectedCharacter.name}</strong> 선택됨
            </div>
            <p className="summary-desc">{selectedCharacter.description}</p>
          </div>
        </div>
      )}

      {/* Bottom Next Button */}
      <div className="bottom-action-area">
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!selectedId}
          id="btn-character-next"
        >
          <span>다음</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
