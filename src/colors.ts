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
  goodBoy: { // Why do we even have ts
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  CCA: { // Red and black
    primary: "#b50202",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFF",
    button: "#424242",
    buttonHighlight: "#7d7d7d",
  },
  spring: { // Pink and green
    primary: "#7bdb74",
    secondary: "#f79ef4",
    background: "#f7e9f6",
    textPrimary: "#000000",
    textSecondary: "#FFFFFF",
    button: "#f79ef4",
    buttonHighlight: "#f7cbf6",
  },
  summer: { // Yellow and blue :)
    primary: "#ffe600",
    secondary: "#00f8fc",
    background: "#d1feff",
    textPrimary: "#000000",
    textSecondary: "#FFFFFF",
    button: "#00f8fc",
    buttonHighlight: "#002244",
  },
  winter: { // Blues and whites
    primary: "#91b7ba",
    secondary: "#001ab0",
    background: "#dbfcff",
    textPrimary: "#000000",
    textSecondary: "#FFFFFF",
    button: "#23307d",
    buttonHighlight: "#002244",
  },
  autumn: { // Dark reds and oranges
    primary: "#a31d0b",
    secondary: "#f28374",
    background: "#f5c3bc",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#f28374",
    buttonHighlight: "#f5c3bc",
  },
  mrhare: { // Piss yellow
    primary: "#fbff00",
    secondary: "#f3f576",
    background: "#FFFFFF",
    textPrimary: "#000000",
    textSecondary: "#000000",
    button: "#f3f576",
    buttonHighlight: "#002244",
  },
  nether: { // Orange and red
    primary: "#ff6600",
    secondary: "#ff0000",
    background: "#690f0e",
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFFF",
    button: "#ff0000",
    buttonHighlight: "#002244",
  },midnight: { // HELLA black
    primary: "#181c24",
    secondary: "#2b313d",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFF",
    button: "#2b313d",
    buttonHighlight: "#002244",
  },america: { // Red white and blue
    primary: "#e30505",
    secondary: "#0808d4",
    background: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#ffffff",
    button: "#0808d4",
    buttonHighlight: "#ed3934",
  },enderpearl: { // Purple
    primary: "#6202bd",
    secondary: "#8c53c2",
    background: "#1a072b",
    textPrimary: "#FFFFFF",
    textSecondary: "#8f8f8f",
    button: "#8c53c2",
    buttonHighlight: "#a564f5",
  }
} as const; // 'as const' is great here!

// The global currentTheme, Colors proxy, and switchTheme are removed
// as their functionality is handled by ThemeProvider and useTheme.