import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { CharacterSelectScreen } from './components/CharacterSelectScreen';
import { GrowthPreviewScreen } from './components/GrowthPreviewScreen';
import { NicknameScreen } from './components/NicknameScreen';
import { SchoolSelectScreen } from './components/SchoolSelectScreen';
import { TempHomeScreen } from './components/TempHomeScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import type { OnboardingState, UserType, CharacterId, SchoolType, UserRole } from './types/onboarding';
import { calculateLevelInfo } from './utils/seedRules';

const STORAGE_KEY = 'healseed_onboarding_data_v3';

const initialDefaultState: OnboardingState = {
  step: 'welcome',
  userType: null,
  role: 'user',
  characterId: null,
  nickname: '',
  schoolName: '숭곡중학교',
  schoolType: 'middle',
  schoolCode: null,
  officeCode: null,
  seed: 0,
  level: 1,
  dailyRecords: {},
  mealRecords: {},
  weeklyGoal: {
    targetSeed: 15,
    title: '이번 주 건강습관 15 Seed 심기 🌱',
  },
};

export const App: React.FC = () => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const level = calculateLevelInfo(parsed.seed || 0).level;
        return {
          ...parsed,
          role: parsed.role || 'user',
          schoolName: parsed.schoolName || '숭곡중학교',
          schoolType: parsed.schoolType || 'middle',
          schoolCode: parsed.schoolCode || null,
          officeCode: parsed.officeCode || null,
          level,
          dailyRecords: parsed.dailyRecords || {},
          mealRecords: parsed.mealRecords || {},
          weeklyGoal: parsed.weeklyGoal || {
            targetSeed: 15,
            title: '이번 주 건강습관 15 Seed 심기 🌱',
          },
        };
      }
    } catch {
      // Fallback
    }
    return initialDefaultState;
  });

  // Sync with LocalStorage for persistence during refresh
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore
    }
  }, [state]);

  // Flow handlers
  const handleStartWelcome = () => {
    setState((prev) => ({ ...prev, step: 'role' }));
  };

  const handleSelectRole = (userType: UserType) => {
    setState((prev) => ({ ...prev, userType, step: 'character' }));
  };

  const handleSelectCharacter = (characterId: CharacterId) => {
    setState((prev) => ({ ...prev, characterId, step: 'preview' }));
  };

  const handleConfirmPreview = () => {
    setState((prev) => ({ ...prev, step: 'nickname' }));
  };

  // Move from Nickname to School Setup screen
  const handleSubmitNickname = (nickname: string) => {
    setState((prev) => ({
      ...prev,
      nickname,
      step: 'school',
    }));
  };

  // Complete School Setup and proceed to Home
  const handleSubmitSchool = (schoolName: string, schoolType: SchoolType) => {
    setState((prev) => ({
      ...prev,
      schoolName,
      schoolType,
      step: 'home',
      seed: 0,
      level: 1,
      dailyRecords: {},
      mealRecords: {},
      weeklyGoal: prev.weeklyGoal || initialDefaultState.weeklyGoal,
    }));
  };

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialDefaultState);
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setState((prev) => ({
      ...prev,
      role: newRole,
      ...(newRole === 'admin' ? { userType: 'staff' as UserType } : {}),
    }));
  };

  const handleSelectAdminRole = () => {
    setState((prev) => ({
      ...prev,
      role: 'admin',
      userType: 'staff',
    }));
  };

  // Section 12: Admin Dashboard Routing
  if (state.role === 'admin') {
    return (
      <div className="app-viewport">
        <AdminLayout
          data={state}
          onSwitchRole={handleSwitchRole}
        />
      </div>
    );
  }

  return (
    <div className="app-viewport">
      {state.step === 'welcome' && (
        <WelcomeScreen
          onStart={handleStartWelcome}
          onSelectAdminRole={handleSelectAdminRole}
        />
      )}

      {state.step === 'role' && (
        <RoleSelectScreen
          initialRole={state.userType}
          onBack={() => setState((prev) => ({ ...prev, step: 'welcome' }))}
          onNext={handleSelectRole}
        />
      )}

      {state.step === 'character' && (
        <CharacterSelectScreen
          initialCharacterId={state.characterId}
          onBack={() => setState((prev) => ({ ...prev, step: 'role' }))}
          onNext={handleSelectCharacter}
        />
      )}

      {state.step === 'preview' && state.characterId && (
        <GrowthPreviewScreen
          characterId={state.characterId}
          onBack={() => setState((prev) => ({ ...prev, step: 'character' }))}
          onNext={handleConfirmPreview}
        />
      )}

      {state.step === 'nickname' && state.characterId && (
        <NicknameScreen
          characterId={state.characterId}
          initialNickname={state.nickname}
          onBack={() => setState((prev) => ({ ...prev, step: 'preview' }))}
          onSubmit={handleSubmitNickname}
        />
      )}

      {state.step === 'school' && (
        <SchoolSelectScreen
          initialSchoolName={state.schoolName}
          initialSchoolType={state.schoolType}
          onBack={() => setState((prev) => ({ ...prev, step: 'nickname' }))}
          onSubmit={handleSubmitSchool}
        />
      )}

      {state.step === 'home' && (
        <TempHomeScreen
          data={state}
          onUpdateState={setState}
          onReset={handleResetAll}
        />
      )}
    </div>
  );
};

export default App;
