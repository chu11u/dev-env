"""Docker container event collector."""
import os
import sys
import subprocess
import json
import docker
from datetime import datetime, timezone
from app.collectors.base import BaseCollector
from app.models import Event
from app.config import DOCKER_HOSTS


class DockerCollector(BaseCollector):
    """Collects Docker container status from monitored hosts."""

    def __init__(self):
        self._known_containers: dict[str, dict] = {}  # name -> status info

    @property
    def source_name(self) -> str:
        return "Docker"

    def _get_container_status(self, host_info: dict) -> list[dict]:
        """Get container status from a host via SSH or local Docker socket."""
        name = host_info["name"]
        local_host = os.environ.get("DOCKER_LOCAL_HOST", "")

        # Use local Docker socket if this is the local host
        if name == local_host:
            try:
                client = docker.from_env()
                containers = client.containers.list(all=True)
                results = []
                for c in containers:
                    info = c.attrs
                    results.append({
                        "Names": c.name,
                        "Name": c.name,
                        "Image": c.image.tags[0] if c.image.tags else info["Config"]["Image"],
                        "Status": c.status,
                        "State": c.status,
                    })
                return results
            except Exception as e:
                print(f"Local Docker error on {name}: {e}", file=sys.stderr)
                return []

        # Fall back to SSH for remote hosts
        host = host_info["host"]
        results = []

        try:
            cmd = [
                "ssh", "-o", "StrictHostKeyChecking=no",
                "-o", "ConnectTimeout=5",
                "-i", "/app/keys/jarvis_homelab",
                f"jarvis@{host}",
                "docker ps --all --format '{{json .}}'"
            ]
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    if line:
                        try:
                            info = json.loads(line)
                            results.append(info)
                        except json.JSONDecodeError:
                            pass
            else:
                print(f"Docker SSH error on {name}: {result.stderr.strip()}", file=sys.stderr)
        except Exception as e:
            print(f"Docker collection error on {name}: {e}", file=sys.stderr)

        return results

    async def collect(self) -> list[Event]:
        """Collect Docker container status changes."""
        events = []

        for host_info in DOCKER_HOSTS:
            hostname = host_info["name"]
            containers = self._get_container_status(host_info)

            for container in containers:
                cname = container.get("Names", container.get("Name", "unknown"))
                cimage = container.get("Image", "")
                status = container.get("Status", "")
                state = container.get("State", "")

                # Determine if status changed
                prev = self._known_containers.get(f"{hostname}/{cname}")
                current_status = {
                    "state": state,
                    "status": status,
                    "image": cimage,
                }

                if prev and prev.get("state") != state:
                    severity = "error" if state in ("exited", "dead") else "warning" if state == "paused" else "info"

                    title = f"Docker: {cname} is now {state}"
                    description = f"Container {cname} ({cimage}) on {hostname} changed to {state}: {status}"

                    event_type = f"container_{state}"

                    tags = [hostname, "docker"]
                    if state in ("exited", "dead"):
                        tags.append("down")

                    event = Event(
                        timestamp=datetime.utcnow(),
                        source="docker",
                        source_name=cname,
                        event_type=event_type,
                        severity=severity,
                        title=title,
                        description=description,
                        details={
                            "container": cname,
                            "image": cimage,
                            "state": state,
                            "status": status,
                            "host": hostname,
                        },
                        host=hostname,
                        tags=tags,
                    )
                    events.append(event)

                self._known_containers[f"{hostname}/{cname}"] = current_status

        return events
