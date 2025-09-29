import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

const { width } = Dimensions.get('window');

export interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  focusedIcon?: keyof typeof Ionicons.glyphMap;
}

interface EnhancedTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number, tabName: string) => void;
}

export default function EnhancedTabBar({
  tabs,
  activeIndex,
  onTabPress,
}: EnhancedTabBarProps) {
  const tabWidth = width / tabs.length;
  
  // Animation values for each tab
  const scaleAnimations = useRef(
    tabs.map(() => new Animated.Value(1))
  ).current;
  
  const bounceAnimations = useRef(
    tabs.map(() => new Animated.Value(0))
  ).current;
  
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(tabWidth * 0.6)).current;

  // Animate when active index changes
  useEffect(() => {
    // Reset all scales and positions
    scaleAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === activeIndex ? 1.15 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    });

    // Bounce animation for active tab
    if (bounceAnimations[activeIndex]) {
      Animated.sequence([
        Animated.spring(bounceAnimations[activeIndex], {
          toValue: -6,
          useNativeDriver: true,
          tension: 400,
          friction: 8,
        }),
        Animated.spring(bounceAnimations[activeIndex], {
          toValue: 0,
          useNativeDriver: true,
          tension: 400,
          friction: 8,
        }),
      ]).start();
    }

    // Reset non-active bounces
    bounceAnimations.forEach((anim, index) => {
      if (index !== activeIndex) {
        Animated.spring(anim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
      }
    });

    // Animate indicator
    const newPosition = activeIndex * tabWidth + tabWidth * 0.2;
    Animated.parallel([
      Animated.spring(indicatorPosition, {
        toValue: newPosition,
        useNativeDriver: false,
        tension: 300,
        friction: 25,
      }),
      Animated.spring(indicatorWidth, {
        toValue: tabWidth * 0.6,
        useNativeDriver: false,
        tension: 300,
        friction: 25,
      }),
    ]).start();
  }, [activeIndex]);

  const handleTabPress = (index: number) => {
    // Immediate scale feedback
    Animated.sequence([
      Animated.spring(scaleAnimations[index], {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
      Animated.spring(scaleAnimations[index], {
        toValue: 1.15,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
    ]).start();

    onTabPress(index, tabs[index].name);
  };

  return (
    <View style={styles.container}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            left: indicatorPosition,
            width: indicatorWidth,
          },
        ]}
      />

      {/* Tab items */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const iconName = isActive && tab.focusedIcon ? tab.focusedIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [
                      { scale: scaleAnimations[index] },
                      { translateY: bounceAnimations[index] },
                    ],
                  },
                ]}
              >
                {/* Icon background for active state */}
                <View
                  style={[
                    styles.iconContainer,
                    isActive && {
                      backgroundColor: `${Colors.accent}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isActive ? Colors.accent.main : Colors.textSecondary}
                  />
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? Colors.accent.main : Colors.textSecondary,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {tab.label}
                </Text>

                {/* Active dot indicator */}
                {isActive && (
                  <Animated.View
                    style={[
                      styles.activeDot,
                      { backgroundColor: Colors.accent.main },
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm + 10,
    ...Spacing.shadow.lg,
    shadowColor: Colors.shadowColor,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    backgroundColor: Colors.accent.main,
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    minHeight: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.textStyles.labelSmall,
    textAlign: 'center',
    lineHeight: 14,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.xs / 2,
    position: 'absolute',
    bottom: -8,
  },
});