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

func (h *Handler) RegisterRoutes(router fiber.Router, requireRouteUserID fiber.Handler) {
	router.Get("/:id/summary", requireRouteUserID, h.GetWorkoutSummary)
	router.Get("/:id", requireRouteUserID, h.GetWorkouts)
	router.Post("/", h.PostWorkouts)
	router.Delete("/:id", requireRouteUserID, h.DeleteWorkouts)
}

func (h *Handler) GetWorkoutSummary(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid id",
			"message": "id must be a number",
		})
	}

	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "missing required fields",
			"message": "id is required",
		})
	}

	summary, err := h.service.GetWorkoutSummary(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "workout summary retrieval failed",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(summary)
}

func (h *Handler) GetWorkouts(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "invalid id",
			"message": "id must be an number",
		})
	}
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "missing required fields",
			"message": "id is required",
		})
	}

	workouts, err := h.service.GetWorkouts(id, startDate, endDate)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "workout retrieval failed",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(workouts)
}

func (h *Handler) PostWorkouts(c *fiber.Ctx) error {

	var req struct {
		Workouts []Workout `json:"workouts"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if len(req.Workouts) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "missing required fields",
			"message": "at least one workout is required",
		})
	}

	for _, w := range req.Workouts {
		if w.CustomerId == 0 || w.Exercise == "" || w.Date == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "missing required fields",
				"message": "customer_id, exercise, and date are required",
			})
		}
	}

	success, err := h.service.CreateWorkouts(req.Workouts)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "workout creation failed",
			"message": "the workouts could not be created",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(success)
}

func (h *Handler) DeleteWorkouts(c *fiber.Ctx) error {
	return nil
}
