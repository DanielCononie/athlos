package sleep

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
	router.Post("/:id", requireRouteUserID, h.AddSleepEntry)
}

func (h *Handler) AddSleepEntry(c *fiber.Ctx) error {

	var req struct {
		Sleep []Sleep `json:"sleep"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if len(req.Sleep) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "missing required fields",
			"message": "at least one sleep entry is required",
		})
	}

	for _, s := range req.Sleep {
		if s.CustomerId == 0 || s.StartTime == "" || s.Length == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "missing required fields",
				"message": "customer_id and date are required",
			})
		}
	}

	// call service function

	return nil
}
