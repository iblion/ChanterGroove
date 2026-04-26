import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen, { isOnboardingComplete } from './screens/OnboardingScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppShell() {
  const { mode, colors, gradients } = useTheme();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    const done = await isOnboardingComplete();
    setShowOnboarding(!done);
    setLoading(false);
  }

  const statusStyle = mode === 'dark' ? 'light' : 'dark';

  if (loading) {
    return (
      <LinearGradient colors={gradients.bgMain} style={styles.loading}>
        <StatusBar style={statusStyle} />
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style={statusStyle} />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={statusStyle} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
