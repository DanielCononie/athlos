import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { HomeBackground } from "@/features/home/components/HomeBackground";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { HomeSections } from "@/features/home/components/HomeSections";
import { StatsGrid } from "@/features/home/components/StatsGrid";
import { homeStats } from "@/features/home/data/stats";

export function HomeScreen() {
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <HomeBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HomeHeader onSignOut={signOut} />
          <StatsGrid stats={homeStats} />
          <HomeSections />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#3b8af5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 32,
    padding: 22,
  },
});
