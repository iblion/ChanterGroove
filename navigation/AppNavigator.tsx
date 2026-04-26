import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen              from '../screens/HomeScreen';
import GameSetupScreen         from '../screens/GameSetupScreen';
import GameScreen              from '../screens/GameScreen';
import ScoreScreen             from '../screens/ScoreScreen';
import LobbyScreen             from '../screens/LobbyScreen';
import MultiRoomScreen         from '../screens/MultiRoomScreen';
import LeaderboardScreen       from '../screens/LeaderboardScreen';
import ProfileScreen           from '../screens/ProfileScreen';
import DailyChallengeScreen    from '../screens/DailyChallengeScreen';
import StatsScreen             from '../screens/StatsScreen';
import AchievementsScreen      from '../screens/AchievementsScreen';
import SettingsScreen          from '../screens/SettingsScreen';
import ArtistModeSetupScreen   from '../screens/ArtistModeSetupScreen';
import SpeedRoundScreen        from '../screens/SpeedRoundScreen';
import { COLORS } from '../constants/theme';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bg, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: '800', color: COLORS.textPrimary },
          cardStyle: { backgroundColor: COLORS.bg },
        }}
      >
        <Stack.Screen name="Home"            component={HomeScreen}            options={{ headerShown: false }} />
        <Stack.Screen name="GameSetup"       component={GameSetupScreen}       options={{ title: 'Game Setup' }} />
        <Stack.Screen name="Game"            component={GameScreen}            options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Score"           component={ScoreScreen}           options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Lobby"           component={LobbyScreen}           options={{ title: 'Multiplayer' }} />
        <Stack.Screen name="MultiRoom"       component={MultiRoomScreen}       options={{ title: 'Room' }} />
        <Stack.Screen name="Leaderboard"     component={LeaderboardScreen}     options={{ title: 'Leaderboard' }} />
        <Stack.Screen name="Profile"         component={ProfileScreen}         options={{ title: 'Profile' }} />
        <Stack.Screen name="DailyChallenge"  component={DailyChallengeScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="Stats"           component={StatsScreen}           options={{ title: 'Stats' }} />
        <Stack.Screen name="Achievements"    component={AchievementsScreen}    options={{ title: 'Achievements' }} />
        <Stack.Screen name="Settings"        component={SettingsScreen}        options={{ title: 'Settings' }} />
        <Stack.Screen name="ArtistMode"      component={ArtistModeSetupScreen} options={{ title: 'Artist Mode' }} />
        <Stack.Screen name="SpeedRound"      component={SpeedRoundScreen}      options={{ headerShown: false, gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
