package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/controllers"
)

func SetupUserRoutes(api fiber.Router) {
	// Setup routes
	api.Post("/users", controllers.CreateUser)
}
