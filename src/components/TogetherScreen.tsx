import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  TreePine,
  Droplets,
  Utensils,
  Activity,
  Heart,
  ShieldCheck,
  Send,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { OnboardingState } from '../types/onboarding';
import './TogetherScreen.css';

interface TogetherScreenProps {
  data: OnboardingState;
}

interface CheerItem {
  id: number;
  text: string;
  count: number;
  icon: string;
  hasCheered: boolean;
}

const INITIAL_CHEERS: CheerItem[] = [
  { id: 1, text: '오늘도 맛있는 급식 먹고 힘내자! 🍱', count: 34, icon: '🍱', hasCheered: false },
  { id: 2, text: '틈틈이 시원한 물 한 잔 잊지 마! 💧', count: 48, icon: '💧', hasCheered: false },
  { id: 3, text: '점심 먹고 가볍게 산책하면 기분 최고야 🚶', count: 29, icon: '🚶', hasCheered: false },
  { id: 4, text: '천천히 꼭꼭 씹어 먹는 좋은 습관 함께해요 🌱', count: 41, icon: '🌱', hasCheered: false },
  { id: 5, text: '내 몸의 기분 좋은 소리에 귀 기울여봐요 💚', count: 25, icon: '💚', hasCheered: false },
];

export const TogetherScreen: React.FC<TogetherScreenProps> = ({ data }) => {
  const [cheers, setCheers] = useState<CheerItem[]>(INITIAL_CHEERS);
  const [customCheerSent, setCustomCheerSent] = useState(false);

  // Calculate shared school seed estimation based on base + user seed
  const schoolTotalSeed = 1420 + data.seed * 3;

  const handleCheerClick = (id: number) => {
    setCheers((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.hasCheered) {
          try {
            confetti({
              particleCount: 25,
              spread: 50,
              origin: { y: 0.7 },
              colors: ['#22C55E', '#38BDF8', '#FACC15'],
            });
          } catch {
            // ignore
          }
          return { ...c, count: c.count + 1, hasCheered: true };
        }
        return c;
      })
    );
  };

  const handleSendQuickCheer = (presetText: string) => {
    setCheers((prev) => [
      {
        id: Date.now(),
        text: presetText,
        count: 1,
        icon: '✨',
        hasCheered: true,
      },
      ...prev,
    ]);
    setCustomCheerSent(true);
    setTimeout(() => setCustomCheerSent(false), 3000);
  };

  return (
    <div className="together-screen screen-container animate-fade-in-up">
      {/* Header */}
      <div className="together-header">
        <div className="together-badge">
          <Users size={14} />
          <span>학교 공동 건강 커뮤니티</span>
        </div>
        <h2 className="together-title">함께하기</h2>
        <p className="together-subtitle">
          <strong>{data.schoolName}</strong> 친구들과 함께 작은 건강습관을 가꾸고 푸른 건강 숲을 키워요.
        </p>
      </div>

      {/* School Tree Status Card */}
      <div className="school-tree-card animate-pop-in">
        <div className="tree-visual-row">
          <div className="tree-icon-bubble">
            <TreePine size={40} className="tree-pine-icon" />
            <div className="tree-sparkle-pill">
              <Sparkles size={11} /> Lv.4 건강 숲
            </div>
          </div>
          <div className="tree-status-info">
            <span className="tree-label">{data.schoolName} 친구들의 합작</span>
            <strong className="tree-total-seed">{schoolTotalSeed.toLocaleString()} Seed</strong>
            <p className="tree-desc">
              친구들이 오늘 실천한 건강한 한 끼와 물 한 잔이 모여 무럭무럭 자라고 있어요! 🌳
            </p>
          </div>
        </div>

        {/* School Stage Progress Bar */}
        <div className="school-progress-wrap">
          <div className="school-progress-labels">
            <span>다음 단계: 울창한 생명의 숲 (2,000 Seed)</span>
            <strong>{Math.round((schoolTotalSeed / 2000) * 100)}%</strong>
          </div>
          <div className="school-progress-track">
            <div
              className="school-progress-fill"
              style={{ width: `${Math.min(100, Math.round((schoolTotalSeed / 2000) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Today's School Habit Participation Rates */}
      <div className="school-habits-card animate-fade-in-up">
        <div className="section-head-row">
          <h3 className="section-card-title">오늘 우리 학교 친구들의 실천 현황</h3>
          <span className="section-card-tag">실시간 참여율</span>
        </div>
        <p className="section-card-desc">
          외모나 체중 비교 없이, 건강한 행동 실천 그 자체를 응원합니다.
        </p>

        <div className="participation-list">
          {/* 1. 급식 골고루 먹기 */}
          <div className="part-item">
            <div className="part-item-left">
              <div className="part-icon-box meal">
                <Utensils size={15} />
              </div>
              <div className="part-text">
                <span className="part-name">급식 골고루 먹기</span>
                <span className="part-sub">다양한 반찬 맛보기</span>
              </div>
            </div>
            <div className="part-stat">
              <strong className="part-percent">86%</strong>
              <span className="part-hint">참여 중</span>
            </div>
          </div>

          {/* 2. 물 충분히 마시기 */}
          <div className="part-item">
            <div className="part-item-left">
              <div className="part-icon-box water">
                <Droplets size={15} />
              </div>
              <div className="part-text">
                <span className="part-name">물 충분히 마시기</span>
                <span className="part-sub">식사 전후 수분 보충</span>
              </div>
            </div>
            <div className="part-stat">
              <strong className="part-percent">92%</strong>
              <span className="part-hint">참여 중</span>
            </div>
          </div>

          {/* 3. 몸 가볍게 움직이기 */}
          <div className="part-item">
            <div className="part-item-left">
              <div className="part-icon-box movement">
                <Activity size={15} />
              </div>
              <div className="part-text">
                <span className="part-name">몸 가볍게 움직이기</span>
                <span className="part-sub">식후 산책 & 계단 이용</span>
              </div>
            </div>
            <div className="part-stat">
              <strong className="part-percent">79%</strong>
              <span className="part-hint">참여 중</span>
            </div>
          </div>

          {/* 4. 마음 돌보기 */}
          <div className="part-item">
            <div className="part-item-left">
              <div className="part-icon-box mind">
                <Heart size={15} />
              </div>
              <div className="part-text">
                <span className="part-name">마음 편안히 돌보기</span>
                <span className="part-sub">천천히 먹고 휴식하기</span>
              </div>
            </div>
            <div className="part-stat">
              <strong className="part-percent">83%</strong>
              <span className="part-hint">참여 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warm Cheering Wall */}
      <div className="cheer-wall-card animate-fade-in-up">
        <div className="section-head-row">
          <h3 className="section-card-title">따뜻한 응원 한마디 나누기</h3>
          <span className="section-card-tag">안심 프리셋 응원</span>
        </div>
        <p className="section-card-desc">
          친구들의 따뜻한 실천에 공감 버튼을 눌러 에너지를 북돋아 주세요!
        </p>

        {customCheerSent && (
          <div className="cheer-sent-toast animate-pop-in">
            <CheckCircle2 size={16} />
            <span>친구들에게 따뜻한 응원을 전송했어요! 🌱</span>
          </div>
        )}

        <div className="cheer-list">
          {cheers.map((c) => (
            <div key={c.id} className="cheer-card">
              <div className="cheer-text-col">
                <span className="cheer-message">{c.text}</span>
              </div>
              <button
                type="button"
                className={`btn-cheer-heart ${c.hasCheered ? 'cheered' : ''}`}
                onClick={() => handleCheerClick(c.id)}
                disabled={c.hasCheered}
                aria-label="응원하기"
              >
                <span>💚</span>
                <strong>{c.count}</strong>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Send Cheering Chips */}
        <div className="quick-cheer-send-box">
          <span className="quick-send-label">나도 응원 남기기:</span>
          <div className="quick-send-chips">
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleSendQuickCheer('오늘 하루도 건강하고 즐겁게 파이팅! 🌟')}
            >
              <Send size={11} />
              <span>건강 파이팅 🌟</span>
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleSendQuickCheer('맛있는 급식 먹고 모두 힘내자! 🍱')}
            >
              <Send size={11} />
              <span>급식 최고 🍱</span>
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleSendQuickCheer('시원한 물 한 잔 마시고 상쾌하게! 💧')}
            >
              <Send size={11} />
              <span>물 한 잔 💧</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strict Privacy Protection Guarantee Notice */}
      <div className="together-privacy-notice animate-fade-in-up">
        <div className="notice-head">
          <ShieldCheck size={16} className="notice-shield" />
          <strong>학생 개인정보 & 사진 안심 보호 원칙</strong>
        </div>
        <p>
          급식판 사진과 개인 메모는 오직 본인만 확인할 수 있는 비공개 기록입니다. 함께하기 화면에는 개인 식별 정보나 사진이 절대 노출되지 않으며, 학교 전체의 긍정적인 참여율 통계만 안전하게 집계됩니다.
        </p>
      </div>
    </div>
  );
};
