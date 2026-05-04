import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function HomeBackground() {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 5200 }), -1, true);
  }, [float]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [-10, 16]) },
      { scale: interpolate(float.value, [0, 1], [0.96, 1.06]) },
    ],
  }));

  return (
    <View style={styles.background}>
      <Animated.View style={[styles.halo, haloStyle]} />
      <View style={styles.orangeTile} />
      <View style={styles.greenTile} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  halo: {
    position: "absolute",
    right: -74,
    top: 68,
    width: 230,
    height: 230,
    borderRadius: 115,
    borderColor: "rgba(47, 111, 237, 0.22)",
    borderWidth: 34,
  },
  orangeTile: {
    position: "absolute",
    left: -34,
    top: 154,
    width: 138,
    height: 92,
    borderRadius: 8,
    backgroundColor: "rgba(255, 140, 97, 0.18)",
    transform: [{ rotate: "-10deg" }],
  },
  greenTile: {
    position: "absolute",
    right: 24,
    bottom: 128,
    width: 112,
    height: 112,
    borderRadius: 8,
    backgroundColor: "rgba(33, 197, 168, 0.18)",
    transform: [{ rotate: "12deg" }],
  },
});
