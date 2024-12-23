package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/services"
)

func CreateUser(c *fiber.Ctx) error {

	type RequestBody struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	// Create user
	user, err := services.CreateUserService(req.Name, req.Email, req.Password, req.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "User created successfully",
		"user":   user,
	})
}
