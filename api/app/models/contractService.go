package models

import "gorm.io/gorm"

type ServiceType string

const (
	EthService    ServiceType = "eth"
	GoBesuService ServiceType = "gobesu"
)

type ContractService struct {
	gorm.Model
	ID              uint        `gorm:"primaryKey"`
	Name            string      `gorm:"unique;not null"`
	ContractAddress string      `gorm:"unique;not null"`
	APIBaseURL      string      `gorm:"not null"`
	ServiceType     ServiceType `gorm:"type:servicetype_type;not null"`
	ABI             []byte
}

func CreateContractService(db *gorm.DB, name string, contractAddress string, apiBaseURL string, abi []byte, serviceType ServiceType) error {
	cs := ContractService{
		Name:            name,
		ContractAddress: contractAddress,
		ABI:             abi,
		APIBaseURL:      apiBaseURL,
		ServiceType:     serviceType,
	}

	return db.Create(&cs).Error
}

func GetContractService(db *gorm.DB, name string) (*ContractService, error) {
	var cs ContractService
	err := db.Where("name = ?", name).First(&cs).Error
	return &cs, err
}

func GetContractServiceByAddress(db *gorm.DB, contractAddress string) (*ContractService, error) {
	var cs ContractService
	err := db.Where("contract_address = ?", contractAddress).First(&cs).Error
	return &cs, err
}

func GetContractServices(db *gorm.DB) ([]ContractService, error) {
	var cs []ContractService
	err := db.Find(&cs).Error
	return cs, err
}
