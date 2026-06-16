import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans antracite-scrollbar relative overflow-hidden">
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
        {children}
      </main>

      <Footer />
    </div>
  );
}
