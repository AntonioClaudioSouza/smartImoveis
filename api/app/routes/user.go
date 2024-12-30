package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/controllers"
	"github.com/goledgerdev/smartimoveis-api/middlewares"
)

func SetupUserRoutes(api fiber.Router) {
	// Setup routes
	api.Post("/user/create", controllers.CreateUser)
	api.Post("/user/login", controllers.Login)
	api.Get("/user/logout", controllers.Logout)
	// api.Get("/user/authenticate", controllers.Authenticate)
	// api.Get("/user/refresh", controllers.Refresh)
	api.Get("/user/checkAuth", middlewares.AuthMiddleware, func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Authenticated",
		})
	})
}
