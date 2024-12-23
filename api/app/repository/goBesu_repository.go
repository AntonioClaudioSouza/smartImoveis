package repository

import (
	"fmt"

	"github.com/ethereum/go-ethereum/common"
	"github.com/goledgerdev/smartimoveis-api/models"
)

type GoBesuRepository struct {
	host            string
	contractAddress common.Address
	timeout         int
}

func NewGoBesuRepository(cfg *models.ContractService) (*GoBesuRepository, error) {
	var result GoBesuRepository

	if cfg.ServiceType != models.GoBesuService {
		return nil, fmt.Errorf("invalid service type")
	}

	if cfg.ContractAddress == "" {
		return nil, fmt.Errorf("contract address is required")
	}

	if cfg.APIBaseURL == "" {
		return nil, fmt.Errorf("api base url is required")
	}

	result.host = cfg.APIBaseURL
	result.timeout = 10
	result.contractAddress = common.HexToAddress(cfg.ContractAddress)
	return &result, nil
}
