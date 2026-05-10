package workouts

type Workout struct {
	ID         int    `json:"id"`
	CustomerId int    `json:"customer_id"`
	Exercise   string `json:"exercise"`
	Reps       int    `json:"reps"`
	Weight     int    `json:"weight"`
	Length     int    `json:"length"` // convert to ms
	Date       string `json:"date"`
	CreatedAt  string `json:"created_at"`
}

type WorkoutSummary struct {
	FavoriteWorkout        string  `json:"favorite_workout"`
	HoursExercisedThisYear float64 `json:"hours_exercised_this_year"`
	LastWorkoutDate        string  `json:"last_workout_date"`
	TotalWorkoutsThisYear  int     `json:"total_workouts_this_year"`
}

// CREATE TABLE workouts (
//     id SERIAL PRIMARY KEY,
//     customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     exercise TEXT NOT NULL,
//     reps INTEGER NOT NULL DEFAULT 0,
//     weight INTEGER NOT NULL DEFAULT 0,
//     length INTEGER NOT NULL DEFAULT 0,
//     date DATE NOT NULL,
//     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX idx_workouts_customer_id ON workouts(customer_id);
// CREATE INDEX idx_workouts_customer_date ON workouts(customer_id, date);
