// Modern Typography System
export const Typography = {
  // Font families
  fontFamily: {
    regular: 'System', // Using system fonts for better performance
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font sizes - Modern scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights for optimal readability
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as any,
    medium: '500' as any,
    semibold: '600' as any,
    bold: '700' as any,
  },
  
  // Letter spacing for refined typography
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
  
  // Predefined text styles for consistency
  textStyles: {
    // Headers
    h1: {
      fontSize: 30,
      fontWeight: '700' as any,
      lineHeight: 1.25,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as any,
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as any,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as any,
      lineHeight: 1.4,
    },
    
    // Body text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as any,
      lineHeight: 1.5,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as any,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as any,
      lineHeight: 1.4,
    },
    
    // Caption and labels
    caption: {
      fontSize: 12,
      fontWeight: '400' as any,
      lineHeight: 1.3,
      letterSpacing: 0.5,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as any,
      lineHeight: 1.3,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500' as any,
      lineHeight: 1.3,
      letterSpacing: 0.5,
    },
    
    // Buttons
    button: {
      fontSize: 16,
      fontWeight: '600' as any,
      lineHeight: 1.2,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as any,
      lineHeight: 1.2,
    },
    
    // Navigation
    tabLabel: {
      fontSize: 12,
      fontWeight: '500' as any,
      lineHeight: 1.2,
      letterSpacing: 0.5,
    },
    navTitle: {
      fontSize: 18,
      fontWeight: '600' as any,
      lineHeight: 1.2,
    },
  },
};

export default Typography;