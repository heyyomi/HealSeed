import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  School,
  Sparkles,
  Check,
  Building2,
  Search,
  ShieldCheck,
  MapPin,
  Loader2,
} from 'lucide-react';
import type { SchoolType, SchoolSearchResult } from '../types/onboarding';
import { searchSchoolsFromNEIS } from '../services/mealService';
import './SchoolSelectScreen.css';

interface SchoolSelectScreenProps {
  initialSchoolName: string;
  initialSchoolType: SchoolType;
  onBack: () => void;
  onSubmit: (schoolName: string, schoolType: SchoolType) => void;
}

const SCHOOL_TYPES: { id: SchoolType; label: string; icon: string }[] = [
  { id: 'elementary', label: '초등학교', icon: '🎒' },
  { id: 'middle', label: '중학교', icon: '🏫' },
  { id: 'high', label: '고등학교', icon: '🎓' },
];

// Recommended quick-pick presets
const QUICK_PRESETS = [
  { name: '숭곡중학교', type: 'middle' as SchoolType, loc: '서울 성북구' },
  { name: '진선여자중학교', type: 'middle' as SchoolType, loc: '서울 강남구' },
  { name: '서울고등학교', type: 'high' as SchoolType, loc: '서울 서초구' },
  { name: '서울초등학교', type: 'elementary' as SchoolType, loc: '서울 종로구' },
];

