import { Dimensions, Platform } from 'react-native';
import { breakpoints } from '../@core/infrustructure/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ** Platforms
export const isIOS = Platform.OS === 'ios';
export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';

export const getScreenWidth = () => screenWidth;
export const getScreenHeight = () => screenHeight;

export const isMobile = () => screenWidth < breakpoints.tablet;
export const isTablet = () =>
  screenWidth >= breakpoints.tablet && screenWidth < breakpoints.desktop;
export const isDesktop = () => screenWidth >= breakpoints.desktop;

export const getResponsiveValue = <T>(mobile: T, tablet: T, desktop: T): T => {
  if (isMobile()) return mobile;
  if (isTablet()) return tablet;
  return desktop;
};

export const getResponsiveSpacing = (multiplier: number) => {
  const baseSpacing = 4;
  return baseSpacing * multiplier;
};

export const getResponsiveFontSize = (baseSize: number) => {
  if (isMobile()) return baseSize;
  if (isTablet()) return baseSize * 1.1;
  return baseSize * 1.2;
};

export const getResponsivePadding = () => {
  if (isMobile()) return 16;
  if (isTablet()) return 24;
  return 32;
};

export const getResponsiveMargin = () => {
  if (isMobile()) return 12;
  if (isTablet()) return 18;
  return 24;
};

export const getResponsiveBorderRadius = () => {
  if (isMobile()) return 8;
  if (isTablet()) return 12;
  return 16;
};

export const getResponsiveShadow = () => {
  if (isMobile()) return 'sm';
  if (isTablet()) return 'md';
  return 'lg';
};

export const getResponsiveMaxWidth = () => {
  if (isMobile()) return '100%';
  if (isTablet()) return '600px';
  return '800px';
};

export const getResponsiveGap = () => {
  if (isMobile()) return 12;
  if (isTablet()) return 16;
  return 20;
};

export const getResponsiveIconSize = (baseSize: number) => {
  if (isMobile()) return baseSize;
  if (isTablet()) return baseSize * 1.15;
  return baseSize * 1.3;
};
