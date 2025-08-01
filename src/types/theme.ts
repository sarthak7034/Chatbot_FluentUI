export type ThemeMode = 'light' | 'dark' | 'auto';

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface TypographyScale {
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  // Chat-specific colors
  userMessage: string;
  botMessage: string;
  userMessageText: string;
  botMessageText: string;
  inputBackground: string;
  inputBorder: string;
  headerBackground: string;
  statusOnline: string;
  statusOffline: string;
  statusConnecting: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: {
    compact: SpacingScale;
    normal: SpacingScale;
    comfortable: SpacingScale;
  };
  typography: TypographyScale;
  animations: AnimationConfig;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isSystemDark: boolean;
  effectiveTheme: 'light' | 'dark';
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}