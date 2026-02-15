'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface ScenarioIntroVideoProps {
  src: string;
  muted?: boolean;
  className?: string;
  overlayOpacity?: number;
  fallbackGradient?: string;
}

/**
 * ScenarioIntroVideo
 *
 * A reusable video background component for scenario intro screens.
 * Features:
 * - Autoplay with sound (falls back to muted if blocked)
 * - Loops infinitely
 * - Mobile-friendly (playsInline)
 * - Graceful fallback to gradient on error
 * - User control for sound when autoplay with audio fails
 */
export default function ScenarioIntroVideo({
  src,
  muted: initialMuted = false,
  className = '',
  overlayOpacity = 0.45,
  fallbackGradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)',
}: ScenarioIntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [showSoundButton, setShowSoundButton] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Attempt autoplay with sound, fall back to muted if needed
  const attemptAutoplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // First try with current muted state
      video.muted = isMuted;
      await video.play();
      setShowSoundButton(false);
    } catch (error) {
      // If autoplay with sound failed, try muted
      if (!isMuted) {
        try {
          video.muted = true;
          setIsMuted(true);
          await video.play();
          // Show button to enable sound
          setShowSoundButton(true);
        } catch (mutedError) {
          // Even muted autoplay failed - likely no user interaction yet
          setShowSoundButton(true);
        }
      }
    }
  }, [isMuted]);

  useEffect(() => {
    if (isLoaded && !hasError) {
      attemptAutoplay();
    }
  }, [isLoaded, hasError, attemptAutoplay]);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !isMuted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);

    // If unmuting, try to play (in case video is paused)
    if (!newMutedState) {
      try {
        await video.play();
        setShowSoundButton(false);
      } catch {
        // If unmuted play fails, revert to muted
        video.muted = true;
        setIsMuted(true);
        setShowSoundButton(true);
      }
    }
  };

  // Fallback gradient when video fails to load
  if (hasError) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{ background: fallbackGradient }}
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        onLoadedData={handleLoadedData}
        onError={handleError}
      />

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Sound control button */}
      {showSoundButton && (
        <button
          onClick={toggleSound}
          className="absolute bottom-6 right-6 z-10 flex items-center gap-2 px-4 py-2
                     bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full
                     border border-white/20 transition-all duration-200
                     text-white/90 hover:text-white text-sm font-medium"
          aria-label={isMuted ? 'Enable sound' : 'Mute'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Tap for sound</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Sound on</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * VideoBackground
 *
 * A container component that wraps ScenarioIntroVideo with proper layering
 * for overlaying content on top of the video.
 */
export function VideoBackground({
  src,
  children,
  muted,
  overlayOpacity,
  fallbackGradient,
  className = '',
}: ScenarioIntroVideoProps & { children?: React.ReactNode }) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      <ScenarioIntroVideo
        src={src}
        muted={muted}
        overlayOpacity={overlayOpacity}
        fallbackGradient={fallbackGradient}
      />
      {/* Content layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
