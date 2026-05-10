package workouts

import (
	"context"
	"database/sql"
)

type Repository interface {
	GetWorkoutSummaryByCustomerId(ctx context.Context, customerId int) (WorkoutSummary, error)
	GetWorkoutsByCustomerId(ctx context.Context, customerId int, startDate string, endDate string) ([]Workout, error)
	InsertManyWorkouts(ctx context.Context, workouts []Workout) (int, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{
		db: db,
	}
}

// This function retrieves aggregate workout stats for the current year.
func (r *repository) GetWorkoutSummaryByCustomerId(ctx context.Context, customerId int) (WorkoutSummary, error) {
	query := `
		WITH this_year AS (
			SELECT exercise, length, date
			FROM workouts
			WHERE customer_id = $1
				AND date >= date_trunc('year', CURRENT_DATE)::date
				AND date < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year')::date
		),
		favorite AS (
			SELECT exercise
			FROM this_year
			GROUP BY exercise
			ORDER BY COUNT(*) DESC, exercise ASC
			LIMIT 1
		)
		SELECT
			COALESCE((SELECT exercise FROM favorite), ''),
			COALESCE(SUM(length), 0)::float8 / 3600000,
			COALESCE(MAX(date)::text, ''),
			COUNT(*)::int
		FROM this_year
	`

	var summary WorkoutSummary
	err := r.db.QueryRowContext(ctx, query, customerId).Scan(
		&summary.FavoriteWorkout,
		&summary.HoursExercisedThisYear,
		&summary.LastWorkoutDate,
		&summary.TotalWorkoutsThisYear,
	)
	if err != nil {
		return WorkoutSummary{}, err
	}

	return summary, nil
}

// This function retrieves workouts by customer id and date range
func (r *repository) GetWorkoutsByCustomerId(ctx context.Context, customerId int, startDate string, endDate string) ([]Workout, error) {

	if startDate == "" {
		startDate = "2000-01-01"
	}

	if endDate == "" {
		endDate = "3000-01-01"
	}
	query := `
		SELECT id, customer_id, exercise, reps, weight, length, date::text, created_at::text
		FROM workouts
		WHERE customer_id = $1 AND date BETWEEN $2 AND $3
		ORDER BY date DESC, id DESC
	`

	rows, err := r.db.QueryContext(ctx, query, customerId, startDate, endDate)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	workouts := []Workout{}

	for rows.Next() {
		var workout Workout
		if err := rows.Scan(
			&workout.ID,
			&workout.CustomerId,
			&workout.Exercise,
			&workout.Reps,
			&workout.Weight,
			&workout.Length,
			&workout.Date,
			&workout.CreatedAt,
		); err != nil {
			return nil, err
		}

		workouts = append(workouts, workout)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return workouts, nil
}

// This function inserts multiple workout entries into postgres
func (r *repository) InsertManyWorkouts(ctx context.Context, workouts []Workout) (int, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO workouts (customer_id, exercise, reps, weight, length, date)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	entriesInserted := 0
	for _, workout := range workouts {
		if _, err := stmt.ExecContext(ctx,
			workout.CustomerId,
			workout.Exercise,
			workout.Reps,
			workout.Weight,
			workout.Length,
			workout.Date,
		); err != nil {
			return 0, err
		}

		entriesInserted++
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return entriesInserted, nil
}
