from langchain.tools import Tool
from rapidfuzz import fuzz
from yt_dlp import YoutubeDL
import re


def parse_count(text):
    multipliers = {'K': 1e3, 'M': 1e6, 'B': 1e9}
    if not text:
        return 0
    match = re.match(r'([\d\.]+)([KMB]?)', text.replace(",", ""))
    if not match:
        return 0
    num, suffix = match.groups()
    return int(float(num) * multipliers.get(suffix, 1))


def youtube_search(query: str, top_k: int = 4) -> list[dict]:
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'skip_download': True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        search_query = f"ytsearch15:{query}"
        info = ydl.extract_info(search_query, download=False)
        entries = info.get("entries", [])

    if not entries:
        return []

    scored = []
    for video in entries:
        title = video.get("title", "")
        similarity = fuzz.token_sort_ratio(query.lower(), title.lower())
        views = video.get("view_count", 0)
        duration = video.get("duration") or 0

        thumbnails_list = video.get("thumbnails", "")
        # print(video)
        scored.append(((similarity, views), {
            "title": title,
            "videoId": video.get("id", ""),
            "channelTitle": video.get("uploader", ""),
            "description": (video.get("description") or "")[:200],
            "thumbnailUrl": (
                    thumbnails_list[1]["url"] if len(thumbnails_list) > 1
                    else thumbnails_list[0]["url"] if thumbnails_list
                    else ""
                ),
            "viewCount": views,
            "duration": f"{int(duration) // 60}:{int(duration) % 60:02d}" if duration else "N/A",
            "url": f"https://www.youtube.com/watch?v={video.get('id', '')}"
        }))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [entry[1] for entry in scored[:top_k]]



#? Step 4: LangChain Tool
YouTubeSearch = Tool(
    name="YouTubeSearch",
    func=youtube_search,
    description="Search youtube and get top videos"
)