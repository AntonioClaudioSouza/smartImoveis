package models

import (
	"time"

	"github.com/goledgerdev/smartimoveis-api/cript"
	"github.com/goledgerdev/smartimoveis-api/services"
	"gorm.io/gorm"
)

type UserRole string

const (
	OwnerRole     UserRole = "owner"
	TenantRole    UserRole = "tenant"
	InspectorRole UserRole = "inspector"
)

type User struct {
	gorm.Model
	ID         string    `gorm:"primaryKey"`
	PrivateKey string    `gorm:"not null"`       // Chave privada da wallet (criptografada)
	PublicKey  string    `gorm:"not null"`       // Chave pública da wallet
	Address    string    `gorm:"not null"`       // Endereço da wallet
	CreatedAt  time.Time `gorm:"autoCreateTime"` // Data de criação
	UpdatedAt  time.Time `gorm:"autoUpdateTime"` // Data de atualização

	// Name     string   `gorm:"size:100;not null"` // Nome do usuário
	// Email    string   `gorm:"unique;not null"`   // Email único
	// Password string   `gorm:"not null"`          // Senha (armazenar como hash)
	// Role     UserRole `gorm:"type:userrole_type;not null"`
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

func CreateUser(db *gorm.DB, name, email, passwordText, role string) error {

	createdUser, err := services.CreateUserService(name, email, passwordText, role)
	if err != nil {
		return err
	}

	privKey, pubKey, address, err := cript.GenerateKeys()
	if err != nil {
		return err
	}

	user := User{
		ID:         createdUser.ID,
		PrivateKey: privKey,
		PublicKey:  pubKey,
		Address:    address,
	}

	return db.Create(&user).Error
}

func GetUsersByRole(db *gorm.DB, role string) ([]User, error) {
	var users []User
	err := db.Where("role = ?", role).Find(&users).Error
	return users, err
}
