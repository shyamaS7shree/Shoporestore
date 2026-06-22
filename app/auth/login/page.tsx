'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { requestLoginOtp, resetPassword, saveAuth, verifyLoginOtp } from '@/lib/api';
import OtpInput from '@/components/OtpInput';

const cleanPhone = (value: string) => value.replace(/\D/g, '').slice(-10);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetForm, setResetForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const nextPhone = cleanPhone(phone);
    if (nextPhone.length !== 10) {
      toast.error('Please enter a valid 10 digit mobile number');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!otpRequested) {
        const res = await requestLoginOtp({ phone: nextPhone });

        if (res.success === false) {
          toast.error(res.message || 'Could not send OTP');
          return;
        }

        setOtpRequested(true);
        setOtp('');
        toast.success(`OTP sent to ${res.email || `+91 ${nextPhone}`}`);
        return;
      }

      if (otp.length !== 6) {
        toast.error('Enter the 6 digit OTP');
        return;
      }

      const res = await verifyLoginOtp({ phone: nextPhone, otp });

      if (res.accessToken) {
        saveAuth(res.accessToken, res.refreshToken, res.user, rememberMe);
        toast.success('Login successfully');
        setPhone('');
        setOtp('');
        setOtpRequested(false);
        router.push(searchParams.get('next') || '/');
        return;
      }

      toast.error(res.message || 'Login failed');
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const nextPhone = cleanPhone(phone);
    if (nextPhone.length !== 10) {
      toast.error('Please enter a valid 10 digit mobile number');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestLoginOtp({ phone: nextPhone });

      if (res.success === false) {
        toast.error(res.message || 'Could not resend OTP');
        return;
      }

      setOtp('');
      setOtpRequested(true);
      toast.success(`OTP sent to ${res.email || `+91 ${nextPhone}`}`);
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const nextPhone = cleanPhone(phone);

    if (nextPhone.length !== 10) {
      toast.error('Please enter your registered 10 digit mobile number');
      return;
    }

    if (!resetForm.email || !resetForm.password || !resetForm.confirmPassword) {
      toast.error('Please fill in all reset password fields');
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPassword({
        phone: nextPhone,
        email: resetForm.email,
        password: resetForm.password,
        confirmPassword: resetForm.confirmPassword,
      });

      if (res.message?.includes('successful')) {
        setResetForm({ email: '', password: '', confirmPassword: '' });
        setMode('login');
        toast.success('Password reset successfully. Continue to login.');
        return;
      }

      toast.error(res.message || 'Could not reset password');
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const queryPhone = cleanPhone(searchParams.get('phone') || '');
    if (queryPhone) {
      setPhone(queryPhone);
    }
  }, [searchParams]);

  return (
    <LoginShell
      phone={phone}
      setPhone={(value) => {
        setPhone(value);
        setOtp('');
        setOtpRequested(false);
      }}
      otp={otp}
      setOtp={setOtp}
      otpRequested={otpRequested}
      rememberMe={rememberMe}
      setRememberMe={setRememberMe}
      mode={mode}
      setMode={setMode}
      resetForm={resetForm}
      setResetForm={setResetForm}
      isSubmitting={isSubmitting}
      handleLogin={handleLogin}
      handleResendOtp={handleResendOtp}
      handleResetPassword={handleResetPassword}
    />
  );
}

type LoginShellProps = {
  phone?: string;
  setPhone?: (phone: string) => void;
  otp?: string;
  setOtp?: (otp: string) => void;
  otpRequested?: boolean;
  rememberMe?: boolean;
  setRememberMe?: (remember: boolean) => void;
  mode?: 'login' | 'reset';
  setMode?: (mode: 'login' | 'reset') => void;
  resetForm?: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  setResetForm?: React.Dispatch<React.SetStateAction<{
    email: string;
    password: string;
    confirmPassword: string;
  }>>;
  isSubmitting?: boolean;
  handleLogin?: (event?: React.FormEvent) => void;
  handleResendOtp?: () => void;
  handleResetPassword?: (event?: React.FormEvent) => void;
};

