import styled from 'styled-components/native';
import {
  colors,
  spacing,
  shadows,
  typography,
  borderRadius,
} from '../@core/infrustructure/theme';

export const MessageContainer = styled.View<{ align: 'left' | 'right' }>`
  margin-vertical: ${spacing.sm}px;
  align-items: ${({ align }) => (align === 'left' ? 'flex-start' : 'flex-end')};
  max-width: 85%;
  align-self: ${({ align }) => (align === 'left' ? 'flex-start' : 'flex-end')};
  width: 100%;
`;

export const SenderName = styled.Text<{ sender: 'john' | 'jack' }>`
  font-size: ${typography.fontSize.sm}px;
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs}px;
  margin-left: ${spacing.xs}px;
`;

export const MessageBubble = styled.View<{
  sender: 'john' | 'jack';
  isHighlighted?: boolean;
  isSuggested?: boolean;
  isCurrent?: boolean;
}>`
  background-color: ${({ isHighlighted, isSuggested, isCurrent }) => {
    if (isCurrent) return colors.secondary.light;
    if (isSuggested) return colors.secondary.light;
    if (isHighlighted) return colors.secondary.light;
    return colors.background.primary;
  }};
  padding-horizontal: ${spacing.md}px;
  padding-vertical: ${spacing.md}px;
  border-radius: ${borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ isCurrent }) => {
    if (isCurrent) return colors.secondary.main;
    return colors.border.light;
  }};
  ${shadows.sm}
  max-width: 280px;
  min-height: 44px;
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
