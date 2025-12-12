import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "BE HEALTHY",
    quote: "Your body deserves the best version of you.",
    image: require("../assets/intro4.jpg"),
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
  const flatListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / width);
    setCurrentIndex(index);
  };

 const goToNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem("hasSeenIntro", "true");
      navigation.replace("Auth");
    }
  };


  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.slide}>

        {/* Background */}
        <Image source={item.image} style={styles.bg} />
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.quote}>{item.quote}</Text>
        </View>

      </View>
    );
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={slides}
        ref={flatListRef}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
      />

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (i - 1) * width,
              i * width,
              (i + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
        })}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
        <Text style={styles.nextText}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  slide: {
    width,
    height: "100%",
    justifyContent: "flex-end",
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 50,
  },

  title: {
    color: "#f4ff47",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 10,
  },

  quote: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
    opacity: 0.9,
  },

  dotsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    position: "absolute",
    bottom: 110,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f4ff47",
    marginHorizontal: 6,
  },

  nextButton: {
    backgroundColor: "#f4ff47",
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 40,
    alignItems: "center",
    marginBottom: 40,
  },

  nextText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
});
