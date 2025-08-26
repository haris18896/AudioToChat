import React, { useCallback } from 'react';
import { ScrollView, Platform, StyleSheet, View } from 'react-native';

// ** Utils
import { useAudioPlayer } from '../hooks/useAudioPlayer';

// ** Custom Components
import Message from './Message';
import MediaPlayer from './MediaPlayer';
import { Container, ChatContainer } from '../styles/ChatScreen';

// ** Data
import transcriptionData from '../assets/json/example_audio.json';
import { useWebAudioPlayer } from '../hooks/useWebAudioPlayer';

const ChatScreen: React.FC = () => {
  // Audio file path - This can be get via an API call
  const audioUri =
    Platform.OS === 'web'
      ? '/assets/audio/example_audio.mp3'
      : 'example_audio.mp3'; // Use local bundled audio file for mobile

  const audioPlayerHook =
    Platform.OS === 'web' ? useWebAudioPlayer : useAudioPlayer;

  const {
    audioPlayer,
    messages,
    togglePlayPause,
    seekTo,
    rewind,
    fastForward,
    repeat,
  } = audioPlayerHook(audioUri, transcriptionData);

  const handleTogglePlayPause = useCallback(() => {
    togglePlayPause();
  }, [togglePlayPause]);

  const handleSeek = useCallback(
    (time: number) => {
      seekTo(time);
    },
    [seekTo],
  );

  const handleRewind = useCallback(() => {
    rewind();
  }, [rewind]);

  const handleFastForward = useCallback(() => {
    fastForward();
  }, [fastForward]);

  const handleRepeat = useCallback(() => {
    repeat();
  }, [repeat]);

  return (
    <Container>
      {Platform.OS === 'web' ? (
        <View style={styles.webContentContainer}>
          <ChatContainer>
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
          </ChatContainer>
        </View>
      ) : (
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
      )}

      <MediaPlayer
        audioPlayer={audioPlayer}
        onTogglePlayPause={handleTogglePlayPause}
        onSeek={handleSeek}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        onRepeat={handleRepeat}
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
