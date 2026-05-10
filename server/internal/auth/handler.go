package auth

import (
	"errors"
	"strconv"
	"strings"

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
	app.Get("/me", h.RequireAuth, h.Me)
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

	token, err := h.service.GenerateToken(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "token generation failed",
			"message": "the user was registered but could not be signed in",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(AuthResponse{
		Message: "user registered successfully",
		Token:   token,
		User:    user,
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

	token, err := h.service.GenerateToken(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "token generation failed",
			"message": "the user could not be signed in",
		})
	}

	return c.JSON(AuthResponse{
		Message: "login successful",
		Token:   token,
		User:    user,
	})
}

// RequireAuth validates a bearer token before protected handlers run.
func (h *Handler) RequireAuth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	tokenString, ok := strings.CutPrefix(authHeader, "Bearer ")
	if !ok || strings.TrimSpace(tokenString) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "missing token",
			"message": "a bearer token is required",
		})
	}

	claims, err := h.service.ValidateToken(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid token",
			"message": "the bearer token is invalid or expired",
		})
	}

	c.Locals("claims", claims)

	return c.Next()
}

// RequireRouteIDMatchesToken ensures the route id belongs to the authenticated user.
func (h *Handler) RequireRouteIDMatchesToken(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid token",
			"message": "the bearer token is invalid or expired",
		})
	}

	tokenUserID, err := strconv.Atoi(claims.Subject)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid token",
			"message": "the bearer token is invalid or expired",
		})
	}

	routeUserID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid id",
			"message": "id must be a number",
		})
	}

	if routeUserID != tokenUserID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   "forbidden",
			"message": "the route id does not match the authenticated user",
		})
	}

	return c.Next()
}

// Me returns the authenticated user for the active JWT.
func (h *Handler) Me(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid token",
			"message": "the bearer token is invalid or expired",
		})
	}

	userID, err := strconv.Atoi(claims.Subject)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "invalid token",
			"message": "the bearer token is invalid or expired",
		})
	}

	user, err := h.service.GetUserByID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "user lookup failed",
			"message": "the authenticated user could not be loaded",
		})
	}

	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "user not found",
			"message": "the authenticated user no longer exists",
		})
	}

	return c.JSON(fiber.Map{
		"user": user,
	})
}
