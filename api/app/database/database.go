package database

import (
	"errors"
	"fmt"
	"os"

	"github.com/goledgerdev/smartimoveis-api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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
	dbInstance, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return errors.New("Falha ao conectar ao banco: " + err.Error())
	}

	initializeEnum()
	if err := dbInstance.AutoMigrate(&models.User{}); err != nil {
		return errors.New("Erro ao realizar a migração: " + err.Error())
	}

	return nil
}

func GetDB() *gorm.DB {
	return dbInstance
}

func initializeEnum() error {
	var exists bool
	err := dbInstance.Raw(`
		SELECT EXISTS (
			SELECT 1
			FROM pg_type
			WHERE typname = 'userrole_type'
		);
	`).Scan(&exists).Error
	if err != nil {
		return err
	}

	// Cria o tipo ENUM se não existir
	if !exists {
		err = dbInstance.Exec(`
			CREATE TYPE userrole_type AS ENUM ('owner', 'tenant', 'inspector');
		`).Error
		if err != nil {
			return err
		}
	}

	return nil
}
