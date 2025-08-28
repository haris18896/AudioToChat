import { renderHook, act } from '@testing-library/react-native';
import { useUnifiedAudioPlayer } from '../useUnifiedAudioPlayer';

// Mock transcription data
const mockTranscriptionData = {
  pause: 250,
  speakers: [
    {
      name: 'john',
      phrases: [
        { words: 'Hello there', time: 1000 },
        { words: 'How are you?', time: 1500 },
      ],
    },
    {
      name: 'jack',
      phrases: [
        { words: 'I am fine', time: 1200 },
        { words: 'Thank you', time: 800 },
      ],
    },
  ],
};

// Mock audio URI
const mockAudioUri = 'test-audio.mp3';

describe('useUnifiedAudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    expect(result.current.audioPlayer).toEqual({
      isPlaying: false,
      currentTime: 0,
      totalTime: 0,
      isLoaded: false,
      playbackRate: 1.0,
      isSeeking: false,
      currentPhraseIndex: 0,
    });
  });

  it('should process transcription data and create messages', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Wait for transcription processing
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.messages).toHaveLength(4);
    expect(result.current.allMessages).toHaveLength(4);
    expect(result.current.audioPlayer.totalTime).toBe(4750); // Total duration including pauses
  });

  it('should handle web audio setup', () => {
    // Mock Platform.OS as web
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));

    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Simulate audio loaded
    act(() => {
      const audioElement = new Audio();
      Object.defineProperty(audioElement, 'duration', { value: 10 });
      const eventListeners: [string, any][] = [];
      const loadedMetadataListener = eventListeners.find(
        (call: any) => call[0] === 'loadedmetadata',
      )?.[1];
      if (loadedMetadataListener) {
        loadedMetadataListener();
      }
    });

    expect(result.current.audioPlayer.isLoaded).toBe(true);
    expect(result.current.audioPlayer.totalTime).toBe(10000); // 10 seconds in ms
  });

  it('should handle play/pause toggle on web', async () => {
    // Mock Platform.OS as web
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));

    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio
    act(() => {
      const audioElement = new Audio();
      Object.defineProperty(audioElement, 'duration', { value: 10 });
      const eventListeners: [string, any][] = [];
      const loadedMetadataListener = eventListeners.find(
        (call: any) => call[0] === 'loadedmetadata',
      )?.[1];
      if (loadedMetadataListener) {
        loadedMetadataListener();
      }
    });

    // Toggle play
    act(() => {
      result.current.togglePlayPause();
    });

    expect(result.current.audioPlayer.isPlaying).toBe(true);

    // Toggle pause
    act(() => {
      result.current.togglePlayPause();
    });

    expect(result.current.audioPlayer.isPlaying).toBe(false);
  });

  it('should handle seeking', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio as loaded
    act(() => {
      result.current.audioPlayer.isLoaded = true;
    });

    // Seek to a specific time
    act(() => {
      result.current.seekTo(2000);
    });

    expect(result.current.audioPlayer.currentTime).toBe(2000);
    expect(result.current.audioPlayer.isSeeking).toBe(true);

    // Wait for seeking to complete
    act(() => {
      jest.advanceTimersByTime(60);
    });

    expect(result.current.audioPlayer.isSeeking).toBe(false);
  });

  it('should handle rewind functionality', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio as loaded and set current time
    act(() => {
      result.current.audioPlayer.isLoaded = true;
      result.current.audioPlayer.currentTime = 2000;
      result.current.audioPlayer.currentPhraseIndex = 1;
    });

    // Trigger rewind
    act(() => {
      result.current.rewind();
    });

    // Should seek to the beginning of the current phrase or previous phrase
    expect(result.current.audioPlayer.currentTime).toBe(1000); // First phrase start time
  });

  it('should handle fast forward functionality', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio as loaded and set current time
    act(() => {
      result.current.audioPlayer.isLoaded = true;
      result.current.audioPlayer.currentTime = 1000;
      result.current.audioPlayer.currentPhraseIndex = 0;
    });

    // Trigger fast forward
    act(() => {
      result.current.fastForward();
    });

    // Should seek to the next phrase
    expect(result.current.audioPlayer.currentTime).toBe(1250); // Second phrase start time
  });

  it('should handle repeat functionality', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio as loaded and set current time
    act(() => {
      result.current.audioPlayer.isLoaded = true;
      result.current.audioPlayer.currentTime = 2000;
      result.current.audioPlayer.currentPhraseIndex = 1;
    });

    // Trigger repeat
    act(() => {
      result.current.repeat();
    });

    // Should seek to current phrase start and change playback rate
    expect(result.current.audioPlayer.playbackRate).toBe(0.75);

    // Wait for playback rate to reset
    act(() => {
      jest.advanceTimersByTime(1500); // Phrase duration
    });

    expect(result.current.audioPlayer.playbackRate).toBe(1.0);
  });

  it('should update visible messages based on current time', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Wait for transcription processing
    act(() => {
      jest.runAllTimers();
    });

    // Set current time to show more messages
    act(() => {
      result.current.audioPlayer.currentTime = 3000;
    });

    // Should show messages up to current time
    expect(result.current.messages.length).toBeGreaterThan(0);
  });

  it('should handle video events on native platform', () => {
    // Mock Platform.OS as ios
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));

    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Simulate video load event
    act(() => {
      result.current.onLoad({ duration: 15, currentTime: 0 });
    });

    expect(result.current.audioPlayer.isLoaded).toBe(true);
    expect(result.current.audioPlayer.totalTime).toBe(15000);

    // Simulate progress event
    act(() => {
      result.current.onProgress({
        currentTime: 5,
        playableDuration: 15,
        seekableDuration: 15,
      });
    });

    expect(result.current.audioPlayer.currentTime).toBe(5000);
  });

  it('should handle video end event', () => {
    const { result } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio as playing
    act(() => {
      result.current.audioPlayer.isPlaying = true;
      result.current.audioPlayer.currentTime = 5000;
    });

    // Trigger end event
    act(() => {
      result.current.onEnd();
    });

    expect(result.current.audioPlayer.isPlaying).toBe(false);
    expect(result.current.audioPlayer.currentTime).toBe(0);
    expect(result.current.audioPlayer.currentPhraseIndex).toBe(0);
  });

  it('should cleanup timeouts on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useUnifiedAudioPlayer(mockAudioUri, mockTranscriptionData),
    );

    // Setup audio as loaded
    act(() => {
      result.current.audioPlayer.isLoaded = true;
    });

    // Trigger repeat to create a timeout
    act(() => {
      result.current.repeat();
    });

    // Unmount the hook
    unmount();

    // Should not throw any errors during cleanup
    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();
  });
});
