package controllers

import (
	"encoding/base64"

	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/goledgerdev/smartimoveis-api/service"
)

func RegisterSmartContract(c *fiber.Ctx) error {

	type RequestBody struct {
		Name            string             `json:"name"`
		ContractAddress string             `json:"contractAddress"`
		ABI             string             `json:"abi"`
		APIBaseURL      string             `json:"apiBaseURL"`
		ServiceType     models.ServiceType `json:"serviceType"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	abi, err := base64.StdEncoding.DecodeString(req.ABI)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ABI",
		})
	}

	err = service.RegisterSmartContractService(service.SmartContract{
		Name:            req.Name,
		ContractAddress: req.ContractAddress,
		ABI:             abi,
		APIBaseURL:      req.APIBaseURL,
		ServiceType:     req.ServiceType,
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "Smart Contract registered successfully",
	})
}
