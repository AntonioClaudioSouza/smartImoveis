package controllers

import (
	"encoding/json"

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
		var parsedError map[string]interface{}
		if jsonErr := json.Unmarshal([]byte(err.Error()), &parsedError); jsonErr == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(parsedError)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "User created successfully",
		"user":   user,
	})
}

func Login(c *fiber.Ctx) error {
	type RequestBody struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	user, err := services.LoginService(req.Login, req.Password, c)
	if err != nil {
		var parsedError map[string]interface{}
		if jsonErr := json.Unmarshal([]byte(err.Error()), &parsedError); jsonErr == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(parsedError)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "User logged in successfully",
		"user":   user,
	})
}

func Logout(c *fiber.Ctx) error {
	err := services.LogoutService(c)
	if err != nil {
		var parsedError map[string]interface{}
		if jsonErr := json.Unmarshal([]byte(err.Error()), &parsedError); jsonErr == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(parsedError)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "User logged out successfully",
	})
}

func Authenticate(c *fiber.Ctx) error {
	user, err := services.AuthenticateService(c)
	if err != nil {
		var parsedError map[string]interface{}
		if jsonErr := json.Unmarshal([]byte(err.Error()), &parsedError); jsonErr == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(parsedError)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "User authenticated successfully",
		"user":   user,
	})
}

func Refresh(c *fiber.Ctx) error {
	refresh, err := services.RefreshService(c)
	if err != nil {
		var parsedError map[string]interface{}
		if jsonErr := json.Unmarshal([]byte(err.Error()), &parsedError); jsonErr == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(parsedError)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "Token refreshed successfully",
		"user":   refresh.User,
		"token":  refresh.Token,
	})
}
