#!/usr/bin/bash
cd app
go clean -testcache
go test ./tests/ -v
cd ..