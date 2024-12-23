package service

import (
	"errors"
	"strings"

	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/goledgerdev/smartimoveis-api/repository"
)

type SmartContract struct {
	Name            string
	ContractAddress string
	ABI             []byte
	APIBaseURL      string
	ServiceType     models.ServiceType
}

type SmartContractName string

const (
	SmartContractNameSmartImoveis SmartContractName = "SMART_IMOVEIS"
	SmartContractNameSmartBRL     SmartContractName = "BRL_TOKEN"
)

func RegisterSmartContractService(contract SmartContract) error {
	res, err := models.GetContractService(database.GetDB(), contract.Name)
	if err != nil {
		if !strings.Contains(err.Error(), "record not found") {
			return err
		}
	} else {
		if res.Name == string(contract.Name) {
			if res.ContractAddress == contract.ContractAddress {
				return errors.New("contract already registered")
			}
		}
	}

	return models.CreateContractService(database.GetDB(), string(contract.Name), contract.ContractAddress, contract.APIBaseURL, contract.ABI, contract.ServiceType)
}

func GetSmartContract(name SmartContractName) (*models.ContractService, error) {
	return models.GetContractService(database.GetDB(), string(name))
}

func GetSmartContracts() ([]models.ContractService, error) {
	return models.GetContractServices(database.GetDB())
}

func GetSmartContractByAddress(contractAddress string) (*models.ContractService, error) {
	return models.GetContractServiceByAddress(database.GetDB(), contractAddress)
}

func GetSmartContractService(name SmartContractName) (repository.SmartContractRepository, error) {
	contract, err := GetSmartContract(name)
	if err != nil {
		return nil, err
	}
	return repository.CreateSmartContractService(contract)
}
