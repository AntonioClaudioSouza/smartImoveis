package repository

import (
	"math/big"
)

// Funções do contrato - Transações Contrato
func (e *GoBesuRepository) SetTaxaLocacao(privKey string, taxa *big.Int) (map[string]interface{}, error) {
	//TODO Implement
	return nil, nil
}

// Funções do contrato - Consultas Contrato
func (e *GoBesuRepository) GetTaxaLocacao() (*big.Int, error) {
	//TODO Implement
	return nil, nil
}

func (e *GoBesuRepository) AdicionarLocatario(privKey string, address string) (map[string]interface{}, error) {
	//TODO Implement
	return nil, nil
}

func (e *GoBesuRepository) RemoverLocatario(privKey string, address string) (map[string]interface{}, error) {
	//TODO Implement
	return nil, nil
}
