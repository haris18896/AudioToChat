import React, { useCallback, useState, useEffect } from 'react';
import { ScrollView, Platform, StyleSheet } from 'react-native';

// ** Utils
import { useAudioPlayer } from '../hooks/useAudioPlayer';

// ** Custom Components
import Message from './Message';
import MediaPlayer from './MediaPlayer';
import { Container, ChatContainer } from '../styles/ChatScreen';

// ** Data
import transcriptionData from '../assets/json/example_audio.json';

const ChatScreen: React.FC = () => {
  const [newlyVisibleMessages, setNewlyVisibleMessages] = useState<Set<string>>(
    new Set(),
  );

  const [previousVisibleCount, setPreviousVisibleCount] = useState(0);

  // Audio file path - This can be get via an API call
  const audioUri =
    Platform.OS === 'web'
      ? '/asset/audio/example_audio.mp3'
      : 'https://file.notion.so/f/f/24407104-f114-40ec-91ac-25f0ac0ac7a6/66b62104-67d0-48a9-956a-2534f0c1f52a/example_audio.mp3?table=block&id=2332fabc-bb3f-8008-9a1b-f5f2f0b3e847&spaceId=24407104-f114-40ec-91ac-25f0ac0ac7a6&expirationTimestamp=1756209600000&signature=BUsDtkA4IX3dWErueU_JKORHJ1U594odOEgctcTzrIs&downloadName=example_audio.mp3';

  const audioPlayerHook = useAudioPlayer;

  const {
    audioPlayer,
    messages,
    togglePlayPause,
    seekTo,
    rewind,
    fastForward,
    repeat,
  } = audioPlayerHook(audioUri, transcriptionData);

  // Track newly visible messages for animations
  useEffect(() => {
    if (messages.length > previousVisibleCount) {
      const newMessages = messages.slice(previousVisibleCount);
      const newMessageIds = new Set(newMessages.map(msg => msg.id));
      setNewlyVisibleMessages(newMessageIds);

      // Clear the "new" status after animation
      setTimeout(() => {
        setNewlyVisibleMessages(prev => {
          const updated = new Set(prev);
          newMessageIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 600); // Slightly longer than animation duration

      setPreviousVisibleCount(messages.length);
    }
  }, [messages, previousVisibleCount]);

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
        <div style={styles.webContentContainer}>
          <ChatContainer>
            {messages.map(message => (
              <Message
                key={message.id}
                message={message}
                isNew={newlyVisibleMessages.has(message.id)}
              />
            ))}
          </ChatContainer>
        </div>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.mobileContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ChatContainer>
            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isNew={newlyVisibleMessages.has(message.id)}
                delay={newlyVisibleMessages.has(message.id) ? index * 50 : 0} // Staggered delay
              />
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
    paddingBottom: 20,
  },
  webContentContainer: {
    overflow: 'scroll',
    flexGrow: 1,
    paddingBottom: 20,
    minHeight: 600,
  },
});

export default ChatScreen;
