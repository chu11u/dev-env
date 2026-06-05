"""Event data models."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Event(BaseModel):
    """A homelab event."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: str  # frigate, ha, docker, system
    source_name: str = ""
    event_type: str  # person_detected, motion, state_change, container_event, disk_warning, etc.
    severity: str = "info"  # info, warning, error, critical
    title: str
    description: str = ""
    details: dict = Field(default_factory=dict)
    host: str = ""
    tags: list[str] = Field(default_factory=list)

    def to_qdrant_payload(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
            "source_name": self.source_name,
            "event_type": self.event_type,
            "severity": self.severity,
            "title": self.title,
            "description": self.description,
            "details": str(self.details),
            "host": self.host,
            "tags": self.tags,
        }

    def text_for_embedding(self) -> str:
        """Generate searchable text for embedding."""
        parts = [
            f"[{self.severity.upper()}]",
            self.title,
            self.description,
            f"Source: {self.source}",
            f"Host: {self.host}",
        ]
        if self.tags:
            parts.append(f"Tags: {', '.join(self.tags)}")
        return ". ".join(p for p in parts if p)

    @classmethod
    def from_qdrant(cls, point) -> "Event":
        p = point.payload
        return cls(
            id=p.get("id", ""),
            timestamp=datetime.fromisoformat(p.get("timestamp", datetime.utcnow().isoformat())),
            source=p.get("source", ""),
            source_name=p.get("source_name", ""),
            event_type=p.get("event_type", ""),
            severity=p.get("severity", "info"),
            title=p.get("title", ""),
            description=p.get("description", ""),
            details={},
            host=p.get("host", ""),
            tags=p.get("tags", []),
        )


class EventSummary(BaseModel):
    """Summary statistics."""
    total_events: int = 0
    events_by_source: dict[str, int] = {}
    events_by_severity: dict[str, int] = {}
    events_last_hour: int = 0
    events_last_24h: int = 0
    latest_events: list[Event] = []
