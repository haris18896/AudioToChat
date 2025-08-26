import styled from 'styled-components/native';
import {
  colors,
  spacing,
  shadows,
  typography,
  borderRadius,
} from '../@core/infrustructure/theme';

export const MessageContainer = styled.View<{ align: 'left' | 'right' }>`
  margin-vertical: ${spacing.xs}px;
  align-items: ${({ align }) => (align === 'left' ? 'flex-start' : 'flex-end')};
  max-width: 80%;
  align-self: ${({ align }) => (align === 'left' ? 'flex-start' : 'flex-end')};
`;

export const SenderName = styled.Text<{ sender: 'john' | 'jack' }>`
  font-size: ${typography.fontSize.sm}px;
  font-weight: ${typography.fontWeight.medium};
  color: ${({ sender }) =>
    sender === 'john' ? colors.chat.john : colors.chat.jack};
  margin-bottom: ${spacing.xs}px;
`;

export const MessageBubble = styled.View<{
  sender: 'john' | 'jack';
  isHighlighted?: boolean;
  isSuggested?: boolean;
  isCurrent?: boolean;
}>`
  background-color: ${({ isHighlighted, isSuggested, isCurrent }) => {
    if (isCurrent) return colors.chat.messageHighlight;
    if (isSuggested) return colors.chat.messageHighlight;
    if (isHighlighted) return colors.chat.messageHighlight;
    return colors.chat.messageBg;
  }};
  padding-horizontal: ${spacing.md}px;
  padding-vertical: ${spacing.sm}px;
  border-radius: ${borderRadius.lg}px;
  border-width: 2px;
  border-color: ${({ sender, isCurrent }) => {
    if (isCurrent) return colors.primary.main;
    return sender === 'john' ? colors.chat.john : colors.chat.jack;
  }};
  ${shadows.sm}
`;

export const MessageText = styled.Text<{
  sender: 'john' | 'jack';
  isCurrent?: boolean;
}>`
  font-size: ${typography.fontSize.md}px;
  font-weight: ${typography.fontWeight.normal};
  color: ${colors.text.primary};
  line-height: ${typography.lineHeight.normal * typography.fontSize.md}px;
`;
