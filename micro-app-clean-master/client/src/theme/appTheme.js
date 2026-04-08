import { createTheme } from "@mui/material/styles";

const brand = {
  darkest: "#0a1628",
  dark: "#0f2744",
  main: "#1565c0",
  light: "#42a5f5",
  accent: "#00bcd4",
  gold: "#ffc107",
  surface: "#f0f4f8",
};

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: brand.main, dark: brand.dark, contrastText: "#fff" },
    secondary: { main: brand.accent, contrastText: "#0a1628" },
    background: {
      default: brand.surface,
      paper: "#ffffff",
    },
    text: {
      primary: "#0d2137",
      secondary: "#546e7a",
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

export { brand };
