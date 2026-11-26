import React, { useState, useEffect } from 'react';
import { Heart, Upload, Download, Menu, X, Sparkles, Camera } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export function Navbar({ favouriteCount, onOpenDownload, onNavigateFilter }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavFavourites = () => {
    setMobileMenuOpen(false);
    if (onNavigateFilter) {
      onNavigateFilter('favourites');
    }
    const element = document.getElementById('gallery');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'royal-glass shadow-royal border-b border-gold-200/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Monogram */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 text-left group"
          >
            <div className="w-10 h-10 rounded-full border border-gold-400/60 bg-royal-cream flex items-center justify-center text-gold-700 font-cinzel font-bold text-xs tracking-widest shadow-sm group-hover:scale-105 transition-transform">
              {siteConfig.couple.monogram}
            </div>
            <div>
              <span className="font-cinzel text-base sm:text-lg font-semibold tracking-wider text-royal-espresso block leading-tight">
                ROYAL MOMENTS
              </span>
              <span className="font-serif italic text-xs text-gold-600 block">
                {siteConfig.couple.fullName}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollTo('hero')}
              className="font-sans text-sm tracking-wide text-royal-espresso/80 hover:text-gold-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                if (onNavigateFilter) onNavigateFilter('all');
                scrollTo('gallery');
              }}
              className="font-sans text-sm tracking-wide text-royal-espresso/80 hover:text-gold-700 transition-colors"
            >
              Memories
            </button>
            <button
              onClick={() => scrollTo('upload')}
              className="font-sans text-sm tracking-wide text-royal-espresso/80 hover:text-gold-700 transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-gold-600" />
              Upload
            </button>
            <button
              onClick={handleNavFavourites}
              className="font-sans text-sm tracking-wide text-royal-espresso/80 hover:text-gold-700 transition-colors flex items-center gap-1.5 relative"
            >
              <Heart className={`w-4 h-4 ${favouriteCount > 0 ? 'fill-gold-500 text-gold-600' : 'text-gold-600'}`} />
              Favourites
              {favouriteCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-gold-500 text-white text-[10px] font-semibold rounded-full">
                  {favouriteCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: Download Album Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onOpenDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-400 bg-gold-50 text-gold-900 text-xs font-semibold tracking-wider uppercase hover:bg-gold-500 hover:text-white hover:border-gold-500 shadow-sm transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              Download Album
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={handleNavFavourites}
              className="p-2 text-royal-espresso/80 hover:text-gold-700 relative"
              aria-label="View Favourites"
            >
              <Heart className={`w-5 h-5 ${favouriteCount > 0 ? 'fill-gold-500 text-gold-600' : 'text-gold-600'}`} />
              {favouriteCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-gold-500 text-white text-[9px] font-semibold rounded-full">
                  {favouriteCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-royal-espresso focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gold-700" /> : <Menu className="w-6 h-6 text-royal-espresso" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden royal-glass border-b border-gold-200 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <button
            onClick={() => scrollTo('hero')}
            className="block w-full text-left font-serif text-lg text-royal-espresso hover:text-gold-700 py-1"
          >
            Home
          </button>
          <button
            onClick={() => {
              if (onNavigateFilter) onNavigateFilter('all');
              scrollTo('gallery');
            }}
            className="block w-full text-left font-serif text-lg text-royal-espresso hover:text-gold-700 py-1"
          >
            Our Memories
          </button>
          <button
            onClick={() => scrollTo('upload')}
            className="flex items-center gap-2 w-full text-left font-serif text-lg text-royal-espresso hover:text-gold-700 py-1"
          >
            <Upload className="w-4 h-4 text-gold-600" />
            Upload Memories
          </button>
          <button
            onClick={handleNavFavourites}
            className="flex items-center justify-between w-full text-left font-serif text-lg text-royal-espresso hover:text-gold-700 py-1"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gold-600 fill-gold-500" />
              Saved Favourites
            </span>
            <span className="text-xs bg-gold-100 text-gold-800 px-2.5 py-0.5 rounded-full font-sans font-semibold">
              {favouriteCount}
            </span>
          </button>
          <div className="pt-2 border-t border-gold-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownload();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gold-500 text-white font-sans text-xs uppercase tracking-widest font-semibold shadow-md active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" />
              Download Complete Album
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
