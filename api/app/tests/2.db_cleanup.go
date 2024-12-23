package main_test

import (
	"context"
	"log"

	"github.com/docker/docker/api/types/container"
)

// Função de cleanup, chamada após todos os testes
func CleanupPostgresContainer() {
	log.Println("Cleaning up container ......")
	if ContainerID != "" {
		err := DockerClient.ContainerStop(context.Background(), ContainerID, container.StopOptions{})
		if err != nil {
			log.Printf("Erro ao parar o container: %v", err)
		}
		err = DockerClient.ContainerRemove(context.Background(), ContainerID, container.RemoveOptions{Force: true})
		if err != nil {
			log.Printf("Erro ao remover o container: %v", err)
		}
	}
}
