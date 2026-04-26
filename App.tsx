import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen, { isOnboardingComplete } from './screens/OnboardingScreen';
import { COLORS, GRADIENTS } from './constants/theme';

export default function App() {
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

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.bgMain} style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </LinearGradient>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
