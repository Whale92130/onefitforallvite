// colors.ts
export type ThemeName = 'light' | 'dark' | 'goodBoy' | 'CCA' | 'spring' | 'summer' | 'winter' | 'autumn' | 'mrhare' | 'nether' | 'midnight' | 'america' | 'enderpearl';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  button: string;
  buttonHighlight: string;
}

// Export your raw themes map
export const themes = {
  light: {
    primary: '#D8D8EB',
    secondary: '#7A7AA3',
    background: '#ffffff',
    textPrimary: '#000000',
    textSecondary: '#FFFFFF', // Consider if textSecondary should be dark for a light theme
    button: '#007FFF',
    buttonHighlight: '#4691DC',
  },
  dark: {
    primary: "#23232e",
    secondary: "#7A7AA3",
    background: "#101426",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000", // Consider if textSecondary should be light for a dark theme
    button: "#004488",
    buttonHighlight: "#002244",
  },
  goodBoy: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  CCA: { // Note: Identical to dark
    primary: "#b50202",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFF",
    button: "#424242",
    buttonHighlight: "#7d7d7d",
  },
  spring: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  summer: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  winter: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  autumn: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  mrhare: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  nether: { // Note: Identical to dark
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },midnight: { // HELLA black
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },america: { // Red white and blue
    primary: "#c90000",
    secondary: "#1e00ff",
    background: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#ffffff",
    button: "#b5231f",
    buttonHighlight: "#ed3934",
  },enderpearl: { // Purple
    primary: "#1d0236",
    secondary: "#3c0b8f",
    background: "#120030",
    textPrimary: "#FFFFFF",
    textSecondary: "#8f8f8f",
    button: "#5c3987",
    buttonHighlight: "#a564f5",
  }
} as const; // 'as const' is great here!

// The global currentTheme, Colors proxy, and switchTheme are removed
// as their functionality is handled by ThemeProvider and useTheme.