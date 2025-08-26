import styled from 'styled-components/native';
import {
  colors,
  spacing,
  shadows,
  borderRadius,
} from '../@core/infrustructure/theme';

export const MediaPlayerContainer = styled.View`
  background-color: ${colors.background.primary};
  padding: ${spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${colors.border.light};
  ${shadows.lg}
`;

export const ControlsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${spacing.md}px;
  min-height: 80px;
  padding-vertical: 10px;
  width: 100%;
`;
export const PlayPauseButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ disabled }: { disabled?: boolean }) =>
    disabled ? colors.border.light : colors.primary.main};
  width: 60px;
  height: 60px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-horizontal: 20px;
  opacity: ${({ disabled }: { disabled?: boolean }) => (disabled ? 0.5 : 1)};
  border-width: 2px;
  border-color: ${({ disabled }: { disabled?: boolean }) =>
    disabled ? colors.border.medium : colors.primary.main};
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  z-index: 1000;
  min-width: 60px;
  min-height: 60px;
`;

export const ControlButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: 16px;
  font-weight: 500;
`;

export const ProgressContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 20px;
  margin-bottom: 20px;
`;

export const ProgressBar = styled.View`
  height: 6px;
  flex: 1;
  background-color: ${colors.border.medium};
  border-radius: ${borderRadius.round}px;
  margin-horizontal: ${spacing.md}px;
  overflow: hidden;
  border: 1px solid ${colors.border.dark};
`;

export const ProgressFill = styled.View<{ progress: number }>`
  height: 100%;
  width: ${({ progress }: { progress: number }) => progress}%;
  background-color: ${colors.secondary.main};
  border-radius: ${borderRadius.round}px;
`;

export const ProgressText = styled.Text`
  color: ${colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
`;

export const ControlButton = styled.TouchableOpacity<{ isPrimary?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.round}px;
  background-color: ${({ isPrimary }: { isPrimary?: boolean }) =>
    isPrimary ? colors.primary.main : colors.background.primary};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${({ isPrimary }: { isPrimary?: boolean }) =>
    isPrimary ? colors.primary.main : colors.border.medium};
  ${shadows.sm}
`;

export const PlayPauseButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: 24px;
  font-weight: 500;
`;
