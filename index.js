/**
 * @format
 */
import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { MD3LightTheme as DefaultTheme, PaperProvider, configureFonts } from 'react-native-paper';
import { BackendurlProvider } from './context/backendUrlContext';
const fontConfig = {
    customVariant: {
      fontFamily: Platform.select({
        web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
        ios: 'System',
        default: 'sans-serif',
      }),
      fontWeight: '400',
      letterSpacing: 0.5,
      lineHeight: 22,
      fontSize: 20,
    }
  };

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        "primary": "rgb(80, 189, 160)",
        "onPrimary": "rgb(255, 255, 255)",
        "primaryContainer": "rgb(240, 219, 255)",
        "onPrimaryContainer": "rgb(44, 0, 81)",
        "secondary": "rgb(156, 159, 164)",
        "onSecondary": "rgb(255, 255, 255)",
        "secondaryContainer": "rgb(237, 221, 246)",
        "onSecondaryContainer": "rgb(33, 24, 42)",
        "tertiary": "rgb(128, 81, 88)",
        "onTertiary": "rgb(255, 255, 255)",
        "tertiaryContainer": "rgb(255, 217, 221)",
        "onTertiaryContainer": "rgb(50, 16, 23)",
        "error": "rgb(255, 140, 144)",
        "onError": "rgb(255, 255, 255)",
        "errorContainer": "rgb(255, 218, 214)",
        "onErrorContainer": "rgb(65, 0, 2)",
        "background": "rgb(244, 245, 250)",
        "onBackground": "rgb(29, 27, 30)",
        "surface": "rgb(255, 251, 255)",
        "onSurface": "rgb(29, 27, 30)",
        "surfaceVariant": "rgb(233, 223, 235)",
        "onSurfaceVariant": "rgb(74, 69, 78)",
        "outline": "rgb(124, 117, 126)",
        "outlineVariant": "rgb(204, 196, 206)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(50, 47, 51)",
        "inverseOnSurface": "rgb(245, 239, 244)",
        "inversePrimary": "rgb(169, 249, 171)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(248, 242, 251)",
            "level2": "rgb(244, 236, 248)",
            "level3": "rgb(240, 231, 246)",
            "level4": "rgb(239, 229, 245)",
            "level5": "rgb(236, 226, 243)"
        },
        "surfaceDisabled": "rgba(29, 27, 30, 0.12)",
        "onSurfaceDisabled": "rgba(29, 27, 30, 0.38)",
        "backdrop": "rgba(51, 47, 55, 0.4)"
    },
    fonts: configureFonts({config: fontConfig}),
};

export default function Main() {
    return (
        <PaperProvider theme={theme}>
        <BackendurlProvider>
            <App />
        </BackendurlProvider>
        </PaperProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);
