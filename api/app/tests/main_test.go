package main_test

import (
	"fmt"
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	// Setar a chave de criptografia AES
	os.Setenv("AES_ENCRYPTION_KEY", "01234567890123456789012345678901")

	// Criar o container PostgreSQL
	err := CreatePostgresContainer()
	if err != nil {
		fmt.Printf("Erro ao criar o container PostgreSQL: %v", err)
	}

	// Execute os testes
	code := m.Run()

	// Cleanup após os testes
	CleanupPostgresContainer()

	// Finaliza o teste
	os.Exit(code)
}