function LoginShell({
  phone = '',
  setPhone,
  otp = '',
  setOtp,
  otpRequested = false,
  rememberMe = true,
  setRememberMe,
  mode = 'login',
  setMode,
  resetForm = { email: '', password: '', confirmPassword: '' },
  setResetForm,
  isSubmitting = false,
  handleLogin,
  handleResendOtp,
  handleResetPassword,
}: LoginShellProps) {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  if (mode === 'login' && otpRequested) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] px-4 pt-[120px] text-[#071225] md:pt-[112px]">
        <section className="mx-auto grid min-h-[430px] w-full max-w-[760px] overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] md:grid-cols-[0.95fr_1fr]">
          <div className="px-7 py-8 sm:px-8">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Shopore" className="h-14 w-14 object-contain" />
              <h1 className="font-serif text-[28px] font-extrabold uppercase tracking-[4px] text-[#071225]">SHOPORE</h1>
            </div>
            <h2 className="mt-6 text-[22px] font-semibold text-[#071225]">OTP Verification</h2>
            <p className="mt-1 text-[14px] text-slate-700">
              OTP Sent To +91 {phone}{' '}
              <button
                type="button"
                onClick={() => {
                  setOtp?.('');
                  setPhone?.(phone);
                }}
                className="font-semibold text-[#071225] underline"
              >
                Change
              </button>
            </p>

            <form onSubmit={handleLogin} className="mt-9">
              <label className="block">
                <span className="mb-3 block text-[14px] font-medium text-[#071225]">OTP</span>
                <OtpInput
                  value={otp}
                  onChange={(value) => setOtp?.(value)}
                  disabled={isSubmitting}
                  className="justify-between gap-0"
                  inputClassName="h-[55px] w-[55px] rounded-[3px] text-[20px]"
                />
              </label>

              <div className="mt-6 flex items-center justify-center gap-2 text-[14px] text-slate-700">
                <span>Didn&apos;t receive a code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting || phone.length !== 10}
                  className="font-medium text-slate-500 disabled:text-slate-300"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="mt-8 h-[60px] w-full rounded bg-[#071225] text-[18px] font-semibold text-white transition hover:bg-[#111d31] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-white"
              >
                {isSubmitting ? 'Verifying...' : 'Continue'}
              </button>
            </form>

            <p className="mt-7 text-center text-[15px] text-slate-500">
              Having trouble logging in?{' '}
              <button type="button" onClick={() => setMode?.('reset')} className="font-semibold text-red-600">
                Get Help
              </button>
            </p>

            <p className="mx-auto mt-12 max-w-[280px] text-center text-[14px] leading-6 text-slate-500">
              By continuing, I agree to<br />
              <span className="text-blue-600">Terms &amp; Conditions</span> and{' '}
              <span className="text-blue-600">Privacy Policy</span>
            </p>
          </div>

          <div className="login-media hidden md:block">
            <video className="login-video" src="/loginvdo.mp4" autoPlay muted loop playsInline />
          </div>
        </section>

        <style jsx>{`
          .login-media {
            position: relative;
            overflow: hidden;
            background: #fff;
          }
          .login-video {
            position: absolute;
            inset: -8px;
            height: calc(100% + 16px);
            width: calc(100% + 16px);
            object-fit: cover;
            object-position: center 22%;
            transform: scale(1.06);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 pt-[120px] text-[#071225] md:pt-[112px]">
      <section className="mx-auto grid min-h-[430px] w-full max-w-[760px] overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] md:grid-cols-[0.95fr_1fr]">
        <div className="px-7 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Shopore" className="h-14 w-14 object-contain" />
            <h1 className="font-serif text-[28px] font-extrabold uppercase tracking-[4px] text-[#071225]">SHOPORE</h1>
          </div>
          <p className="mt-2 text-[15px] text-slate-700">
            {mode === 'reset' ? 'Reset your password' : 'Log in with mobile number'}
          </p>

          <form onSubmit={mode === 'reset' ? handleResetPassword : handleLogin} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold">Mobile Number</span>
              <span className="flex h-11 rounded border border-slate-300 transition focus-within:border-[#071225]">
                <span className="flex w-14 items-center justify-center border-r border-slate-300 text-[13px] text-slate-600">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone?.(cleanPhone(event.target.value))}
                  placeholder="Enter your mobile number"
                  className="h-full flex-1 px-4 text-[14px] outline-none"
                  required
                />
              </span>
            </label>

            {mode === 'reset' ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold">Registered Email</span>
                  <input
                    type="email"
                    value={resetForm.email}
                    onChange={(event) => setResetForm?.((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Enter your registered email"
                    className="h-11 w-full rounded border border-slate-300 px-4 text-[14px] outline-none transition focus:border-[#071225]"
                    required
                  />
                </label>

                <PasswordField
                  label="New Password"
                  value={resetForm.password}
                  onChange={(value) => setResetForm?.((current) => ({ ...current, password: value }))}
                  placeholder="Create new password"
                  show={showResetPassword}
                  setShow={setShowResetPassword}
                />

                <PasswordField
                  label="Confirm Password"
                  value={resetForm.confirmPassword}
                  onChange={(value) => setResetForm?.((current) => ({ ...current, confirmPassword: value }))}
                  placeholder="Confirm new password"
                  show={showResetConfirmPassword}
                  setShow={setShowResetConfirmPassword}
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 text-[12px] text-slate-500">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe?.(event.target.checked)}
                      className="h-3.5 w-3.5 accent-[#071225]"
                    />
                    Remember me
                  </label>
                  {otpRequested ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting || phone.length !== 10}
                      className="font-bold text-[#071225] disabled:text-slate-400"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode?.('reset')}
                      className="font-bold text-[#071225]"
                    >
                      Get Help
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting || phone.length !== 10 || (mode === 'login' && otpRequested ? otp.length !== 6 : false)}
              className="h-11 w-full rounded bg-[#071225] text-[15px] font-bold text-white transition hover:bg-[#111d31] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (mode === 'reset' ? 'Saving...' : otpRequested ? 'Verifying...' : 'Sending OTP...') : mode === 'reset' ? 'Save Password' : otpRequested ? 'Continue' : 'Send OTP'}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            {mode === 'reset' ? (
              <>
                Remembered it?{' '}
                <button type="button" onClick={() => setMode?.('login')} className="font-bold text-[#071225]">
                  Login
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-bold text-[#071225]">
                  Register
                </Link>
              </>
            )}
          </p>

          <p className="mx-auto mt-12 max-w-[280px] text-center text-[12px] leading-5 text-slate-400">
            By continuing, you agree to Terms & Conditions and Privacy Policy.
          </p>
        </div>

        <div className="login-media hidden md:block">
          <video className="login-video" src="/loginvdo.mp4" autoPlay muted loop playsInline />
        </div>
      </section>

      <style jsx>{`
        .login-media {
          position: relative;
          overflow: hidden;
          background: #fff;
        }
        .login-video {
          position: absolute;
          inset: -8px;
          height: calc(100% + 16px);
          width: calc(100% + 16px);
          object-fit: cover;
          object-position: center 22%;
          transform: scale(1.06);
        }
      `}</style>
    </main>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold">{label}</span>
      <span className="relative block">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded border border-slate-300 px-4 pr-11 text-[14px] outline-none transition focus:border-[#071225]"
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-slate-500"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}
