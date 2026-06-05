"""Frigate event collector."""
import sys
from datetime import datetime, timezone
import httpx

from app.collectors.base import BaseCollector
from app.models import Event
from app.config import FRIGATE_URL


class FrigateCollector(BaseCollector):
    """Collects detection events from Frigate NVR."""

    def __init__(self):
        self.client = httpx.Client(base_url=FRIGATE_URL, timeout=15.0)
        self._last_event_time = 0.0

    @property
    def source_name(self) -> str:
        return "Frigate NVR"

    def _get_cameras(self) -> list[dict]:
        """Get list of cameras from Frigate."""
        try:
            resp = self.client.get("/api/config")
            resp.raise_for_status()
            config = resp.json()
            cameras = []
            for name, cam_config in config.get("cameras", {}).items():
                cameras.append({
                    "name": name,
                    "enabled": cam_config.get("enabled", True),
                })
            return cameras
        except Exception as e:
            print(f"Error getting Frigate cameras: {e}", file=sys.stderr)
            return []

    async def collect(self) -> list[Event]:
        """Collect recent Frigate events."""
        events = []
        try:
            resp = self.client.get(
                "/api/events",
                params={"limit": 20, "include_thumbnails": 0},
            )
            resp.raise_for_status()
            data = resp.json()

            for item in data:
                start_time = item.get("start_time", 0) or 0
                if start_time <= self._last_event_time:
                    continue

                label = item.get("label", "unknown")
                camera = item.get("camera", "unknown")
                score = item.get("data", {}).get("top_score", item.get("data", {}).get("score", 0))
                end_time = item.get("end_time", 0)
                is_false_positive = item.get("false_positive", False)
                has_clip = item.get("has_clip", False)
                has_snapshot = item.get("has_snapshot", False)
                zones = item.get("zones", [])
                sub_label = item.get("sub_label")
                duration = round(end_time - start_time, 1) if end_time > start_time else 0

                severity = "info"
                if label in ("person", "car", "dog"):
                    severity = "warning"

                title = f"{label.capitalize()} detected on {camera}"
                desc_parts = [f"Confidence: {score:.1%}" if score else ""]
                if duration > 0:
                    desc_parts.append(f"Duration: {duration}s")
                if has_clip:
                    desc_parts.append("Has recording clip")
                if has_snapshot:
                    desc_parts.append("Has snapshot")
                if zones:
                    desc_parts.append(f"Zones: {', '.join(zones)}")
                if sub_label:
                    desc_parts.append(f"Sub-label: {sub_label}")
                if is_false_positive:
                    desc_parts.append("⚠️ Marked as false positive")

                description = " | ".join(p for p in desc_parts if p)

                tags = [label, camera, "frigate"]
                if has_clip:
                    tags.append("has_clip")
                if has_snapshot:
                    tags.append("has_snapshot")
                if zones:
                    tags.extend(zones)

                event = Event(
                    timestamp=datetime.fromtimestamp(start_time, tz=timezone.utc),
                    source="frigate",
                    source_name=f"Camera: {camera}",
                    event_type=f"{label}_detected",
                    severity=severity,
                    title=title,
                    description=description,
                    details={
                        "camera": camera,
                        "label": label,
                        "score": score,
                        "duration": duration,
                        "has_clip": has_clip,
                        "has_snapshot": has_snapshot,
                        "zones": zones,
                        "false_positive": is_false_positive,
                        "frigate_id": item.get("id", ""),
                    },
                    host="frigate",
                    tags=tags,
                )
                events.append(event)

            # Update last event time
            if data:
                latest = max(item.get("start_time", 0) for item in data)
                if latest > self._last_event_time:
                    self._last_event_time = latest

        except Exception as e:
            print(f"Frigate collection error: {e}", file=sys.stderr)

        return events
