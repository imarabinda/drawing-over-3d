import createEmotionCache from "@/lib/theme/theme";
import { CacheProvider, EmotionCache } from "@emotion/react";
import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const globalStyles = `

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
body{
  color:white;
  overflow:hidden;
}
canvas {
  outline:none;
}

  .fade-out {
    opacity: 1;
    visibility:visible;
    animation: fade-out 0.5s linear forwards;
  }

  .fade-out-fast {
    opacity: 1;
    visibility:visible;
    animation: fade-out 0.2s linear forwards;
  }
  .fade-in {
    opacity: 0;
    visibility:hidden;
    animation: fade-in 0.3s linear forwards;
  }
  .fade-in-fast {
    opacity: 0;
    visibility:hidden;
    animation: fade-in 0.1s linear forwards;
  }
  @keyframes fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility:hidden;
    }
  }
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
      visibility:visible;
    }
  }


`;

const defaultTheme = createTheme();
export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const clientSideEmotionCache = createEmotionCache();
export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: MyAppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline enableColorScheme />
        <GlobalStyles styles={globalStyles} />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}
