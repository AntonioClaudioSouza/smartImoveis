package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

// GenerateAESKey generates a random AES key of the specified size in bytes.
func GenerateAESKey(size int) (string, error) {
	key := make([]byte, size)
	_, err := rand.Read(key)
	if err != nil {
		return "", fmt.Errorf("failed to generate key: %w", err)
	}
	return hex.EncodeToString(key), nil
}

// UpdateEnvFile updates the .env file, replacing or adding the AES_ENCRYPTION_KEY.
func UpdateEnvFile(key string) error {
	envFilePath := "app/.env"

	// Read the .env file
	content, err := os.ReadFile(envFilePath)
	if err != nil {
		return fmt.Errorf("failed to read .env file: %w", err)
	}

	lines := strings.Split(string(content), "\n")
	updated := false
	for i, line := range lines {
		if strings.HasPrefix(line, "AES_ENCRYPTION_KEY=") {
			lines[i] = "AES_ENCRYPTION_KEY=" + key
			updated = true
			break
		}
	}

	if !updated {
		// Add the key if not already present
		lines = append(lines, "AES_ENCRYPTION_KEY="+key)
	}

	// Write updated content back to .env
	err = os.WriteFile(envFilePath, []byte(strings.Join(lines, "\n")), 0644)
	if err != nil {
		return fmt.Errorf("failed to write to .env file: %w", err)
	}

	return nil
}

func main() {
	// Generate a 32-byte AES key for AES-256
	key, err := GenerateAESKey(16)
	if err != nil {
		fmt.Println("Error generating AES key:", err)
		os.Exit(1)
	}

	// Update the .env file
	err = UpdateEnvFile(key)
	if err != nil {
		fmt.Println("Error updating .env file:", err)
		os.Exit(1)
	}

	fmt.Println("AES key generated and updated in .env file successfully.")
}
