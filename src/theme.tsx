import { hexToRgb } from "@opentui/core";
import { createContext, useContext, type ParentProps } from "solid-js";

export const themes = {
  dark: {
    base100: hexToRgb("#1d232a"),
    base200: hexToRgb("#191e24"),
    base300: hexToRgb("#15191e"),
    baseContent: hexToRgb("#ecf9ff"),
    primary: hexToRgb("#605dff"),
    primaryContent: hexToRgb("#edf1fe"),
    secondary: hexToRgb("#f43098"),
    secondaryContent: hexToRgb("#f9e4f0"),
    accent: hexToRgb("#00d3bb"),
    accentContent: hexToRgb("#084d49"),
    neutral: hexToRgb("#09090b"),
    neutralContent: hexToRgb("#e4e4e7"),
    info: hexToRgb("#00bafe"),
    infoContent: hexToRgb("#042e49"),
    success: hexToRgb("#00d390"),
    successContent: hexToRgb("#004c39"),
    warning: hexToRgb("#fcb700"),
    warningContent: hexToRgb("#793205"),
    error: hexToRgb("#ff627d"),
    errorContent: hexToRgb("#4d0218"),
  },
} as const;

export const themeContext = createContext(themes.dark);

export function ThemeContextProvider(props: ParentProps) {
  return (
    <themeContext.Provider value={themes.dark}>
      {props.children}
    </themeContext.Provider>
  );
}

export const useTheme = () => useContext(themeContext);
