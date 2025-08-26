export interface ChatMessage {
  id: string;
  sender: 'john' | 'jack';
  text: string;
  timestamp: number;
  duration: number;
  endTime: number;
  isCurrent: boolean;
  isHighlighted?: boolean;
  isSuggested?: boolean;
}

export interface MediaPlayer {
  isPlaying: boolean;
  currentTime: number;
  totalTime: number;
  isLoaded: boolean;
}

export interface Phrase {
  words: string;
  time: number;
}

export interface Speaker {
  name: string;
  phrases: Phrase[];
}

export interface TranscriptionData {
  pause: number;
  speakers: Speaker[];
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  totalTime: number;
  isLoaded: boolean;
  playbackRate: number;
  isSeeking: boolean;
  currentPhraseIndex: number;
}

export interface ChatState {
  messages: ChatMessage[];
  mediaPlayer: MediaPlayer;
}

export interface ChatContextType {
  messages: ChatMessage[];
  mediaPlayer: MediaPlayer;
  sendMessage: (text: string, sender: 'john' | 'jack') => void;
  updateMediaPlayer: (updates: Partial<MediaPlayer>) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
}

export interface PhraseTiming {
  id: string;
  speaker: 'john' | 'jack';
  text: string;
  startTime: number;
  duration: number;
  endTime: number;
  speakerIndex: number;
  phraseIndex: number;
}
