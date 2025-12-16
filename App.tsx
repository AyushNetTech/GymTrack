import React, { useEffect, useState } from 'react';
import { Alert, Linking, ActivityIndicator, View, StatusBar, Platform } from 'react-native';
import { NavigationContainer, LinkingOptions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { supabase } from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen/ProfileSetupScreen';
import { Session } from '@supabase/supabase-js';
import TabNavigator from "./navigation/TabNavigator";
import { ToastProvider } from "./components/ToastProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import IntroScreen from './screens/IntroScreen';
import VerificationSuccessDialog from "./components/VerificationSuccessDialog";


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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [handlingCallback, setHandlingCallback] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);


  if (Platform.OS === "android") {
    StatusBar.setTranslucent(false);
  }

  // -----------------------
  // Load initial session
  // -----------------------
  useEffect(() => {
    const init = async () => {
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // -----------------------
  // Handle auth callback
  // -----------------------
  const handleAuthCallback = async (url: string) => {
  setHandlingCallback(true); // 🔒 lock UI immediately

  let access_token = null;
  let refresh_token = null;

  // Try HASH format (#access_token=...)
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    const hashString = url.substring(hashIndex + 1);
    const hashParams = new URLSearchParams(hashString);
    access_token = hashParams.get("access_token");
    refresh_token = hashParams.get("refresh_token");
  }

  // Try QUERY format (?access_token=...)
  const queryIndex = url.indexOf("?");
  if (queryIndex !== -1 && !access_token) {
    const queryString = url.substring(queryIndex + 1);
    const queryParams = new URLSearchParams(queryString);
    access_token = queryParams.get("access_token");
    refresh_token = queryParams.get("refresh_token");
  }

  if (!access_token || !refresh_token) {
    setHandlingCallback(false);
    return;
  }

  

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    Alert.alert("Session error", error.message);
    setHandlingCallback(false);
    return;
  }

  

  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: "ProfileSetup" }],
    });
  }

  setHandlingCallback(false); // 🔓 unlock after navigation
};


  // -----------------------
  // Deep link listener
  // -----------------------
  useEffect(() => {
  const handleUrl = ({ url }: { url: string }) => {

    // 1️⃣ RESET PASSWORD (highest priority)
    if (url.includes("reset-password")) {

      navigationRef.isReady() &&
        navigationRef.reset({
          index: 0,
          routes: [{ name: "ResetPassword", params: { url } }],
        });

      return;
    }

    // 2️⃣ EMAIL VERIFICATION
    if (url.includes("auth/callback")) {
      setShowVerifyDialog(true);
      return; // 🚫 DO NOT NAVIGATE HERE
    }
  };

  // Cold start
  Linking.getInitialURL().then((url) => {
    if (url) handleUrl({ url });
  });

  // Warm start
  const sub = Linking.addEventListener("url", handleUrl);

  return () => sub.remove();
}, []);



  // -----------------------
  // Check profile
  // -----------------------
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user || handlingCallback) return;

      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile && navigationRef.isReady()) {
        
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'ProfileSetup' }],
        });
      } else {
        
      }
    };

    checkProfile();
  }, [session, handlingCallback]);

  if (loading || handlingCallback) {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ToastProvider>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
            }}
          >
            <ActivityIndicator size="large" color="#f4ff47" />
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
          <StatusBar barStyle="light-content" backgroundColor="black" />
          <NavigationContainer linking={linking} ref={navigationRef}>
            <VerificationSuccessDialog
              visible={showVerifyDialog}
              onClose={() => {
                setShowVerifyDialog(false);

                navigationRef.isReady() &&
                  navigationRef.reset({
                    index: 0,
                    routes: [{ name: "Auth" }],
                  });
              }}
            />
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={session ? "Home" : "Intro"}>
              {!session && <Stack.Screen name="Intro" component={IntroScreen} />}
              {!session && <Stack.Screen name="Auth" component={AuthScreen} />}
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ presentation: "modal" }} />
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              <Stack.Screen name="Home" component={TabNavigator} options={{ gestureEnabled: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
