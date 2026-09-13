import React, { useState } from 'react';
import { ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CharacterId } from '../types/onboarding';
import { CHARACTERS } from '../data/characters';
import './NicknameScreen.css';

interface NicknameScreenProps {
  characterId: CharacterId;
  initialNickname: string;
  onBack: () => void;
  onSubmit: (nickname: string) => void;
}

export const NicknameScreen: React.FC<NicknameScreenProps> = ({
  characterId,
  initialNickname,
  onBack,
  onSubmit,
}) => {
  const [nickname, setNickname] = useState(initialNickname);
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  const trimmed = nickname.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 10;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid) return;

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#38BDF8', '#FACC15', '#EC4899', '#A855F7'],
      });
    } catch {
      // Fallback silently if confetti fails
    }

    setTimeout(() => {
      onSubmit(trimmed);
    }, 400);
  };

  return (
    <div className="nickname-screen screen-container">
      {/* Top Navigation */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 이동">
          <ChevronLeft size={22} />
        </button>
        <div className="step-indicator">
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot active" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="screen-title-section animate-fade-in-up">
        <h2 className="screen-main-title">
          어떤 이름으로<br />불러드릴까요?
        </h2>
        <p className="screen-subtitle">
          앱 안에서 사용할 닉네임을 입력해주세요.
        </p>
      </div>

      {/* Center Character Hero Presentation */}
      <div className="nickname-character-section animate-pop-in">
        <div className="character-bubble-halo" style={{ borderColor: character.themeColor }}>
          <div className="character-avatar-large">
            <img
              src={character.image}
              alt={character.name}
              className="avatar-large-img animate-float"
            />
          </div>
          <div className="companion-speech-bubble">
            <span>반가워요! 내 이름은 <strong>{character.name}</strong>야 🌱</span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <form className="nickname-form-section animate-fade-in-up" onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-label-row">
            <label htmlFor="nickname-input" className="input-label">
              닉네임
            </label>
            <span className={`char-counter ${trimmed.length === 10 ? 'maxed' : ''}`}>
              {trimmed.length}/10
            </span>
          </div>

          <div className={`input-field-box ${isValid ? 'valid' : ''}`}>
            <input
              id="nickname-input"
              type="text"
              placeholder="예: 민지, 씩씩이, 건강샘"
              maxLength={10}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="nickname-input"
              autoFocus
              autoComplete="off"
            />
            {isValid && (
              <CheckCircle size={20} className="valid-icon animate-pop-in" />
            )}
          </div>

          <p className="input-helper-text">
            한글, 영문, 숫자 조합으로 1~10자 이내로 지어주세요.
          </p>
        </div>

        {/* Bottom Button */}
        <div className="bottom-action-area">
          <button
            type="submit"
            className="btn-primary"
            disabled={!isValid}
            id="btn-nickname-submit"
          >
            <Sparkles size={18} />
            <span>헬씨드 시작하기</span>
          </button>
        </div>
      </form>
    </div>
  );
};
