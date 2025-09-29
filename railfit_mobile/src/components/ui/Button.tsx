import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ModernButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Spacing.borderRadius.lg,
      ...Spacing.shadow.sm,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        minHeight: 36,
      },
      md: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        minHeight: 48,
      },
      lg: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? Colors.textDisabled : Colors.accent.main,
      },
      secondary: {
        backgroundColor: disabled ? Colors.textDisabled : Colors.secondary.main,
      },
      outline: {
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: disabled ? Colors.textDisabled : Colors.accent.main,
        ...Spacing.shadow.none,
      },
      ghost: {
        backgroundColor: 'transparent',
        ...Spacing.shadow.none,
      },
      destructive: {
        backgroundColor: disabled ? Colors.textDisabled : Colors.error,
      },
    };

    const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...widthStyle,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...Typography.textStyles.button,
      textAlign: 'center',
    };

    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      sm: Typography.textStyles.buttonSmall,
      md: Typography.textStyles.button,
      lg: { ...Typography.textStyles.button, fontSize: 18 },
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: Colors.textInverse },
      secondary: { color: Colors.textInverse },
      outline: { color: disabled ? Colors.textDisabled : Colors.accent.main },
      ghost: { color: disabled ? Colors.textDisabled : Colors.accent.main },
      destructive: { color: Colors.textInverse },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.accent.main : Colors.textInverse}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              getTextStyle(),
              textStyle,
              leftIcon ? { marginLeft: 8 } : undefined,
              rightIcon ? { marginRight: 8 } : undefined,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}