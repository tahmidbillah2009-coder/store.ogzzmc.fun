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
        <div className="absolute top-[-8%] left-[-10%] w-[42vw] h-[42vw] bg-[#B30000]/5 rounded-full blur-[90px] opacity-80 ambient-pulse-red" />
        <div
          className="absolute bottom-[10%] right-[-8%] hidden md:block w-[46vw] h-[46vw] bg-[#B30000]/4 rounded-full blur-[110px] opacity-70 ambient-pulse-red"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-[35%] left-[25%] hidden lg:block w-[30vw] h-[30vw] bg-yellow-600/3 rounded-full blur-[90px] opacity-60 ambient-pulse-gold" />
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
