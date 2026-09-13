import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { AdminPasswordModal } from './admin/AdminPasswordModal';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
  onSelectAdminRole?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onSelectAdminRole }) => {
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

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

        <div className="safe-badge">
          <ShieldCheck size={14} color="#16A34A" />
          <span>체중·칼로리 비교 없는 즐거운 건강 실천</span>
        </div>

        {/* Discreet Staff/Admin Access Link */}
        <div className="welcome-staff-link-row">
          <button
            type="button"
            className="btn-discreet-staff-link"
            onClick={() => setShowAdminAuthModal(true)}
            id="btn-welcome-staff-auth"
          >
            교직원(보건교사) 전용 로그인
          </button>
        </div>
      </div>

      {/* Admin Password Authentication Modal */}
      <AdminPasswordModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={() => {
          setShowAdminAuthModal(false);
          onSelectAdminRole?.();
        }}
      />
    </div>
  );
};
