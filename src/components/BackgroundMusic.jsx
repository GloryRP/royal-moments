import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

/**
 * Royal Background Music Component
 * Plays background soundtrack continuously on infinite loop across the entire web app.
 * Automatically starts playing on first user tap (e.g. "Tap to Open" envelope).
 */
export function BackgroundMusic({ isEnvelopeOpen }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Attempt play function with error handling for browser autoplay policies
  const startPlayback = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.6;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      })
      .catch((err) => {
        // Autoplay policy prevented; will play on next click
        console.warn('Playback waiting for user gesture:', err.message);
      });
  };

  // Automatically start music when user taps the royal envelope to enter
  useEffect(() => {
    if (isEnvelopeOpen && !hasStarted) {
      startPlayback();
    }
  }, [isEnvelopeOpen, hasStarted]);

  // One-time global gesture listener for mobile browsers that require a direct tap
  useEffect(() => {
    const handleFirstGesture = () => {
      if (audioRef.current && !isPlaying && !hasStarted) {
        startPlayback();
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [isPlaying, hasStarted]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 0.6;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch(console.warn);
    }
  };

  return (
    <>
      {/* Hidden persistent loop audio element */}
      <audio
        ref={audioRef}
        src="/background-music.mp3"
        loop
        preload="auto"
      />

      {/* Floating Royal Music Controller */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-35 pointer-events-auto select-none">
        <button
          onClick={togglePlay}
          className={`group relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full shadow-royal-lg backdrop-blur-md border transition-all duration-300 hover:scale-105 active:scale-95 ${
            isPlaying
              ? 'bg-royal-card/95 border-gold-400 text-royal-espresso shadow-royal'
              : 'bg-black/60 border-white/20 text-white/80 hover:bg-black/80'
          }`}
          title={isPlaying ? 'Pause background music' : 'Play background music'}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {/* Ambient Gold Halo Glow when playing */}
          {isPlaying && (
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-300/40 via-gold-400/40 to-gold-300/40 rounded-full blur-sm animate-pulse pointer-events-none" />
          )}

          {/* Icon / Animated Equalizer Bars */}
          <div className="relative flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5">
            {isPlaying ? (
              <div className="flex items-end gap-[2px] h-3.5 w-3.5">
                <span className="w-1 bg-gold-600 rounded-full animate-[musicBar_0.8s_ease-in-out_infinite]" style={{ height: '70%' }} />
                <span className="w-1 bg-gold-600 rounded-full animate-[musicBar_1.1s_ease-in-out_infinite_0.2s]" style={{ height: '100%' }} />
                <span className="w-1 bg-gold-600 rounded-full animate-[musicBar_0.7s_ease-in-out_infinite_0.4s]" style={{ height: '55%' }} />
              </div>
            ) : (
              <VolumeX className="w-4 h-4 text-white/70" />
            )}
          </div>

          {/* Label */}
          <span className="text-[10px] sm:text-[11px] font-cinzel tracking-wider uppercase font-semibold">
            {isPlaying ? 'Music' : 'Muted'}
          </span>
        </button>
      </div>
    </>
  );
}
