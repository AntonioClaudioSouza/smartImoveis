package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/service"
)

func GetTaxaLocacao(c *fiber.Ctx) error {

	instance, err := service.GetSmartContractService(service.SmartContractNameSmartImoveis)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	resp, err := instance.GetTaxaLocacao()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"taxa": resp,
	})
}
