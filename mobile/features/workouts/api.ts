import { AuthApiError } from "@/features/auth/api";

export type WorkoutSummary = {
  favorite_workout: string;
  hours_exercised_this_year: number;
  last_workout_date: string;
  total_workouts_this_year: number;
};

export type Workout = {
  id: number;
  customer_id: number;
  exercise: string;
  reps: number;
  weight: number;
  length: number;
  date: string;
  created_at: string;
};

export type NewWorkout = {
  customer_id: number;
  exercise: string;
  reps: number;
  weight: number;
  length: number;
  date: string;
};

export type CreateWorkoutsResponse = {
  message: string;
  entriesInserted: number;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

async function parseWorkoutResponse<T>(response: Response, fallbackMessage: string) {
  const data = (await response.json().catch(() => null)) as (T & ApiErrorResponse) | null;

  if (!response.ok) {
    throw new AuthApiError(data?.message ?? fallbackMessage, response.status);
  }

  if (!data) {
    throw new AuthApiError("The server returned an unexpected response.", response.status);
  }

  return data as T;
}

export async function getWorkoutSummary(
  authenticatedFetch: (path: string, init?: RequestInit) => Promise<Response>,
  customerId: number,
) {
  const response = await authenticatedFetch(`/workouts/${customerId}/summary`);
  return parseWorkoutResponse<WorkoutSummary>(response, "Could not load workout summary.");
}

export async function getWorkouts(
  authenticatedFetch: (path: string, init?: RequestInit) => Promise<Response>,
  customerId: number,
) {
  const response = await authenticatedFetch(`/workouts/${customerId}`);
  return parseWorkoutResponse<Workout[]>(response, "Could not load workouts.");
}

export async function createWorkouts(
  authenticatedFetch: (path: string, init?: RequestInit) => Promise<Response>,
  workouts: NewWorkout[],
) {
  const response = await authenticatedFetch("/workouts/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ workouts }),
  });

  return parseWorkoutResponse<CreateWorkoutsResponse>(response, "Could not save workouts.");
}
