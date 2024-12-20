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

type User struct {
	gorm.Model
	ID         uint      `gorm:"primaryKey"`
	Name       string    `gorm:"size:100;not null"` // Nome do usuário
	Email      string    `gorm:"unique;not null"`   // Email único
	Password   string    `gorm:"not null"`          // Senha (armazenar como hash)
	PrivateKey string    `gorm:"not null"`          // Chave privada da wallet (criptografada)
	Role       UserRole  `gorm:"type:userrole_type;not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime"` // Data de criação
	UpdatedAt  time.Time `gorm:"autoUpdateTime"` // Data de atualização
}

// BeforeCreate criptografa a chave privada antes de salvar
func (u *User) BeforeCreate(tx *gorm.DB) error {
	var err error
	if len(u.PrivateKey) > 0 {
		return errors.New("PrivateKey must be empty")
	}

	u.PrivateKey, err = cript.EncryptKey(u.PrivateKey)
	if err != nil {
		return err
	}

	u.Password, err = cript.GenerateSHA256(u.Password)
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
	privKey, err := cript.GeneratePrivateECDSAKey()
	if err != nil {
		return err
	}

	hashedPassword, err := cript.EncryptKey(passwordText)
	if err != nil {
		return err
	}

	user := User{
		Name:       name,
		Email:      email,
		Password:   hashedPassword,
		Role:       UserRole(role),
		PrivateKey: privKey,
	}

	return db.Create(&user).Error
}

func GetUsersByRole(db *gorm.DB, role string) ([]User, error) {
	var users []User
	err := db.Where("role = ?", role).Find(&users).Error
	return users, err
}
