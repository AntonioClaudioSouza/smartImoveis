package middlewares

import (
	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/services"
)

func AuthMiddleware(c *fiber.Ctx) error {
	_, err := services.AuthenticateService(c)
	if err != nil {
		_, err := services.RefreshService(c)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "Unauthorized",
			})
		}
	}
	c.Next()
	return nil
}
