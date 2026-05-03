package auth

import (
	"errors"

	"github.com/gofiber/fiber/v2"
)

// Handler struct
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// RegisterRoutes attaches auth routes to the app
func (h *Handler) RegisterRoutes(app *fiber.App) {
	app.Post("/register", h.Register)
	app.Post("/login", h.Login)
}

// ----------- Handlers -----------

// Register handles user registration
func (h *Handler) Register(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "missing required fields",
			"message": "email and password are required",
		})
	}

	user, err := h.service.RegisterUser(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, ErrUserAlreadyExists) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   "user already exists",
				"message": "an account with this email already exists",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "registration failed",
			"message": "the user could not be registered",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "user registered successfully",
		"user":    user,
	})
}

// Login handles user login
func (h *Handler) Login(c *fiber.Ctx) error {
	// Parse request body
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "missing required fields",
			"message": "email and password are required",
		})
	}

	user, err := h.service.LoginUser(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "invalid credentials",
				"message": "the provided email or password is incorrect",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "login failed",
			"message": "the user could not be logged in",
		})
	}

	return c.JSON(fiber.Map{
		"message": "login successful",
		"user":    user,
	})
}
