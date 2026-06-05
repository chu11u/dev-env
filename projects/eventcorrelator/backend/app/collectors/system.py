"""System metrics collector."""
import sys
import subprocess
import json
from datetime import datetime, timezone
from app.collectors.base import BaseCollector
from app.models import Event
from app.config import SYSTEM_HOSTS


class SystemCollector(BaseCollector):
    """Collects system health metrics (disk, uptime, load)."""

    def __init__(self):
        self._known_metrics: dict[str, dict] = {}

    @property
    def source_name(self) -> str:
        return "System Monitor"

    def _get_uptime(self, host_info: dict) -> str:
        """Get host uptime."""
        name = host_info["name"]
        host = host_info["host"]
        try:
            cmd = [
                "ssh", "-o", "StrictHostKeyChecking=no",
                "-o", "ConnectTimeout=5",
                "-i", "/app/keys/jarvis_homelab",
                f"jarvis@{host}",
                "uptime -p 2>/dev/null || uptime | grep -o 'up .*' | sed 's/up //' | sed 's/,.*//'"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        return "unknown"

    def _get_disk_usage(self, host_info: dict) -> list[dict]:
        """Get disk usage info."""
        name = host_info["name"]
        host = host_info["host"]
        results = []
        try:
            cmd = [
                "ssh", "-o", "StrictHostKeyChecking=no",
                "-o", "ConnectTimeout=5",
                "-i", "/app/keys/jarvis_homelab",
                f"jarvis@{host}",
                "df -h / /var /data /DATA 2>/dev/null | tail -n +2 | awk '{print $6\"|\"$5\"|\"$3\"|\"$4}'"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    if "|" in line:
                        parts = line.split("|")
                        if len(parts) == 4:
                            results.append({
                                "mount": parts[0],
                                "usage_pct": parts[1],
                                "used": parts[2],
                                "available": parts[3],
                            })
        except:
            pass
        return results

    def _get_load(self, host_info: dict) -> str:
        """Get system load."""
        name = host_info["name"]
        host = host_info["host"]
        try:
            cmd = [
                "ssh", "-o", "StrictHostKeyChecking=no",
                "-o", "ConnectTimeout=5",
                "-i", "/app/keys/jarvis_homelab",
                f"jarvis@{host}",
                "cat /proc/loadavg | cut -d' ' -f1-3"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        return "unknown"

    async def collect(self) -> list[Event]:
        """Collect system metrics and detect anomalies."""
        events = []

        for host_info in SYSTEM_HOSTS:
            hostname = host_info["name"]
            host = host_info["host"]

            # Skip hosts that are unlikely to be directly SSH-accessible
            if hostname == "ha":
                continue  # HA is API-only

            uptime = self._get_uptime(host_info)
            disk_info = self._get_disk_usage(host_info)
            load = self._get_load(host_info)

            current_metrics = {
                "uptime": uptime,
                "load": load,
                "disk": disk_info,
            }
            prev = self._known_metrics.get(hostname, {})

            # Check for high disk usage
            for disk in disk_info:
                usage_str = disk.get("usage_pct", "0%").replace("%", "")
                try:
                    usage = int(usage_str)
                    if usage >= 90:
                        title = f"⚠️ Disk critical on {hostname}: {disk['mount']} at {usage}%"
                        description = f"Mount {disk['mount']} on {hostname} is at {usage}% capacity ({disk['used']} used / {disk['available']} available)"
                        event_type = "disk_critical"
                        severity = "critical"
                        tags = [hostname, "disk", "critical"]
                    elif usage >= 80:
                        title = f"⚠️ Disk warning on {hostname}: {disk['mount']} at {usage}%"
                        description = f"Mount {disk['mount']} on {hostname} is at {usage}% capacity"
                        event_type = "disk_warning"
                        severity = "warning"
                        tags = [hostname, "disk", "warning"]
                    else:
                        continue

                    event = Event(
                        timestamp=datetime.utcnow(),
                        source="system",
                        source_name=f"Disk: {disk['mount']}",
                        event_type=event_type,
                        severity=severity,
                        title=title,
                        description=description,
                        details={
                            "host": hostname,
                            "mount": disk["mount"],
                            "usage_pct": usage,
                            "used": disk["used"],
                            "available": disk["available"],
                        },
                        host=hostname,
                        tags=tags,
                    )
                    events.append(event)
                except ValueError:
                    pass

            # Check for uptime changes (system restart)
            if prev and prev.get("uptime", "") != uptime and "days" not in uptime:
                title = f"🔄 System restarted: {hostname}"
                description = f"{hostname} appears to have restarted. Uptime: {uptime}"
                event_type = "system_restart"
                severity = "warning"
                events.append(Event(
                    timestamp=datetime.utcnow(),
                    source="system",
                    source_name=f"Host: {hostname}",
                    event_type=event_type,
                    severity=severity,
                    title=title,
                    description=description,
                    details={"host": hostname, "uptime": uptime, "load": load},
                    host=hostname,
                    tags=[hostname, "restart"],
                ))

            self._known_metrics[hostname] = current_metrics

        return events
