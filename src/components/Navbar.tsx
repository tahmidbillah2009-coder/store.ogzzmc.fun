import { useState } from 'react';
import { Menu, X, Gamepad2, ShieldCheck, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { normalizePathname } from '../site/seo';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = normalizePathname(location.pathname);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
      navigate('/');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Ranks", path: "/ranks" },
    { name: "Coins", path: "/coins" },
    { name: "Bundles", path: "/bundles" },
    { name: "Order Tracker", path: "/order-tracker" },
  ];

  const isActive = (path: string) => normalizePathname(path) === currentPath;

  return (
    <nav
      className="relative z-50 transition-colors duration-300"
      style={{
        background: 'rgba(0,0,0,0.12)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        boxShadow: '0 6px 30px rgba(179,0,0,0.06), inset 0 -1px 0 rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(179,0,0,0.08)',
        borderRadius: '0 0 12px 12px'
      }}
    >
      <div className="max-w-none px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link id="nav-logo" to="/" className="flex items-center gap-4 group">
              <div className={`w-12 h-12 flex items-center justify-center border border-[#B30000]/50 rounded-xl transition-all shadow-[0_0_15px_rgba(179,0,0,0.3)] overflow-hidden ${settings?.logoUrl ? 'p-0 bg-transparent' : 'p-2.5 bg-[#B30000]/10 group-hover:bg-[#B30000]/20'}`}>
                {settings?.logoUrl ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={settings.logoUrl}
                    alt="OGzz MC Store logo"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback if URL fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Gamepad2 className="h-6 w-6 text-[#B30000] group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-wider uppercase font-sans">
                  OG<span className="text-[#B30000] drop-shadow-[0_0_11px_rgba(179,0,0,0.65)]">zz</span>
                </span>
                <span className="block text-xs text-gray-400 font-mono tracking-widest uppercase">
                  MC Store
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                id={`nav-${link.name.toLowerCase().replace(' ', '-')}`}
                to={link.path}
                className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-white bg-[#B30000]/20 border border-[#B30000]/40 shadow-[0_0_8px_rgba(179,0,0,0.2)]'
                    : 'text-gray-300 hover:text-white hover:bg-[#B30000]/10 border border-transparent'
                }`}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* User Session / CTA - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && (
              <Link
                id="nav-admin"
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-mono transition-all uppercase font-bold"
              >
                <ShieldCheck className="w-4 h-4" />
                Staff Panel
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3.5">
                <Link
                  id="nav-user-dashboard"
                  to="/dashboard"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold border transition-all ${
                    isActive('/dashboard')
                      ? 'border-[#B30000] text-white bg-[#B30000]/10'
                      : 'border-[#B30000]/30 text-gray-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <User className="h-5 w-5 text-[#B30000]" />
                  <span className="font-mono text-white font-bold">{profile?.minecraftUsername || 'Player'}</span>
                </Link>
                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  className="p-2.5 text-gray-400 hover:text-[#B30000] hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-5.5 w-5.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  id="nav-login"
                  to="/login"
                  className="flex items-center gap-1.5 px-5 py-2.5 text-base font-bold text-gray-300 hover:text-white bg-transparent transition-all"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>
                <Link
                  id="nav-register"
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2.5 text-base font-bold text-white bg-[#B30000] hover:bg-[#D60000] rounded-lg transition-all shadow-[0_0_15px_rgba(179,0,0,0.4)] hover:shadow-[0_0_20px_rgba(214,0,0,0.6)] border border-[#B30000]"
                >
                  <UserPlus className="h-5 w-5" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle - Mobile */}
          <div className="flex md:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#B30000]/20 border border-[#B30000]/30"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div
          className="md:hidden px-4 pt-2 pb-6 space-y-3 shadow-xl"
          style={{
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            borderTop: '1px solid rgba(179,0,0,0.06)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.6), 0 6px 30px rgba(179,0,0,0.04)'
          }}
        >
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'text-white bg-[#B30000]/20 border-l-4 border-[#B30000]'
                    : 'text-gray-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-2">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-yellow-600/10 text-yellow-400 border border-yellow-500/20 rounded-md text-sm font-mono uppercase"
              >
                <ShieldCheck className="w-4 h-4" />
                Staff Panel
              </Link>
            )}

            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-900 border border-[#B30000]/30 rounded-md text-white text-sm"
                >
                  <User className="h-4 w-4 text-[#B30000]" />
                  <span>{profile?.minecraftUsername || 'My Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#B30000]/20 hover:bg-[#B30000]/30 border border-[#B30000]/40 rounded-md text-[#FF3E3E] text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1 py-2.5 bg-zinc-900 text-gray-300 hover:text-white border border-zinc-800 rounded-md text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1 py-2.5 bg-[#B30000] text-white rounded-md text-sm font-medium shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
