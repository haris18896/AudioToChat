import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Utils
import { useUnifiedAudioPlayer } from '../hooks/useUnifiedAudioPlayer';

// Custom Components
import Message from './Message';
import MediaPlayer from './MediaPlayer';
import { Container, ChatContainer } from '../styles/ChatScreen';

// Data
import transcriptionData from '../assets/json/example_audio.json';
import { isWeb } from '../utils/responsive';

const ChatScreen: React.FC = () => {
  // Audio file path
  const audioUri = isWeb
    ? '/assets/audio/example_audio.mp3'
    : 'https://file.notion.so/f/f/24407104-f114-40ec-91ac-25f0ac0ac7a6/66b62104-67d0-48a9-956a-2534f0c1f52a/example_audio.mp3?table=block&id=2332fabc-bb3f-8008-9a1b-f5f2f0b3e847&spaceId=24407104-f114-40ec-91ac-25f0ac0ac7a6&expirationTimestamp=1756375200000&signature=M503SoQhWRf8uv5LIL-PIwkNZC5VFTkAu6DwkZOUVdg&downloadName=example_audio.mp3';

  const {
    audioPlayer,
    messages,
    togglePlayPause,
    rewind,
    fastForward,
    repeat,
    // Video-specific props
    videoRef,
    onLoad,
    onProgress,
    onError,
    onEnd,
  } = useUnifiedAudioPlayer(audioUri, transcriptionData);

  // Memoize platform-specific content to prevent unnecessary re-renders
  const webContent = useMemo(
    () => (
      <View style={styles.webContentContainer}>
        <ChatContainer>
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </ChatContainer>
      </View>
    ),
    [messages],
  );

  const mobileContent = useMemo(
    () => (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.mobileContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ChatContainer>
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </ChatContainer>
      </ScrollView>
    ),
    [messages],
  );

  return (
    <Container>
      {isWeb ? webContent : mobileContent}

      <MediaPlayer
        audioPlayer={audioPlayer}
        onTogglePlayPause={togglePlayPause}
        onRewind={rewind}
        onFastForward={fastForward}
        onRepeat={repeat}
        // Video-specific props
        audioUri={audioUri}
        videoRef={videoRef}
        onLoad={onLoad}
        onProgress={onProgress}
        onError={onError}
        onEnd={onEnd}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileContentContainer: {
    flexGrow: 1,
  },
  webContentContainer: {
    overflow: 'scroll' as any,
    flexGrow: 1,
    paddingBottom: 20,
    minHeight: 600,
  },
});

export default ChatScreen;
