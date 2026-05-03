package main

import (
	"fitness/internal/auth"
	"fitness/internal/db"
	"fitness/internal/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	log := logger.New()

	if err := godotenv.Load(); err != nil {
		log.Warn("no .env file found")
	}

	database, err := db.Connect(log)
	if err != nil {
		log.Error("failed to connect to database", "error", err)
		return
	}
	defer database.Close()

	app := fiber.New()

	authRepo := auth.NewRepository(database)
	authService := auth.NewService(authRepo, log)
	authHandler := auth.NewHandler(authService)

	authHandler.RegisterRoutes(app)

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
