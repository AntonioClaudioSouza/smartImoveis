package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type AuthUser struct {
	ID       string `json:"id"`
	Login    string `json:"login"`
	Metadata struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"user_metadata"`
}

type AuthServiceResponse struct {
	User AuthUser `json:"user"`
}

func CreateUserService(name, email, password, role string) (*AuthUser, error) {
	port := os.Getenv("AUTHORIZATION_SERVER_PORT")
	authServiceURL := fmt.Sprintf("http://smartimoveis.authorization-server:%s/user/create", port)
	payload := map[string]interface{}{
		"login":    name,
		"password": password,
		"user_metadata": map[string]interface{}{
			"email": email,
			"name":  name,
			"role":  role,
		},
	}

	// Convert payload to JSON
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal JSON: %w", err)
	}

	// Make HTTP POST request
	resp, err := http.Post(authServiceURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("authentication service error: %s", string(body))
	}

	// Parse the response
	var serviceResp AuthServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&serviceResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &serviceResp.User, nil
}
