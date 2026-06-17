import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { KeyRound, Mail, Loader2, Gamepad2, ArrowLeft, CircleAlert, CircleCheckBig, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const { login, resetPassword } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLogin = loginVal.trim();
    if (!cleanLogin || !password) {
      toast.error("Please fill in all layout credentials.");
      return;
    }

    setLoading(true);
    try {
      await login(cleanLogin, password);
      toast.success("Welcome back, Player!");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login trigger failed:", err);
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openResetForm = () => {
    const suggestedEmail = emailPattern.test(loginVal.trim()) ? loginVal.trim() : '';
    setResetEmail(suggestedEmail);
    setResetError('');
    setResetSuccess('');
    setShowResetForm(true);
  };

  const closeResetForm = () => {
    setShowResetForm(false);
    setResetLoading(false);
    setResetError('');
    setResetSuccess('');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = resetEmail.trim();

    if (!sanitizedEmail) {
      setResetError('Please enter your email address.');
      setResetSuccess('');
      return;
    }

    if (!emailPattern.test(sanitizedEmail)) {
      setResetError('Please enter a valid email address.');
      setResetSuccess('');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      await resetPassword(sanitizedEmail);
      const successMessage = 'Password reset link has been sent to your email.';
      setResetSuccess(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      const errorMessage = err.message || 'Firebase could not send the password reset email. Please try again.';
      setResetError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#0A0A0A]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#B30000]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#B30000]/40 rounded-xl shadow-[0_0_50px_rgba(179,0,0,0.12)] p-8 space-y-6">

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className={`inline-flex w-12 h-12 items-center justify-center border border-[#B30000]/30 rounded-full mb-2 overflow-hidden shadow-[0_0_15px_rgba(179,0,0,0.2)] ${settings?.logoUrl ? 'p-0 bg-transparent' : 'p-2.5 bg-[#B30000]/10 text-[#FF3E3E]'}`}>
            {settings?.logoUrl ? (
              <img
                referrerPolicy="no-referrer"
                src={settings.logoUrl}
                alt="OGzz MC Store player login logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Gamepad2 className="w-6 h-6" />
            )}
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            PLAYER <span className="text-[#B30000]">LOGIN</span>
          </h1>
          <p className="text-zinc-500 text-xs">
            Enter your Email or Minecraft Character name to authenticate.
          </p>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
              Email or Minecraft Username
            </label>
            <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
              <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-input"
                type="text"
                placeholder="SpryGamer or player@email.com"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
                Password
              </label>
              <button
                type="button"
                onClick={openResetForm}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF3E3E] hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
              <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="px-3 text-zinc-500 transition-colors hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Trigger button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#B30000] hover:bg-[#D60000] disabled:bg-zinc-800 text-white font-bold font-mono text-xs uppercase tracking-wider rounded transition-all shadow-md shadow-red-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting Server...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Navigation fallback Link */}
        <div className="text-center text-xs">
          <span className="text-zinc-500">New player on OGzz MC? </span>
          <Link to="/register" id="login-to-register-link" className="text-[#FF3E3E] hover:underline font-bold">Create Profile</Link>
        </div>

      </div>

      {showResetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#B30000]/40 bg-[#0C0C0C] p-5 sm:p-6 shadow-[0_0_60px_rgba(179,0,0,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#B30000]/30 bg-[#B30000]/10 text-[#FF3E3E]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                    Reset <span className="text-[#B30000]">Password</span>
                  </h2>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Enter your registered email and Firebase will send a secure password reset link.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeResetForm}
                disabled={resetLoading}
                className="rounded-lg border border-zinc-800 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 transition-colors hover:border-[#B30000]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
                  Registered Email
                </label>
                <div className="flex rounded border border-zinc-900 bg-zinc-950 transition-all focus-within:border-[#B30000]">
                  <span className="flex items-center border-r border-zinc-900 bg-zinc-900/30 p-3 text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="password-reset-email"
                    type="email"
                    placeholder="player@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                    className="flex-1 min-w-0 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              {/* Inline feedback keeps the reset state visible even after toast notifications fade. */}
              {resetError ? (
                <div className="flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2.5 text-xs text-red-200">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6262]" />
                  <span>{resetError}</span>
                </div>
              ) : null}

              {resetSuccess ? (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-3 py-2.5 text-xs text-emerald-200">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{resetSuccess}</span>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={closeResetForm}
                  disabled={resetLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-[#B30000]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B30000] px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all hover:bg-[#D60000] disabled:cursor-not-allowed disabled:bg-zinc-800 sm:w-auto sm:min-w-[220px]"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
