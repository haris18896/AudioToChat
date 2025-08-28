import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';

// Types && Utils
import { AudioPlayerState } from '../types/chat';
import { formatTime, calculateProgress } from '../utils/timeUtils';

// Video Component
let Video: any = null;
if (!isWeb) {
  try {
    Video = require('react-native-video').default;
  } catch (error) {
    console.log('react-native-video not available:', error);
  }
}

// Custom Components
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
  MediaWrapper,
} from '../styles/MediaPlayer';
import { isWeb } from '../utils/responsive';

interface MediaPlayerProps {
  audioPlayer: AudioPlayerState;
  onTogglePlayPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onRepeat: () => void;
  // Video-specific props (native only)
  audioUri?: string;
  videoRef?: any;
  onLoad?: (data: any) => void;
  onProgress?: (data: any) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = memo(
  ({
    audioPlayer,
    onTogglePlayPause,
    onRewind,
    onFastForward,
    onRepeat,
    // Video props
    audioUri,
    videoRef,
    onLoad,
    onProgress,
    onError,
    onEnd,
  }) => {
    // Memoize expensive calculations
    const progressPercentage = useMemo(() => {
      return (
        calculateProgress(audioPlayer.currentTime, audioPlayer.totalTime) * 100
      );
    }, [audioPlayer.currentTime, audioPlayer.totalTime]);

    const formattedCurrentTime = useMemo(() => {
      return formatTime(audioPlayer.currentTime);
    }, [audioPlayer.currentTime]);

    const formattedTotalTime = useMemo(() => {
      return formatTime(audioPlayer.totalTime);
    }, [audioPlayer.totalTime]);

    return (
      <MediaWrapper>
        {!isWeb && Video && audioUri && (
          <Video
            volume={1.0}
            muted={false}
            onEnd={onEnd}
            repeat={false}
            ref={videoRef}
            onLoad={onLoad}
            audioOnly={true}
            onError={onError}
            style={styles.video}
            resizeMode="contain"
            playWhenInactive={true}
            playInBackground={true}
            onProgress={onProgress}
            source={{ uri: audioUri }}
            paused={!audioPlayer.isPlaying}
            rate={audioPlayer.playbackRate}
            progressUpdateInterval={100}
          />
        )}

        {/* Progress Bar */}
        <ProgressBar>
          <ProgressFill progress={progressPercentage} />
        </ProgressBar>

        <MediaPlayerContainer>
          <ProgressContainer>
            <ProgressText>{formattedCurrentTime}</ProgressText>
            <ProgressText>{formattedTotalTime}</ProgressText>
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
                {audioPlayer.isPlaying ? '⏸️' : '▶️'}
              </PlayPauseButtonText>
            </PlayPauseButton>

            <ControlButton
              onPress={onFastForward}
              disabled={!audioPlayer.isLoaded}
            >
              <ControlButtonText>⏩</ControlButtonText>
            </ControlButton>

            <ControlButton onPress={onRepeat} disabled={!audioPlayer.isLoaded}>
              <ControlButtonText>🔁</ControlButtonText>
            </ControlButton>
          </ControlsContainer>
        </MediaPlayerContainer>
      </MediaWrapper>
    );
  },
);

const styles = StyleSheet.create({
  video: {
    height: 0,
  },
});

export default MediaPlayer;
