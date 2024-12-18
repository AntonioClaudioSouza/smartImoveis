package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	app := fiber.New()

	// Middleware de CORS com configurações padrão
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173, http://127.0.0.1:5173",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowMethods:     "GET, POST",
		AllowCredentials: true,
	}))

	app.Get("/api/demo", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "demo",
		})
	})

	app.Listen(":8000")
}
