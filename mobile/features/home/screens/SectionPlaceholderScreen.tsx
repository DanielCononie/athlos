import { SafeAreaView, StyleSheet, Text } from "react-native";

type SectionPlaceholderScreenProps = {
  title: string;
};

export function SectionPlaceholderScreen({ title }: SectionPlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#f4f7fb",
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "lowercase",
  },
});
