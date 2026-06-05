"""Configuration for Event Correlator."""

EMBED_API_URL = "http://192.168.131.50:8001"
QDRANT_HOST = "192.168.131.50"
QDRANT_PORT = 6333
QDRANT_COLLECTION = "homelab_events"

# Frigate
FRIGATE_URL = "http://192.168.131.132:5000"

# Home Assistant
HA_URL = "http://192.168.131.10:8123"
HA_TOKEN = ""  # Will be loaded from environment

# Docker hosts to monitor
DOCKER_HOSTS = [
    {"name": "games", "host": "192.168.131.134"},
    {"name": "jsrepo", "host": "192.168.131.50"},
]

# System monitoring targets
SYSTEM_HOSTS = [
    {"name": "proxmox", "host": "192.168.131.3"},
    {"name": "omv", "host": "192.168.131.200"},
    {"name": "frigate", "host": "192.168.131.132"},
    {"name": "games", "host": "192.168.131.134"},
    {"name": "jsrepo", "host": "192.168.131.50"},
    {"name": "techdns1", "host": "192.168.131.21"},
    {"name": "motioneye", "host": "192.168.131.194"},
]

# Collection intervals (in minutes)
COLLECT_INTERVAL_FRIGATE = 2
COLLECT_INTERVAL_HA = 5
COLLECT_INTERVAL_DOCKER = 5
COLLECT_INTERVAL_SYSTEM = 10

# Max events to keep per source type
MAX_EVENTS_PER_TYPE = 5000
