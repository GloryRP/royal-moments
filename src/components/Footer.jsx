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
        {/* Monogram Seal inside Heart */}
        <div className="relative w-14 h-14 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 40 40" className="w-14 h-14 drop-shadow-md" fill="none">
            <path
              d="M20 34.5 C20 34.5 4.5 23.5 4.5 13 C4.5 7.5 9 4 14.5 4 C17.8 4 20 6.2 20 6.2 C20 6.2 22.2 4 25.5 4 C31 4 35.5 7.5 35.5 13 C35.5 23.5 20 34.5 20 34.5 Z"
              fill="rgba(46, 35, 29, 0.85)"
              stroke="#D4AF47"
              strokeWidth="1.8"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-gold-300 font-cinzel font-bold text-xs tracking-tight select-none">
            P &amp; S
          </span>
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