export const SchoolSelectScreen: React.FC<SchoolSelectScreenProps> = ({
  initialSchoolName,
  initialSchoolType,
  onBack,
  onSubmit,
}) => {
  const [schoolName, setSchoolName] = useState(initialSchoolName || '숭곡중학교');
  const [schoolType, setSchoolType] = useState<SchoolType>(initialSchoolType || 'middle');
  const [searchResults, setSearchResults] = useState<SchoolSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolSearchResult | null>({
    schoolName: initialSchoolName || '숭곡중학교',
    schoolType: initialSchoolType || 'middle',
    officeCode: 'B10',
    schoolCode: '7121370',
    location: '서울특별시 성북구 종암로 208',
  });

  const searchTimeoutRef = useRef<any>(null);

  // Trigger real-time search when user types (debounced)
  useEffect(() => {
    const trimmed = schoolName.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Don't search again if the current input exactly matches the chosen school
    if (selectedSchool && selectedSchool.schoolName === trimmed) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const list = await searchSchoolsFromNEIS(trimmed);
        setSearchResults(list);
        setShowDropdown(list.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [schoolName, selectedSchool]);

  const handleSelectSchoolResult = (item: SchoolSearchResult) => {
    setSchoolName(item.schoolName);
    setSchoolType(item.schoolType);
    setSelectedSchool(item);
    setShowDropdown(false);
  };

  const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setSchoolName(preset.name);
    setSchoolType(preset.type);
    setSelectedSchool({
      schoolName: preset.name,
      schoolType: preset.type,
      officeCode: 'B10',
      schoolCode: '',
      location: preset.loc,
    });
    setShowDropdown(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = schoolName.trim();
    if (trimmed.length < 2) return;

    // If user typed shorthand like "숭곡중" without clicking dropdown, auto-resolve it
    if (!selectedSchool || selectedSchool.schoolName !== trimmed) {
      setIsSearching(true);
      try {
        const list = await searchSchoolsFromNEIS(trimmed);
        if (list.length > 0) {
          const matched = list[0];
          onSubmit(matched.schoolName, matched.schoolType);
          return;
        }
      } catch {
        // proceed with typed
      } finally {
        setIsSearching(false);
      }
    }

    onSubmit(selectedSchool?.schoolName || trimmed, schoolType);
  };

  const trimmed = schoolName.trim();
  const isValid = trimmed.length >= 2;

  return (
    <div className="school-screen screen-container">
      {/* Top Navigation */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack} aria-label="이전 화면으로 이동">
          <ChevronLeft size={22} />
        </button>
        <div className="step-indicator">
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot" />
          <span className="step-dot active" />
        </div>
      </div>

      {/* Screen Title */}
      <div className="screen-title-section animate-fade-in-up">
        <div className="school-badge-row">
          <div className="school-badge">
            <School size={14} />
            <span>학교 급식 맞춤 설정</span>
          </div>
          <span className="neis-live-badge">
            <ShieldCheck size={12} />
            <span>NEIS 실시간 연동</span>
          </span>
        </div>
        <h2 className="screen-main-title">
          어느 학교의<br />급식을 볼까요?
        </h2>
        <p className="screen-subtitle">
          학교를 설정하면 매일 오늘의 급식을 교육부 NEIS에서 실시간으로 불러와요.
        </p>
      </div>

      {/* School Setup Form */}
      <form className="school-form-section animate-fade-in-up" onSubmit={handleSubmit}>
        {/* School Name Input with NEIS Real-Time Search */}
        <div className="form-group search-form-group">
          <div className="form-label-row">
            <label htmlFor="school-name-input" className="form-label">
              학교명 검색
            </label>
            <span className="search-sublabel">약칭 입력 가능 (예: 숭곡중)</span>
          </div>

          <div className={`school-input-box ${isValid ? 'valid' : ''}`}>
            <Building2 size={20} className="input-prefix-icon" />
            <input
              id="school-name-input"
              type="text"
              placeholder="학교명을 입력하세요 (예: 숭곡중)"
              value={schoolName}
              onChange={(e) => {
                setSchoolName(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className="school-input"
              autoComplete="off"
            />
            {isSearching ? (
              <Loader2 size={18} className="search-spin-icon" />
            ) : (
              <Search size={18} className="search-action-icon" />
            )}
          </div>

          {/* Real-time NEIS Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown-menu animate-pop-in">
              <div className="dropdown-header">
                <span>NEIS 교육부 학교 검색 결과 ({searchResults.length})</span>
                <button
                  type="button"
                  className="dropdown-close-btn"
                  onClick={() => setShowDropdown(false)}
                >
                  닫기
                </button>
              </div>
              <div className="dropdown-list">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.schoolCode}-${idx}`}
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleSelectSchoolResult(item)}
                  >
                    <div className="item-main-row">
                      <strong className="item-name">{item.schoolName}</strong>
                      <span className="item-type-badge">
                        {item.schoolType === 'elementary'
                          ? '초등'
                          : item.schoolType === 'middle'
                          ? '중학'
                          : '고등'}
                      </span>
                    </div>
                    <div className="item-sub-row">
                      <MapPin size={12} className="loc-pin" />
                      <span className="item-loc">{item.location}</span>
                      <span className="item-verified-tag">✓ NEIS 실시간</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verified School Feedback Card */}
          {selectedSchool && (
            <div className="verified-school-card animate-pop-in">
              <div className="verified-check-bubble">
                <Check size={14} strokeWidth={3} />
              </div>
              <div className="verified-content">
                <div className="verified-top-row">
                  <strong className="verified-title">{selectedSchool.schoolName}</strong>
                  <span className="verified-badge-pill">
                    <ShieldCheck size={11} /> NEIS 공식 연동
                  </span>
                </div>
                {selectedSchool.location && (
                  <span className="verified-loc">{selectedSchool.location}</span>
                )}
              </div>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="quick-presets-wrap">
            <span className="preset-label">빠른 선택:</span>
            <div className="preset-chips">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className={`preset-chip ${schoolName === p.name ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* School Type Selector */}
        <div className="form-group">
          <label className="form-label">학교급 선택</label>
          <div className="school-type-grid">
            {SCHOOL_TYPES.map((type) => {
              const isSelected = schoolType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  id={`btn-school-type-${type.id}`}
                  className={`school-type-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSchoolType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                  {isSelected && (
                    <div className="type-check-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative School Meal Tip Card */}
        <div className="school-info-card">
          <div className="info-icon-bubble">🍱</div>
          <div className="info-text">
            <strong>교육부 NEIS 공식 급식과 함께해요!</strong>
            <p>
              약칭(예: 숭곡중)으로 검색해도 공식 명칭(숭곡중학교)과 오늘의 급식 정보를 자동으로 연동합니다.
            </p>
          </div>
        </div>

        {/* Bottom Submit Button */}
        <div className="bottom-action-area">
          <button
            type="submit"
            className="btn-primary"
            disabled={!isValid || isSearching}
            id="btn-school-submit"
          >
            <Sparkles size={18} />
            <span>학교 설정 완료</span>
          </button>
        </div>
      </form>
    </div>
  );
};
