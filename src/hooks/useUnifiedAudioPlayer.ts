/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// Types
import {
  ChatMessage,
  PhraseTiming,
  AudioPlayerState,
  TranscriptionData,
} from '../types/chat';
import {
  getVisibleMessages,
  updateMessageStates,
  getCurrentPhraseIndex,
  phraseTimingsToMessages,
  processTranscriptionData,
} from '../utils/transcriptionUtils';
import { isWeb } from '../utils/responsive';

// Video types
type VideoRef = any;
type OnLoadData = {
  duration: number;
  currentTime: number;
};
type OnProgressData = {
  currentTime: number;
  playableDuration: number;
  seekableDuration: number;
};

export const useUnifiedAudioPlayer = (
  audioUri: string | number,
  transcriptionData: TranscriptionData,
) => {
  // Core audio state
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    isLoaded: false,
    playbackRate: 1.0,
    isSeeking: false,
    currentPhraseIndex: 0,
  });

  // Message/transcription state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [phraseTimings, setPhraseTimings] = useState<PhraseTiming[]>([]);

  // Platform-specific refs
  const videoRef = useRef<VideoRef>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup refs for timeouts
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

  // Memoize processed transcription data
  const processedTimings = useMemo(() => {
    return processTranscriptionData(transcriptionData);
  }, [transcriptionData]);

  // Memoize messages
  const processedMessages = useMemo(() => {
    return phraseTimingsToMessages(processedTimings);
  }, [processedTimings]);

  // Memoize total duration
  const totalDuration = useMemo(() => {
    return processedTimings.length > 0
      ? processedTimings[processedTimings.length - 1].endTime
      : 0;
  }, [processedTimings]);

  // Cleanup function for timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, []);

  // Add timeout to tracking set
  const addTimeout = useCallback((timeout: NodeJS.Timeout) => {
    timeoutRefs.current.add(timeout);
  }, []);

  // Process transcription data
  useEffect(() => {
    setPhraseTimings(processedTimings);
    setMessages(processedMessages);
    setAudioPlayer(prev => ({ ...prev, totalTime: totalDuration }));
  }, [processedTimings, processedMessages, totalDuration]);

  // Memoize current phrase index calculation
  const currentPhraseIndex = useMemo(() => {
    if (phraseTimings.length === 0) return 0;
    return getCurrentPhraseIndex(phraseTimings, audioPlayer.currentTime);
  }, [phraseTimings, audioPlayer.currentTime]);

  // Memoize visible messages calculation
  const currentVisibleMessages = useMemo(() => {
    if (phraseTimings.length === 0) return [];
    const visible = getVisibleMessages(messages, audioPlayer.currentTime);
    return updateMessageStates(visible, audioPlayer.currentTime);
  }, [phraseTimings, messages, audioPlayer.currentTime]);

  // Update visible messages based on current time
  useEffect(() => {
    if (phraseTimings.length === 0) return;

    setVisibleMessages(currentVisibleMessages);
    setAudioPlayer(prev => ({ ...prev, currentPhraseIndex }));
  }, [currentVisibleMessages, currentPhraseIndex]);

  // Web audio setup
  const setupWebAudio = useCallback(async () => {
    if (!isWeb) return;

    try {
      const audio = new Audio(audioUri as string);

      audio.addEventListener('loadedmetadata', () => {
        setAudioPlayer(prev => ({
          ...prev,
          isLoaded: true,
          totalTime: audio.duration * 1000,
        }));
      });

      audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime * 1000;
        setAudioPlayer(prev => ({ ...prev, currentTime }));
      });

      audio.addEventListener('ended', () => {
        setAudioPlayer(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
          currentPhraseIndex: 0,
        }));
      });

      audioRef.current = audio;
    } catch (error) {
      console.error('Error setting up web audio:', error);
    }
  }, [audioUri, isWeb]);

  // Initialize audio
  useEffect(() => {
    if (isWeb) {
      setupWebAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearAllTimeouts();
    };
  }, [isWeb, setupWebAudio, clearAllTimeouts]);

  const onLoad = useCallback((data: OnLoadData) => {
    console.log('Video loaded:', data);
    const totalTimeMs = data.duration * 1000;
    setAudioPlayer(prev => ({
      ...prev,
      isLoaded: true,
      totalTime: totalTimeMs,
    }));
  }, []);

  const onProgress = useCallback(
    (data: OnProgressData) => {
      if (audioPlayer.isSeeking) return;

      const currentTimeMs = data.currentTime * 1000;

      if (Math.abs(currentTimeMs - audioPlayer.currentTime) > 50) {
        setAudioPlayer(prev => ({
          ...prev,
          currentTime: currentTimeMs,
        }));
      }
    },
    [audioPlayer.isSeeking, audioPlayer.currentTime],
  );

  const onError = useCallback(
    (error: any) => {
      console.error('Video error:', error);
      console.error('Audio URI:', audioUri);
    },
    [audioUri],
  );

  const onEnd = useCallback(() => {
    console.log('Audio ended');
    setAudioPlayer(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentPhraseIndex: 0,
    }));
  }, []);

  // Control functions
  const togglePlayPause = useCallback(async () => {
    if (!audioPlayer.isLoaded) {
      console.log('Audio not loaded yet');
      return;
    }

    try {
      if (isWeb && audioRef.current) {
        if (audioPlayer.isPlaying) {
          audioRef.current.pause();
          setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
        } else {
          if (audioPlayer.currentTime >= audioPlayer.totalTime - 100) {
            audioRef.current.currentTime = 0;
          }
          await audioRef.current.play();
          setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
        }
      } else {
        const newPlayingState = !audioPlayer.isPlaying;

        if (
          newPlayingState &&
          audioPlayer.currentTime >= audioPlayer.totalTime - 100
        ) {
          seekTo(0);
        }

        setAudioPlayer(prev => ({ ...prev, isPlaying: newPlayingState }));
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [
    audioPlayer.isPlaying,
    audioPlayer.isLoaded,
    audioPlayer.currentTime,
    audioPlayer.totalTime,
    isWeb,
  ]);

  const seekTo = useCallback(
    (time: number) => {
      if (!audioPlayer.isLoaded) return;

      try {
        setAudioPlayer(prev => ({
          ...prev,
          currentTime: time,
          isSeeking: true,
        }));

        if (isWeb && audioRef.current) {
          audioRef.current.currentTime = time / 1000;
        } else if (videoRef.current) {
          videoRef.current.seek(time / 1000);
        }

        // Reset seeking flag after a short delay to allow seeking to complete
        const timeout = setTimeout(() => {
          setAudioPlayer(prev => ({ ...prev, isSeeking: false }));
        }, 50);
        addTimeout(timeout);
      } catch (error) {
        console.error('Error seeking:', error);
        setAudioPlayer(prev => ({ ...prev, isSeeking: false }));
      }
    },
    [audioPlayer.isLoaded, isWeb, addTimeout],
  );

  const rewind = useCallback(() => {
    if (phraseTimings.length === 0) return;

    const currentIndex = audioPlayer.currentPhraseIndex;
    let targetIndex = currentIndex;

    const currentPhrase = phraseTimings[currentIndex];
    if (
      currentPhrase &&
      audioPlayer.currentTime <= currentPhrase.startTime + 500
    ) {
      targetIndex = Math.max(0, currentIndex - 1);
    }

    const targetPhrase = phraseTimings[targetIndex];
    if (targetPhrase) {
      seekTo(targetPhrase.startTime);
    }
  }, [
    audioPlayer.currentPhraseIndex,
    audioPlayer.currentTime,
    phraseTimings,
    seekTo,
  ]);

  const fastForward = useCallback(() => {
    if (phraseTimings.length === 0) return;

    const currentIndex = audioPlayer.currentPhraseIndex;
    const nextIndex = Math.min(phraseTimings.length - 1, currentIndex + 1);
    const nextPhrase = phraseTimings[nextIndex];

    if (nextPhrase) {
      seekTo(nextPhrase.startTime);
    }
  }, [audioPlayer.currentPhraseIndex, phraseTimings, seekTo]);

  const repeat = useCallback(() => {
    if (phraseTimings.length === 0) return;

    const currentIndex = audioPlayer.currentPhraseIndex;
    const currentPhrase = phraseTimings[currentIndex];

    if (currentPhrase) {
      seekTo(currentPhrase.startTime);

      setAudioPlayer(prev => ({
        ...prev,
        playbackRate: 0.75,
      }));

      const timeout = setTimeout(() => {
        setAudioPlayer(prev => ({ ...prev, playbackRate: 1.0 }));
      }, currentPhrase.endTime - currentPhrase.startTime);
      addTimeout(timeout);

      if (isWeb && audioRef.current) {
        audioRef.current.playbackRate = 0.75;
      }
    }
  }, [
    audioPlayer.currentPhraseIndex,
    phraseTimings,
    seekTo,
    isWeb,
    addTimeout,
  ]);

  return {
    audioPlayer,
    messages: visibleMessages,
    allMessages: messages,
    togglePlayPause,
    seekTo,
    rewind,
    fastForward,
    repeat,
    // Video-specific (native only)
    videoRef,
    onLoad,
    onProgress,
    onError,
    onEnd,
  };
};
