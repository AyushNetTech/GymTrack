import React from 'react';
import { ImageBackground, Text, StyleSheet } from 'react-native';

export default function StepWelcome() {
  return (
    <ImageBackground
      source={require('../../assets/intro1.png')}
      style={styles.bg}
    >
      <Text style={styles.title}>Transform Your Body</Text>
      <Text style={styles.subtitle}>
        Personalized workouts. Real results.
      </Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    height: 500,
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 18,
    marginTop: 12,
  },
});
