import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Camera, Sparkles, RotateCcw } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

/* ══════════════════════════════════════════════════════════════════════════════
   REALISTIC 3D FLUTTERING BUTTERFLY COMPONENT
   Features 3D perspective wing-flapping and delicate botanical venation
   ══════════════════════════════════════════════════════════════════════════════ */
export function FlyingButterfly({ style = {}, className = '', scale = 1 }) {
  return (
    <div
      className={`relative inline-block pointer-events-none select-none ${className}`}
      style={{
        perspective: '600px',
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Left Wing with 3D Flap */}
        <motion.div
          style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d' }}
          animate={{
            rotateY: [0, 68, 8, 72, 0],
            rotateZ: [0, -4, 0, -3, 0]
          }}
          transition={{
            duration: 0.38,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative"
        >
          <svg width={42 * scale} height={56 * scale} viewBox="0 0 60 80" fill="none">
            {/* Forewing */}
            <path
              d="M60 44 C55 30, 36 10, 18 12 C4 14, 2 28, 10 38 C18 48, 38 50, 60 44 Z"
              fill="url(#wingGradientLeft)"
              stroke="#6b7f63"
              strokeWidth="0.8"
            />
            {/* Hindwing */}
            <path
              d="M60 44 C52 50, 28 66, 22 60 C16 54, 24 40, 38 40 C48 40, 56 42, 60 44 Z"
              fill="url(#hindGradientLeft)"
              stroke="#6b7f63"
              strokeWidth="0.7"
            />
            {/* Delicate wing veins */}
            <path d="M60 44 C50 36, 34 22, 22 20" stroke="#5d7256" strokeWidth="0.6" opacity="0.45" fill="none" />
            <path d="M60 44 C48 40, 30 32, 16 30" stroke="#5d7256" strokeWidth="0.5" opacity="0.4" fill="none" />
            <path d="M60 44 C52 52, 38 58, 28 54" stroke="#5d7256" strokeWidth="0.5" opacity="0.4" fill="none" />
            {/* Gold dust border sparkles */}
            <path d="M18 12 C10 14, 4 22, 6 30" stroke="#C5A059" strokeWidth="1" opacity="0.5" fill="none" />
            <circle cx="20" cy="22" r="2" fill="#D4AF47" opacity="0.4" />
            <circle cx="28" cy="52" r="1.8" fill="#D4AF47" opacity="0.35" />
          </svg>
        </motion.div>

        {/* Central Slender Body */}
        <div className="relative z-10 -mx-[2px] flex flex-col items-center">
          {/* Antennae */}
          <div className="flex justify-between w-3.5 -mb-1">
            <span className="w-1.5 h-2.5 border-l border-t border-[#4a5944] rounded-tl-full block -rotate-12" />
            <span className="w-1.5 h-2.5 border-r border-t border-[#4a5944] rounded-tr-full block rotate-12" />
          </div>
          {/* Head & Thorax */}
          <div className="w-1 h-1.5 rounded-full bg-[#3c4a37]" />
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#4a5944] via-[#3c4a37] to-[#2e3a2b]" />
        </div>

        {/* Right Wing with 3D Flap */}
        <motion.div
          style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
          animate={{
            rotateY: [0, -68, -8, -72, 0],
            rotateZ: [0, 4, 0, 3, 0]
          }}
          transition={{
            duration: 0.38,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative"
        >
          <svg width={42 * scale} height={56 * scale} viewBox="0 0 60 80" fill="none">
            {/* Forewing */}
            <path
              d="M0 44 C5 30, 24 10, 42 12 C56 14, 58 28, 50 38 C42 48, 22 50, 0 44 Z"
              fill="url(#wingGradientRight)"
              stroke="#6b7f63"
              strokeWidth="0.8"
            />
            {/* Hindwing */}
            <path
              d="M0 44 C8 50, 32 66, 38 60 C44 54, 36 40, 22 40 C12 40, 4 42, 0 44 Z"
              fill="url(#hindGradientRight)"
              stroke="#6b7f63"
              strokeWidth="0.7"
            />
            {/* Delicate wing veins */}
            <path d="M0 44 C10 36, 26 22, 38 20" stroke="#5d7256" strokeWidth="0.6" opacity="0.45" fill="none" />
            <path d="M0 44 C12 40, 30 32, 44 30" stroke="#5d7256" strokeWidth="0.5" opacity="0.4" fill="none" />
            <path d="M0 44 C8 52, 22 58, 32 54" stroke="#5d7256" strokeWidth="0.5" opacity="0.4" fill="none" />
            {/* Gold dust border sparkles */}
            <path d="M42 12 C50 14, 56 22, 54 30" stroke="#C5A059" strokeWidth="1" opacity="0.5" fill="none" />
            <circle cx="40" cy="22" r="2" fill="#D4AF47" opacity="0.4" />
            <circle cx="32" cy="52" r="1.8" fill="#D4AF47" opacity="0.35" />
          </svg>
        </motion.div>
      </div>

      {/* Embedded Linear Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="wingGradientLeft" x1="60" y1="44" x2="10" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DFE7DA" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#C2D3BC" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#8DA384" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="hindGradientLeft" x1="60" y1="44" x2="20" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D5E0CF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9AB091" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="wingGradientRight" x1="0" y1="44" x2="50" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DFE7DA" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#C2D3BC" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#8DA384" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="hindGradientRight" x1="0" y1="44" x2="40" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D5E0CF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9AB091" stopOpacity="0.92" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HERO SECTION — DIRECT ENVELOPE OPENING (NO SIDEWAYS DRIFT OR DELAY)
   ══════════════════════════════════════════════════════════════════════════════ */
export function Hero({ isOpen: controlledIsOpen, onOpen, onClose }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Directly open immediately on click - no delay, perfectly centered
  const handleOpenEnvelope = () => {
    if (onOpen) {
      onOpen();
    } else {
      setInternalIsOpen(true);
    }
  };

  const handleReclose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className={`relative flex items-center justify-center transition-all duration-500 ${
        !isOpen
          ? 'min-h-[100dvh] h-[100dvh] w-full overflow-hidden py-4 px-3'
          : 'min-h-[calc(100vh-64px)] pt-14 pb-8 sm:pt-16 sm:pb-12'
      }`}
    >
      {/* Luxurious Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FBF8F2] via-[#F6EFE5] to-[#FBF8F2] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* ──────────────────────────────────────────────────────────────────────────
          STATE 1: COMPACT CLOSED ROYAL ENVELOPE (Fills mobile screen perfectly)
          ────────────────────────────────────────────────────────────────────────── */}
      {!isOpen ? (
        <motion.div
          key="sealed-envelope-view"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="relative z-20 w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] mx-auto px-2 xs:px-4 text-center flex flex-col items-center justify-center my-auto"
        >
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold-300/70 bg-white/80 backdrop-blur-md mb-2 shadow-sm">
            <Sparkles className="w-3 h-3 text-gold-600" />
            <span className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.22em] text-gold-900 font-semibold">
              Wedding Invitation
            </span>
            <Sparkles className="w-3 h-3 text-gold-600" />
          </div>

          {/* Couple Names */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-royal-espresso mb-1 tracking-tight">
            Prabhudas &amp; Somya
          </h2>

          <p className="font-cinzel text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-gold-800/80 mb-3">
            Engagement Ceremony • November 22
          </p>

          {/* Clickable Envelope Container - Fits Mobile Screen Magnificently */}
          <div
            onClick={handleOpenEnvelope}
            className="group relative cursor-pointer mx-auto w-full max-w-[290px] xs:max-w-[330px] sm:max-w-[380px] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            title="Click to open invitation directly"
          >
            {/* Subtle Gold Ambient Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-gold-300/30 via-gold-400/40 to-gold-300/30 rounded-2xl blur-md group-hover:blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300" />

            {/* Envelope Image */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gold-300/70 bg-[#8B9E82]">
              <img
                src="/envelope-closed.jpg"
                alt="Royal Engagement Invitation Envelope"
                className="w-full h-auto max-h-[48vh] sm:max-h-[52vh] object-cover transform transition-transform duration-500 group-hover:scale-105"
              />

              {/* Shimmering pulse over the wax seal */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gold-300 animate-ping opacity-40" />
              </div>
            </div>

            {/* "Tap to Open" Callout Button */}
            <div className="mt-3.5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-500 via-gold-600 to-gold-500 text-white text-xs font-sans font-semibold uppercase tracking-[0.2em] shadow-royal hover:shadow-royal-lg transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tap to Open</span>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────
            STATE 2: REVEALED INVITATION CARD (Centered, Direct, No Sideways Jump)
            ────────────────────────────────────────────────────────────────────────── */
        <motion.div
          key="revealed-hero-content"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative z-20 max-w-2xl w-full mx-auto px-4 text-center my-auto"
        >
          {/* Inner Letter Card Presentation */}
          <div className="relative rounded-2xl p-4 sm:p-6 bg-royal-card border border-gold-300/70 shadow-royal-lg">
            {/* Inner Ornamental Border */}
            <div className="absolute inset-2 sm:inset-3 border border-gold-300/30 rounded-xl pointer-events-none" />

            {/* Top View Envelope Action */}
            <div className="flex justify-end mb-1">
              <button
                onClick={handleReclose}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 hover:bg-gold-50 border border-gold-300/50 text-gold-900 text-[10px] font-sans tracking-wide shadow-sm transition-all"
                title="Close and view envelope"
              >
                <RotateCcw className="w-2.5 h-2.5 text-gold-600" />
                <span>Envelope</span>
              </button>
            </div>

            {/* Fluttering Butterfly - Ascending straight up from center */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center -mt-2 mb-1"
            >
              <FlyingButterfly scale={0.78} />
            </motion.div>

            {/* Heading: Engagement Ceremony */}
            <p className="font-cinzel text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold-800 font-semibold mb-1">
              {siteConfig.hero.heading}
            </p>

            {/* Couple's Names in Flowing Calligraphy */}
            <div className="mb-1">
              <h1 className="font-pinyon text-4xl sm:text-5xl md:text-6xl text-royal-espresso font-normal leading-[0.95] tracking-tight">
                {siteConfig.couple.partnerOne}
              </h1>
              <div className="font-pinyon text-2xl sm:text-3xl text-gold-600/80 my-0.5">&amp;</div>
              <h1 className="font-pinyon text-4xl sm:text-5xl md:text-6xl text-royal-espresso font-normal leading-[0.95] tracking-tight">
                {siteConfig.couple.partnerTwo}
              </h1>
            </div>

            {/* Delicate Gold Divider */}
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto my-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gold-400" />
              <div className="w-1.5 h-1.5 rotate-45 border border-gold-500 bg-gold-400/40" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gold-400" />
            </div>

            {/* Date */}
            <p className="font-cinzel text-[10px] sm:text-xs tracking-[0.2em] uppercase text-royal-espresso/70 mb-3">
              {siteConfig.couple.engagementDate}
            </p>

            {/* Editorial Frame Cover Image - Completely Visible Hands & Garland */}
            <div className="relative max-w-[250px] sm:max-w-[280px] mx-auto rounded-xl p-1 bg-gradient-to-b from-gold-300/50 via-gold-100/30 to-gold-300/50 shadow-md mb-3.5 group">
              <div className="relative overflow-hidden rounded-lg bg-royal-cream/60 flex items-center justify-center">
                <img
                  src={siteConfig.hero.coverImage}
                  alt={siteConfig.hero.coverImageAlt}
                  className="w-full h-auto max-h-[22vh] sm:max-h-[25vh] object-contain mx-auto rounded-lg"
                  loading="eager"
                />
              </div>
            </div>

            {/* Fully Visible Action Buttons */}
            <div className="flex flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-1">
              <button
                onClick={() => scrollTo('gallery')}
                className="flex-1 px-5 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-royal hover:shadow-royal-lg transition-all"
              >
                {siteConfig.hero.primaryCta}
              </button>
              <button
                onClick={() => scrollTo('upload')}
                className="flex-1 px-5 py-2.5 rounded-full bg-royal-cream hover:bg-gold-50 text-gold-900 border border-gold-400 font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-gold-700" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-3">
            <button
              onClick={() => scrollTo('gallery')}
              className="inline-flex flex-col items-center gap-0.5 text-royal-espresso/60 hover:text-gold-700 transition-colors"
              aria-label="Scroll to Gallery"
            >
              <span className="font-cinzel text-[9px] uppercase tracking-widest">Explore Memories</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
