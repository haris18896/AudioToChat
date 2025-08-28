import React, { useRef, useEffect, memo } from 'react';
import { Animated } from 'react-native';

// ** Types
import { ChatMessage } from '../types/chat';

// ** Custom Components
import {
  SenderName,
  MessageText,
  MessageBubble,
  MessageContainer,
} from '../styles/Message';
import { isWeb } from '../utils/responsive';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = memo(({ message }) => {
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
        useNativeDriver: !isWeb,
      }).start();

      // Add subtle pulse effect
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: !isWeb,
          }),
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: !isWeb,
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
        useNativeDriver: !isWeb,
      }).start();
    }
  }, [message.isCurrent, highlightAnim]);

  // Animation Styles
  const animationStyles = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
  };

  return (
    <Animated.View style={[animationStyles]}>
      <MessageContainer align={align}>
        <SenderName
          isCurrent={message.isCurrent}
          isHighlighted={message.isHighlighted}
          sender={message.sender}
        >
          {senderName}
        </SenderName>
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
  );
});

export default Message;
