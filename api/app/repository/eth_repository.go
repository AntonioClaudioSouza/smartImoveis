package repository

import (
	"context"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/goledgerdev/smartimoveis-api/models"
)

type EthRepository struct {
	host            string
	contractAddress common.Address
	timeout         int
	chainID         *big.Int
	client          *ethclient.Client
	abi             abi.ABI
	boundContract   *bind.BoundContract
}

func NewEthRepository(cfg *models.ContractService) (*EthRepository, error) {
	var result EthRepository
	var err error

	if cfg.ServiceType != models.EthService {
		return nil, fmt.Errorf("invalid service type")
	}

	if cfg.ContractAddress == "" {
		return nil, fmt.Errorf("contract address is required")
	}

	if cfg.APIBaseURL == "" {
		return nil, fmt.Errorf("api base url is required")
	}

	if cfg.ABI == nil {
		return nil, fmt.Errorf("abi is required")
	}

	result.abi, err = abi.JSON(strings.NewReader(string(cfg.ABI)))
	if err != nil {
		return nil, fmt.Errorf("error parsing abi: %v", err)
	}

	result.host = cfg.APIBaseURL
	result.timeout = 10
	result.contractAddress = common.HexToAddress(cfg.ContractAddress)
	return &result, nil
}

func (e *EthRepository) createConnection(ctx *context.Context) error {
	var err error

	e.client, err = ethclient.DialContext(*ctx, e.host)
	if err != nil {
		return fmt.Errorf("could not dialing node: %v", err)
	}

	e.chainID, err = e.client.NetworkID(*ctx)
	if err != nil {
		return fmt.Errorf("error querying chain id: %v", err)
	}

	e.boundContract = bind.NewBoundContract(
		e.contractAddress,
		e.abi,
		e.client,
		e.client,
		e.client,
	)
	return nil
}

func (e *EthRepository) transaction(privKey string, method string, args ...interface{}) (*types.Receipt, error) {
	ctx, cxtCancel := context.WithTimeout(context.Background(), time.Duration(e.timeout)*time.Second)
	defer cxtCancel()

	if err := e.createConnection(&ctx); err != nil {
		return nil, err
	}

	priv, err := crypto.HexToECDSA(privKey)
	if err != nil {
		return nil, fmt.Errorf("error loading private key: %v", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(priv, e.chainID)
	if err != nil {
		return nil, fmt.Errorf("error creating transactor: %v", err)
	}

	data, err := e.boundContract.Transact(auth, method, args...)
	if err != nil {
		return nil, fmt.Errorf("error sending transaction: %v", err)
	}

	receipt, err := bind.WaitMined(
		context.Background(),
		e.client,
		data,
	)
	if err != nil {
		return nil, fmt.Errorf("error waiting for transaction to be mined: %v", err)
	}

	return receipt, nil
}

func (e *EthRepository) call(method string, args ...interface{}) ([]interface{}, error) {
	ctx, cxtCancel := context.WithTimeout(context.Background(), time.Duration(e.timeout)*time.Second)
	defer cxtCancel()

	if err := e.createConnection(&ctx); err != nil {
		return nil, err
	}

	caller := bind.CallOpts{
		Pending: false,
		Context: ctx,
	}

	var output []interface{}
	err := e.boundContract.Call(&caller, &output, method, args...)
	if err != nil {
		return nil, fmt.Errorf("error calling method: %v", err)
	}

	return output, nil
}

func (e *EthRepository) convertToMap(d *types.Receipt) (map[string]interface{}, error) {
	receiptMap := make(map[string]interface{})
	receiptMap["BlockHash"] = d.BlockHash.Hex()
	receiptMap["BlockNumber"] = d.BlockNumber
	receiptMap["CumulativeGasUsed"] = d.CumulativeGasUsed
	receiptMap["GasUsed"] = d.GasUsed
	receiptMap["Status"] = d.Status
	receiptMap["TransactionHash"] = d.TxHash.Hex()
	receiptMap["TransactionIndex"] = d.TransactionIndex
	return receiptMap, nil
}
