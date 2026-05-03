import { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useAuth } from "@/features/auth/hooks/useAuth";

const stats = [
  { label: "Workouts", value: "18" },
  { label: "Streak", value: "7d" },
  { label: "Readiness", value: "92%" },
];

export default function HomeScreen() {
  const { signOut, user } = useAuth();
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.background}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <View style={styles.orangeTile} />
        <View style={styles.greenTile} />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(560).springify()} style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Fitness</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>

          <TouchableOpacity activeOpacity={0.82} style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(620).springify()} style={styles.heroCard}>
          <Text style={styles.cardLabel}>Signed in as</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.cardCopy}>Your training home is ready for the next layer of features.</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View
              entering={FadeInDown.delay(160 + index * 80).duration(520).springify()}
              key={stat.label}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
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
  content: {
    flex: 1,
    padding: 22,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  eyebrow: {
    color: "#2f6fed",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3f0",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  signOutText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    marginTop: 34,
    minHeight: 210,
    overflow: "hidden",
    padding: 24,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.24,
    shadowRadius: 32,
    elevation: 10,
  },
  cardLabel: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  email: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 14,
  },
  cardCopy: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 290,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  statValue: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
});
