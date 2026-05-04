package auth

import (
	"context"
	"database/sql"
)

type Repository interface {
	GetUserByID(ctx context.Context, id int) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	CreateUser(ctx context.Context, user *User) error
}

type repository struct {
	db *sql.DB
}

// CreateUser implements Repository.
func (r *repository) CreateUser(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(ctx, query,
		user.Email,
		user.PasswordHash,
	).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
}

// GetUserByID implements Repository.
func (r *repository) GetUserByID(ctx context.Context, id int) (*User, error) {
	query := `
		SELECT id, email, is_email_verified, two_factor_enabled, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user User

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.IsEmailVerified,
		&user.TwoFactorEnabled,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

// GetUserByEmail implements Repository.
func (r *repository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, password_hash, is_email_verified, two_factor_enabled, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user User

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.IsEmailVerified,
		&user.TwoFactorEnabled,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // user not found
		}
		return nil, err
	}

	return &user, nil

}

func NewRepository(db *sql.DB) Repository {
	return &repository{
		db: db,
	}
}
