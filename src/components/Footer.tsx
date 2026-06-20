import { Gamepad2, Heart, HelpCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  
  // Custom display helper for Discord link representation
  const getDiscordDisplay = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname + parsed.pathname;
    } catch {
      return url.replace('https://', '').replace('http://', '');
    }
  };

  return (
    <footer className="bg-[#050505] border-t border-[#B30000]/20 pt-16 pb-8">
      <div className="max-w-none px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 flex items-center justify-center border border-[#B30000]/30 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(179,0,0,0.2)] ${settings?.logoUrl ? 'p-0 bg-transparent' : 'p-1.5 bg-[#B30000]/10'}`}>
                {settings?.logoUrl ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={settings.logoUrl}
                    alt="OGzz MC Store footer logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Gamepad2 className="h-5.5 w-5.5 text-[#B30000] drop-shadow-[0_0_8px_rgba(179,0,0,0.5)]" />
                )}
              </div>
              <span className="text-lg font-bold text-white tracking-widest uppercase">
                OGZZ <span className="text-[#B30000]">MC</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium Minecraft server marketplace. Enhance your adventure with elite ranks and virtual gold coin hoards. Fast support tickets in our community.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider mb-4 border-l-2 border-[#B30000] pl-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/ranks" className="text-gray-400 hover:text-white transition-colors">VIP Ranks Store</Link>
              </li>
              <li>
                <Link to="/coins" className="text-gray-400 hover:text-white transition-colors">Virtual Coins</Link>
              </li>
              <li>
                <Link to="/order-tracker" className="text-gray-400 hover:text-white transition-colors">Track Order ID</Link>
              </li>
            </ul>
          </div>

          {/* Trust Panel */}
          <div>
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider mb-4 border-l-2 border-[#B30000] pl-2">
              Payment & Trust
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#B30000]" />
                <span>Secure Ticket Exchange</span>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#B30000]" />
                <span>24/7 Discord Support</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#B30000]" />
                <span>Player-First Economy</span>
              </li>
            </ul>
          </div>

          {/* Social Discord Section */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider border-l-2 border-[#B30000] pl-2">
              Join Our Discord
            </h4>
            <p className="text-gray-400 text-sm">
              Join our active community hub to confirm orders and receive your packages.
            </p>
            <a
              id="footer-discord-btn"
              href={settings.discordLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium rounded-md transition-all shadow-md font-mono"
            >
              {getDiscordDisplay(settings.discordLink)}
            </a>
          </div>
        </div>

        {/* EULA Compliance warning and Copyright */}
        <div className="pt-8 border-t border-zinc-900 text-center space-y-4">
          <p className="text-zinc-600 text-xs leading-relaxed max-w-3xl mx-auto">
            Disclaimer: OGzz MC is not affiliate with Mojang Studios or Microsoft Corporation. Minecraft is a trademark of Mojang Synergies AB. All purchases directly fund the server maintenance, upgrades, and hosting costs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-xs">
            <p>© 2026 OGzz MC Store. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <span className="text-zinc-800">|</span>
              <span className="cursor-default">Privacy Policy</span>
            </div>
          </div>
          <div className="pt-3 text-center">
            <p className="text-zinc-600 text-[11px]">Built by <span className="text-[#B30000] font-mono font-bold">Void_AXE_</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
