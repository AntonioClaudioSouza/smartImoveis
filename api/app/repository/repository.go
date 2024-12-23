package repository

import (
	"errors"
	"math/big"

	"github.com/goledgerdev/smartimoveis-api/models"
)

type SmartContractRepository interface {
	SetTaxaLocacao(privKey string, taxa *big.Int) (map[string]interface{}, error)
	GetTaxaLocacao() (*big.Int, error)
	AdicionarLocatario(privKey string, address string) (map[string]interface{}, error)
	RemoverLocatario(privKey string, address string) (map[string]interface{}, error)
}

func CreateSmartContractService(cfg *models.ContractService) (SmartContractRepository, error) {

	switch models.ServiceType(cfg.ServiceType) {
	case models.EthService:
		return NewEthRepository(cfg)
	case models.GoBesuService:
		return NewGoBesuRepository(cfg)
	}

	return nil, errors.New("invalid service type")
}
