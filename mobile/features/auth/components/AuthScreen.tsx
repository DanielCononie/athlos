import { Link } from "expo-router";
import { PropsWithChildren, ReactNode, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type AuthScreenProps = PropsWithChildren<{
  footerAction: string;
  footerHref: "/(auth)/login" | "/(auth)/register";
  footerLabel: string;
  subtitle: string;
  title: string;
}>;

type AuthFieldProps = TextInputProps & {
  label: string;
};

type AuthButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AuthScreen({
  children,
  footerAction,
  footerHref,
  footerLabel,
  subtitle,
  title,
}: AuthScreenProps) {
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 7600 }), -1, true);
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withDelay(700, withTiming(0, { duration: 1800 })),
      ),
      -1,
      false,
    );
  }, [drift, pulse]);

  const heroRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.54, 0.86]),
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-18, 22]) },
      { translateY: interpolate(drift.value, [0, 1], [10, -20]) },
      { scale: interpolate(pulse.value, [0, 1], [0.96, 1.08]) },
    ],
  }));

  const accentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [18, -16]) },
      { translateY: interpolate(drift.value, [0, 1], [-8, 16]) },
      { rotate: `${interpolate(drift.value, [0, 1], [-8, 9])}deg` },
    ],
  }));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.background}>
        <Animated.View style={[styles.heroRing, heroRingStyle]} />
        <Animated.View style={[styles.accentPlate, accentStyle]} />
        <View style={styles.mintGlow} />
        <View style={styles.gridLineOne} />
        <View style={styles.gridLineTwo} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <Animated.View entering={FadeInUp.duration(560).springify()} style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <View style={styles.logoPulse} />
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.appName}>Athlos</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(620).springify()} style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {children}

            <Text style={styles.footerText}>
              {footerLabel}{" "}
              <Link href={footerHref} style={styles.footerLink}>
                {footerAction}
              </Link>
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthForm({ children }: PropsWithChildren) {
  return <View style={styles.form}>{children}</View>;
}

export function AuthField({ label, style, ...props }: AuthFieldProps) {
  return (
    <Animated.View entering={FadeInDown.duration(480).springify()} style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#8792a5"
        selectionColor="#2f6fed"
        style={[styles.input, style]}
        {...props}
      />
    </Animated.View>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(240)} style={styles.errorBox}>
      <Text style={styles.errorText}>{children}</Text>
    </Animated.View>
  );
}

export function AuthButton({ disabled = false, label, onPress }: AuthButtonProps) {
  const pressed = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.72 : 1,
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.985]) }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      entering={FadeInDown.delay(120).duration(460).springify()}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 180 });
      }}
      style={[styles.primaryButton, buttonStyle]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <View style={styles.buttonSheen} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#3b8af5",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  heroRing: {
    position: "absolute",
    right: -88,
    top: -96,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 38,
    borderColor: "rgba(47, 111, 237, 0.24)",
    backgroundColor: "rgba(255, 255, 255, 0.24)",
  },
  accentPlate: {
    position: "absolute",
    left: -42,
    top: 82,
    width: 180,
    height: 106,
    borderRadius: 8,
    backgroundColor: "rgba(255, 140, 97, 0.2)",
  },
  mintGlow: {
    position: "absolute",
    right: -26,
    bottom: 112,
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "rgba(33, 197, 168, 0.18)",
  },
  gridLineOne: {
    position: "absolute",
    left: 28,
    right: 28,
    top: 196,
    height: 1,
    backgroundColor: "rgba(17, 24, 39, 0.05)",
  },
  gridLineTwo: {
    position: "absolute",
    bottom: 142,
    left: 44,
    right: 44,
    height: 1,
    backgroundColor: "rgba(17, 24, 39, 0.05)",
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 22,
  },
  logoMark: {
    alignItems: "center",
    width: 64,
    height: 64,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#111827",
    shadowColor: "#2f6fed",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10,
  },
  logoPulse: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#21c5a8",
    right: 10,
    top: 10,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
  },
  appName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 12,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.78)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 22,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.14,
    shadowRadius: 50,
    elevation: 10,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#5b6472",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  form: {
    gap: 15,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#222a37",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f9fbff",
    borderColor: "#d9e1ef",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 15,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  errorBox: {
    backgroundColor: "#fff4ed",
    borderColor: "#fed7aa",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: "#c2410c",
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    minHeight: 56,
    justifyContent: "center",
    marginTop: 2,
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonSheen: {
    position: "absolute",
    top: 0,
    right: -38,
    width: 86,
    height: 70,
    backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "18deg" }],
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  footerText: {
    color: "#5b6472",
    fontSize: 15,
    marginTop: 24,
    textAlign: "center",
  },
  footerLink: {
    color: "#2f6fed",
    fontWeight: "900",
  },
});
