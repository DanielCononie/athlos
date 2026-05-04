import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { HomeStat } from "@/features/home/data/stats";

type StatsGridProps = {
  stats: HomeStat[];
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
