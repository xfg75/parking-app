import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useFlowStore } from '../store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const setIncomingUrl = useFlowStore((state) => state.setIncomingUrl);

  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent({
    debug: true,
    resetOnBackground: true,
  });

  useEffect(() => {
    if (hasShareIntent && shareIntent.value) {
      console.log('Received share intent:', shareIntent.value);
      setIncomingUrl(shareIntent.value);
      resetShareIntent();
      // Wait for layout to mount before pushing
      setTimeout(() => {
        router.push('/processing');
      }, 100);
    } else if (error) {
      console.log('Share intent error:', error);
    }
  }, [hasShareIntent, shareIntent, error]);

  return (
    // Forcing DarkTheme as requested by "Dark Mode par défaut"
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="processing" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="track-selection" options={{ title: 'Sélection des pistes', headerBackTitle: 'Retour' }} />
        <Stack.Screen name="search-dispatch" options={{ title: 'Recherche & Dispatch', headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
