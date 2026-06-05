"""Home Assistant event collector."""
import sys
import os
from datetime import datetime, timezone, timedelta
import httpx
import json

from app.collectors.base import BaseCollector
from app.models import Event
from app.config import HA_URL, HA_TOKEN


class HACollector(BaseCollector):
    """Collects events from Home Assistant logbook and state changes."""

    def __init__(self):
        token = HA_TOKEN or os.environ.get("HA_TOKEN", "")
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        self.client = httpx.Client(base_url=HA_URL, headers=self.headers, timeout=15.0)
        self._last_collect: datetime | None = None

    @property
    def source_name(self) -> str:
        return "Home Assistant"

    def _get_logbook(self, hours: float = 0.5) -> list[dict]:
        """Get recent logbook entries."""
        try:
            if self._last_collect:
                # Get entries since last collect
                resp = self.client.get(
                    f"/api/logbook/{self._last_collect.isoformat()}"
                )
            else:
                # Get entries from last 30 minutes
                since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
                resp = self.client.get(f"/api/logbook/{since}")

            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"HA logbook error: {e}", file=sys.stderr)
            return []

    def _get_states(self) -> list[dict]:
        """Get all entity states and detect interesting changes."""
        try:
            resp = self.client.get("/api/states")
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"HA states error: {e}", file=sys.stderr)
            return []

    async def collect(self) -> list[Event]:
        """Collect recent Home Assistant events."""
        events = []

        # Collect logbook entries
        logbook = self._get_logbook()
        for entry in logbook:
            entity_id = entry.get("entity_id", "")
            state = entry.get("state", "")
            name = entry.get("name", entity_id)
            when_str = entry.get("when", "")
            context_id = entry.get("context_id", "")
            context_event_type = entry.get("context_event_type", "")

            try:
                timestamp = datetime.fromisoformat(when_str) if when_str else datetime.utcnow()
            except:
                timestamp = datetime.utcnow()

            # Determine severity based on domain and state
            severity = "info"
            domain = entity_id.split(".")[0] if "." in entity_id else ""

            if state in ("on", "off"):
                # Check if it's a sensor change worth noting
                if domain in ("binary_sensor", "sensor"):
                    severity = "info"

            title = f"HA: {name} → {state}"
            description = f"Entity: {entity_id} | Domain: {domain} | Context: {context_event_type or 'N/A'}"

            event_type = f"{domain}_state_change"

            tags = [domain, "ha"]
            if context_event_type:
                tags.append(context_event_type)

            event = Event(
                timestamp=timestamp,
                source="ha",
                source_name=name,
                event_type=event_type,
                severity=severity,
                title=title,
                description=description,
                details={
                    "entity_id": entity_id,
                    "state": state,
                    "domain": domain,
                    "context_id": context_id,
                    "context_event_type": context_event_type,
                },
                host="ha",
                tags=tags,
            )
            events.append(event)

        self._last_collect = datetime.utcnow()
        return events
