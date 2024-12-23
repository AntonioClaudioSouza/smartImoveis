package routes

import (
	"github.com/gofiber/fiber/v2"
	controllersAdmin "github.com/goledgerdev/smartimoveis-api/controllers/admin"
)

func SetupAdminRoutes(app *fiber.App) {
	// Setup routes
	app.Post("/api/admin/setTaxaLocacao", controllersAdmin.SetTaxaLocacao)
}
