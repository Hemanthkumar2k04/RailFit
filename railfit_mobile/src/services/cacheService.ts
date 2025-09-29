// Modern Spacing System
export const Spacing = {
  // Base spacing unit (4px) - allows for consistent scaling
  unit: 4,
  
  // Spacing scale - 4px base unit
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 12,     // 12px
  base: 16,   // 16px (default)
  lg: 20,     // 20px
  xl: 24,     // 24px
  '2xl': 32,  // 32px
  '3xl': 40,  // 40px
  '4xl': 48,  // 48px
  '5xl': 64,  // 64px
  '6xl': 80,  // 80px
  
  // Common spacing patterns
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Component-specific spacing
  component: {
    // Cards and containers
    cardPadding: 20,
    cardMargin: 16,
    cardGap: 12,
    
    // Buttons
    buttonPaddingVertical: 16,
    buttonPaddingHorizontal: 24,
    buttonMargin: 8,
    
    // Input fields
    inputPadding: 16,
    inputMargin: 12,
    
    // Navigation
    tabBarHeight: 60,
    headerHeight: 56,
    bottomTabHeight: 84,
    
    // Screen padding
    screenPadding: 20,
    screenPaddingHorizontal: 20,
    screenPaddingVertical: 16,
    
    // List items
    listItemPadding: 16,
    listItemMargin: 8,
    
    // Section spacing
    sectionMarginBottom: 32,
    sectionPadding: 20,
  },
  
  // Border radius for modern look
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999, // Fully rounded
  },
  
  // Shadow and elevation
  shadow: {
    none: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export default Spacing;