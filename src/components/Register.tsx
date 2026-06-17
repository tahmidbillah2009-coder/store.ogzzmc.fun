import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Gamepad, Lock, UserPlus, Loader2, ShieldCheck, CheckSquare, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    // Validations
    if (!cleanEmail || !cleanUsername || !password || !confirmPassword) {
      toast.error("Please fill in all required setup fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters (Firebase default requirement).");
      return;
    }

    // Minecraft name standard regex validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!usernameRegex.test(cleanUsername)) {
      toast.error("Minecraft characters must contain 3-16 alphanumeric characters or underscores.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(cleanEmail, cleanUsername, password);
      toast.success("Successfully registered! Welcome, Player!");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Sign up failed:", err);
      toast.error(err.message || "Registration failed. Please review your logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-[#0A0A0A] py-10">
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-80 h-80 bg-[#B30000]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#B30000]/40 rounded-xl shadow-[0_0_50px_rgba(179,0,0,0.12)] p-8 space-y-6">
        
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#B30000]/10 border border-[#B30000]/30 rounded-full text-[#FF3E3E] mb-1 font-mono">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
            PLAYER <span className="text-[#B30000]">REGISTER</span>
          </h1>
          <p className="text-zinc-500 text-xs">
            Submit credentials to register your Minecraft store profile today.
          </p>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
              <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="register-email"
                type="email"
                placeholder="steve@minecraft.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
              Minecraft Username
            </label>
            <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
              <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                <Gamepad className="w-4 h-4" />
              </span>
              <input
                id="register-username"
                type="text"
                placeholder="Steve_IGN"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
                Password
              </label>
              <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
                <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
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

            <div className="space-y-1">
              <label className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider block">
                Confirm Code
              </label>
              <div className="flex bg-zinc-950 border border-zinc-900 focus-within:border-[#B30000] rounded transition-all">
                <span className="p-3 bg-zinc-900/30 text-zinc-500 border-r border-zinc-900 flex items-center">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white text-sm p-2.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="px-3 text-zinc-500 transition-colors hover:text-white"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-3 bg-zinc-950 border border-zinc-900 rounded space-y-1.5 text-[10px] text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5 text-green-500">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Username Requirements:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Length between 3 to 16 characters</li>
              <li>Only letters, numbers, and underscores</li>
              <li>Must EXACTLY match your in-game name</li>
            </ul>
          </div>

          {/* Trigger button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#B30000] hover:bg-[#D60000] disabled:bg-zinc-800 text-white font-bold font-mono text-xs uppercase tracking-wider rounded transition-all shadow-md shadow-red-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating Ledger...
              </>
            ) : (
              "Complete Register"
            )}
          </button>
        </form>

        {/* Existing Player fallback Link */}
        <div className="text-center text-xs pt-2">
          <span className="text-zinc-500">Already registered your character? </span>
          <Link to="/login" id="register-to-login-link" className="text-[#FF3E3E] hover:underline font-bold">Log In</Link>
        </div>

      </div>
    </div>
  );
}
