package main_test

import (
	"testing"

	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/stretchr/testify/assert"
)

// Teste de inserção de usuário
func TestCreateUser(t *testing.T) {
	user := models.User{
		Name:     "John Doe",
		Email:    "john@example.com",
		Password: "hashed_password",
		Role:     "owner", // Defina o Role aqui
	}

	// Criação de um novo usuário
	result := db.Create(&user)
	assert.NoError(t, result.Error, "Erro ao criar o usuário")

	// Verificando se o usuário foi criado corretamente
	var createdUser models.User
	result = db.First(&createdUser, user.ID)
	assert.NoError(t, result.Error, "Erro ao buscar o usuário")
	assert.Equal(t, "John Doe", createdUser.Name)
}
