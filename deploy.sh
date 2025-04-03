#!/bin/bash

# Navigate to the backend directory
cd /home/user/backend

# Pull the latest changes
git pull origin main

# Rebuild and redeploy the Docker container
docker-compose down
docker-compose up --build -d