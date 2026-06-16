import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import HomeView from './components/HomeView';
import Ranks from './components/Ranks';
import Coins from './components/Coins';
import Bundles from './components/Bundles';
import OrderTracker from './components/OrderTracker';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import TermsConditions from './components/TermsConditions';
import Seo from './components/Seo';
import SiteLayout from './components/SiteLayout';
import { getSeoForPath, normalizePathname } from './site/seo';
import { ShieldQuestion, Home } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AppShell />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

function AppShell() {
  return (
    <SiteLayout>
      <RouteSeo />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/ranks" element={<Ranks />} />
        <Route path="/coins" element={<Coins />} />
        <Route path="/bundles" element={<Bundles />} />
        <Route path="/order-tracker" element={<OrderTracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/terms" element={<TermsConditions />} />

        {/* Supporting all Admin Tabs routes natively inside our responsive Console layout */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminDashboard />} />
        <Route path="/admin/ranks" element={<AdminDashboard />} />
        <Route path="/admin/coins" element={<AdminDashboard />} />

        {/* 404 fallback page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SiteLayout>
  );
}

function RouteSeo() {
  const location = useLocation();
  const normalizedPath = normalizePathname(location.pathname);
  const seo = getSeoForPath(normalizedPath);

  return (
    <Seo
      title={seo.title}
      description={seo.description}
      path={normalizedPath}
      keywords={seo.keywords}
      type={seo.type}
      noIndex={seo.noIndex}
    />
  );
}

// Visual 404 Page Component
function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 bg-[#B30000]/10 border border-[#B30000]/40 rounded-full text-[#FF3E3E] select-none scale-105">
        <ShieldQuestion className="w-12 h-12" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold font-mono tracking-wider uppercase text-white">404 - REALM NOT FOUND</h1>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          You've wandered off the biome! The folder path on OGzz MC doesn't exist.
        </p>
      </div>
      <a
        href="/"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#B30000] hover:bg-[#D60000] text-white text-xs font-mono font-bold rounded uppercase transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        Return to Spawn
      </a>
    </div>
  );
}
