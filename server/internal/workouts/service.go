package workouts

import (
	"context"
	"log/slog"
)

type Service struct {
	repo Repository
	log  *slog.Logger
}

func NewService(repo Repository, log *slog.Logger) *Service {
	return &Service{
		repo: repo,
		log:  log,
	}
}

type PostSuccess struct {
	Message         string `json:"message"`
	EntriesInserted int    `json:"entriesInserted"`
}

// call repo function for insertmany
func (s *Service) CreateWorkouts(workouts []Workout) (PostSuccess, error) {

	entriesInserted, err := s.repo.InsertManyWorkouts(context.Background(), workouts)
	if err != nil {
		return PostSuccess{}, err
	}

	return PostSuccess{
		Message:         "workouts created",
		EntriesInserted: entriesInserted,
	}, nil
}

func (s *Service) GetWorkouts(id int, startDate string, endDate string) ([]Workout, error) {
	return s.repo.GetWorkoutsByCustomerId((context.Background()), id, startDate, endDate)
}

func (s *Service) GetWorkoutSummary(id int) (WorkoutSummary, error) {
	return s.repo.GetWorkoutSummaryByCustomerId(context.Background(), id)
}
