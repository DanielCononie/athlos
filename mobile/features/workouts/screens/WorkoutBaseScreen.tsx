import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { HomeBackground } from "@/features/home/components/HomeBackground";
import { createWorkouts, getWorkoutSummary, getWorkouts } from "@/features/workouts/api";
import type { NewWorkout, Workout, WorkoutSummary } from "@/features/workouts/api";
import { TopNav, WorkoutSection } from "@/features/workouts/components/TopNav";

type SectionOffsets = Record<WorkoutSection, number>;
type WorkoutForm = {
  date: string;
  durationMinutes: string;
  exercise: string;
  reps: string;
  weight: string;
};

type StagedWorkout = NewWorkout & {
  localId: string;
};

const emptySummary: WorkoutSummary = {
  favorite_workout: "",
  hours_exercised_this_year: 0,
  last_workout_date: "",
  total_workouts_this_year: 0,
};

const emptyForm: WorkoutForm = {
  date: getTodayDate(),
  durationMinutes: "",
  exercise: "",
  reps: "",
  weight: "",
};

export function WorkoutBaseScreen() {
  const { authenticatedFetch, user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<SectionOffsets>>({});
  const [activeSection, setActiveSection] = useState<WorkoutSection>("summary");
  const [summary, setSummary] = useState<WorkoutSummary>(emptySummary);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<WorkoutForm>(emptyForm);
  const [stagedWorkouts, setStagedWorkouts] = useState<StagedWorkout[]>([]);

  const loadWorkoutData = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [summaryData, workoutData] = await Promise.all([
        getWorkoutSummary(authenticatedFetch, user.id),
        getWorkouts(authenticatedFetch, user.id),
      ]);

      setSummary(summaryData);
      setWorkouts(workoutData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load workouts.");
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialWorkoutData() {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [summaryData, workoutData] = await Promise.all([
          getWorkoutSummary(authenticatedFetch, user.id),
          getWorkouts(authenticatedFetch, user.id),
        ]);

        if (isMounted) {
          setSummary(summaryData);
          setWorkouts(workoutData);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load workouts.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialWorkoutData();

    return () => {
      isMounted = false;
    };
  }, [authenticatedFetch, user]);

  const stats = useMemo(
    () => [
      {
        label: "Favorite Workout",
        value: summary.favorite_workout || "None",
      },
      {
        label: "Hours This Year",
        value: formatHours(summary.hours_exercised_this_year),
      },
      {
        label: "Last Workout",
        value: formatDate(summary.last_workout_date),
      },
      {
        label: "Total This Year",
        value: String(summary.total_workouts_this_year),
      },
    ],
    [summary],
  );

  const recentWorkouts = useMemo(() => workouts.slice(0, 5), [workouts]);

  const captureSectionOffset = useCallback(
    (section: WorkoutSection) => (event: LayoutChangeEvent) => {
      sectionOffsets.current[section] = event.nativeEvent.layout.y;
    },
    [],
  );

  const scrollToSection = useCallback((section: WorkoutSection) => {
    setActiveSection(section);

    const y = sectionOffsets.current[section] ?? 0;
    scrollRef.current?.scrollTo({
      y: Math.max(y - 12, 0),
      animated: true,
    });
  }, []);

  const updateForm = useCallback((field: keyof WorkoutForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const addWorkoutToBatch = useCallback(() => {
    if (!user) {
      setErrorMessage("You must be signed in to add workouts.");
      return;
    }

    const exercise = form.exercise.trim();
    const date = form.date.trim();

    if (!exercise || !date) {
      setErrorMessage("Exercise and date are required.");
      return;
    }

    const reps = parseOptionalNumber(form.reps);
    const weight = parseOptionalNumber(form.weight);
    const durationMinutes = parseOptionalNumber(form.durationMinutes);

    if (reps === null || weight === null || durationMinutes === null) {
      setErrorMessage("Reps, weight, and duration must be whole numbers.");
      return;
    }

    const workout: StagedWorkout = {
      localId: `${Date.now()}-${stagedWorkouts.length}`,
      customer_id: user.id,
      exercise,
      reps,
      weight,
      length: durationMinutes * 60000,
      date,
    };

    setStagedWorkouts((currentWorkouts) => [...currentWorkouts, workout]);
    setForm({
      ...emptyForm,
      date,
    });
    setSuccessMessage(`${exercise} added to batch.`);
    setErrorMessage(null);
  }, [form, stagedWorkouts.length, user]);

  const removeStagedWorkout = useCallback((localId: string) => {
    setStagedWorkouts((currentWorkouts) =>
      currentWorkouts.filter((workout) => workout.localId !== localId),
    );
    setSuccessMessage(null);
  }, []);

  const submitWorkoutBatch = useCallback(async () => {
    if (stagedWorkouts.length === 0) {
      setErrorMessage("Add at least one workout before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const workoutsToCreate = stagedWorkouts.map(({ localId, ...workout }) => workout);
      const response = await createWorkouts(authenticatedFetch, workoutsToCreate);

      setStagedWorkouts([]);
      setSuccessMessage(`${response.entriesInserted} workouts saved.`);
      await loadWorkoutData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save workouts.");
    } finally {
      setIsSubmitting(false);
    }
  }, [authenticatedFetch, loadWorkoutData, stagedWorkouts]);

  return (
    <SafeAreaView style={styles.screen}>
      <HomeBackground />
      <TopNav activeSection={activeSection} onSelectSection={scrollToSection} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y + 80;
          const offsets = sectionOffsets.current;

          if (offsets.addNew !== undefined && y >= offsets.addNew) {
            setActiveSection("addNew");
          } else if (offsets.history !== undefined && y >= offsets.history) {
            setActiveSection("history");
          } else {
            setActiveSection("summary");
          }
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.header}>
          <Text style={styles.eyebrow}>Workouts</Text>
          <Text style={styles.title}>Training dashboard</Text>
        </Animated.View>

        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

        <View onLayout={captureSectionOffset("summary")} style={styles.section}>
          <SectionHeader title="Summary" />
          {isLoading ? (
            <LoadingBlock />
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Animated.View
                  entering={FadeInDown.delay(80 + index * 70).duration(460).springify()}
                  key={stat.label}
                  style={styles.statCard}
                >
                  <Text numberOfLines={2} adjustsFontSizeToFit style={styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        <View onLayout={captureSectionOffset("history")} style={styles.section}>
          <SectionHeader title="History" />
          <View style={styles.historyList}>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <Animated.View
                  entering={FadeInDown.delay(100 + index * 60).duration(420).springify()}
                  key={workout.id}
                  style={styles.historyRow}
                >
                  <View style={styles.historyMain}>
                    <Text style={styles.historyTitle}>{workout.exercise}</Text>
                    <Text style={styles.historyMeta}>{formatWorkoutMeta(workout)}</Text>
                  </View>
                  <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                </Animated.View>
              ))
            ) : (
              <Text style={styles.emptyText}>No workouts logged yet.</Text>
            )}
          </View>
        </View>

        <View onLayout={captureSectionOffset("addNew")} style={styles.section}>
          <Animated.View entering={FadeInDown.duration(460).springify()} style={styles.addPanel}>
            <View style={styles.addPanelHeader}>
              <View>
                <Text style={styles.addTitle}>Build a batch</Text>
                <Text style={styles.addSubtitle}>{stagedWorkouts.length} queued</Text>
              </View>
              <Pressable
                onPress={addWorkoutToBatch}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
              >
                <Text style={styles.iconButtonText}>+</Text>
              </Pressable>
            </View>

            {successMessage ? <SuccessBanner message={successMessage} /> : null}

            <LabeledInput
              label="Exercise"
              onChangeText={(value) => updateForm("exercise", value)}
              placeholder="Bench Press"
              value={form.exercise}
            />

            <View style={styles.inputGrid}>
              <LabeledInput
                keyboardType="number-pad"
                label="Reps"
                onChangeText={(value) => updateForm("reps", value)}
                placeholder="8"
                value={form.reps}
              />
              <LabeledInput
                keyboardType="number-pad"
                label="Weight"
                onChangeText={(value) => updateForm("weight", value)}
                placeholder="135"
                value={form.weight}
              />
            </View>

            <View style={styles.inputGrid}>
              <LabeledInput
                keyboardType="number-pad"
                label="Minutes"
                onChangeText={(value) => updateForm("durationMinutes", value)}
                placeholder="45"
                value={form.durationMinutes}
              />
              <LabeledInput
                label="Date"
                onChangeText={(value) => updateForm("date", value)}
                placeholder="YYYY-MM-DD"
                value={form.date}
              />
            </View>

            <Pressable
              onPress={addWorkoutToBatch}
              style={({ pressed }) => [styles.addBatchButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.addBatchButtonText}>Add to batch</Text>
            </Pressable>

            <View style={styles.batchList}>
              {stagedWorkouts.length > 0 ? (
                stagedWorkouts.map((workout, index) => (
                  <Animated.View
                    entering={FadeInDown.delay(index * 40).duration(320).springify()}
                    key={workout.localId}
                    style={styles.batchRow}
                  >
                    <View style={styles.batchMain}>
                      <Text style={styles.batchTitle}>{workout.exercise}</Text>
                      <Text style={styles.batchMeta}>{formatWorkoutMeta(workout)}</Text>
                    </View>
                    <Pressable
                      onPress={() => removeStagedWorkout(workout.localId)}
                      style={({ pressed }) => [styles.removeButton, pressed && styles.pressedButton]}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </Pressable>
                  </Animated.View>
                ))
              ) : (
                <View style={styles.emptyBatch}>
                  <Text style={styles.emptyBatchText}>Queue workouts here before saving.</Text>
                </View>
              )}
            </View>

            <Pressable
              disabled={isSubmitting || stagedWorkouts.length === 0}
              onPress={submitWorkoutBatch}
              style={({ pressed }) => [
                styles.submitButton,
                stagedWorkouts.length === 0 && styles.disabledButton,
                pressed && !isSubmitting && styles.pressedButton,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Save batch</Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function LoadingBlock() {
  return (
    <View style={styles.loadingBlock}>
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(240)} style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(240)} style={styles.successBanner}>
      <Text style={styles.successText}>{message}</Text>
    </Animated.View>
  );
}

function LabeledInput({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: "default" | "number-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType ?? "default"}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(17, 24, 39, 0.36)"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function formatHours(hours: number) {
  if (hours === 0) {
    return "0";
  }

  return hours < 10 ? hours.toFixed(1) : Math.round(hours).toString();
}

function formatDate(date: string) {
  if (!date) {
    return "None";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatWorkoutMeta(workout: Pick<Workout, "length" | "reps" | "weight">) {
  const details = [];

  if (workout.reps > 0) {
    details.push(`${workout.reps} reps`);
  }

  if (workout.weight > 0) {
    details.push(`${workout.weight} lb`);
  }

  if (workout.length > 0) {
    details.push(`${Math.round(workout.length / 60000)} min`);
  }

  return details.length > 0 ? details.join(" | ") : "Logged workout";
}

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  if (!/^\d+$/.test(trimmedValue)) {
    return null;
  }

  return Number(trimmedValue);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f58e8e",
  },
  scrollContent: {
    paddingBottom: 34,
    paddingHorizontal: 18,
  },
  header: {
    paddingBottom: 18,
    paddingTop: 22,
  },
  eyebrow: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 5,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 116,
    padding: 14,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
  },
  statValue: {
    color: "#111827",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 0,
    minHeight: 58,
  },
  statLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 5,
    textTransform: "uppercase",
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 72,
    padding: 14,
  },
  historyMain: {
    flex: 1,
    paddingRight: 12,
  },
  historyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  historyMeta: {
    color: "rgba(255, 255, 255, 0.68)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 5,
  },
  historyDate: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    paddingVertical: 10,
  },
  addPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  addPanelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  addSubtitle: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
    textTransform: "uppercase",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  iconButtonText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 30,
  },
  pressedButton: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  inputGrid: {
    flexDirection: "row",
    gap: 10,
  },
  inputField: {
    flex: 1,
    marginBottom: 10,
  },
  inputLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f3f5f8",
    borderColor: "rgba(17, 24, 39, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    height: 46,
    letterSpacing: 0,
    paddingHorizontal: 12,
  },
  addBatchButton: {
    alignItems: "center",
    backgroundColor: "#f58e8e",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    marginBottom: 10,
  },
  addBatchButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  batchList: {
    gap: 10,
    marginTop: 4,
  },
  batchRow: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 70,
    padding: 12,
  },
  batchMain: {
    flex: 1,
    paddingRight: 12,
  },
  batchTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  batchMeta: {
    color: "rgba(255, 255, 255, 0.66)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 5,
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  emptyBatch: {
    alignItems: "center",
    backgroundColor: "#f3f5f8",
    borderColor: "rgba(17, 24, 39, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 62,
    padding: 12,
  },
  emptyBatchText: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.42,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  loadingBlock: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.58)",
    borderRadius: 8,
    height: 126,
    justifyContent: "center",
  },
  errorBanner: {
    backgroundColor: "rgba(127, 29, 29, 0.88)",
    borderRadius: 8,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  successBanner: {
    backgroundColor: "rgba(20, 83, 45, 0.88)",
    borderRadius: 8,
    marginBottom: 14,
    padding: 12,
  },
  successText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
