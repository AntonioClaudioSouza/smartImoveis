package models

import (
	"errors"
	"time"

	"github.com/goledgerdev/smartimoveis-api/cript"
	"gorm.io/gorm"
)

type UserRole string

const (
	OwnerRole     UserRole = "owner"
	TenantRole    UserRole = "tenant"
	InspectorRole UserRole = "inspector"
)

func CheckUserRoleType(role string) error {
	switch role {
	case string(OwnerRole):
		return nil
	case string(TenantRole):
		return nil
	case string(InspectorRole):
		return nil
	}
	return errors.New("invalid user role")
}

type User struct {
	gorm.Model
	ID         string    `gorm:"primaryKey"`
	PrivateKey string    `gorm:"not null"`       // Chave privada da wallet (criptografada)
	PublicKey  string    `gorm:"not null"`       // Chave pública da wallet
	Address    string    `gorm:"not null"`       // Endereço da wallet
	CreatedAt  time.Time `gorm:"autoCreateTime"` // Data de criação
	UpdatedAt  time.Time `gorm:"autoUpdateTime"` // Data de atualização
}

// BeforeCreate criptografa a chave privada antes de salvar
func (u *User) BeforeCreate(tx *gorm.DB) error {
	var err error

	u.PrivateKey, err = cript.EncryptKey(u.PrivateKey)
	if err != nil {
		return err
	}
	return nil
}

// GetDecryptedPrivateKey retorna a chave privada descriptografada
func (u *User) GetDecryptedPrivateKey() (string, error) {
	return cript.DecryptKey(u.PrivateKey)
}

func CreateUser(db *gorm.DB, id string) (*User, error) {

	privKey, pubKey, address, err := cript.GenerateKeys()
	if err != nil {
		return nil, err
	}

	user := User{
		ID:         id,
		PrivateKey: privKey,
		PublicKey:  pubKey,
		Address:    address,
	}

	err = db.Create(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
