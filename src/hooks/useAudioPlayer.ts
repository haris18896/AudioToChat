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
      console.warn('Sound import failed or is not a constructor');
      Sound = null;
    }
  } catch (error) {
    console.warn('react-native-sound not available:', error);
    Sound = null;
  }
}

export const useAudioPlayer = (
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

  const soundRef = useRef<any>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (Platform.OS === 'web') return;

    if (!Sound) {
      console.error('react-native-sound not available for audio playback');
      return;
    }

    // Additional check to ensure Sound is a valid constructor
    if (typeof Sound !== 'function') {
      console.error('Sound is not a valid constructor function');
      return;
    }

    try {
      console.log('Loading audio file...', audioUri);

      let soundSource: string | number;
      if (typeof audioUri === 'string') {
        soundSource = audioUri;
      } else if (typeof audioUri === 'number') {
        soundSource = audioUri;
      } else {
        console.error('Invalid audio URI type:', typeof audioUri);
        return;
      }

      // Create Sound instance with the audio source
      const sound = new Sound(soundSource, undefined, (error: any) => {
        if (error) {
          console.error('Error loading audio:', error);
          return;
        }

        const duration = sound.getDuration();
        console.log('check duration...', duration);
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

  useEffect(() => {
    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [loadAudio]);

  const startTimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    console.log('Starting time updates...');
    updateIntervalRef.current = setInterval(() => {
      if (soundRef.current) {
        soundRef.current.getCurrentTime((seconds: number) => {
          const currentTime = seconds * 1000;

          if (
            currentTime >= audioPlayer.totalTime &&
            audioPlayer.totalTime > 0
          ) {
            console.log('Audio ended, resetting state');
            setAudioPlayer(prev => ({
              ...prev,
              isPlaying: false,
              currentTime: 0,
              currentPhraseIndex: 0,
            }));

            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current);
            }
          } else {
            setAudioPlayer(prev => ({ ...prev, currentTime }));
          }
        });
      }
    }, 50);
  }, [audioPlayer.totalTime]);

  // Seek to specific time
  const seekTo = useCallback(
    async (time: number) => {
      if (!soundRef.current || !audioPlayer.isLoaded) return;

      try {
        setAudioPlayer(prev => ({ ...prev, isSeeking: true }));
        const timeInSeconds = time / 1000;
        soundRef.current.setCurrentTime(timeInSeconds);

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

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || !audioPlayer.isLoaded) return;

    try {
      if (audioPlayer.isPlaying) {
        console.log('Pausing audio...', soundRef.current);
        soundRef.current.pause();
        setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
      } else {
        console.log('Playing audio...', soundRef.current);
        // If we're at the end, restart from beginning
        if (audioPlayer.currentTime >= audioPlayer.totalTime) {
          await seekTo(0);
        }

        soundRef.current.play((success: boolean) => {
          if (success) {
            console.log('Audio play success, setting isPlaying to true');
            setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
          } else {
            console.error('Failed to play audio');
          }
        });
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [
    audioPlayer.isPlaying,
    audioPlayer.isLoaded,
    audioPlayer.currentTime,
    audioPlayer.totalTime,
    seekTo,
  ]);

  // Rewind: Go to beginning of current phrase, or previous phrase if at beginning
  const rewind = useCallback(async () => {
    if (phraseTimings.length === 0) return;

    const currentIndex = audioPlayer.currentPhraseIndex;
    let targetIndex = currentIndex;

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

  // Repeat: Reset audio clip to beginning
  const repeat = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      await seekTo(0);

      if (!audioPlayer.isPlaying) {
        soundRef.current.play((success: boolean) => {
          if (success) {
            setAudioPlayer(prev => ({ ...prev, isPlaying: true }));
          }
        });
      }
    } catch (error) {
      console.error('Error resetting audio:', error);
    }
  }, [audioPlayer.isPlaying, seekTo]);

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
