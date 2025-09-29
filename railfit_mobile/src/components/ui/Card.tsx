import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof Spacing.padding;
  margin?: keyof typeof Spacing.margin;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function ModernCard({
  children,
  variant = 'default',
  padding = 'lg',
  margin = 'md',
  style,
  onPress,
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Spacing.borderRadius.xl,
      padding: Spacing.padding[padding],
      marginBottom: Spacing.margin[margin],
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: Colors.surface,
        ...Spacing.shadow.md,
        shadowColor: Colors.shadowColor,
      },
      elevated: {
        backgroundColor: Colors.surfaceElevated,
        ...Spacing.shadow.lg,
        shadowColor: Colors.shadowColor,
      },
      outlined: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Spacing.shadow.none,
      },
      ghost: {
        backgroundColor: 'transparent',
        ...Spacing.shadow.none,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const CardComponent = onPress ? 
    require('react-native').TouchableOpacity : 
    View;

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  // Additional styles if needed
});