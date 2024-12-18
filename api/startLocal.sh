#!/usr/bin/bash

set -a
source envLocal

# Default values
FRONTEND_ORIGIN="http://localhost:5173"
URL_HOST_API="http://localhost:8000"

while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
        --front-end)
            FRONTEND_ORIGIN="$2"
            shift # Move past the flag
            shift # Move past the value
            ;;
        --help)
            echo "Usage: startLocal.sh [options]"
            echo "Options:"
            echo "  --front-end <url>   URL of the front-end to use (default: http://localhost:3000)"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            # Unknown option
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

docker-compose -f docker/docker-compose-local.yaml up -d --build
