import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { verifyAdminPassword, loginAdminWithGoogle } from '../../services/adminAuthService';
import './AdminPasswordModal.css';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = '학교 관리자(보건교사) 인증',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const res = await loginAdminWithGoogle();
      if (res.success) {
        setIsGoogleLoading(false);
        onSuccess();
      } else {
        setIsGoogleLoading(false);
        if (res.errorCode === 'auth/operation-not-allowed' || res.errorCode === 'auth/configuration-not-found') {
          setErrorMessage('Firebase 콘솔에서 Google 로그인을 사용 설정해주세요. (현재는 아래 관리자 암호로 즉시 진입하실 수 있습니다.)');
        } else if (res.errorCode === 'auth/popup-closed-by-user') {
          // 사용자 팝업 닫음
        } else {
          setErrorMessage(res.error || 'Google 로그인 중 오류가 발생했습니다.');
        }
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMessage(err?.message || 'Google 로그인에 실패했습니다.');
    }
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage('관리자 암호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const isValid = verifyAdminPassword(password);

    if (isValid) {
      setPassword('');
      setErrorMessage(null);
      setIsSubmitting(false);
      onSuccess();
    } else {
      setIsSubmitting(false);
      setErrorMessage('암호가 올바르지 않습니다. 다시 확인해주세요.');
    }
  };

  const handleClose = () => {
    setPassword('');
    setErrorMessage(null);
    setIsGoogleLoading(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-backdrop admin-auth-backdrop" onClick={handleClose}>
      <div className="admin-auth-card animate-pop-in" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          type="button"
          className="admin-auth-close-btn"
          onClick={handleClose}
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="admin-auth-icon-bubble">
          <Lock size={22} className="lock-icon" />
        </div>

        <h3 className="admin-auth-title">{title}</h3>
        <p className="admin-auth-desc">
          학교 보건교사 및 운영자 전용 공간입니다.<br />
          Google 아이디 또는 관리자 인증으로 진입하세요.
        </p>

        {/* Google Sign-In Button */}
        <div className="admin-google-auth-box">
          <button
            type="button"
            className="btn-google-auth-cta"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting}
          >
            <svg className="google-g-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isGoogleLoading ? 'Google 계정 확인 중...' : 'Google 아이디로 로그인'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="admin-auth-divider">
          <span>또는 암호로 로그인</span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="admin-auth-error animate-fade-in">
            <ShieldAlert size={14} className="error-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form (No default password hint) */}
        <form onSubmit={handleSubmitPassword} className="admin-auth-form">
          <div className="admin-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="관리자 암호 입력"
              className={`admin-password-input ${errorMessage ? 'error' : ''}`}
            />
            <button
              type="button"
              className="btn-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? '암호 숨기기' : '암호 보기'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="admin-auth-actions">
            <button
              type="button"
              className="btn-auth-cancel"
              onClick={handleClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isSubmitting || isGoogleLoading}
            >
              <span>암호로 진입</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
