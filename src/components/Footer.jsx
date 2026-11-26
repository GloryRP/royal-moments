import React from 'react';
import { Heart, ArrowUp, Sparkles } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-royal-espresso text-royal-ivory pt-16 pb-12 overflow-hidden border-t border-gold-900/60">
      {/* Background Subtle Ambient Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Monogram Seal */}
        <div className="w-14 h-14 rounded-full border border-gold-500/50 bg-royal-espresso/80 flex items-center justify-center text-gold-400 font-cinzel text-sm tracking-widest mx-auto mb-6 shadow-royal">
          {siteConfig.couple.monogram}
        </div>

        {/* Couple's Names */}
        <h3 className="font-serif text-3xl sm:text-4xl text-gold-200 tracking-wide mb-2">
          {siteConfig.couple.fullName}
        </h3>

        {/* Date */}
        <p className="font-sans text-xs sm:text-sm text-gold-300/70 mb-6">
          {siteConfig.couple.engagementDate}
        </p>

        {/* Divider with Gold Diamond */}
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto mb-6">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gold-500/50" />
          <div className="w-2 h-2 rotate-45 border border-gold-400 bg-gold-500/30" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gold-500/50" />
        </div>

        {/* Romantic Quote */}
        <p className="font-script text-2xl sm:text-3xl text-gold-300 mb-8">
          "{siteConfig.footer.quote}"
        </p>

        {/* Back to Top Button */}
        <div className="mb-10">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold-500/40 bg-white/5 hover:bg-gold-500/20 text-gold-300 hover:text-gold-200 text-xs font-sans uppercase tracking-widest transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Back to Top
          </button>
        </div>

        {/* Copyright notice */}
        <p className="font-sans text-[11px] text-white/40">
          {siteConfig.footer.copyrightNotice}
        </p>
      </div>
    </footer>
  );
}
