import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { verifyAdminPassword } from '../../services/adminAuthService';
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
  title = '학교 관리자 인증',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
          <Lock size={24} className="lock-icon" />
        </div>

        <h3 className="admin-auth-title">{title}</h3>
        <p className="admin-auth-desc">
          학교 보건교사 및 운영자 전용 공간입니다.<br />
          보안을 위해 관리자 암호를 입력해주세요.
        </p>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="admin-auth-form">
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
              autoFocus
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

          {/* Error Message */}
          {errorMessage && (
            <div className="admin-auth-error animate-fade-in">
              <ShieldAlert size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Helper Hint */}
          <div className="admin-auth-hint-box">
            <span className="hint-label">💡 초기 안내:</span>
            <span className="hint-text">
              기본 암호는 <code>healseed2026</code> 또는 <code>1234</code> 입니다.
            </span>
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
              disabled={isSubmitting}
            >
              <span>관리자 모드 진입</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
