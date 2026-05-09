package workouts

import "github.com/gofiber/fiber/v2"

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) RegisterRoutes(app *fiber.App) {
	app.Get("/workouts/:id", h.GetWorkouts)
	app.Post("/workouts", h.PostWorkouts)
	app.Delete("/workouts/:id", h.DeleteWorkouts)
}

func (h *Handler) GetWorkouts(c *fiber.Ctx) error {
	return nil
}

func (h *Handler) PostWorkouts(c *fiber.Ctx) error {

	var req struct {
		workouts []Workout
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	for _, w := range req.workouts {
		if w.ID == 0 || w.Exercise == "" || w.Date == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "missing required fields",
				"message": "id, exercise, and date are required",
			})
		}
	}

	// h.service.CreateWorkouts(req.workouts)

	// if err := h.service.CreateWorkout(req.workouts); err != nil {
	// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"error":   "workout creation failed",
	// 		"message": "the workout could not be created",
	// 	})
	// }

	return nil
}

func (h *Handler) DeleteWorkouts(c *fiber.Ctx) error {
	return nil
}
