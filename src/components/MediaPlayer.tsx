import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

// ** Types && Utils
import { AudioPlayerState } from '../types/chat';
import { formatTime, calculateProgress } from '../utils/timeUtils';

// ** Custom Components
import {
  ProgressBar,
  ProgressText,
  ProgressFill,
  ControlButton,
  PlayPauseButton,
  ProgressContainer,
  ControlsContainer,
  ControlButtonText,
  PlayPauseButtonText,
  MediaPlayerContainer,
} from '../styles/MediaPlayer';

interface MediaPlayerProps {
  audioPlayer: AudioPlayerState;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onRewind: () => void;
  onFastForward: () => void;
  onRepeat: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  audioPlayer,
  onTogglePlayPause,
  onSeek,
  onRewind,
  onFastForward,
  onRepeat,
}) => {
  // Progress Bar
  const handleProgressBarPress = (event: any) => {
    if (!audioPlayer.isLoaded) return;

    let clickX: number;
    let progressBarWidth: number;

    if (Platform.OS === 'web') {
      // Web-specific logic
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      clickX = event.clientX - rect.left;
      progressBarWidth = rect.width;
    } else {
      // React Native logic
      const { locationX, target } = event.nativeEvent;
      clickX = locationX;
      progressBarWidth = target.measure(
        (x: number, y: number, width: number) => {
          progressBarWidth = width;
        },
      );
      // Fallback to a reasonable width if measure fails
      if (!progressBarWidth) progressBarWidth = 200;
    }

    const clickPercentage = clickX / progressBarWidth;
    const newTime = clickPercentage * audioPlayer.totalTime;

    onSeek(newTime);
  };

  return (
    <MediaPlayerContainer>
      <ProgressContainer>
        <ProgressText>{formatTime(audioPlayer.currentTime)}</ProgressText>
        <TouchableOpacity onPress={handleProgressBarPress} activeOpacity={0.8}>
          <ProgressBar>
            <ProgressFill
              progress={
                calculateProgress(
                  audioPlayer.currentTime,
                  audioPlayer.totalTime,
                ) * 100
              }
            />
          </ProgressBar>
        </TouchableOpacity>
        <ProgressText>{formatTime(audioPlayer.totalTime)}</ProgressText>
      </ProgressContainer>

      <ControlsContainer>
        <ControlButton onPress={onRewind} disabled={!audioPlayer.isLoaded}>
          <ControlButtonText>⏪</ControlButtonText>
        </ControlButton>

        <PlayPauseButton
          onPress={onTogglePlayPause}
          disabled={!audioPlayer.isLoaded}
        >
          <PlayPauseButtonText>
            {audioPlayer?.isPlaying ? '⏸️' : '▶️'}
          </PlayPauseButtonText>
        </PlayPauseButton>

        <ControlButton onPress={onFastForward} disabled={!audioPlayer.isLoaded}>
          <ControlButtonText>⏩</ControlButtonText>
        </ControlButton>

        <ControlButton onPress={onRepeat} disabled={!audioPlayer.isLoaded}>
          <ControlButtonText>🔁</ControlButtonText>
        </ControlButton>
      </ControlsContainer>
    </MediaPlayerContainer>
  );
};

export default MediaPlayer;
