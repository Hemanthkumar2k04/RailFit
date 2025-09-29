import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

interface ScreenDimensions {
  width: number;
  height: number;
}

interface ResponsiveData {
  screenData: ScreenDimensions;
  isTablet: boolean;
  isLandscape: boolean;
  isWeb: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

export const useResponsive = (): ResponsiveData => {
  const [screenData, setScreenData] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;
  const isWeb = Platform.OS === 'web';
  
  // Responsive breakpoints
  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  return {
    screenData,
    isTablet,
    isLandscape,
    isWeb,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
  };
};

export const getResponsiveValue = <T>(
  small: T,
  medium?: T,
  large?: T
): T => {
  const { isSmallScreen, isMediumScreen, isLargeScreen } = useResponsive();
  
  if (isLargeScreen && large !== undefined) return large;
  if (isMediumScreen && medium !== undefined) return medium;
  return small;
};