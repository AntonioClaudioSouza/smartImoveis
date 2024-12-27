package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/goledgerdev/smartimoveis-api/database"
	"github.com/goledgerdev/smartimoveis-api/models"
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

type RefreshServiceResponse struct {
	User  AuthUser `json:"user"`
	Token struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
}

var authorizationUrl = os.Getenv("AUTHORIZATION_URL")

func CreateUserService(name, email, password, role string) (*AuthUser, error) {
	if err := models.CheckUserRoleType(role); err != nil {
		return nil, err
	}
	authServiceURL := fmt.Sprintf("%s/user/create", authorizationUrl)
	payload := map[string]interface{}{
		"login":    email,
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
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	// Parse the response
	var serviceResp AuthServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&serviceResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	db := database.GetDB()
	_, err = models.CreateUser(db, serviceResp.User.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &serviceResp.User, nil
}

func LoginService(login, password string, c *fiber.Ctx) (*AuthUser, error) {
	authServiceURL := fmt.Sprintf("%s/user/login", authorizationUrl)
	payload := map[string]interface{}{
		"login":    login,
		"password": password,
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
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	// Forward cookies to the client
	for _, cookie := range resp.Cookies() {
		// Set the cookie in the response
		c.Cookie(&fiber.Cookie{
			Name:     cookie.Name,
			Value:    cookie.Value,
			HTTPOnly: cookie.HttpOnly,
			Secure:   cookie.Secure,
			SameSite: fmt.Sprintf("%d", cookie.SameSite),
			Domain:   cookie.Domain,
		})
	}

	// Parse the response
	var serviceResp AuthServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&serviceResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &serviceResp.User, nil
}

func LogoutService(c *fiber.Ctx) error {
	authServiceURL := fmt.Sprintf("%s/user/logout", authorizationUrl)

	refresh_token := c.Cookies("refresh_token")

	if refresh_token == "" {
		return fmt.Errorf("missing refresh_token")
	}

	// Create a new HTTP client
	client := &http.Client{}

	// Create a new HTTP request
	req, err := http.NewRequest("GET", authServiceURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Access and copy request headers (including cookies)
	for key, values := range c.GetReqHeaders() {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Make HTTP POST request
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return errors.New(string(body))
	}

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		HTTPOnly: true,
	})

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HTTPOnly: true,
	})

	return nil
}

func AuthenticateService(c *fiber.Ctx) (*AuthUser, error) {
	authServiceURL := fmt.Sprintf("%s/authenticate", authorizationUrl)

	refresh_token := c.Cookies("refresh_token")

	if refresh_token == "" {
		return nil, fmt.Errorf("missing refresh_token")
	}

	// Create a new HTTP client
	client := &http.Client{}

	// Create a new HTTP request
	req, err := http.NewRequest("GET", authServiceURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Access and copy request headers (including cookies)
	for key, values := range c.GetReqHeaders() {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Make HTTP POST request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	// Parse the response
	var serviceResp AuthServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&serviceResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &serviceResp.User, nil
}

func RefreshService(c *fiber.Ctx) (*RefreshServiceResponse, error) {
	authServiceURL := fmt.Sprintf("%s/refresh", authorizationUrl)

	refresh_token := c.Cookies("refresh_token")

	if refresh_token == "" {
		return nil, fmt.Errorf("missing refresh_token")
	}

	// Create a new HTTP client
	client := &http.Client{}

	// Create a new HTTP request
	req, err := http.NewRequest("GET", authServiceURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Access and copy request headers (including cookies)
	for key, values := range c.GetReqHeaders() {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Make HTTP POST request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	// Forward cookies to the client
	for _, cookie := range resp.Cookies() {
		// Set the cookie in the response
		c.Cookie(&fiber.Cookie{
			Name:     cookie.Name,
			Value:    cookie.Value,
			HTTPOnly: cookie.HttpOnly,
			Secure:   cookie.Secure,
			SameSite: string(cookie.SameSite),
			Domain:   cookie.Domain,
		})
	}

	// Parse the response
	var serviceResp RefreshServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&serviceResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &serviceResp, nil
}
