package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/goledgerdev/smartimoveis-api/cript"
	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/routes"
)

func initApp() {
	log.Println("Starting SmartImoveis API ...")
	if err := database.ConnectDatabase(); err != nil {
		panic(err)
	}

	if err := cript.Init(); err != nil {
		panic(err)
	}
	log.Println("Starting SmartImoveis API ...SUCCESS")
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
	routes.SetupSmartContractRoutes(app)
	routes.SetupAdminRoutes(app)

	app.Listen(":8000")
}
