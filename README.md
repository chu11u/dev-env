# Dev Environment for elkayam.me

A browser-based development environment running on your home lab.
All services are accessible under `*.apps.elkayam.me` with TLS
terminated by NPM.

## Architecture

```
I create code here → You push to GitHub → Server auto-deploys

Internet → NPM (*.apps.elkayam.me, TLS) → nginx → containers
dev.apps.elkayam.me      → code-server (VS Code IDE)
clock.apps.elkayam.me    → clock project
todo.apps.elkayam.me     → todo project
```

## Workflow

### On Your Mac (Local)

```bash
# When I create new files/projects:
./sync-push.sh
# Pushes to GitHub → Server auto-deploys in 5 minutes
# (or manually: ./deploy-all.sh on server)
```

### On Server (One-Time Setup)

```bash
cd /home/elkayam/dev-env

# 1. Add cron job for auto-deploy (every 5 minutes)
crontab -l | cat - cron-deploy | crontab -

# 2. Make scripts executable
chmod +x *.sh

# 3. Test it
./deploy-all.sh
```

### Optional: Webhook (Instant Deploys)

For instant deploys instead of 5-minute polling:

```bash
# Start webhook listener
./webhook-server.sh &

# Configure GitHub webhook:
# Settings → Webhooks → Add webhook
# Payload URL: https://webhook.apps.elkayam.me
# Secret: your-secret-change-this
# Events: Pushes
```

## Project Structure

```
dev-env/
├── docker-compose.yml            # code-server (IDE)
├── nginx-project-template.conf   # Template for nginx routing
├── nginx-dev.apps.elkayam.me.conf # code-server routing
├── deploy-all.sh                 # Auto-deploy all projects
├── webhook-server.sh             # Instant deploy via GitHub webhook
├── sync-push.sh                  # Push to GitHub (run locally)
├── cron-deploy                   # Cron entry (auto-pull every 5 min)
├── cleanup-project.sh            # Remove a project
└── projects/                     # Your projects
    ├── clock/
    │    ├── index.html
    │    ├── Dockerfile
    │    └── docker-compose.yml
    └── todo/
         ├── src/
         ├── Dockerfile
         └── docker-compose.yml
```

## Creating a New Project

Just ask me to build something! I'll create:

```
projects/<name>/
    ├── index.html (or src/ for React/Node)
    ├── Dockerfile
    ├── docker-compose.yml
    └── .gitignore
```

Then you run `./sync-push.sh` and it's deployed!

## Access

| Service | URL | Purpose |
|---------|-----|---------|
| IDE | https://dev.apps.elkayam.me | Code with AI |
| Projects | https://*.apps.elkayam.me | View deployed apps |

## DNS + NPM

| Setting | Value |
|---------|-------|
| **Technitium DNS** | `*.apps` → A record → your public IP |
| **NPM** | `*.apps.elkayam.me` → `192.168.131.134:80` |
| **SSL** | Wildcard cert for `*.apps.elkayam.me` |
