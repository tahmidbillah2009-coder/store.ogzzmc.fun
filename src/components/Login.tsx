import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { KeyRound, Mail, Loader2, Gamepad2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

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
            <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
              Password
            </label>
            <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
              <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
              />
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

        {/* Console activation helper for Email config enablement */}
        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded text-[10.5px] text-zinc-400 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-[#FF3E3E] font-mono uppercase text-[9px] tracking-wider font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Firebase Notice:</span>
          </div>
          <p>Please ensure that <strong>Email/Password Auth provider</strong> is toggled active inside your Firebase console settings under Authentication &gt; Sign-In Method tab!</p>
        </div>

        {/* Navigation fallback Link */}
        <div className="text-center text-xs">
          <span className="text-zinc-500">New player on OGzz MC? </span>
          <Link to="/register" id="login-to-register-link" className="text-[#FF3E3E] hover:underline font-bold">Create Profile</Link>
        </div>

      </div>
    </div>
  );
}
