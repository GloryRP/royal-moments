import React from 'react';
import { X, Smartphone, Share2, PlusSquare, CheckCircle, ArrowDownToLine, Monitor } from 'lucide-react';

export function InstallAppModal({ isOpen, onClose, deferredPrompt, onPromptInstall, isInstalled }) {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-royal-card border border-gold-300/80 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-royal-espresso"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-royal-espresso/60 hover:text-royal-espresso hover:bg-gold-100/60 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with App Icon */}
        <div className="text-center mb-5">
          <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-16 h-16 drop-shadow-md" fill="none">
              <path
                d="M20 34.5 C20 34.5 4.5 23.5 4.5 13 C4.5 7.5 9 4 14.5 4 C17.8 4 20 6.2 20 6.2 C20 6.2 22.2 4 25.5 4 C31 4 35.5 7.5 35.5 13 C35.5 23.5 20 34.5 20 34.5 Z"
                fill="#FAF6EC"
                stroke="#C5A059"
                strokeWidth="1.8"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-gold-800 font-cinzel font-bold text-xs tracking-tighter select-none">
              P &amp; S
            </span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-royal-espresso">
            Install Ramula's Presents
          </h3>
          <p className="font-sans text-xs sm:text-sm text-royal-espresso/70 mt-1">
            Add to your home screen or desktop for instant 1-tap full-screen access to Prabhudas &amp; Soumya's engagement memories.
          </p>
        </div>

        {/* Already Installed Status */}
        {isInstalled ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
            <p className="font-sans text-xs font-semibold text-emerald-900">
              App is already installed on your device!
            </p>
            <p className="font-sans text-[11px] text-emerald-700 mt-0.5">
              You can find "Ramula's Presents" on your home screen or desktop.
            </p>
          </div>
        ) : deferredPrompt ? (
          /* Native 1-Tap Install Button for Android / Chrome / Edge / Desktop */
          <div className="space-y-4 mb-4">
            <button
              onClick={onPromptInstall}
              className="w-full py-3.5 px-4 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-royal hover:shadow-royal-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Install to Home Screen Now</span>
            </button>
            <p className="text-[11px] text-center text-royal-espresso/60 font-sans">
              No app store download needed. Fast, secure, and opens full-screen.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Step-by-Step Guide */
          <div className="bg-gold-50/70 border border-gold-200 rounded-xl p-4 space-y-3 mb-4 text-left">
            <p className="font-sans text-xs font-semibold text-gold-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-gold-700" />
              Follow these 2 simple steps in Safari:
            </p>

            <div className="space-y-2 text-xs font-sans text-royal-espresso">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Tap the <strong className="inline-flex items-center gap-1 text-sky-600 font-semibold"><Share2 className="w-3.5 h-3.5 inline" /> Share</strong> button at the bottom of your Safari screen.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Scroll down and tap <strong className="inline-flex items-center gap-1 font-semibold text-gold-900"><PlusSquare className="w-3.5 h-3.5 inline text-gold-700" /> Add to Home Screen</strong>, then tap <strong>Add</strong>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* General Android / Desktop Instructions */
          <div className="bg-gold-50/70 border border-gold-200 rounded-xl p-4 space-y-2.5 mb-4 text-left">
            <p className="font-sans text-xs font-semibold text-gold-900 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-gold-700" />
              How to add to your screen:
            </p>
            <div className="text-xs font-sans text-royal-espresso space-y-1.5">
              <p>• <strong>On Android phone</strong>: Tap the browser menu <strong>(⋮)</strong> and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</p>
              <p>• <strong>On Computer</strong>: Click the install icon in the right side of the address bar at the top of your browser.</p>
            </div>
          </div>
        )}

        <div className="text-center pt-1">
          <button
            onClick={onClose}
            className="text-xs text-royal-espresso/70 hover:text-royal-espresso underline font-sans"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
