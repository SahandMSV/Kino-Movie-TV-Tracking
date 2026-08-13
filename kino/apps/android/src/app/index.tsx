import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type='title' style={styles.title}>
            Kino
          </ThemedText>

          <ThemedText type='subtitle' style={styles.subtitle}>
            Doesn&apos;t look like anything to me.
          </ThemedText>

          <ThemedText style={styles.caption}>
            First commit • The beginning of something great
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 80,
    fontWeight: "bold",
    letterSpacing: -4,
    color: "#ffffff",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    textAlign: "center",
    color: "#a1a1aa",
    lineHeight: 32,
    marginBottom: 32,
  },
  caption: {
    fontSize: 16,
    color: "#52525b",
    textAlign: "center",
  },
});
