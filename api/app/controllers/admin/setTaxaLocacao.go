package controllersAdmin

import (
	"math/big"

	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/service"
)

func SetTaxaLocacao(c *fiber.Ctx) error {

	type RequestBody struct {
		Taxa big.Int `json:"taxa"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	instance, err := service.GetSmartContractService(service.SmartContractNameSmartImoveis)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	resp, err := instance.SetTaxaLocacao(PRIVATE_KEY, &req.Taxa)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}
