'use client';

import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { registerUser, requestLoginOtp, resetPassword, saveAuth, verifyLoginOtp } from '@/lib/api';

const AUTH_TOAST_KEY = 'shopore_pending_auth_toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cleanPhone = (value: string) => value.replace(/\D/g, '').slice(-10);

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginMode, setLoginMode] = useState<'login' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetData, setResetData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const sendLoginOtp = async (mobileNumber: string) => {
    const cleanMobile = cleanPhone(mobileNumber);
    const res = await requestLoginOtp({
      phone: cleanMobile,
    });

    if (res.message === 'OTP sent') {
      setLoginStep('otp');
      setOtp('');
      setOtpEmail(res.email || '');
      setIsError(false);
      setMessage(res.email ? `OTP sent to ${res.email}` : 'OTP sent to your registered email');
      return true;
    }

    setIsError(true);
    setMessage(res.message || 'Could not send OTP');
    return false;
  };

  const completeOtpLogin = async (mobileNumber: string, loginOtp: string, remember = rememberMe) => {
    const res = await verifyLoginOtp({
      phone: cleanPhone(mobileNumber),
      otp: loginOtp,
    });

    if (res.accessToken) {
      saveAuth(res.accessToken, res.refreshToken, res.user, remember);
      localStorage.setItem(AUTH_TOAST_KEY, 'Login successfully');
      onClose();
      window.location.reload();
      return true;
    }

    setIsError(true);
    setMessage(res.message || 'Login failed');
    return false;
  };

  const handleSendOtp = async () => {
    const mobileNumber = cleanPhone(phone);
    if (mobileNumber.length !== 10) {
      setIsError(true);
      setMessage('Enter a valid 10 digit mobile number');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await sendLoginOtp(mobileNumber);
    } catch {
      setIsError(true);
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const mobileNumber = cleanPhone(phone);
    if (mobileNumber.length !== 10) {
      setIsError(true);
      setMessage('Enter a valid 10 digit mobile number');
      return;
    }

    if (otp.length !== 6) {
      setIsError(true);
      setMessage('Enter the 6 digit OTP');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await completeOtpLogin(mobileNumber, otp);
    } catch {
      setIsError(true);
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const mobileNumber = cleanPhone(registerData.phone);
    if (!registerData.fullName || !registerData.email || !registerData.password || mobileNumber.length !== 10) {
      setIsError(true);
      setMessage('Please fill all fields with a valid mobile number');
      return;
    }

    if (registerData.password.length < 6) {
      setIsError(true);
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await registerUser({ ...registerData, phone: mobileNumber });
      if (res.message?.includes('successful')) {
        toast.success('Register successfully');
        setRegisterData({ fullName: '', phone: '', email: '', password: '' });
        setTab('login');
        setPhone(mobileNumber);
        await sendLoginOtp(mobileNumber);
      } else {
        setIsError(true);
        setMessage(res.message || 'Registration failed');
      }
    } catch {
      setIsError(true);
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const mobileNumber = cleanPhone(phone);
    if (mobileNumber.length !== 10) {
      setIsError(true);
      setMessage('Enter your registered 10 digit mobile number');
      return;
    }

    if (!resetData.email || !resetData.password || !resetData.confirmPassword) {
      setIsError(true);
      setMessage('Please fill all reset password fields');
      return;
    }

    if (resetData.password !== resetData.confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await resetPassword({
        phone: mobileNumber,
        email: resetData.email,
        password: resetData.password,
        confirmPassword: resetData.confirmPassword,
      });

      if (res.message?.includes('successful')) {
        setPassword(resetData.password);
        setResetData({ email: '', password: '', confirmPassword: '' });
        setLoginMode('login');
        setIsError(false);
        setMessage('Password reset successfully. Continue to login.');
        return;
      }

      setIsError(true);
      setMessage(res.message || 'Could not reset password');
    } catch {
      setIsError(true);
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-overlay" onClick={onClose} />
      <section className="auth-shell" aria-modal="true" role="dialog">
        <button type="button" onClick={onClose} className="auth-close" aria-label="Close">
          <X size={13} />
        </button>

        <div className="auth-form-panel">
          <div className="auth-brand">
            <img src="/icon.png" alt="Shopore" className="auth-logo" />
            <span>SHOPORE</span>
          </div>
          <p className="auth-subtitle">
            {tab === 'register' ? 'Create your account' : loginMode === 'reset' ? 'Reset your password' : 'Log in with mobile number'}
          </p>

          <div className="auth-tabs">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setTab(item);
                  setLoginMode('login');
                  setLoginStep('phone');
                  setOtp('');
                  setMessage('');
                }}
                className={tab === item ? 'active' : ''}
              >
                {item === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {message && <div className={`auth-message ${isError ? 'error' : 'success'}`}>{message}</div>}

          {tab === 'login' ? (
            loginMode === 'reset' ? (
              <div className="auth-fields">
                <label className="auth-label">Mobile Number</label>
                <div className="auth-phone-field">
                  <span>+91</span>
                  <input
                    type="tel"
                    placeholder="Registered mobile number"
                    value={phone}
                    onChange={(event) => setPhone(cleanPhone(event.target.value))}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Registered email address"
                  value={resetData.email}
                  onChange={(event) => setResetData({ ...resetData, email: event.target.value })}
                />
                <div className="auth-password-field">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="Create new password"
                    value={resetData.password}
                    onChange={(event) => setResetData({ ...resetData, password: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((value) => !value)}
                    aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                  >
                    {showResetPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="auth-password-field">
                  <input
                    type={showResetConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={resetData.confirmPassword}
                    onChange={(event) => setResetData({ ...resetData, confirmPassword: event.target.value })}
                    onKeyDown={(event) => event.key === 'Enter' && handleResetPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPassword((value) => !value)}
                    aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showResetConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <button type="button" onClick={handleResetPassword} disabled={loading} className="auth-primary">
                  {loading ? 'Saving...' : 'Save Password'}
                </button>
                <p className="auth-switch">
                  Remembered it?
                  <button type="button" onClick={() => setLoginMode('login')}>Login</button>
                </p>
              </div>
            ) : (
              <div className="auth-fields">
                <label className="auth-label">Mobile Number</label>
                <div className="auth-phone-field">
                  <span>+91</span>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phone}
                    onChange={(event) => {
                      setPhone(cleanPhone(event.target.value));
                      setLoginStep('phone');
                      setOtp('');
                      setMessage('');
                    }}
                    onKeyDown={(event) => event.key === 'Enter' && (loginStep === 'otp' ? handleVerifyOtp() : handleSendOtp())}
                  />
                </div>
                {loginStep === 'otp' && (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6 digit OTP"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(event) => event.key === 'Enter' && handleVerifyOtp()}
                  />
                )}
                <div className="auth-login-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    Remember me
                  </label>
                  {loginStep === 'otp' ? (
                    <button type="button" onClick={handleSendOtp} disabled={loading}>
                      Resend OTP
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={loginStep === 'otp' ? handleVerifyOtp : handleSendOtp}
                  disabled={loading || phone.length !== 10 || (loginStep === 'otp' && otp.length !== 6)}
                  className="auth-primary"
                >
                  {loading ? (loginStep === 'otp' ? 'Verifying...' : 'Sending OTP...') : loginStep === 'otp' ? 'Continue' : 'Send OTP'}
                </button>
                {loginStep === 'otp' && otpEmail && (
                  <p className="auth-otp-note">Check your registered email {otpEmail} for the OTP.</p>
                )}
                <p className="auth-switch">
                  Don&apos;t have an account?
                  <button type="button" onClick={() => setTab('register')}>Register</button>
                </p>
              </div>
            )
          ) : (
            <div className="auth-fields">
              <input
                type="text"
                placeholder="Full name"
                value={registerData.fullName}
                onChange={(event) => setRegisterData({ ...registerData, fullName: event.target.value })}
              />
              <div className="auth-phone-field">
                <span>+91</span>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={registerData.phone}
                  onChange={(event) => setRegisterData({ ...registerData, phone: cleanPhone(event.target.value) })}
                />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={registerData.email}
                onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })}
              />
              <div className="auth-password-field">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })}
                  onKeyDown={(event) => event.key === 'Enter' && handleRegister()}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((value) => !value)}
                  aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <button type="button" onClick={handleRegister} disabled={loading} className="auth-primary">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <p className="auth-switch">
                Already have an account?
                <button type="button" onClick={() => setTab('login')}>Login</button>
              </p>
            </div>
          )}

          <p className="auth-terms">By continuing, you agree to Terms & Conditions and Privacy Policy.</p>
        </div>

        <div className="auth-media-panel" aria-hidden="true">
          <video className="auth-video" src="/loginvdo.mp4" autoPlay muted loop playsInline />
        </div>
      </section>

      <style>{`
        .auth-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(15, 23, 42, 0.52); backdrop-filter: blur(3px); }
        .auth-shell { position: fixed; left: 50%; top: 50%; z-index: 1001; display: grid; width: min(680px, calc(100vw - 28px)); max-height: calc(100vh - 28px); grid-template-columns: minmax(0, 1fr) minmax(260px, 306px); overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28); transform: translate(-50%, -50%); font-family: DM Sans, Inter, sans-serif; }
        .auth-close { position: absolute; right: 12px; top: 12px; z-index: 2; display: flex; height: 22px; width: 22px; align-items: center; justify-content: center; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 50%; background: rgba(255, 255, 255, 0.94); color: #071225; cursor: pointer; box-shadow: 0 5px 14px rgba(15, 23, 42, 0.1); }
        .auth-close svg { height: 11px; width: 11px; stroke-width: 2.3; }
        .auth-form-panel { display: flex; min-height: 0; flex-direction: column; overflow-y: auto; padding: 24px 24px; }
        .auth-logo { width: 52px; height: 52px; object-fit: contain; display: block; margin: 0; }
        .auth-brand { display: flex; align-items: center; gap: 10px; margin: 0; }
        .auth-brand span { font-family: Georgia, serif; font-size: 25px; font-weight: 800; letter-spacing: 4px; color: #071225; }
        .auth-subtitle { margin: 7px 0 16px; font-size: 13px; color: #374151; }
        .auth-tabs { display: grid; grid-template-columns: 1fr 1fr; margin: 0 -24px 18px; border-bottom: 1px solid #eef2f7; }
        .auth-tabs button { height: 40px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #8b95a5; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
        .auth-tabs button.active { border-bottom-color: #071225; color: #071225; }
        .auth-message { margin-bottom: 16px; border-radius: 6px; padding: 11px 13px; font-size: 13px; font-weight: 600; }
        .auth-message.error { border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; }
        .auth-message.success { border: 1px solid #bbf7d0; background: #f0fdf4; color: #15803d; }
        .auth-fields { display: grid; gap: 12px; }
        .auth-label { font-size: 12px; font-weight: 700; color: #374151; }
        .auth-fields input { height: 42px; border: 1px solid #dbe1ea; border-radius: 4px; padding: 0 14px; color: #071225; font: inherit; font-size: 14px; outline: none; }
        .auth-fields input:focus { border-color: #071225; }
        .auth-phone-field { display: grid; grid-template-columns: 56px 1fr; border: 1px solid #dbe1ea; border-radius: 4px; }
        .auth-phone-field:focus-within { border-color: #071225; }
        .auth-phone-field span { display: flex; align-items: center; justify-content: center; border-right: 1px solid #dbe1ea; font-size: 13px; color: #374151; }
        .auth-phone-field input { border: 0; }
        .auth-password-field { position: relative; }
        .auth-password-field input { width: 100%; padding-right: 44px; }
        .auth-password-field button { position: absolute; right: 12px; top: 50%; display: flex; height: 28px; width: 28px; transform: translateY(-50%); align-items: center; justify-content: center; border: 0; background: transparent; color: #64748b; cursor: pointer; }
        .auth-primary { height: 42px; border: 0; border-radius: 4px; background: #071225; color: #fff; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
        .auth-primary:disabled { cursor: not-allowed; opacity: 0.42; }
        .auth-switch { margin: 3px 0 0; text-align: center; color: #8b95a5; font-size: 13px; }
        .auth-switch button { margin-left: 4px; border: 0; background: transparent; color: #071225; cursor: pointer; font: inherit; font-weight: 800; }
        .auth-otp-note { margin: -2px 0 0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5; }
        .auth-login-options { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #64748b; font-size: 12px; }
        .auth-login-options label { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
        .auth-login-options input { height: 14px; width: 14px; accent-color: #071225; }
        .auth-login-options button { border: 0; background: transparent; color: #071225; cursor: pointer; font: inherit; font-weight: 800; }
        .auth-link-btn { border: 0; background: transparent; color: #071225; font: inherit; font-size: 12px; font-weight: 800; text-align: center; cursor: pointer; }
        .auth-terms { margin: 22px auto 0; max-width: 260px; text-align: center; color: #8b95a5; font-size: 12px; line-height: 1.5; }
        .auth-media-panel { position: relative; overflow: hidden; background: #fff; }
        .auth-video { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: cover; object-position: center 22%; }
        @media (max-width: 720px) { .auth-shell { grid-template-columns: 1fr; width: min(400px, calc(100vw - 28px)); } .auth-media-panel { display: none; } .auth-form-panel { padding: 24px 22px; } .auth-tabs { margin-left: -22px; margin-right: -22px; } }
      `}</style>
    </>
  );
}
