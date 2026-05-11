package sleep

import (
	"context"
	"database/sql"
)

type Repository interface {
	InsertManySleepEntries(ctx context.Context, entries int) (int, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{
		db: db,
	}
}

func (r *repository) InsertManySleepEntries(ctx context.Context, entries int) (int, error) {
	return 0, nil
}
