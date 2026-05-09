import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { HomeBackground } from "@/features/home/components/HomeBackground";
import { TopNav } from "../components/TopNav";

export function WorkoutBaseScreen() {
    return (
        <SafeAreaView style={styles.screen}>
            <HomeBackground />
            <TopNav />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f58e8e",
      },

});