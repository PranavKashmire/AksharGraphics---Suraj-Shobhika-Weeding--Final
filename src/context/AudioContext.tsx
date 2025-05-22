import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

interface AudioContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  isLoading: boolean;
  loadingProgress: number;
  hasError: boolean;
  volume: number;
  setVolume: (volume: number) => void;
}

interface AudioProviderProps {
  children: ReactNode;
  isDisabledOnRoutes?: string[];
  audioSrc?: string;
  audioVolume?: number;
  autoplay?: boolean;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  toggleMusic: () => {},
  isLoading: true,
  loadingProgress: 0,
  hasError: false,
  volume: 0.5,
  setVolume: () => {},
});

export const AudioProvider: React.FC<AudioProviderProps> = ({
  children,
  isDisabledOnRoutes = [],
  audioSrc = "/audio/Kudmayi.mp3",
  audioVolume = 0.5,
  autoplay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(audioVolume);
  const location = useLocation();
  const interactionAttemptedRef = useRef(false);

  // Check if current route is in disabled routes list
  const isMusicDisabled = isDisabledOnRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  // Initialize audio on mount
  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audioRef.current = audio;

    // Set audio properties
    audio.src = audioSrc;
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "auto";

    // Set up event listeners for loading progress
    audio.addEventListener("loadstart", () => {
      setIsLoading(true);
      setLoadingProgress(0);
    });

    audio.addEventListener("progress", () => {
      if (audio.duration) {
        // Calculate buffered percentage
        const bufferedRanges = audio.buffered;
        if (bufferedRanges.length > 0) {
          const bufferedEnd = bufferedRanges.end(bufferedRanges.length - 1);
          const progress = Math.min(
            100,
            Math.round((bufferedEnd / audio.duration) * 100)
          );
          setLoadingProgress(progress);
        }
      }
    });

    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      setLoadingProgress(100);

      // Try autoplay if enabled and not on disabled route
      if (autoplay && !isMusicDisabled && !isInitialized) {
        initializeAudio();
      }
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio loading error:", e);
      setHasError(true);
      setIsLoading(false);
    });

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      audio.removeEventListener("loadstart", () => {});
      audio.removeEventListener("progress", () => {});
      audio.removeEventListener("canplaythrough", () => {});
      audio.removeEventListener("error", () => {});
    };
  }, [audioSrc, volume, autoplay, isMusicDisabled]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Initialize audio on user interaction
  const initializeAudio = () => {
    const audio = audioRef.current;
    if (!audio || isMusicDisabled || isInitialized) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsInitialized(true);
          interactionAttemptedRef.current = true;
        })
        .catch((error) => {
          console.log("Audio playback failed:", error);
          setIsPlaying(false);

          // Don't set initialization to true if it failed due to user interaction policy
          if (error.name !== "NotAllowedError") {
            setIsInitialized(true);
          }
        });
    }
  };

  // Set up listeners for user interaction to enable audio
  useEffect(() => {
    if (isMusicDisabled || isInitialized || interactionAttemptedRef.current)
      return;

    const autoplayEvents = [
      "click",
      "touchstart",
      "scroll",
      "mousedown",
      "keydown",
      "pointerdown",
      "pointerup",
    ];

    const handleUserInteraction = () => {
      if (!isMusicDisabled && !isInitialized) {
        initializeAudio();
        // Remove all event listeners after first interaction
        autoplayEvents.forEach((event) => {
          document.removeEventListener(event, handleUserInteraction);
        });
      }
    };

    // Add event listeners for user interaction
    autoplayEvents.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      autoplayEvents.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isMusicDisabled, isInitialized]);

  // Watch for route changes and pause music on disabled routes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isMusicDisabled) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (isInitialized && isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [location.pathname, isMusicDisabled, isInitialized, isPlaying]);

  // Handle visibility change (browser tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current || isMusicDisabled) return;

      if (!document.hidden && isInitialized && isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInitialized, isPlaying, isMusicDisabled]);

  // Toggle music function
  const toggleMusic = () => {
    if (isMusicDisabled || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
          });
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        toggleMusic,
        isLoading,
        loadingProgress,
        hasError,
        volume,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  return useContext(AudioContext);
};
