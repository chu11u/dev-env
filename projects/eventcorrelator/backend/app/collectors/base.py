"""Base collector interface."""
from abc import ABC, abstractmethod
from app.models import Event


class BaseCollector(ABC):
    """Base class for event collectors."""

    @abstractmethod
    async def collect(self) -> list[Event]:
        """Collect events from the source. Returns list of Event objects."""
        pass

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Human-readable name of this collector."""
        pass
