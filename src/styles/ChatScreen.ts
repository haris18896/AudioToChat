import styled from 'styled-components/native';
import { colors, spacing } from '../@core/infrustructure/theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${colors.background.secondary};
`;

export const ChatContainer = styled.View`
  flex: 1;
  padding-horizontal: ${spacing.md}px;
  padding-vertical: ${spacing.md}px;
`;
