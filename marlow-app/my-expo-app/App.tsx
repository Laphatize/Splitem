import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import BillSplitterScreen from './components/BillSplitterScreen';
import BillSplitResultsModal from './components/BillSplitResultsModal';
import BankLinkScreen from './components/BankLinkScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ChatScreen from './components/ChatScreen';
import InsightsScreen from './components/InsightsScreen';
import AIAssistantScreen from './components/AIAssistantScreen';
import { Ionicons } from '@expo/vector-icons';
import { darkBg, cardBg, accent, textPrimary } from './theme';

import './global.css';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }: { route: any }) {
  const { user, token } = route.params || {};
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: cardBg, borderTopColor: darkBg, height: 64 },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: textPrimary,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Insights') iconName = 'bar-chart-outline';
          else if (route.name === 'BillSplitter') iconName = 'calculator-outline';
          else if (route.name === 'Assistant') iconName = 'sparkles-outline';
          else if (route.name === 'Chat') iconName = 'chatbubble-ellipses-outline';
          else if (route.name === 'Notifications') iconName = 'notifications-outline';
          else iconName = 'ellipse-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} initialParams={{ user, token }} />
      <Tab.Screen name="Insights" component={InsightsScreen} initialParams={{ user, token }} />
      <Tab.Screen name="BillSplitter" component={BillSplitterScreen} initialParams={{ user, token }} />
      <Tab.Screen name="Assistant" component={AIAssistantScreen} initialParams={{ user, token }} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: true }}>
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="BillSplitResults" component={BillSplitResultsModal} options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="BankLink" component={BankLinkScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
