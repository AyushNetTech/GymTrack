import React, { useEffect, useState } from 'react'
import { Alert, Linking, ActivityIndicator, View } from 'react-native'
import { NavigationContainer, LinkingOptions, createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Provider as PaperProvider } from 'react-native-paper'
import { supabase } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import HomeScreen from './screens/HomeScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ProfileSetupScreen from './screens/ProfileSetupScreen'
import { Session } from '@supabase/supabase-js'

export type RootStackParamList = {
  Auth: undefined
  Home: undefined
  ResetPassword: { url?: string } | undefined
  ProfileSetup: undefined
}

export const navigationRef = createNavigationContainerRef<RootStackParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Load session
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

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('ResetPassword', { url: event.url })
      }
    }
    const subscription = Linking.addEventListener('url', handleDeepLink)

    Linking.getInitialURL().then(url => {
      if (url && navigationRef.isReady() && url.startsWith('myapp://reset-password')) {
        navigationRef.navigate('ResetPassword', { url })
      }
    })
    return () => subscription.remove()
  }, [])

  // Check profile if user logged in
  useEffect(() => {
    const checkProfile = async () => {
      if (!session?.user) return
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

  return (
    <PaperProvider>
      <NavigationContainer linking={linking} ref={navigationRef} fallback={<></>}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
              <Stack.Screen name="Home" component={HomeScreen} />
            ) : (
              <Stack.Screen name="Auth" component={AuthScreen} />
            )}
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  )
}
