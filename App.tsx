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
import { checkProfileCompletion } from "./utils/profileState";
import { navigationRef } from "./navigation/navigationRef";
import {
  markAuthStarted,
  hasAuthStarted,
  shouldShowVerifyDialog,
  clearAuthStarted,
} from "./utils/authState";



export type RootStackParamList = {
  Intro: undefined;
  Auth: undefined;
  Home: undefined;
  ResetPassword: { url?: string } | undefined;
  ProfileSetup: undefined;
};

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
const [openedFromVerification, setOpenedFromVerification] = useState(false);
const [linkingReady, setLinkingReady] = useState(false);
const [navigationReady, setNavigationReady] = useState(false);
const [authStateReady, setAuthStateReady] = useState(false);
const [profileChecked, setProfileChecked] = useState(false);
const [profileCompleted, setProfileCompleted] = useState(false);


useEffect(() => {
  const restoreAuthState = async () => {
    const started = await hasAuthStarted();
    const showDialog = await shouldShowVerifyDialog();

    if (started) {
      setOpenedFromVerification(true);
    }

    if (showDialog && !showVerifyDialog) {
      setShowVerifyDialog(true);
    }

    setAuthStateReady(true);
  };

  restoreAuthState();
}, []);




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
      if (!session) {
        // 🔥 user signed out
        setProfileCompleted(false);
        setProfileChecked(false);
        setOpenedFromVerification(false);
        setShowVerifyDialog(false);
        setHandlingCallback(false);
      }
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

  setHandlingCallback(false); // 🔓 unlock after navigation
};


  // -----------------------
  // Deep link listener
  // -----------------------
  useEffect(() => {
  const handleUrl = async ({ url }: { url: string }) => {

    // 1️⃣ RESET PASSWORD (highest priority)
    if (url.includes("reset-password")) {
      // Alert.alert("reset password")
      navigationRef.isReady() &&
        navigationRef.reset({
          index: 0,
          routes: [{ name: "ResetPassword", params: { url } }],
        });

      return;
    }

    // 2️⃣ EMAIL VERIFICATION


      if (url.includes("auth/callback")) {
        // Alert.alert("Verification Link Opened");

        await markAuthStarted();
          setOpenedFromVerification(true);

          await handleAuthCallback(url);

          // 🔥 ADD THIS
          setShowVerifyDialog(true);
        return;
      }



  };

  // Cold start
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleUrl({ url });
    }
    setLinkingReady(true); // ✅ mark linking resolved
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

      const completed = await checkProfileCompletion(session.user.id);

      setProfileCompleted(completed);
      setProfileChecked(true);
    };

    checkProfile();
  }, [session, handlingCallback]);



  if (!linkingReady || !authStateReady || (session && !profileChecked)) {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ToastProvider>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" }}>
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
          <NavigationContainer
            linking={linking}
            ref={navigationRef}
            onReady={() => {
              setNavigationReady(true);
            }}
          >
            <VerificationSuccessDialog
              visible={showVerifyDialog}
              onClose={async () => {
                setShowVerifyDialog(false);
                await clearAuthStarted();

                navigationRef.reset({
                  index: 0,
                  routes: [{ name: "Auth" }],
                });
              }}

            />

              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!session && !openedFromVerification && (
                  <Stack.Screen name="Intro" component={IntroScreen} />
                )}

                {!session && <Stack.Screen name="Auth" component={AuthScreen} />}

                {!session && (
                  <Stack.Screen
                    name="ResetPassword"
                    component={ResetPasswordScreen}
                    options={{ presentation: "modal" }}
                  />
                )}

                {session && !profileCompleted && (
                  <Stack.Screen name="ProfileSetup">
                    {(props) => (
                      <ProfileSetupScreen
                        {...props}
                        onProfileCompleted={() => {
                          setProfileCompleted(true);
                        }}
                      />
                    )}
                  </Stack.Screen>
                )}


                {session && profileCompleted && (
                  <Stack.Screen name="Home" component={TabNavigator} />
                )}
              </Stack.Navigator>

          </NavigationContainer>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
