import { ThemeConfig, ThemeColors, SpacingScale, TypographyScale, AnimationConfig } from '../types/theme';

// Common spacing scales
const compactSpacing: SpacingScale = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  xxl: '1.5rem',
};

const normalSpacing: SpacingScale = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '2.5rem',
};

const comfortableSpacing: SpacingScale = {
  xs: '0.75rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '2.5rem',
  xxl: '3rem',
};

// Common typography scale
const typography: TypographyScale = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Common animation configuration
const animations: AnimationConfig = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#0078d4',
  secondary: '#6c757d',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  success: '#198754',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#0dcaf0',
  // Chat-specific colors
  userMessage: '#0078d4',
  botMessage: '#f1f3f4',
  userMessageText: '#ffffff',
  botMessageText: '#212529',
  inputBackground: '#ffffff',
  inputBorder: '#ced4da',
  headerBackground: '#f8f9fa',
  statusOnline: '#198754',
  statusOffline: '#dc3545',
  statusConnecting: '#ffc107',
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#4fc3f7',
  secondary: '#9e9e9e',
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#404040',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  // Chat-specific colors
  userMessage: '#4fc3f7',
  botMessage: '#3a3a3a',
  userMessageText: '#000000',
  botMessageText: '#ffffff',
  inputBackground: '#2d2d2d',
  inputBorder: '#555555',
  headerBackground: '#2d2d2d',
  statusOnline: '#4caf50',
  statusOffline: '#f44336',
  statusConnecting: '#ff9800',
};

// Create theme configurations
export const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: lightColors,
  spacing: {
    compact: compactSpacing,
    normal: normalSpacing,
    comfortable: comfortableSpacing,
  },
  typography,
  animations,
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

export const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: darkColors,
  spacing: {
    compact: compactSpacing,
    normal: normalSpacing,
    comfortable: comfortableSpacing,
  },
  typography,
  animations,
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;