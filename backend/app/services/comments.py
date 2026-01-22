from typing import List, Optional

import httpx

from app.core.config import get_settings


def fetch_top_comments(video_id: str, max_results: int = 10) -> List[str]:
    settings = get_settings()
    api_key = settings.youtube_api_key
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY is not configured for comment enrichment.")

    params = {
        "key": api_key,
        "part": "snippet",
        "videoId": video_id,
        "maxResults": max_results,
        "order": "relevance",
        "textFormat": "plainText",
    }

    url = "https://www.googleapis.com/youtube/v3/commentThreads"
    with httpx.Client(timeout=10) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        items = resp.json().get("items", [])

    comments: List[str] = []
    for item in items:
        snippet = item.get("snippet", {})
        top_level = snippet.get("topLevelComment", {}).get("snippet", {})
        text = top_level.get("textDisplay")
        if text:
            comments.append(text)
        reply_count = snippet.get("totalReplyCount", 0)
        if reply_count and "replies" in item:
            replies = item["replies"].get("comments", [])
            for reply in replies:
                reply_text = reply.get("snippet", {}).get("textDisplay")
                if reply_text:
                    comments.append(reply_text)
    return comments
