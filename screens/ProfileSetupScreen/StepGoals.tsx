import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from 'react-native';

const PRIMARY = '#f4ff47';
const { width } = Dimensions.get('window');
const GAP = 14;
const SIZE = (width - GAP * 3) / 2;

export default function StepGoals({ goal, setGoal }: any) {
  const goals = ['Lose Weight', 'Build Muscles', 'Home Workout', 'Healthy Diet'];

  return (
    <View style={styles.grid}>
      {goals.map((g) => (
        <TouchableOpacity key={g} style={styles.box} onPress={() => setGoal(g)}>
          <Image source={require('../../assets/workout1.jpg')} style={styles.image} />
          <View style={styles.overlay} />
          {goal === g && <View style={styles.selected} />}
          <Text style={styles.text}>{g}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  box: { width: SIZE, height: SIZE, borderRadius: 18, overflow: 'hidden', marginBottom: GAP },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  text: { position: 'absolute', bottom: 12, color: '#fff', fontWeight: '800', alignSelf: 'center' },
  selected: { ...StyleSheet.absoluteFillObject, borderWidth: 3, borderColor: PRIMARY },
});
