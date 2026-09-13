import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const ADMIN_PASSWORD_STORAGE_KEY = 'healseed_admin_password_v1';
const ADMIN_USER_STORAGE_KEY = 'healseed_admin_logged_user_v1';
const DEFAULT_PASSWORDS = ['healseed2026', '1234', 'admin1234'];

/**
 * 저장된 관리자 암호 조회 (기본값: healseed2026)
 */
export const getStoredAdminPassword = (): string => {
  return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || 'healseed2026';
};

/**
 * 새 관리자 암호 설정
 */
export const setAdminPassword = (newPassword: string): void => {
  localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, newPassword.trim());
};

/**
 * 입력된 암호 검증
 */
export const verifyAdminPassword = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed) return false;

  const stored = getStoredAdminPassword();
  if (trimmed === stored) return true;

  // 기본 프리셋 비밀번호 허용 (테스트 및 초기 운영 편의성)
  return DEFAULT_PASSWORDS.includes(trimmed);
};

export interface AdminGoogleLoginResult {
  success: boolean;
  user?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  error?: string;
  errorCode?: string;
}

/**
 * Google 계정으로 관리자 로그인
 */
export const loginAdminWithGoogle = async (): Promise<AdminGoogleLoginResult> => {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    const adminInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(adminInfo));
    return { success: true, user: adminInfo };
  } catch (err: any) {
    console.error('Google Admin Login error:', err);
    return {
      success: false,
      error: err?.message || '구글 로그인 중 오류가 발생했습니다.',
      errorCode: err?.code || 'auth/unknown',
    };
  }
};

/**
 * 현재 로그인된 관리자 정보 조회
 */
export const getLoggedInAdminUser = (): {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
} | null => {
  try {
    const saved = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

/**
 * 관리자 로그아웃
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch {
    // Ignore
  }
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
};
