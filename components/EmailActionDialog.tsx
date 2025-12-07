import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';

type Props = {
  visible: boolean;
  onTimeout: () => void;
  duration?: number;
  message?: string;
};

export default function EmailActionDialog({
  visible,
  onTimeout,
  duration = 10,
  message,
}: Props) {
  const progress = useRef(new Animated.Value(1)).current;

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

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#ff6b6b', '#ffb84d', '#fff44d', '#4dff6b'],
  });

  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Email Action</Dialog.Title>
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
  dialog: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: "#eee"
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color:"black"
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
    color:"black"
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000ff',
  },
  progressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
});
