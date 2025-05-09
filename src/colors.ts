type ThemeName = 'light' | 'dark' | 'goodBoy' | 'CCA';

let currentTheme: ThemeName = 'light';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  button: string;
  buttonHighlight: string;
}

const themes = {
  light: {
    primary: '#D8D8EB',      // light purple
    secondary: '#7A7AA3',    // dark purple
    background: '#ffffff',   // white
    textPrimary: '#000000',  // black
    textSecondary: '#FFFFFF',  // white
    button: '#007FFF', // blue
    buttonHighlight: '#4691DC', // dark blue
  },
  dark: {
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  goodBoy: {
    primary: "#222222",
    secondary: "#555555",
    background: "#000000",
    textPrimary: "#FFFFFF",
    textSecondary: "#000000",
    button: "#004488",
    buttonHighlight: "#002244",
  },
  CCA: {    primary: "#222222",
        secondary: "#555555",
        background: "#000000",
        textPrimary: "#FFFFFF",
        textSecondary: "#000000",
        button: "#004488",
        buttonHighlight: "#002244",},
}as const;



export const Colors = new Proxy<Theme>(themes.light, {
  get: (target, property) => {
    return themes[currentTheme][property as keyof Theme] || target[property as keyof Theme];
  },
});

export const switchTheme = (themeName: ThemeName) => {
  currentTheme = themeName
};