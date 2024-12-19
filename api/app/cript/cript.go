package cript

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"io"
	"log"
	"os"
)

func Init() error {
	key := os.Getenv("AES_ENCRYPTION_KEY")
	if len(key) == 0 {
		return errors.New("AES_ENCRYPTION_KEY is not set")
	}

	if len(key) != 32 {
		return errors.New("AES_ENCRYPTION_KEY needs to have 32 characters")
	}
	return nil
}

func GetEncryptionKey() string {
	key := os.Getenv("AES_ENCRYPTION_KEY")
	if len(key) != 64 {
		log.Fatal("A chave de criptografia precisa ter 32 caracteres")
	}
	return key
}

// EncryptKey criptografa uma chave privada usando AES-GCM
func EncryptKey(plaintext string) (string, error) {
	block, err := aes.NewCipher([]byte(GetEncryptionKey()))
	if err != nil {
		return "", err
	}

	nonce := make([]byte, 12) // GCM recomenda um nonce de 12 bytes
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nil, nonce, []byte(plaintext), nil)
	result := append(nonce, ciphertext...)
	return base64.StdEncoding.EncodeToString(result), nil
}

// DecryptKey descriptografa uma chave privada usando AES-GCM
func DecryptKey(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher([]byte(GetEncryptionKey()))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	if len(data) < 12 {
		return "", errors.New("dados inválidos")
	}

	nonce, encryptedData := data[:12], data[12:]
	plaintext, err := aesGCM.Open(nil, nonce, encryptedData, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// GeneratePrivateKey cria uma chave privada ECDSA e a retorna como uma string hexadecimal
func GeneratePrivateECDSAKey() (string, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(privateKey.D.Bytes()), nil
}

func GenerateSHA256(data string) (string, error) {
	hash := sha256.New()
	_, err := hash.Write([]byte(data))
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}
