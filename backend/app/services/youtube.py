import datetime as dt
from typing import Dict, List, Optional

import httpx

from app.core.config import get_settings

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


def _parse_iso_duration(duration: str) -> int:
    """
    Parse ISO8601 duration (e.g., PT1H2M3S) to seconds.
    """
    if not duration:
        return 0
    total = 0
    time_str = duration.replace("PT", "")
    num = ""
    for ch in time_str:
        if ch.isdigit():
            num += ch
            continue
        if ch == "H":
            total += int(num or 0) * 3600
        elif ch == "M":
            total += int(num or 0) * 60
        elif ch == "S":
            total += int(num or 0)
        num = ""
    return total


def fetch_youtube_metadata(
    topics: List[str],
    max_results_per_topic: int = 5,
    min_view_count: int = 0,
    max_age_days: Optional[int] = 365,
    exclude_keywords: Optional[List[str]] = None,
    order: str = "relevance",
) -> List[Dict]:
    settings = get_settings()
    api_key = settings.youtube_api_key
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY is not set in the environment.")

    exclude_keywords = [kw.lower() for kw in (exclude_keywords or [])]
    cutoff_date = None
    if max_age_days:
        cutoff_date = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=max_age_days)

    headers = {"Accept": "application/json"}
    by_id: Dict[str, Dict] = {}

    with httpx.Client(timeout=10) as client:
        for topic in topics:
            search_params = {
                "key": api_key,
                "q": topic,
                "part": "snippet",
                "type": "video",
                "maxResults": max_results_per_topic,
                "order": order,
                "safeSearch": "none",
            }

            search_resp = client.get(YOUTUBE_SEARCH_URL, params=search_params, headers=headers)
            search_resp.raise_for_status()
            search_items = search_resp.json().get("items", [])

            video_ids = [item["id"]["videoId"] for item in search_items if item.get("id", {}).get("videoId")]
            if not video_ids:
                continue

            video_params = {
                "key": api_key,
                "id": ",".join(video_ids),
                "part": "snippet,contentDetails,statistics",
            }
            video_resp = client.get(YOUTUBE_VIDEOS_URL, params=video_params, headers=headers)
            video_resp.raise_for_status()
            for item in video_resp.json().get("items", []):
                video_id = item.get("id")
                snippet = item.get("snippet", {})
                stats = item.get("statistics", {})
                content = item.get("contentDetails", {})

                title = (snippet.get("title") or "").strip()
                description = snippet.get("description") or ""
                title_desc = f"{title} {description}".lower()

                if any(bad in title_desc for bad in exclude_keywords):
                    continue

                published_at = snippet.get("publishedAt")
                published_dt = None
                if published_at:
                    try:
                        published_dt = dt.datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                    except ValueError:
                        published_dt = None

                if cutoff_date and published_dt and published_dt < cutoff_date:
                    continue

                view_count = int(stats.get("viewCount", 0) or 0)
                if view_count < min_view_count:
                    continue

                record = by_id.get(video_id, {})
                merged_topics = set(record.get("topics_source", []))
                merged_topics.add(topic)

                by_id[video_id] = {
                    "video_id": video_id,
                    "title": title,
                    "description": description,
                    "channel_title": snippet.get("channelTitle"),
                    "published_at": published_dt.isoformat() if published_dt else None,
                    "duration_seconds": _parse_iso_duration(content.get("duration", "")),
                    "view_count": view_count,
                    "like_count": int(stats.get("likeCount", 0) or 0),
                    "topics_source": list(merged_topics),
                    "raw": item,
                }

    return list(by_id.values())
