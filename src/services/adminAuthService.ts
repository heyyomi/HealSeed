const ADMIN_PASSWORD_STORAGE_KEY = 'healseed_admin_password_v1';
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
 * 입력된 암호 검증 (초기 기본 암호들 및 사용자 설정 암호 모두 지원)
 */
export const verifyAdminPassword = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed) return false;

  const stored = getStoredAdminPassword();
  if (trimmed === stored) return true;

  // 기본 프리셋 비밀번호 허용 (테스트 및 초기 운영 편의성)
  return DEFAULT_PASSWORDS.includes(trimmed);
};
