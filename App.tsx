import React, { useEffect, useState } from 'react'
import { Alert, Linking, ActivityIndicator, View, StatusBar, Platform } from 'react-native'
import { NavigationContainer, LinkingOptions, createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Provider as PaperProvider } from 'react-native-paper'
import { supabase } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ProfileSetupScreen from './screens/ProfileSetupScreen'
import { Session } from '@supabase/supabase-js'
import TabNavigator from "./navigation/TabNavigator";
import { ToastProvider } from "./components/ToastProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import IntroScreen from './screens/IntroScreen'

export type RootStackParamList = {
  Intro: undefined;
  Auth: undefined;
  Home: undefined;
  ResetPassword: { url?: string } | undefined;
  ProfileSetup: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      ProfileSetup: 'profile-setup',
    },
  },
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  if (Platform.OS === "android") {
    StatusBar.setTranslucent(false);
  }

  // Load initial session and listen for changes
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Handle auth callback from deep links
  const handleAuthCallback = async (url: string) => {
    const [, hash] = url.split('#');
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.log('Error setting session:', error.message);
        return;
      }

      setSession(data.session);
      setLoading(false);
    }
  };

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.startsWith("myapp://reset-password")) {
        navigationRef.isReady() && navigationRef.navigate("ResetPassword", { url });
        return;
      }
      if (url.startsWith("myapp://auth/callback")) {
        handleAuthCallback(url);
        return;
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  // Check if user has a profile and navigate if missing
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile && navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'ProfileSetup' }],
        })
      }
    }
    checkProfile()
  }, [session])

  if (loading) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <ToastProvider>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ToastProvider> 
          <StatusBar
            barStyle="light-content"
            backgroundColor="black"
            translucent={false}
          />
          <NavigationContainer linking={linking} ref={navigationRef} fallback={<></>}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={session ? "Home" : "Intro"}>
              {/* Screens for not logged-in users */}
              {!session && <Stack.Screen name="Intro" component={IntroScreen} />}
              {!session && <Stack.Screen name="Auth" component={AuthScreen} />}

              {/* Reset Password modal */}
              <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreen}
                options={{ presentation: "modal" }}
              />

              {/* Profile setup */}
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />

              {/* Home screen after login */}
              <Stack.Screen
                name="Home"
                component={TabNavigator}
                options={{ gestureEnabled: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
