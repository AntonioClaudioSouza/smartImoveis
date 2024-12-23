package repository

import (
	"fmt"
	"math/big"
)

// Funções do contrato - Transações Contrato
func (e *EthRepository) SetTaxaLocacao(privKey string, taxa *big.Int) (map[string]interface{}, error) {
	receipt, err := e.transaction(privKey, "setTaxaLocacao", taxa)
	if err != nil {
		return nil, fmt.Errorf("error setting taxa locacao: %v", err)
	}
	return e.convertToMap(receipt)
}

// Funções do contrato - Consultas Contrato
func (e *EthRepository) GetTaxaLocacao() (*big.Int, error) {
	output, err := e.call("getTaxaLocacao")
	if err != nil {
		return nil, fmt.Errorf("error getting taxa locacao: %v", err)
	}
	return output[0].(*big.Int), nil
}

func (e *EthRepository) AdicionarLocatario(privKey string, address string) (map[string]interface{}, error) {
	receipt, err := e.transaction(privKey, "adicionarLocatario", address)
	if err != nil {
		return nil, fmt.Errorf("error adding locatario: %v", err)
	}
	return e.convertToMap(receipt)
}

func (e *EthRepository) RemoverLocatario(privKey string, address string) (map[string]interface{}, error) {
	receipt, err := e.transaction(privKey, "removerLocatario", address)
	if err != nil {
		return nil, fmt.Errorf("error removing locatario: %v", err)
	}
	return e.convertToMap(receipt)
}
