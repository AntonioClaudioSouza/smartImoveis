package main_test

import (
	"fmt"
	"os"
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/lib/pq"
)

var db *gorm.DB

func TestMain(m *testing.M) {
	// Criar o container PostgreSQL
	err := CreatePostgresContainer()
	if err != nil {
		fmt.Printf("Erro ao criar o container PostgreSQL: %v", err)
	}

	// Conectar ao banco de dados
	dsn := fmt.Sprintf("host=localhost port=%s user=%s password=%s dbname=%s sslmode=disable", postgresPort, postgresUser, postgresPass, postgresDB)
	db, err = gorm.Open("postgres", dsn)
	if err != nil {
		fmt.Printf("Erro ao conectar ao banco de dados: %v", err)
	}

	// Execute os testes
	code := m.Run()

	// Cleanup após os testes
	CleanupPostgresContainer()

	// Finaliza o teste
	defer db.Close()
	os.Exit(code)
}
