import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';

// && Utils
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

// only import Sound on Mobile app
let Sound: any = null;
if (Platform.OS !== 'web') {
  try {
    Sound = require('react-native-sound').default;
    if (!Sound || typeof Sound !== 'function') {
      Sound = null;
    } else {
      Sound.setCategory('Playback');
    }
  } catch (error) {
    Sound = null;
  }
}

export const useUnifiedAudioPlayer = (
  audioUri: string | number,
  transcriptionData: TranscriptionData,
  _audioFileInfo?: { bundlePath: string; fileName: string },
) => {
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    isLoaded: false,
    playbackRate: 1.0,
    isSeeking: false,
    currentPhraseIndex: 0,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [phraseTimings, setPhraseTimings] = useState<PhraseTiming[]>([]);
  const [lastSpokenPhrase, setLastSpokenPhrase] = useState<ChatMessage | null>(
    null,
  );

  // Native audio refs (mobile)
  const soundRef = useRef<any>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRepeatingRef = useRef<boolean>(false);
  const repeatEndTimeRef = useRef<number>(0);

  // Web audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isWeb = Platform.OS === 'web';

  // Process transcription data into phrase timings
  useEffect(() => {
    const timings = processTranscriptionData(transcriptionData);
    setPhraseTimings(timings);

    const chatMessages = phraseTimingsToMessages(timings);
    setMessages(chatMessages);

    const totalDuration =
      timings.length > 0 ? timings[timings.length - 1].endTime : 0;

    setAudioPlayer(prev => ({
      ...prev,
      totalTime: totalDuration,
    }));
  }, [transcriptionData]);

  // Update visible messages and current phrase based on current time
  useEffect(() => {
    if (phraseTimings.length === 0) return;

    const currentPhraseIndex = getCurrentPhraseIndex(
      phraseTimings,
      audioPlayer.currentTime,
    );
    const visible = getVisibleMessages(messages, audioPlayer.currentTime);
    const updatedVisible = updateMessageStates(
      visible,
      audioPlayer.currentTime,
    );

    setVisibleMessages(updatedVisible);
    setAudioPlayer(prev => ({ ...prev, currentPhraseIndex }));

    const currentPhrase = phraseTimings[currentPhraseIndex];
    if (currentPhrase && audioPlayer.currentTime >= currentPhrase.startTime) {
      const lastMessage = messages.find(msg => msg.id === currentPhrase.id);
      if (lastMessage) {
        setLastSpokenPhrase(lastMessage);
      }
    }
  }, [audioPlayer.currentTime, phraseTimings, messages]);

  // Native audio loading (mobile)
  const loadNativeAudio = useCallback(async () => {
    if (!Sound || typeof Sound !== 'function') return;

    try {
      let soundSource: string | number;
      if (typeof audioUri === 'string') {
        soundSource = audioUri;
      } else if (typeof audioUri === 'number') {
        soundSource = audioUri;
      } else {
        return;
      }

      const basePath =
        typeof soundSource === 'string' && !soundSource.startsWith('http')
          ? Sound.MAIN_BUNDLE
          : undefined;

      const sound = new Sound(soundSource, basePath, (error: any) => {
        if (error) {
          console.error({
            'Base path:': basePath,
            'Audio source:': soundSource,
            'Error loading audio:': error,
          });
          return;
        }

        const duration = sound.getDuration();
        setAudioPlayer(prev => ({
          ...prev,
          isLoaded: true,
          totalTime: duration * 1000,
        }));
      });

      soundRef.current = sound;
    } catch (error) {
      console.error('Error creating sound:', error);
    }
  }, [audioUri]);

  // Web audio loading
  const loadWebAudio = useCallback(async () => {
    try {
      console.log('Loading audio URI:', audioUri);
      const audio = new Audio(audioUri as string);

      audio.addEventListener('loadedmetadata', () => {
        setAudioPlayer(prev => ({
          ...prev,
          isLoaded: true,
        }));

        const handleTimeUpdate = () => {
          if (audio.currentTime !== undefined) {
            const currentTime = audio.currentTime * 1000;
            setAudioPlayer(prev => ({ ...prev, currentTime }));
          }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('progress', handleTimeUpdate);

        const intervalId = setInterval(() => {
          if (audio.currentTime !== undefined) {
            const currentTime = audio.currentTime * 1000;
            setAudioPlayer(prev => ({ ...prev, currentTime }));
          }
        }, 50);

        timeUpdateHandlerRef.current = handleTimeUpdate;
        progressIntervalRef.current = intervalId;
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
      console.error('Error creating audio:', error);
    }
  }, [audioUri]);

  // Audio loading effect
  useEffect(() => {
    if (isWeb) {
      loadWebAudio();
    } else {
      loadNativeAudio();
    }

    return () => {
      // Cleanup native audio
      if (soundRef.current) {
        soundRef.current.release();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }

      // Cleanup web audio
      if (audioRef.current && timeUpdateHandlerRef.current) {
        audioRef.current.removeEventListener(
          'timeupdate',
          timeUpdateHandlerRef.current,
        );
        audioRef.current.removeEventListener(
          'progress',
          timeUpdateHandlerRef.current,
        );
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isWeb, loadWebAudio, loadNativeAudio]);

  // Native audio end handler
  const handleNativeAudioEnd = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause();
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    setAudioPlayer(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentPhraseIndex: 0,
      playbackRate: 1.0,
    }));

    isRepeatingRef.current = false;
    repeatEndTimeRef.current = 0;
  }, []);

  // Native audio time updates
  const startNativeTimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      if (soundRef.current) {
        soundRef.current.getCurrentTime((seconds: number) => {
          const currentTime = seconds * 1000;

          if (
            isRepeatingRef.current &&
            currentTime >= repeatEndTimeRef.current
          ) {
            if (soundRef.current && soundRef.current.setSpeed) {
              soundRef.current.setSpeed(1.0);
            }
            setAudioPlayer(prev => ({ ...prev, playbackRate: 1.0 }));
            isRepeatingRef.current = false;
            repeatEndTimeRef.current = 0;
          }

          if (
            audioPlayer.totalTime > 0 &&
            (currentTime >= audioPlayer.totalTime - 100 ||
              seconds >= audioPlayer.totalTime / 1000 - 0.1)
          ) {
            handleNativeAudioEnd();
            return;
          }

          setAudioPlayer(prev => ({ ...prev, currentTime }));
        });
      }
    }, 50);
  }, [audioPlayer.totalTime, handleNativeAudioEnd]);

  // Seek to specific time
  const seekTo = useCallback(
    async (time: number) => {
      if (!audioPlayer.isLoaded) return;

      try {
        setAudioPlayer(prev => ({ ...prev, isSeeking: true }));

        if (isWeb) {
          if (!audioRef.current) return;
          audioRef.current.currentTime = time / 1000;
        } else {
          if (!soundRef.current) return;
          const timeInSeconds = time / 1000;
          soundRef.current.setCurrentTime(timeInSeconds);
        }

        if (time === 0) {
          setAudioPlayer(prev => ({
            ...prev,
            currentTime: time,
            currentPhraseIndex: 0,
            isSeeking: false,
          }));
        } else {
          setAudioPlayer(prev => ({
            ...prev,
            currentTime: time,
            isSeeking: false,
          }));
        }
      } catch (error) {
        console.error('Error seeking:', error);
        setAudioPlayer(prev => ({ ...prev, isSeeking: false }));
      }
    },
    [audioPlayer.isLoaded, isWeb],
  );

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!audioPlayer.isLoaded) return;

    try {
      if (audioPlayer.isPlaying) {
        // Pause logic
        if (isWeb) {
          if (!audioRef.current) return;
          audioRef.current.pause();
        } else {
          if (!soundRef.current) return;
          soundRef.current.pause();
          if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
          }
        }
        setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
      } else {
        // Play logic
        if (audioPlayer.currentTime >= audioPlayer.totalTime - 100) {
          await seekTo(0);
        }

        if (isWeb) {
          if (!audioRef.current) return;
          await audioRef.current.play();
        } else {
          if (!soundRef.current) return;
          if (soundRef.current.setSpeed && !isRepeatingRef.current) {
            soundRef.current.setSpeed(1.0);
          }
          soundRef.current.play();
          startNativeTimeUpdates();
        }

        setAudioPlayer(prev => ({
          ...prev,
          isPlaying: true,
          playbackRate: isWeb ? 1.0 : isRepeatingRef.current ? 0.75 : 1.0,
        }));
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
    seekTo,
    startNativeTimeUpdates,
  ]);

  // Rewind: Go to beginning of current phrase, or previous phrase if at beginning
  const rewind = useCallback(async () => {
    if (phraseTimings.length === 0) return;

    // Reset repeat state for native audio
    if (!isWeb) {
      isRepeatingRef.current = false;
      repeatEndTimeRef.current = 0;
      if (soundRef.current && soundRef.current.setSpeed) {
        soundRef.current.setSpeed(1.0);
      }
      setAudioPlayer(prev => ({ ...prev, playbackRate: 1.0 }));
    }

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
      await seekTo(targetPhrase.startTime);

      // Only continue playing if it was already playing
      if (audioPlayer.isPlaying) {
        if (isWeb) {
          if (audioRef.current) {
            await audioRef.current.play();
          }
        } else {
          if (soundRef.current) {
            soundRef.current.play();
            startNativeTimeUpdates();
          }
        }
      } else {
        // If paused, make sure native audio stays paused after seeking
        if (!isWeb && soundRef.current) {
          soundRef.current.pause();
        }
      }
    }
  }, [
    audioPlayer.currentPhraseIndex,
    audioPlayer.currentTime,
    audioPlayer.isPlaying,
    phraseTimings,
    isWeb,
    seekTo,
    startNativeTimeUpdates,
  ]);

  // Forward: Skip to beginning of next phrase
  const fastForward = useCallback(async () => {
    if (phraseTimings.length === 0) return;

    // Reset repeat state for native audio
    if (!isWeb) {
      isRepeatingRef.current = false;
      repeatEndTimeRef.current = 0;
      if (soundRef.current && soundRef.current.setSpeed) {
        soundRef.current.setSpeed(1.0);
      }
      setAudioPlayer(prev => ({ ...prev, playbackRate: 1.0 }));
    }

    const currentIndex = audioPlayer.currentPhraseIndex;
    const nextIndex = Math.min(phraseTimings.length - 1, currentIndex + 1);
    const nextPhrase = phraseTimings[nextIndex];

    if (nextPhrase) {
      await seekTo(nextPhrase.startTime);

      // Only continue playing if it was already playing
      if (audioPlayer.isPlaying) {
        if (isWeb) {
          if (audioRef.current) {
            await audioRef.current.play();
          }
        } else {
          if (soundRef.current) {
            soundRef.current.play();
            startNativeTimeUpdates();
          }
        }
      } else {
        // If paused, make sure native audio stays paused after seeking
        if (!isWeb && soundRef.current) {
          soundRef.current.pause();
        }
      }
    }
  }, [
    audioPlayer.currentPhraseIndex,
    audioPlayer.isPlaying,
    phraseTimings,
    isWeb,
    seekTo,
    startNativeTimeUpdates,
  ]);

  // Repeat: Platform-specific repeat functionality
  const repeat = useCallback(async () => {
    if (phraseTimings.length === 0) return;

    try {
      if (isWeb) {
        // Web repeat: use lastSpokenPhrase
        if (!lastSpokenPhrase || !audioRef.current) return;

        const phrase = phraseTimings.find(p => p.id === lastSpokenPhrase.id);
        if (phrase) {
          await seekTo(phrase.startTime);

          // Only continue playing if it was already playing
          if (audioPlayer.isPlaying) {
            await audioRef.current.play();
          }
        }
      } else {
        // Native repeat: play current phrase at 0.75x speed
        if (!soundRef.current) return;

        const currentIndex = audioPlayer.currentPhraseIndex;
        const lastPlayedIndex = currentIndex > 0 ? currentIndex : 0;
        const lastPhrase = phraseTimings[lastPlayedIndex];

        if (lastPhrase) {
          isRepeatingRef.current = true;
          repeatEndTimeRef.current = lastPhrase.endTime;

          if (soundRef.current.setSpeed) {
            soundRef.current.setSpeed(0.75);
          }

          await seekTo(lastPhrase.startTime);

          // Only continue playing if it was already playing
          if (audioPlayer.isPlaying) {
            soundRef.current.play();
            setAudioPlayer(prev => ({ ...prev, playbackRate: 0.75 }));
            startNativeTimeUpdates();
          } else {
            // If paused, make sure native audio stays paused and just update the playback rate
            soundRef.current.pause();
            setAudioPlayer(prev => ({ ...prev, playbackRate: 0.75 }));
          }
        } else {
          if (soundRef.current.setSpeed) {
            soundRef.current.setSpeed(1.0);
          }
          setAudioPlayer(prev => ({ ...prev, playbackRate: 1.0 }));
        }
      }
    } catch (error) {
      console.error('Error repeating phrase:', error);
    }
  }, [
    phraseTimings,
    isWeb,
    lastSpokenPhrase,
    audioPlayer.isPlaying,
    audioPlayer.currentPhraseIndex,
    seekTo,
    startNativeTimeUpdates,
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
  };
};
