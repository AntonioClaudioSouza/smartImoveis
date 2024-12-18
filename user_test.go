package main

import (
	"os"
	"testing"

	"github.com/goledgerdev/smartimoveis-api/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Função para criar a conexão com o banco de dados de testes
func setupTestDB(t *testing.T) *gorm.DB {
	// Usando SQLite em memória para testes
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Falha ao conectar ao banco de dados: %v", err)
	}

	// Criar as tabelas necessárias para o teste
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("Erro ao migrar o banco de dados: %v", err)
	}

	// Set env variable for AES encryption key
	os.Setenv("AES_ENCRYPTION_KEY", "01234567890123456789012345678901")
	return db
}

// Teste para criar um novo usuário
func TestCreateUser(t *testing.T) {
	// Configuração do banco de dados de teste
	db := setupTestDB(t)

	// Dados do usuário
	user := models.User{
		Name:       "John Doe",
		Email:      "john@example.com",
		Password:   "hashed_password", // Senha já criptografada no teste
		PrivateKey: "encrypted_private_key",
		Role:       models.OwnerRole, // Definindo o Role
	}

	// Inserir o usuário no banco de dados
	result := db.Create(&user)
	assert.NoError(t, result.Error, "Erro ao criar o usuário")

	// Verificar se o usuário foi criado corretamente
	var createdUser models.User
	result = db.First(&createdUser, user.ID)
	assert.NoError(t, result.Error, "Erro ao buscar o usuário")
	assert.Equal(t, user.Name, createdUser.Name)
	assert.Equal(t, user.Email, createdUser.Email)
	assert.Equal(t, user.Role, createdUser.Role)
}

// Teste para verificar restrições de email único
func TestUniqueEmailConstraint(t *testing.T) {
	// Configuração do banco de dados de teste
	db := setupTestDB(t)

	// Criar o primeiro usuário
	user1 := models.User{
		Name:       "John Doe",
		Email:      "john@example.com",
		Password:   "hashed_password",
		PrivateKey: "encrypted_private_key",
		Role:       models.OwnerRole,
	}
	db.Create(&user1)

	// Tentar criar um segundo usuário com o mesmo email
	user2 := models.User{
		Name:       "Jane Doe",
		Email:      "john@example.com", // Email duplicado
		Password:   "another_hashed_password",
		PrivateKey: "another_encrypted_private_key",
		Role:       models.TenantRole,
	}
	result := db.Create(&user2)
	assert.Error(t, result.Error, "Esperado erro de email único")
	assert.Contains(t, result.Error.Error(), "UNIQUE constraint failed")
}

// Teste para verificar se o tipo de `Role` está sendo armazenado corretamente
func TestUserRole(t *testing.T) {
	// Configuração do banco de dados de teste
	db := setupTestDB(t)

	// Criar um usuário com role "tenant"
	user := models.User{
		Name:       "Tenant User",
		Email:      "tenant@example.com",
		Password:   "hashed_password",
		PrivateKey: "encrypted_private_key",
		Role:       models.TenantRole,
	}

	// Inserir no banco de dados
	result := db.Create(&user)
	assert.NoError(t, result.Error, "Erro ao criar o usuário com role")

	// Verificar se o role foi armazenado corretamente
	var createdUser models.User
	result = db.First(&createdUser, user.ID)
	assert.NoError(t, result.Error, "Erro ao buscar o usuário")
	assert.Equal(t, models.TenantRole, createdUser.Role)
}
