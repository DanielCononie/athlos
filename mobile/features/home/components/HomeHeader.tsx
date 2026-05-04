import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type HomeHeaderProps = {
  onSignOut: () => void;
};

export function HomeHeader({ onSignOut }: HomeHeaderProps) {
  return (
    <Animated.View entering={FadeInUp.duration(560).springify()} style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>Athlos</Text>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <TouchableOpacity activeOpacity={0.82} style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  eyebrow: {
    color: "black",
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
});
