package main

import (
	"fitness/internal/auth"
	"fitness/internal/db"
	"fitness/internal/logger"
	"fitness/internal/workouts"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	log := logger.New()

	if err := godotenv.Load(); err != nil {
		log.Warn("no .env file found")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if len(jwtSecret) < 32 {
		log.Error("JWT_SECRET must be set and at least 32 characters long")
		return
	}

	database, err := db.Connect(log)
	if err != nil {
		log.Error("failed to connect to database", "error", err)
		return
	}
	defer database.Close()

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, OPTIONS",
		AllowOrigins: allowedOrigins(),
	}))

	authRepo := auth.NewRepository(database)
	authService := auth.NewService(authRepo, log, jwtSecret)
	authHandler := auth.NewHandler(authService)

	authHandler.RegisterRoutes(app)

	workoutsRepo := workouts.NewRepository(database)
	workoutsService := workouts.NewService(workoutsRepo, log)
	workoutsHandler := workouts.NewHandler(workoutsService)

	registerProtectedWorkoutRoutes(app, workoutsHandler, authHandler.RequireAuth, authHandler.RequireRouteIDMatchesToken)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	log.Info("starting server", "port", ":3000")

	if err := app.Listen(":3000"); err != nil {
		log.Error("failed to start server", "error", err)
	}

}

func registerProtectedWorkoutRoutes(
	app *fiber.App,
	workoutsHandler *workouts.Handler,
	requireAuth fiber.Handler,
	requireRouteUserID fiber.Handler,
) {
	protectedWorkouts := app.Group("/workouts", requireAuth)
	workoutsHandler.RegisterRoutes(protectedWorkouts, requireRouteUserID)
}

func allowedOrigins() string {
	origins := os.Getenv("CORS_ORIGINS")
	if origins != "" {
		return origins
	}

	return "http://localhost:8081,http://localhost:19006,http://localhost:19000"
}
