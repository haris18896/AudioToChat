import React from 'react';

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
  onRewind,
  onFastForward,
  onRepeat,
}) => {
  return (
    <MediaPlayerContainer>
      <ProgressContainer>
        <ProgressText>{formatTime(audioPlayer.currentTime)}</ProgressText>

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
