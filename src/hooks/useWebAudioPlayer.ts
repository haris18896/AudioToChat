import { useState, useRef, useCallback, useEffect } from 'react';
import {
  TranscriptionData,
  AudioPlayerState,
  ChatMessage,
  PhraseTiming,
} from '../types/chat';
import {
  processTranscriptionData,
  phraseTimingsToMessages,
  getCurrentPhraseIndex,
  getVisibleMessages,
  updateMessageStates,
} from '../utils/transcriptionUtils';

export const useWebAudioPlayer = (
  audioUri: string,
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process transcription data into phrase timings
  useEffect(() => {
    const timings = processTranscriptionData(transcriptionData);
    setPhraseTimings(timings);

    const chatMessages = phraseTimingsToMessages(timings);
    setMessages(chatMessages);

    // Calculate total duration
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

    // Track last spoken phrase for repeat functionality
    const currentPhrase = phraseTimings[currentPhraseIndex];
    if (currentPhrase && audioPlayer.currentTime >= currentPhrase.startTime) {
      const lastMessage = messages.find(msg => msg.id === currentPhrase.id);
      if (lastMessage) {
        setLastSpokenPhrase(lastMessage);
      }
    }
  }, [audioPlayer.currentTime, phraseTimings, messages]);

  const loadAudio = useCallback(async () => {
    try {
      console.log('Loading audio URI:', audioUri);
      const audio = new Audio(audioUri);

      audio.addEventListener('loadedmetadata', () => {
        setAudioPlayer(prev => ({
          ...prev,
          isLoaded: true,
        }));

        // Add timeupdate event listener once audio is loaded
        const handleTimeUpdate = () => {
          if (audio.currentTime !== undefined) {
            const currentTime = audio.currentTime * 1000;
            setAudioPlayer(prev => ({ ...prev, currentTime }));
          }
        };

        // Add both timeupdate and progress events for more frequent updates
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('progress', handleTimeUpdate);

        // Also add a more frequent interval for smoother progress bar
        const intervalId = setInterval(() => {
          if (audio.currentTime !== undefined) {
            const currentTime = audio.currentTime * 1000;
            setAudioPlayer(prev => ({ ...prev, currentTime }));
          }
        }, 50); // Update every 50ms for smooth progress bar

        timeUpdateHandlerRef.current = handleTimeUpdate;

        // Store interval ID for cleanup
        progressIntervalRef.current = intervalId;
      });

      audio.addEventListener('ended', () => {
        setAudioPlayer(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0, // Reset current time to beginning
          currentPhraseIndex: 0, // Reset phrase index
        }));
      });

      audioRef.current = audio;
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  }, [audioUri]);

  // Load audio
  useEffect(() => {
    loadAudio();
    return () => {
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
  }, [loadAudio]);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !audioPlayer.isLoaded) return;

    try {
      if (audioPlayer.isPlaying) {
        audioRef.current.pause();
        setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audioRef.current.play();
        setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [audioPlayer.isPlaying, audioPlayer.isLoaded]);

  const seekTo = useCallback(
    async (time: number) => {
      if (!audioRef.current || !audioPlayer.isLoaded) return;

      try {
        setAudioPlayer(prev => ({ ...prev, isSeeking: true }));
        audioRef.current.currentTime = time / 1000;

        // If seeking to beginning, reset phrase index
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
    [audioPlayer.isLoaded],
  );

  // Rewind: Go to beginning of current phrase, or previous phrase if at beginning
  const rewind = useCallback(async () => {
    if (phraseTimings.length === 0) return;

    const currentIndex = audioPlayer.currentPhraseIndex;
    let targetIndex = currentIndex;

    // If we're at the beginning of the current phrase, go to previous phrase
    const currentPhrase = phraseTimings[currentIndex];
    if (
      currentPhrase &&
      audioPlayer.currentTime <= currentPhrase.startTime + 500
    ) {
      // Within 500ms of phrase start, go to previous phrase
      targetIndex = Math.max(0, currentIndex - 1);
    }

    const targetPhrase = phraseTimings[targetIndex];
    if (targetPhrase) {
      await seekTo(targetPhrase.startTime);
    }
  }, [
    audioPlayer.currentPhraseIndex,
    audioPlayer.currentTime,
    phraseTimings,
    seekTo,
  ]);

  // Forward: Skip to beginning of next phrase
  const fastForward = useCallback(async () => {
    if (phraseTimings.length === 0) return;

    const currentIndex = audioPlayer.currentPhraseIndex;
    const nextIndex = Math.min(phraseTimings.length - 1, currentIndex + 1);
    const nextPhrase = phraseTimings[nextIndex];

    if (nextPhrase) {
      await seekTo(nextPhrase.startTime);
    }
  }, [audioPlayer.currentPhraseIndex, phraseTimings, seekTo]);

  // Repeat: Repeat last spoken phrase
  const repeat = useCallback(async () => {
    if (!lastSpokenPhrase || !audioRef.current) return;

    try {
      // Seek to the beginning of the last spoken phrase
      const phrase = phraseTimings.find(p => p.id === lastSpokenPhrase.id);
      if (phrase) {
        await seekTo(phrase.startTime);

        // Play the audio if not already playing
        if (!audioPlayer.isPlaying) {
          await audioRef.current.play();
          setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
        }
      }
    } catch (error) {
      console.error('Error repeating phrase:', error);
    }
  }, [lastSpokenPhrase, phraseTimings, audioPlayer.isPlaying, seekTo]);

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
