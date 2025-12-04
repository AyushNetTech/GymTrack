import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';

type Props = {
  visible: boolean;
  onTimeout: () => void;      // called when countdown ends
  duration?: number;           // countdown in seconds
  message?: string;            // custom message
};

export default function EmailActionDialog({
  visible,
  onTimeout,
  duration = 10,
  message,
}: Props) {
  const progress = useRef(new Animated.Value(1)).current;

  // Animate progress bar
  useEffect(() => {
    if (!visible) return;

    progress.setValue(1);

    Animated.timing(progress, {
      toValue: 0,
      duration: duration * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => setTimeout(() => onTimeout(), 0));
  }, [visible, duration, onTimeout, progress]);

  // Interpolated width
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Interpolated color: green → yellow → red
  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#ff4d4d', '#ffb84d', '#ffff4d', '#4dff4d'],
  });

  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        <Dialog.Title>Email Action</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text style={styles.message}>
            {message || 'Check your email and click the verification link!'}
          </Text>
          <View style={styles.progressContainer}>
            <Animated.View
              style={[styles.progressBar, { width, backgroundColor }]}
            />
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center' },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  progressContainer: {
    width: '100%',
    height: 14,
    backgroundColor: '#ddd',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 7,
  },
});
