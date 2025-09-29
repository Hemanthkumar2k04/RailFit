import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EnhancedTabBar, { TabItem } from './EnhancedTabBar';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface CustomTabNavigatorProps {
  tabs: TabItem[];
  screens: React.ComponentType<any>[];
  initialTab?: number;
}

export default function CustomTabNavigator({
  tabs,
  screens,
  initialTab = 0,
}: CustomTabNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(initialTab);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const handleTabPress = (index: number, tabName: string) => {
    if (index === activeIndex) return;

    // Animate to new tab
    Animated.spring(slideAnimation, {
      toValue: -index * width,
      useNativeDriver: true,
      tension: 300,
      friction: 30,
    }).start();

    setActiveIndex(index);
  };

  const ActiveScreen = screens[activeIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Content */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.screensContainer,
            {
              transform: [{ translateX: slideAnimation }],
            },
          ]}
        >
          {screens.map((Screen, index) => (
            <View key={index} style={styles.screen}>
              <Screen />
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Enhanced Tab Bar */}
      <EnhancedTabBar
        tabs={tabs}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  screensContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  screen: {
    width,
    flex: 1,
  },
});