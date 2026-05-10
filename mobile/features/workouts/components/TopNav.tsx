import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export type WorkoutSection = "summary" | "history" | "addNew";

type TopNavProps = {
  activeSection: WorkoutSection;
  onSelectSection: (section: WorkoutSection) => void;
};

const sections: { key: WorkoutSection; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "history", label: "History" },
  { key: "addNew", label: "Add new" },
];

export function TopNav({ activeSection, onSelectSection }: TopNavProps) {
  const activeIndex = sections.findIndex((section) => section.key === activeSection);

  return (
    <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.shell}>
      <View style={styles.container}>
        {sections.map((section) => {
          const isActive = activeSection === section.key;

          return (
            <Pressable
              key={section.key}
              onPress={() => onSelectSection(section.key)}
              style={({ pressed }) => [
                styles.selection,
                isActive && styles.activeSelection,
                pressed && styles.pressedSelection,
              ]}
            >
              <Text style={[styles.selectionText, isActive && styles.activeSelectionText]}>
                {section.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.dividerShell}>
        <View style={styles.progressSegments}>
          {sections.map((section, index) => {
            const isCurrent = index === activeIndex;
            const isComplete = index < activeIndex;

            return (
              <View
                key={section.key}
                style={[
                  styles.progressSegment,
                  isComplete && styles.completeProgressSegment,
                  isCurrent && styles.activeProgressSegment,
                ]}
              />
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  container: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  selection: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: "center",
  },
  activeSelection: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  pressedSelection: {
    transform: [{ scale: 0.97 }],
  },
  selectionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  activeSelectionText: {
    color: "#111827",
  },
  dividerShell: {
    height: 10,
    marginTop: 10,
    width: "100%",
  },
  progressSegments: {
    flexDirection: "row",
    gap: 8,
    height: 10,
    width: "100%",
  },
  progressSegment: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 8,
    flex: 1,
    height: 4,
    marginTop: 3,
  },
  completeProgressSegment: {
    backgroundColor: "rgba(255, 255, 255, 0.58)",
  },
  activeProgressSegment: {
    backgroundColor: "#ffffff",
    height: 8,
    marginTop: 1,
  },
});
