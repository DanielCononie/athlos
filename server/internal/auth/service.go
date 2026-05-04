package auth

import (
	"context"
	"errors"
	"log/slog"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrUserAlreadyExists  = errors.New("user already exists")
)

const tokenLifetime = 24 * time.Hour

type Service struct {
	repo      Repository
	log       *slog.Logger
	jwtSecret []byte
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func NewService(repo Repository, log *slog.Logger, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		log:       log,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *Service) RegisterUser(email string, password string) (*User, error) {
	ctx := context.Background()

	existingUser, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	if existingUser != nil {
		return nil, ErrUserAlreadyExists
	}

	hashedPassword, err := HashPassword(password)

	if err != nil {
		return nil, errors.New("Error during password processing")
	}

	user := &User{
		Email:        email,
		PasswordHash: hashedPassword,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) GetUserByID(id int) (*User, error) {
	return s.repo.GetUserByID(context.Background(), id)
}

func (s *Service) LoginUser(email string, password string) (*User, error) {
	ctx := context.Background()

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	if user == nil || !VerifyPassword(password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

func (s *Service) GenerateToken(user *User) (string, error) {
	now := time.Now()
	claims := Claims{
		Email: user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strconv.Itoa(user.ID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(tokenLifetime)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, ErrInvalidToken
		}

		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// HashPassword generates a bcrypt hash for the given password.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// VerifyPassword verifies if the given password matches the stored hash.
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
