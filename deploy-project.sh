#!/bin/bash
# ============================================================
# Deploy a project (pull from GitHub + rebuild)
# Usage: ./deploy-project.sh <project-name> [github-url]
# ============================================================

set -e

PROJECT_NAME="${1}"
GITHUB_URL="${2}"
BASE_DIR="/home/elkayam/dev-env"
PROJECT_DIR="$BASE_DIR/projects/$PROJECT_NAME"

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name> [github-url]"
    echo "Example: $0 myapp https://github.com/user/myapp.git"
    exit 1
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo "Project not found: $PROJECT_DIR"
    exit 1
fi

echo "Deploying: $PROJECT_NAME"
echo "========================"

cd "$PROJECT_DIR"

# Add GitHub remote if provided
if [ -n "$GITHUB_URL" ]; then
    if git remote | grep -q "origin"; then
        git remote set-url origin "$GITHUB_URL"
    else
        git remote add origin "$GITHUB_URL"
    fi
fi

# Pull latest
if git remote | grep -q "origin"; then
    echo "Pulling latest code..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "No remote changes"
fi

# Rebuild
echo "Building containers..."
docker compose up -d --build

echo ""
echo "Deployed: https://$PROJECT_NAME.apps.elkayam.me"
