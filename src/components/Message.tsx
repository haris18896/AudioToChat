import React, { useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';

// ** Types
import { ChatMessage } from '../types/chat';

// ** Custom Components
import {
  SenderName,
  MessageText,
  MessageBubble,
  MessageContainer,
} from '../styles/Message';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const align = message.sender === 'john' ? 'left' : 'right';
  const senderName = message.sender === 'john' ? 'John' : 'Jack';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set initial values without animation for immediate visibility
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    scaleAnim.setValue(1);
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (message.isCurrent) {
      // Start highlight animation
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // Add subtle pulse effect
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      );
      pulseAnimation.start();

      // Store the pulse animation for cleanup
      return () => {
        pulseAnimation.stop();
      };
    } else {
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [message.isCurrent, highlightAnim]);

  // Animation Styles
  const animationStyles = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
  };

  const highlightStyles = {
    shadowOpacity: highlightAnim,
  };

  return (
    <Animated.View style={[animationStyles]}>
      <Animated.View style={highlightStyles}>
        <MessageContainer align={align}>
          <SenderName sender={message.sender}>{senderName}</SenderName>
          <MessageBubble
            sender={message.sender}
            isHighlighted={message.isHighlighted}
            isSuggested={message.isSuggested}
            isCurrent={message.isCurrent}
          >
            <MessageText sender={message.sender} isCurrent={message.isCurrent}>
              {message.text}
            </MessageText>
          </MessageBubble>
        </MessageContainer>
      </Animated.View>
    </Animated.View>
  );
};

export default Message;
