package auth

import "time"

type AuthResponse struct {
	Message string `json:"message"`
	Token   string `json:"token"`
	User    *User  `json:"user"`
}

type User struct {
	ID              int    `json:"id"`
	Email           string `json:"email"`
	PasswordHash    string `json:"-"`
	IsEmailVerified bool   `json:"is_email_verified"`

	TwoFactorEnabled bool   `json:"two_factor_enabled"`
	TwoFactorSecret  string `json:"-"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     email TEXT UNIQUE NOT NULL,
//     password_hash TEXT NOT NULL,
//     is_email_verified BOOLEAN DEFAULT FALSE,

//     two_factor_enabled BOOLEAN DEFAULT FALSE,
//     two_factor_secret TEXT,

//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
