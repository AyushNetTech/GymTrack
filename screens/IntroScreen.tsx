import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "BE HEALTHY",
    quote: "Your body deserves the best version of you.",
    image: require("../assets/intro1.png"),
  },
  {
    id: "2",
    title: "BE STRONGER",
    quote: "Strength grows when you push past your limits.",
    image: require("../assets/intro3.jpg"),
  },
  {
    id: "3",
    title: "BE YOURSELF",
    quote: "The only competition is your yesterday.",
    image: require("../assets/intro2.jpg"),
  },
];

export default function IntroScreen({ navigation }: any) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (e: any) => {
    setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace("Auth");
    }
  };

  const skipToEnd = () => {
    flatListRef.current?.scrollToIndex({
      index: slides.length - 1,
      animated: true,
    });
  };

  const renderItem = ({ item, index }: any) => {
    const translateX = scrollX.interpolate({
      inputRange: [(index - 1) * width, index * width, (index + 1) * width],
      outputRange: [-50, 0, 50],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange: [(index - 0.5) * width, index * width, (index + 0.5) * width],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <Animated.Image
          source={item.image}
          style={[styles.bg, { transform: [{ translateX }] }]}
          resizeMode="cover"
        />
        <View style={styles.overlay} />

        <Animated.View style={[styles.textContainer, { opacity }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.quote}>{item.quote}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: currentIndex === i ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.bottomContainer}>
        {currentIndex < slides.length - 1 ? (
          <View style={styles.row}>
            <BlurView intensity={100} tint="dark" style={styles.skipBtn}>
              <TouchableOpacity style={styles.btn} onPress={skipToEnd}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </BlurView>

            <BlurView intensity={0} tint="light" style={styles.nextBtn}>
              <TouchableOpacity style={styles.btn} onPress={goToNext}>
                <Text style={styles.nextText}>Next →</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        ) : (
          <BlurView intensity={0} tint="light" style={styles.getStartedBtn}>
            <TouchableOpacity style={styles.btn} onPress={goToNext}>
              <Text style={styles.nextText}>Get Started</Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  slide: { width, height },

  bg: {
    width,
    height,
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  textContainer: {
    position: "absolute",
    bottom:160,
    paddingHorizontal: 20,
    alignItems:"flex-start",
    justifyContent:"flex-start",
    // backgroundColor:"red",
    height:120
  },

  title: {
    color: "#f4ff47",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 10,
  },

  quote: { color: "#fff", fontSize: 18, opacity: 0.9 

  },

  dotsContainer: {
    position: "absolute",
    bottom: 150,
    flexDirection: "row",
    alignSelf: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f4ff47",
    marginHorizontal: 6,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 45,
    width: "100%",
    paddingHorizontal: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  btn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  nextText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  skipBtn: {
  width: "48%",
  height: 54,
  borderRadius: 30,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: "rgba(255,255,255,0.35)",
  shadowColor: "#fff",
  shadowOpacity: 0.15,
  shadowRadius: 6,
},

  nextBtn: {
    width: "48%",
    height: 54,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#f4ff47",
  },

  getStartedBtn: {
    width: "100%",
    height: 54,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#f4ff47",
  },
});
