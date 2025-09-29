import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';

const { width } = Dimensions.get('window');

export interface InteractiveMenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  onItemPress?: (index: number, item: InteractiveMenuItem) => void;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Assets', icon: 'cube' },
  { label: 'Scanner', icon: 'qr-code' },
  { label: 'Analytics', icon: 'bar-chart' },
  { label: 'Settings', icon: 'settings' },
];

export default function InteractiveMenu({
  items = defaultItems,
  accentColor = Colors.accent.main,
  onItemPress,
}: InteractiveMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  
  // Animation values
  const scaleValues = useRef(items.map(() => new Animated.Value(1))).current;
  const bounceValues = useRef(items.map(() => new Animated.Value(0))).current;
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  // Update animation values when items change
  useEffect(() => {
    if (scaleValues.length !== items.length) {
      scaleValues.splice(0);
      bounceValues.splice(0);
      items.forEach(() => {
        scaleValues.push(new Animated.Value(1));
        bounceValues.push(new Animated.Value(0));
      });
    }
  }, [items]);

  // Animate to active item
  useEffect(() => {
    // Reset all scales
    scaleValues.forEach((scale, index) => {
      Animated.spring(scale, {
        toValue: index === activeIndex ? 1.1 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    });

    // Bounce animation for active icon
    if (bounceValues[activeIndex]) {
      Animated.sequence([
        Animated.spring(bounceValues[activeIndex], {
          toValue: -8,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
        Animated.spring(bounceValues[activeIndex], {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
      ]).start();
    }

    // Animate underline
    if (itemWidths.length > 0) {
      const itemWidth = width / items.length;
      const newPosition = activeIndex * itemWidth + (itemWidth - itemWidths[activeIndex]) / 2;
      
      Animated.parallel([
        Animated.spring(underlinePosition, {
          toValue: newPosition,
          useNativeDriver: false,
          tension: 300,
          friction: 25,
        }),
        Animated.spring(underlineWidth, {
          toValue: itemWidths[activeIndex] || 60,
          useNativeDriver: false,
          tension: 300,
          friction: 25,
        }),
      ]).start();
    }
  }, [activeIndex, itemWidths]);

  const handleItemPress = (index: number) => {
    setActiveIndex(index);
    onItemPress?.(index, items[index]);
    items[index].onPress?.();
  };

  const handleTextLayout = (event: LayoutChangeEvent, index: number) => {
    const { width: textWidth } = event.nativeEvent.layout;
    setItemWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = textWidth;
      return newWidths;
    });
  };

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          
          return (
            <TouchableOpacity
              key={`${item.label}-${index}`}
              style={styles.menuItem}
              onPress={() => handleItemPress(index)}
              activeOpacity={0.7}
            >
              {/* Icon with bounce animation */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      { scale: scaleValues[index] },
                      { translateY: bounceValues[index] },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBackground,
                    {
                      backgroundColor: isActive ? accentColor : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={isActive ? Colors.surface : Colors.textSecondary}
                  />
                </View>
              </Animated.View>

              {/* Label with layout measurement */}
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? accentColor : Colors.textSecondary,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
                onLayout={(event) => handleTextLayout(event, index)}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Animated underline */}
      <Animated.View
        style={[
          styles.underline,
          {
            backgroundColor: accentColor,
            left: underlinePosition,
            width: underlineWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    ...Spacing.shadow.md,
    shadowColor: Colors.shadowColor,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    minHeight: 60,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    marginBottom: Spacing.xs,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...Typography.textStyles.labelSmall,
    textAlign: 'center',
  },
  underline: {
    height: 3,
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
});