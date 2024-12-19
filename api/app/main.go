package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/goledgerdev/smartimoveis-api/cript"
	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/routes"
	"github.com/joho/godotenv"
)

func initApp() {
	if err := godotenv.Load(); err != nil {
		log.Println("Erro ao carregar o arquivo .env, usando variáveis de ambiente padrão")
	}

	if err := database.ConnectDatabase(); err != nil {
		panic(err)
	}

	if err := cript.Init(); err != nil {
		panic(err)
	}
}

func main() {

	initApp()
	app := fiber.New()

	// Middleware de CORS com configurações padrão
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173, http://127.0.0.1:5173",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowMethods:     "GET, POST",
		AllowCredentials: true,
	}))

	// Setup routes
	routes.SetupUserRoutes(app)

	app.Get("/api/demo", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "demo",
		})
	})

	app.Listen(":8000")
}
