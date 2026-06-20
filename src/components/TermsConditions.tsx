import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { ShieldCheck, ArrowLeft, FileText, Scale } from 'lucide-react';

export default function TermsConditions() {
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const rawTerms = settings?.termsAndConditions || '';

  // Simple, powerful custom renderer to parse custom markdown headlines and bullet points beautifully
  const renderTermsContent = (text: string) => {
    if (!text) {
      return (
        <p className="text-zinc-400 text-sm leading-relaxed text-center py-6">
          No terms and conditions have been configured yet.
        </p>
      );
    }

    const blocks = text.split('\n\n');
    return blocks.map((block, index) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;

      // Header 3 checks (### Heading)
      if (trimmedBlock.startsWith('###')) {
        const headerText = trimmedBlock.replace(/^###\s*/, '').replace(/\*+/g, '').trim();
        return (
          <h3 
            key={index} 
            className="text-lg font-bold text-white tracking-wide uppercase border-b border-zinc-900 pb-2 mt-8 mb-4 font-sans flex items-center gap-2"
          >
            <span className="w-1.5 h-4 bg-[#B30000] rounded"></span>
            {headerText}
          </h3>
        );
      }

      // Header 2 checks (## Heading)
      if (trimmedBlock.startsWith('##')) {
        const headerText = trimmedBlock.replace(/^##\s*/, '').replace(/\*+/g, '').trim();
        return (
          <h2 
            key={index} 
            className="text-xl font-black text-[#FF3E3E] tracking-wider uppercase mt-8 mb-4 font-sans"
          >
            {headerText}
          </h2>
        );
      }

      // Bullet points checks
      if (trimmedBlock.startsWith('*') || trimmedBlock.startsWith('-') || /^\d+\./.test(trimmedBlock)) {
        const lines = trimmedBlock.split('\n');
        return (
          <ul key={index} className="space-y-2.5 my-4 pl-4 list-none border-l border-zinc-800">
            {lines.map((line, idx) => {
              const cleanLine = line.replace(/^[\*\-\d\.\s]+/, '').trim();
              return (
                <li key={idx} className="text-zinc-300 text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-[#B30000] font-bold mt-0.5">•</span>
                  <span>{cleanLine}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Default paragraph (with custom inline **bold** checks)
      const renderInlineFormatting = (paraText: string) => {
        const parts = paraText.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="text-white font-bold">{part}</strong>;
          }
          return <span key={pIdx}>{part}</span>;
        });
      };

      return (
        <p key={index} className="text-zinc-400 text-sm leading-relaxed my-4 font-sans">
          {renderInlineFormatting(trimmedBlock)}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 bg-[#0A0A0A]">
      
      {/* Decorative Top breadcrumb links */}
      <div className="flex items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#B30000]" />
          Back to storefront
        </Link>
      </div>

      {/* Main visual header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF3E3E]">
            <Scale className="w-5 h-5 text-[#B30000]" />
            <span className="text-xs font-mono uppercase tracking-widest font-bold">OGZZ MC STORE LEGAL REFERENCE</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase">
            TERMS & <span className="text-[#B30000] drop-shadow-[0_0_15px_rgba(179,0,0,0.5)]">CONDITIONS</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-lg">
            Review our official billing rules, general acceptance guidelines, delivery information, and refund terms.
          </p>
        </div>

        <div className="bg-[#0C0C0C] border border-zinc-900 rounded-xl p-4 flex items-center gap-3.5 max-w-xs">
          <ShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div>
            <span className="block text-xs font-mono font-bold text-white uppercase tracking-wider">EULA Compliant</span>
            <p className="text-[10px] text-zinc-500">
              Verified server billing guidelines to fund hosting maintenance.
            </p>
          </div>
        </div>
      </div>

      {/* Document Body card */}
      <div className="bg-[#0C0C0C]/90 border border-zinc-900/80 rounded-2xl p-6 sm:p-10 shadow-xl space-y-4 relative overflow-hidden">
        
        {/* Subtle top red glow decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#B30000]/60"></div>
        
        <div className="flex items-center gap-2 pb-2">
          <FileText className="w-5 h-5 text-[#B30000]" />
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Official Store Agreement</span>
        </div>

        <div className="text-zinc-300 antialiased space-y-2 select-text selection:bg-[#B30000]/30 selection:text-white">
          {renderTermsContent(rawTerms)}
        </div>

        <div className="pt-8 border-t border-zinc-900 text-center text-xs text-zinc-650 flex flex-col items-center justify-center space-y-4">
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            By executing any transaction, booking orders on this storefront, or generating support verification codes, you confirm absolute consent to all points written above.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B30000] animate-pulse"></span>
            <span className="font-mono text-zinc-400 font-bold uppercase tracking-widest">Active Storefront Policy</span>
          </div>
        </div>

      </div>

    </div>
  );
}
