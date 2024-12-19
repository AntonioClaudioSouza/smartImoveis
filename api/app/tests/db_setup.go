package main_test

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/goledgerdev/smartimoveis-api/database"
)

const (
	postgresImage = "postgres:15"
	postgresPort  = "5432"
	postgresUser  = "user"
	postgresPass  = "password"
	postgresDB    = "testdb"
)

var ContainerID string
var DockerClient *client.Client

// Função que cria e inicia o container PostgreSQL
func CreatePostgresContainer() error {
	var err error
	ctx := context.Background()
	DockerClient, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	log.Println("Pulling image...", postgresImage)
	reader, err := DockerClient.ImagePull(ctx, "docker.io/library/"+postgresImage, image.PullOptions{})
	if err != nil {
		panic(err)
	}
	defer reader.Close()

	// cli.ImagePull is asynchronous.
	// The reader needs to be read completely for the pull operation to complete.
	// If stdout is not required, consider using io.Discard instead of os.Stdout.
	// io.Copy(os.Stdout, reader)
	io.Copy(io.Discard, reader)

	log.Println("Image pulled")
	network := &network.NetworkingConfig{}
	hostConfig := &container.HostConfig{
		PortBindings: nat.PortMap{
			"5432/tcp": []nat.PortBinding{
				{
					HostIP:   "localhost", // Adapte para o seu IP
					HostPort: "5432",
				},
			},
		},
	}
	log.Println("Creating container...")
	resp, err := DockerClient.ContainerCreate(ctx, &container.Config{
		Image: postgresImage,
		Env: []string{
			"POSTGRES_USER=" + postgresUser,
			"POSTGRES_PASSWORD=" + postgresPass,
			"POSTGRES_DB=" + postgresDB,
		},
	}, hostConfig, network, nil, "postgres.test")
	if err != nil {
		panic(err)
	}

	// Inicia o container
	log.Println("Start container...")
	if err := DockerClient.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		panic(err)
	}

	// Aguardando o PostgreSQL ficar disponível
	log.Println("Wait for start postgres...")
	err = waitForPostgres("localhost", postgresPort, postgresUser, postgresPass, postgresDB, 20, 2*time.Second)
	if err != nil {
		return err
	}

	ContainerID = resp.ID
	return nil
}

// Função para esperar o PostgreSQL estar disponível
func waitForPostgres(dbHost string, dbPort string, dbUser string, dbPassword string, dbName string, retries int, delay time.Duration) error {
	os.Setenv("DATABASE_HOST", dbHost)
	os.Setenv("DATABASE_PORT", dbPort)
	os.Setenv("DATABASE_USER", dbUser)
	os.Setenv("DATABASE_PASSWORD", dbPassword)
	os.Setenv("DATABASE_DB", dbName)
	os.Setenv("DATABASE_SSLMODE", "disable")

	for i := 0; i < retries; i++ {
		err := database.ConnectDatabase()
		if err == nil {
			return nil // Se a conexão for bem-sucedida, retorna nil
		}

		// Espera antes de tentar novamente
		log.Printf("Tentando conectar ao banco de dados... (%d/%d)", i+1, retries)
		time.Sleep(delay)
	}

	return fmt.Errorf("não foi possível conectar ao PostgreSQL após %d tentativas", retries)
}
