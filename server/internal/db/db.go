package db

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"

	_ "github.com/lib/pq"
)

func Connect(log *slog.Logger) (*sql.DB, error) {
	connStr := os.Getenv("DB_URL")

	if connStr == "" {
		return nil, fmt.Errorf("DB_URL is not set")
	}

	database, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := database.Ping(); err != nil {
		return nil, err
	}

	log.Info("connected to postgres")

	return database, nil
}
