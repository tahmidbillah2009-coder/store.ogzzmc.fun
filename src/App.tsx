import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans antracite-scrollbar relative overflow-hidden">
      <RouteSeo />

      {/* Absolute Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-[#B30000]/5 rounded-full filter blur-[120px] mix-blend-screen ambient-pulse-red" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60vw] h-[60vw] bg-[#B30000]/4 rounded-full filter blur-[140px] mix-blend-screen ambient-pulse-red" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[35%] left-[25%] w-[40vw] h-[40vw] bg-yellow-600/3 rounded-full filter blur-[110px] mix-blend-screen ambient-pulse-gold" />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F0F0F',
            color: '#FFF',
            border: '1px solid #B30000',
            fontFamily: 'monospace',
            fontSize: '13px',
          },
        }}
      />

      <Navbar />

      <main className="flex-grow">
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
      </main>

      <Footer />
    </div>
  );
}

function RouteSeo() {
  const location = useLocation();
  useSettings();

  const routes: Record<string, { title: string; description: string; keywords?: string[]; type?: 'website' | 'article'; noIndex?: boolean }> = {
    '/': {
      title: 'OGzz MC - Minecraft Server Store',
      description: 'Official OGzz MC Store. Purchase ranks, coins and bundles for the best Minecraft experience.',
      keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Ranks', 'Minecraft Coins', 'Minecraft Bundles'],
    },
    '/ranks': {
      title: 'Minecraft Ranks - OGzz MC Store',
      description: 'Purchase premium Minecraft ranks on OGzz MC and unlock exclusive perks.',
      keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Ranks'],
    },
    '/coins': {
      title: 'Buy Coins - OGzz MC Store',
      description: 'Purchase OGzz MC coins and use them for exclusive in-game rewards.',
      keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Coins'],
    },
    '/bundles': {
      title: 'Minecraft Bundles - OGzz MC Store',
      description: 'Get the best value with OGzz MC bundles and exclusive packages.',
      keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Minecraft Bundles', 'Minecraft Ranks', 'Minecraft Coins'],
    },
    '/order-tracker': {
      title: 'Order Tracker - OGzz MC Store',
      description: 'Track your OGzz MC store purchases and order status.',
      keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store', 'Order Tracker'],
    },
    '/login': {
      title: 'Player Login | OGzz MC Store',
      description: 'Sign in to your OGzz MC account to manage Minecraft Store purchases, order history, and support steps for our Minecraft Server.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
      noIndex: true,
    },
    '/register': {
      title: 'Player Register | OGzz MC Store',
      description: 'Create your OGzz MC account to purchase Minecraft Ranks, coins, and bundle offers for our Minecraft Survival Server and Minecraft SMP.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Ranks', 'Minecraft Coins', 'Minecraft Bundles'],
      noIndex: true,
    },
    '/dashboard': {
      title: 'Player Dashboard | OGzz MC Store',
      description: 'Review your OGzz MC orders, track store activity, and manage Minecraft Store purchases from your personal player dashboard.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
      noIndex: true,
    },
    '/terms': {
      title: 'Terms and Conditions | OGzz MC Store',
      description: 'Read the OGzz MC Store terms and conditions covering billing, delivery, support, and purchase rules for our Minecraft Server.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
      type: 'article',
    },
    '/admin': {
      title: 'Admin Dashboard | OGzz MC Store',
      description: 'Manage OGzz MC Minecraft Store orders, products, settings, and staff tools from the secure admin dashboard.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Server'],
      noIndex: true,
    },
    '/admin/orders': {
      title: 'Admin Orders | OGzz MC Store',
      description: 'Review and manage OGzz MC Minecraft Store orders from the admin orders console.',
      keywords: ['OGzz MC', 'Minecraft Store'],
      noIndex: true,
    },
    '/admin/ranks': {
      title: 'Admin Ranks | OGzz MC Store',
      description: 'Manage OGzz MC Minecraft Ranks and store listings from the admin ranks console.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Ranks'],
      noIndex: true,
    },
    '/admin/coins': {
      title: 'Admin Coins | OGzz MC Store',
      description: 'Manage OGzz MC coin packs and Minecraft Store currency products from the admin coins console.',
      keywords: ['OGzz MC', 'Minecraft Store', 'Minecraft Coins'],
      noIndex: true,
    },
  };

  const seo = routes[location.pathname] ?? {
    title: 'Page Not Found | OGzz MC Store',
    description: 'The requested OGzz MC page could not be found. Return to the Minecraft Store homepage to browse ranks, coins, and bundles.',
    keywords: ['OGzz MC', 'Minecraft Server', 'Minecraft Store'],
    noIndex: true,
  };

  return (
    <Seo
      title={seo.title}
      description={seo.description}
      path={location.pathname}
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
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#B30000] hover:bg-[#D60000] text-white text-xs font-mono font-bold rounded uppercase transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        Return to Spawn
      </Link>
    </div>
  );
}
