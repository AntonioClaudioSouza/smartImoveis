package database

import (
	"errors"
	"fmt"
	"os"

	"github.com/goledgerdev/smartimoveis-api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbInstance *gorm.DB

func ConnectDatabase() error {
	host := os.Getenv("DATABASE_HOST")
	port := os.Getenv("DATABASE_PORT")
	user := os.Getenv("DATABASE_USER")
	password := os.Getenv("DATABASE_PASSWORD")
	dbname := os.Getenv("DATABASE_DB")
	sslmode := os.Getenv("DATABASE_SSLMODE")

	if host == "" {
		return errors.New("DATABASE_HOST não configurado")
	}

	if port == "" {
		return errors.New("DATABASE_PORT não configurado")
	}

	if user == "" {
		return errors.New("DATABASE_USER não configurado")
	}

	if password == "" {
		return errors.New("DATABASE_PASSWORD não configurado")
	}

	if dbname == "" {
		return errors.New("DATABASE_DB não configurado")
	}

	if sslmode == "" {
		return errors.New("DATABASE_SSLMODE não configurado")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	var err error
	dbInstance, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return errors.New("Falha ao conectar ao banco: " + err.Error())
	}

	dbInstance.Exec("CREATE TYPE userrole_type AS ENUM ('owner', 'tenant','inspector')")
	if err := dbInstance.AutoMigrate(&models.User{}); err != nil {
		return errors.New("Erro ao realizar a migração: " + err.Error())
	}

	return nil
}

func GetDB() *gorm.DB {
	return dbInstance
}
