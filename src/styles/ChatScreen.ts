import styled from 'styled-components/native';
import { colors, spacing } from '../@core/infrustructure/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${colors.background.primary};
`;

export const ChatContainer = styled.View`
  padding-horizontal: ${spacing.md}px;
  padding-vertical: ${spacing.sm}px;
  min-height: 100px;
  background-color: ${colors.background.secondary};
`;
