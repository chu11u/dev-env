#!/bin/bash
# ============================================================
# Local Sync & Push - Run this from your Mac
# Pushes all changes to GitHub, which triggers auto-deploy
# ============================================================

cd "$(dirname "$0")"

echo "========================================"
echo "  📤 Syncing to GitHub..."
echo "========================================"

# Check for git
if [ ! -d ".git" ]; then
    echo "Not a git repo! Initialize first:"
    echo "  git init"
    echo "  git remote add origin https://github.com/chu11u/dev-env.git"
    exit 1
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to push."
    exit 0
fi

# Show what will be pushed
echo ""
echo "Changes to push:"
git status --short

echo ""
read -p "Push these changes? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Commit everything
git add -A
git commit -m "Auto-update: $(date +%Y-%m-%d)"

# Push
git push origin main

echo ""
echo "========================================"
echo "  🚀 Changes pushed! Server will auto-deploy..."
echo "========================================"
echo ""
echo "Check new projects at: https://*.apps.elkayam.me"
