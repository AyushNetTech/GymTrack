import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';
import LottieView from 'lottie-react-native';

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
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (!visible) return;

    // Reset & play animation
    lottieRef.current?.reset();
    lottieRef.current?.play();

    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: duration * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => onTimeout());
  }, [visible, duration, onTimeout]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#ff0303ff', '#ff9900ff', '#f8e800ff', '#00ff2aff'],
  });

  if (!visible) return null;

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} style={styles.dialog}>
        <Dialog.Title style={styles.title}>
          Email Action
        </Dialog.Title>

        <Dialog.Content style={styles.content}>
          {/* 🔥 Lottie Animation */}
          <LottieView
            ref={lottieRef}
            source={require('../assets/EmailSendBlack.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />

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
    backgroundColor: '#111',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: "white",
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
    color:"white"
  },
  lottie: {
    width: 160,
    height: 160,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color:"white",
  },
  progressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#000000ff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
});
