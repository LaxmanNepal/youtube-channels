import json, os, urllib.parse, urllib.request
from datetime import datetime, timezone

API_KEY = os.environ["YOUTUBE_API_KEY"]
CHANNELS = [
    "laxmannepalofficial", "laxmannepalenglish", "iamfromhetauda",
    "hamrotechnicalknowledge", "laxmannepalvlogs", "lifeoflaxman",
    "ShreeKathaGhar", "LaxmanLoFi", "LNN1053", "TheLaxmanNepal"
]


def fetch(handle):
    params = urllib.parse.urlencode({
        "part": "snippet,statistics",
        "forHandle": "@" + handle,
        "key": API_KEY,
    })
    with urllib.request.urlopen("https://www.googleapis.com/youtube/v3/channels?" + params, timeout=30) as r:
        data = json.load(r)
    item = (data.get("items") or [None])[0]
    if not item:
        return {"handle": handle, "error": "Channel not found"}
    s = item.get("statistics", {})
    return {
        "id": item["id"],
        "handle": handle,
        "title": item.get("snippet", {}).get("title", handle),
        "subscribers": int(s.get("subscriberCount", 0)),
        "views": int(s.get("viewCount", 0)),
        "videos": int(s.get("videoCount", 0)),
    }


now = datetime.now(timezone.utc)
record = {
    "timestamp": now.isoformat(),
    "date": now.date().isoformat(),
    "channels": [fetch(h) for h in CHANNELS],
}

os.makedirs("data/history", exist_ok=True)
with open(f"data/history/{now.date().isoformat()}.json", "w", encoding="utf-8") as f:
    json.dump(record, f, indent=2)
with open("data/history/latest.json", "w", encoding="utf-8") as f:
    json.dump(record, f, indent=2)

# Keep one browser-friendly compact time series for 7/30/90-day analysis.
series_path = "data/history/series.json"
series = []
if os.path.exists(series_path):
    try:
        with open(series_path, "r", encoding="utf-8") as f:
            series = json.load(f)
    except (json.JSONDecodeError, OSError):
        series = []

series = [row for row in series if row.get("date") != record["date"]]
series.append(record)
series.sort(key=lambda row: row.get("date", ""))

with open(series_path, "w", encoding="utf-8") as f:
    json.dump(series, f, indent=2)
