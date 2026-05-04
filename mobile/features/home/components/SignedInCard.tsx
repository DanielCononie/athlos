import { StyleSheet, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";


const styles = StyleSheet.create({
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
});
