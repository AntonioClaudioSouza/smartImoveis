package main_test

import (
	"testing"

	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
	user, err := models.CreateUser(database.GetDB(), "123")
	assert.NoError(t, err, "Erro ao criar o usuário")

	var createdUser models.User
	result := database.GetDB().First(&createdUser, user.ID)
	assert.NoError(t, result.Error, "Erro ao buscar o usuário")
	assert.Equal(t, user.ID, createdUser.ID, "ID do usuário não é igual")
	assert.Equal(t, user.PrivateKey, createdUser.PrivateKey, "chave privada do usuário não é igual")
	assert.Equal(t, user.PublicKey, createdUser.PublicKey, "chave pública do usuário não é igual")
	assert.Equal(t, user.Address, createdUser.Address, "endereço do usuário não é igual")
}
