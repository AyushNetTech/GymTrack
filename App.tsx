import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
import { checkProfileCompletion, clearProfileCompleted } from "./utils/profileState";
import { navigationRef } from "./navigation/navigationRef";
import { hasCompletedIntro } from "./utils/authState";
import LoadingScreen from "./components/LoadingScreen";
import { UserProvider } from "./context/UserContext";


export type RootStackParamList = {
  Intro: undefined;
  Auth: undefined;
  Home: undefined;
  ResetPassword: { url?: string } | undefined;
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>()


export default function App() {
  const [session, setSession] = useState<Session | null>(null);
const [authStateReady, setAuthStateReady] = useState(false);
const [profileChecked, setProfileChecked] = useState(false);
const [profileCompleted, setProfileCompleted] = useState(false);
const [introCompleted, setIntroCompleted] = useState(false);
const [initialAppLoad, setInitialAppLoad] = useState(true);
const [homeReady, setHomeReady] = useState(false);
const appReady =
  authStateReady &&
  initialAppLoad === false &&
  (!session || profileChecked);


  useEffect(() => {
  setHomeReady(false);
}, [session]);


useEffect(() => {
  const restoreAuthState = async () => {
    const introDone = await hasCompletedIntro();
    setIntroCompleted(introDone);

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
      
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      
      setSession(session);
      if (!session) {
        // 🔥 user signed out
        setProfileCompleted(false);
        setProfileChecked(false);
        await clearProfileCompleted();
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // -----------------------
  // Check profile

  useEffect(() => {
    if (!session?.user) {
      setProfileChecked(false);
      setInitialAppLoad(false);
      return;
    }

    const checkProfile = async () => {
      const completed = await checkProfileCompletion(session.user.id);
      setProfileCompleted(completed);
      setProfileChecked(true);
      setInitialAppLoad(false); // ✅ KEY
    };

    checkProfile();
  }, [session]);

  return (
    <UserProvider>
    <SafeAreaProvider>
      <PaperProvider>
        <ToastProvider>
          <StatusBar barStyle="light-content" backgroundColor="black" />
          {!appReady ? (
            <LoadingScreen visible />
          ) : (
          <NavigationContainer
            ref={navigationRef}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>

              {/* Intro */}
              {!session && !introCompleted && (
                <Stack.Screen name="Intro">
                  {(props) => (
                    <IntroScreen
                      {...props}
                      onIntroCompleted={() => setIntroCompleted(true)}
                    />
                  )}
                </Stack.Screen>
              )}

              {/* Auth */}
              {!session && introCompleted && (
                <>
                  <Stack.Screen name="Auth" component={AuthScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                </>
              )}

              {/* Profile setup */}
                {session && profileChecked && !profileCompleted && (
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

              {/* Main app */}
              {session && profileCompleted && (
                <Stack.Screen name="Home">
                  {(props) => (
                    <TabNavigator
                      {...props}
                      onHomeReady={() => setHomeReady(true)}
                    />
                  )}
                </Stack.Screen>
              )}
            </Stack.Navigator>

          </NavigationContainer>
          )}
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
    </UserProvider>
  );
}
