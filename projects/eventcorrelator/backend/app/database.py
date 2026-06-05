"""Qdrant database operations for Event Correlator."""
import traceback
import sys
from datetime import datetime, timezone
from typing import Optional
import httpx
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.config import (
    QDRANT_HOST, QDRANT_PORT, QDRANT_COLLECTION,
    EMBED_API_URL, MAX_EVENTS_PER_TYPE,
)
from app.models import Event

_client: Optional[QdrantClient] = None
_embed_client: Optional[httpx.AsyncClient] = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
        _ensure_collection(_client)
    return _client


def get_embed_client() -> httpx.AsyncClient:
    global _embed_client
    if _embed_client is None:
        _embed_client = httpx.AsyncClient(base_url=EMBED_API_URL, timeout=30.0)
    return _embed_client


def _ensure_collection(client: QdrantClient):
    """Create the events collection if it doesn't exist."""
    collections = [c.name for c in client.get_collections().collections]
    if QDRANT_COLLECTION not in collections:
        print(f"Creating collection '{QDRANT_COLLECTION}' (dim=384)", file=sys.stderr)
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=qmodels.VectorParams(
                size=384, distance=qmodels.Distance.COSINE
            ),
        )
        # Create payload indexes for filtering
        client.create_payload_index(
            collection_name=QDRANT_COLLECTION,
            field_name="timestamp",
            field_schema=qmodels.PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=QDRANT_COLLECTION,
            field_name="source",
            field_schema=qmodels.PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=QDRANT_COLLECTION,
            field_name="severity",
            field_schema=qmodels.PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=QDRANT_COLLECTION,
            field_name="event_type",
            field_schema=qmodels.PayloadSchemaType.KEYWORD,
        )
        print(f"Collection '{QDRANT_COLLECTION}' ready", file=sys.stderr)


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Get embeddings from the embed API service on jsrepo."""
    client = get_embed_client()
    resp = await client.post("/embed", json={"texts": texts})
    resp.raise_for_status()
    return resp.json()["embeddings"]


async def store_event(event: Event) -> bool:
    """Store an event in Qdrant with its embedding."""
    try:
        client = get_client()
        text = event.text_for_embedding()
        vecs = await embed_texts([text])
        point = qmodels.PointStruct(
            id=abs(hash(event.id)) % (2**63),
            vector=vecs[0],
            payload=event.to_qdrant_payload(),
        )
        client.upsert(collection_name=QDRANT_COLLECTION, points=[point])
        return True
    except Exception as e:
        print(f"Error storing event: {e}", file=sys.stderr)
        return False


async def store_events_batch(events: list[Event]) -> int:
    """Store multiple events at once, with batched embedding."""
    if not events:
        return 0

    try:
        client = get_client()
        all_points = []
        batch_size = 32

        for i in range(0, len(events), batch_size):
            batch = events[i:i + batch_size]
            texts = [e.text_for_embedding() for e in batch]
            try:
                vecs = await embed_texts(texts)
                points = [
                    qmodels.PointStruct(
                        id=abs(hash(e.id)) % (2**63),
                        vector=vecs[j],
                        payload=e.to_qdrant_payload(),
                    )
                    for j, e in enumerate(batch)
                ]
                all_points.extend(points)
                print(f"  Embedded batch {i//batch_size + 1}/{(len(events)-1)//batch_size + 1}: {len(batch)} events", file=sys.stderr)
            except Exception as e:
                print(f"  Batch {i//batch_size + 1} failed: {e}", file=sys.stderr)
                continue

        if all_points:
            # Upsert in larger batches to avoid payload limits
            upsert_batch_size = 256
            for i in range(0, len(all_points), upsert_batch_size):
                client.upsert(
                    collection_name=QDRANT_COLLECTION,
                    points=all_points[i:i + upsert_batch_size],
                )
        return len(all_points)
    except Exception as e:
        print(f"Error storing batch: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return 0

    try:
        client = get_client()
        texts = [e.text_for_embedding() for e in events]
        vecs = await embed_texts(texts)
        points = [
            qmodels.PointStruct(
                id=abs(hash(e.id)) % (2**63),
                vector=vecs[i],
                payload=e.to_qdrant_payload(),
            )
            for i, e in enumerate(events)
        ]
        client.upsert(collection_name=QDRANT_COLLECTION, points=points)
        return len(events)
    except Exception as e:
        print(f"Error storing batch: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return 0


async def search_events(
    query: str,
    limit: int = 20,
    offset: int = 0,
    source: Optional[str] = None,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    host: Optional[str] = None,
    since: Optional[str] = None,
    until: Optional[str] = None,
) -> list[Event]:
    """Semantic search over events with filters."""
    try:
        client = get_client()
        vecs = await embed_texts([query])

        # Build filter
        must_conditions = []
        if source:
            must_conditions.append(qmodels.FieldCondition(
                key="source", match=qmodels.MatchValue(value=source)
            ))
        if severity:
            must_conditions.append(qmodels.FieldCondition(
                key="severity", match=qmodels.MatchValue(value=severity)
            ))
        if event_type:
            must_conditions.append(qmodels.FieldCondition(
                key="event_type", match=qmodels.MatchValue(value=event_type)
            ))
        if host:
            must_conditions.append(qmodels.FieldCondition(
                key="host", match=qmodels.MatchValue(value=host)
            ))

        query_filter = qmodels.Filter(must=must_conditions) if must_conditions else None

        results = client.query_points(
            collection_name=QDRANT_COLLECTION,
            query=vecs[0],
            limit=limit,
            offset=offset,
            with_payload=True,
            query_filter=query_filter,
        )
        return [Event.from_qdrant(r) for r in results.points]
    except Exception as e:
        print(f"Error searching events: {e}", file=sys.stderr)
        return []


def get_events(
    limit: int = 50,
    offset: int = 0,
    source: Optional[str] = None,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    host: Optional[str] = None,
    since: Optional[str] = None,
    until: Optional[str] = None,
) -> list[Event]:
    """Get events ordered by timestamp (newest first), with optional filters."""
    try:
        client = get_client()

        must_conditions = []
        if source:
            must_conditions.append(qmodels.FieldCondition(
                key="source", match=qmodels.MatchValue(value=source)
            ))
        if severity:
            must_conditions.append(qmodels.FieldCondition(
                key="severity", match=qmodels.MatchValue(value=severity)
            ))
        if event_type:
            must_conditions.append(qmodels.FieldCondition(
                key="event_type", match=qmodels.MatchValue(value=event_type)
            ))
        if host:
            must_conditions.append(qmodels.FieldCondition(
                key="host", match=qmodels.MatchValue(value=host)
            ))

        query_filter = qmodels.Filter(must=must_conditions) if must_conditions else None

        # Use a random vector for scroll (we just want to filter, not semantic search)
        # Actually, let's use scroll for ordered retrieval
        results = client.scroll(
            collection_name=QDRANT_COLLECTION,
            limit=limit,
            with_payload=True,
            with_vectors=False,
            scroll_filter=query_filter,
            order_by={"key": "timestamp", "direction": qmodels.Direction.DESC},
        )
        return [Event.from_qdrant(r) for r in results[0]]
    except Exception as e:
        print(f"Error getting events: {e}", file=sys.stderr)
        return []


def get_event_count() -> dict:
    """Get event statistics."""
    try:
        client = get_client()
        total = client.count(collection_name=QDRANT_COLLECTION).count

        # Count by source
        sources = ["frigate", "ha", "docker", "system"]
        events_by_source = {}
        for s in sources:
            try:
                cnt = client.count(
                    collection_name=QDRANT_COLLECTION,
                    count_filter=qmodels.Filter(
                        must=[qmodels.FieldCondition(
                            key="source", match=qmodels.MatchValue(value=s)
                        )]
                    ),
                ).count
                events_by_source[s] = cnt
            except:
                events_by_source[s] = 0

        severities = ["info", "warning", "error", "critical"]
        events_by_severity = {}
        for s in severities:
            try:
                cnt = client.count(
                    collection_name=QDRANT_COLLECTION,
                    count_filter=qmodels.Filter(
                        must=[qmodels.FieldCondition(
                            key="severity", match=qmodels.MatchValue(value=s)
                        )]
                    ),
                ).count
                events_by_severity[s] = cnt
            except:
                events_by_severity[s] = 0

        return {
            "total": total,
            "by_source": events_by_source,
            "by_severity": events_by_severity,
        }
    except Exception as e:
        print(f"Error getting counts: {e}", file=sys.stderr)
        return {"total": 0, "by_source": {}, "by_severity": {}}


async def cleanup_old_events():
    """Remove excess events per source type to keep DB manageable."""
    try:
        client = get_client()
        sources = ["frigate", "ha", "docker", "system"]
        for source in sources:
            cnt = client.count(
                collection_name=QDRANT_COLLECTION,
                count_filter=qmodels.Filter(
                    must=[qmodels.FieldCondition(
                        key="source", match=qmodels.MatchValue(value=source)
                    )]
                ),
            ).count
            if cnt > MAX_EVENTS_PER_TYPE:
                # Get all points for this source, ordered by timestamp ASC
                results = client.scroll(
                    collection_name=QDRANT_COLLECTION,
                    limit=cnt - MAX_EVENTS_PER_TYPE,
                    with_payload=False,
                    with_vectors=False,
                    scroll_filter=qmodels.Filter(
                        must=[qmodels.FieldCondition(
                            key="source", match=qmodels.MatchValue(value=source)
                        )]
                    ),
                    order_by={"key": "timestamp", "direction": qmodels.Direction.ASC},
                )
                ids_to_delete = [r.id for r in results[0]]
                if ids_to_delete:
                    client.delete(
                        collection_name=QDRANT_COLLECTION,
                        points_selector=qmodels.PointIdsList(points=ids_to_delete),
                    )
                    print(f"Cleaned up {len(ids_to_delete)} old {source} events", file=sys.stderr)
    except Exception as e:
        print(f"Error cleaning up: {e}", file=sys.stderr)
