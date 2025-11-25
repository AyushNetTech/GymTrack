import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { supabase } from '../lib/supabase'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">You are logged in 🎉</Text>

      <Button mode="contained" onPress={() => supabase.auth.signOut()} style={{ marginTop: 20 }}>
        Sign Out
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
})
