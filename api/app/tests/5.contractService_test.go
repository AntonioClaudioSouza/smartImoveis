package main_test

import (
	"testing"

	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/stretchr/testify/assert"
)

func TestCreateContractService(t *testing.T) {

	name := "Test Service"
	contractAddress := "0x1234567890AbCdEf1234567890AbCdEf12345678"
	apiBaseURL := "https://api.example.com"
	abi := []byte{1, 2, 3} // Example ABI data
	serviceType := models.EthService

	// Call the function to create a contract service
	err := models.CreateContractService(database.GetDB(), name, contractAddress, apiBaseURL, abi, serviceType)

	// Assertions
	assert.Nil(t, err, "Error creating contract service")

	createdContractService, err := models.GetContractService(database.GetDB(), name)
	assert.NoError(t, err, "Erro ao buscar o usuário")
	assert.Equal(t, createdContractService.Name, name, "Nome do serviço não corresponde")
	assert.Equal(t, createdContractService.ContractAddress, contractAddress, "Endereço do contrato não corresponde")
	assert.Equal(t, createdContractService.ServiceType, serviceType, "Tipo de serviço não corresponde")
	assert.Equal(t, createdContractService.APIBaseURL, apiBaseURL, "URL base da API não corresponde")
	assert.Equal(t, createdContractService.ABI, abi, "ABI não corresponde")
}
