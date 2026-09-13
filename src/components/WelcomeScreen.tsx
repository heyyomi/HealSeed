import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="welcome-screen">
      {/* Background Decorative Blobs */}
      <div className="bg-decor-circle circle-1" />
      <div className="bg-decor-circle circle-2" />

      {/* Brand Header */}
      <div className="brand-header animate-fade-in-up">
        <div className="brand-pill">
          <Sparkles size={14} className="sparkle-icon" />
          <span>학교 맞춤형 건강습관</span>
        </div>
        <div className="app-title-group">
          <h1 className="logo-en">HealSeed</h1>
          <span className="logo-kr">헬씨드</span>
        </div>
        <p className="app-slogan">
          “작은 습관을 심고, 건강한 나를 키우다.”
        </p>
      </div>

      {/* Main Illustration Area: 5 Characters Hero */}
      <div className="hero-illustration-card animate-pop-in">
        <div className="hero-image-wrapper">
          <img
            src="/assets/hero_group.jpg"
            alt="헬씨드 5종 메이트 캐릭터 친구들"
            className="hero-image"
          />
          <div className="hero-overlay-tag">
            <span className="hero-tag-text">5종 메이트와 함께해요! 🌱</span>
          </div>
        </div>

        {/* 5 Character Mini Avatar Bar */}
        <div className="character-avatar-strip">
          {CHARACTERS.map((char) => (
            <div key={char.id} className="mini-avatar-item" title={char.name}>
              <div
                className="mini-avatar-bubble"
                style={{ borderColor: char.themeColor }}
              >
                <img src={char.image} alt={char.name} />
              </div>
              <span className="mini-avatar-name">{char.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="welcome-action-group animate-fade-in-up">
        <button
          className="btn-primary start-cta-btn"
          onClick={onStart}
          id="btn-welcome-start"
        >
          <span>시작하기</span>
          <ArrowRight size={20} />
        </button>

        <button
          className="login-sub-btn"
          onClick={() => setShowLoginModal(true)}
          id="btn-welcome-login"
        >
          <span>이미 계정이 있어요?</span>
          <strong>로그인</strong>
        </button>

        <div className="safe-badge">
          <ShieldCheck size={14} color="#16A34A" />
          <span>체중·칼로리 비교 없는 즐거운 건강 실천</span>
        </div>
      </div>

      {/* Login Demo Modal */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-card animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-emoji">🏫</div>
            <h3 className="modal-title">학교 계정 로그인 안내</h3>
            <p className="modal-desc">
              기존에 생성된 학교 계정 로그인 및 Firebase Auth 연동은 다음 단계에서 연결될 예정입니다.
              <br /><br />
              먼저 온보딩으로 나만의 캐릭터와 초기 설정을 체험해보세요!
            </p>
            <div className="modal-btn-row">
              <button
                className="btn-primary"
                onClick={() => {
                  setShowLoginModal(false);
                  onStart();
                }}
              >
                새로 시작해보기
              </button>
              <button
                className="btn-subtle"
                onClick={() => setShowLoginModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
