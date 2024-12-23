package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/controllers"
)

func SetupSmartContractRoutes(app *fiber.App) {
	// Setup routes
	app.Post("/api/registerSmartContract", controllers.RegisterSmartContract)
}
