package workouts

import "log/slog"

type Service struct {
	// repo Repository
	log *slog.Logger
}

// func NewService(repo Repository, log *slog.Logger) *Service {
// 	return &Service{
// 		// repo: repo,
// 		log: log,
// 	}
// }

type PostSuccess struct {
	Message         string `json:"message"`
	EntriesInserted int    `json:"entriesInserted"`
}

// call repo function for insertmany
func (s *Service) CreateWorkouts(workouts []Workout) (PostSuccess, error) {

	return PostSuccess{}, nil
}
