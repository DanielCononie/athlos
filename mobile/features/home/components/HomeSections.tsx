import { Href, router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type HomeSection = {
  background: string;
  description: string;
  href: string;
  icon: string;
  name: string;
};

const sections: HomeSection[] = [
  {
    name: "Nutrition",
    icon: "🍎",
    description: "Track meals and daily nutrients.",
    background: "#eaf7d9",
    href: "/nutrition",
  },
  {
    name: "Workouts",
    icon: "🏋️",
    description: "Log sessions and training progress.",
    background: "#dff0ff",
    href: "/workouts",
  },
  {
    name: "Sleep",
    icon: "💤",
    description: "Review rest and recovery quality.",
    background: "#efe8ff",
    href: "/sleep",
  },
  {
    name: "Meditation",
    icon: "🧠",
    description: "Build focus and calmer routines.",
    background: "#ffe9dc",
    href: "/meditation",
  },
];

export function HomeSections() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore your plan</Text>

      <View style={styles.grid}>
        {sections.map((section, index) => (
          <Animated.View
            entering={FadeInDown.delay(240 + index * 70).duration(520).springify()}
            key={section.name}
            style={styles.cardShell}
          >
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => router.push(section.href as Href)}
              style={[styles.card, { backgroundColor: section.background }]}
            >
              <View style={styles.icon}>
                <Text style={styles.iconText}>{section.icon}</Text>
              </View>

              <Text style={styles.name}>{section.name}</Text>
              <Text style={styles.description}>{section.description}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardShell: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "48%",
  },
  card: {
    borderRadius: 8,
    height: 148,
    padding: 15,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  icon: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  name: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 16,
  },
  description: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 8,
  },
});
