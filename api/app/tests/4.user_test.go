package main_test

import (
	"testing"

	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
	user := models.User{
		Name:     "John Doe",
		Email:    "john@example.com",
		Password: "hashed_password", // Senha já criptografada no teste
		Role:     models.OwnerRole,  // Definindo o Role
	}

	result := database.GetDB().Create(&user)
	assert.NoError(t, result.Error, "Erro ao criar o usuário")

	var createdUser models.User
	result = database.GetDB().First(&createdUser, user.ID)
	assert.NoError(t, result.Error, "Erro ao buscar o usuário")
	assert.Equal(t, user.Name, createdUser.Name)
	assert.Equal(t, user.Email, createdUser.Email)
	assert.Equal(t, user.Role, createdUser.Role)
}

func TestUniqueEmailConstraint(t *testing.T) {
	user1 := models.User{
		Name:     "John Doe",
		Email:    "john@example.com",
		Password: "hashed_password",
		Role:     models.OwnerRole,
	}
	database.GetDB().Create(&user1)

	user2 := models.User{
		Name:     "Jane Doe",
		Email:    "john@example.com", // Email duplicado
		Password: "another_hashed_password",
		Role:     models.TenantRole,
	}
	result := database.GetDB().Create(&user2)
	assert.Error(t, result.Error, "Esperado erro de email único")
	assert.Contains(t, result.Error.Error(), "unique constraint")
}

func TestUserRole(t *testing.T) {
	user := models.User{
		Name:     "Tenant User",
		Email:    "tenant@example.com",
		Password: "hashed_password",
		Role:     models.TenantRole,
	}

	result := database.GetDB().Create(&user)
	assert.NoError(t, result.Error, "Erro ao criar o usuário com role")

	var createdUser models.User
	result = database.GetDB().First(&createdUser, user.ID)
	assert.NoError(t, result.Error, "Erro ao buscar o usuário")
	assert.Equal(t, models.TenantRole, createdUser.Role)
}

func TestInvalidUserRole(t *testing.T) {
	user := models.User{
		Name:     "Invalid Role User",
		Email:    "invalid@example.com",
		Password: "hashed_password",
		Role:     "invalid_role",
	}

	result := database.GetDB().Create(&user)
	assert.Error(t, result.Error, "Esperado erro devido a role inválido")
	assert.Contains(t, result.Error.Error(), "invalid_role")
}
