import json, os, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone

API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()
if not API_KEY:
    raise SystemExit("YOUTUBE_API_KEY is required")

CHANNELS = [
    "laxmannepalofficial", "laxmannepalenglish", "iamfromhetauda",
    "hamrotechnicalknowledge", "laxmannepalvlogs", "lifeoflaxman",
    "ShreeKathaGhar", "LaxmanLoFi", "LNN1053", "TheLaxmanNepal",
    "TheLaneGamer", "LaxmanNepalMusic"
]

def detect_image_extension(content, content_type=""):
    content_type=(content_type or "").lower().split(";",1)[0].strip()
    if content.startswith(b"\xff\xd8\xff") or content_type=="image/jpeg": return "jpg"
    if content.startswith(b"\x89PNG\r\n\x1a\n") or content_type=="image/png": return "png"
    if content.startswith(b"RIFF") and content[8:12]==b"WEBP": return "webp"
    if content_type=="image/webp": return "webp"
    if content_type=="image/avif" or content[4:12]==b"ftypavif": return "avif"
    return "jpg"

def save_avatar(channel_id,url):
    if not channel_id or not url:return ""
    os.makedirs("data/avatars",exist_ok=True)
    try:
        req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req,timeout=20) as r:
            content=r.read(); content_type=r.headers.get("Content-Type","")
        if not content:return ""
        ext=detect_image_extension(content,content_type); path=f"data/avatars/{channel_id}.{ext}"
        with open(path,"wb") as f:f.write(content)
        return f"./data/avatars/{channel_id}.{ext}"
    except (urllib.error.URLError,urllib.error.HTTPError,TimeoutError,OSError):return ""

def fetch(handle):
    params=urllib.parse.urlencode({"part":"snippet,statistics","forHandle":"@"+handle,"key":API_KEY})
    url="https://www.googleapis.com/youtube/v3/channels?"+params; last_error="Request failed"
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url,timeout=30) as r:data=json.load(r)
            item=(data.get("items") or [None])[0]
            if not item:return {"handle":handle,"error":"Channel not found"}
            s=item.get("statistics",{}); snippet=item.get("snippet",{}); thumbs=snippet.get("thumbnails",{})
            remote=thumbs.get("high",{}).get("url") or thumbs.get("medium",{}).get("url") or thumbs.get("default",{}).get("url") or ""
            avatar=save_avatar(item["id"],remote)
            return {"id":item["id"],"handle":handle,"title":snippet.get("title",handle),"avatar":avatar,"avatarRemote":remote,"subscribers":int(s.get("subscriberCount",0)),"views":int(s.get("viewCount",0)),"videos":int(s.get("videoCount",0))}
        except urllib.error.HTTPError as e:
            try:body=json.load(e); last_error=body.get("error",{}).get("message",f"HTTP {e.code}")
            except Exception:last_error=f"HTTP {e.code}"
            if e.code not in (429,500,502,503,504):break
        except (urllib.error.URLError,TimeoutError,ValueError,OSError) as e:last_error=str(e) or "Request failed"
        if attempt<2:time.sleep(2**attempt)
    return {"handle":handle,"error":last_error}

now=datetime.now(timezone.utc); channels=[fetch(h) for h in CHANNELS]; successes=[c for c in channels if not c.get("error")]; failures=[c for c in channels if c.get("error")]
if not successes:raise SystemExit("All YouTube channel requests failed; refusing to replace the last good snapshot")
record={"timestamp":now.isoformat(),"date":now.date().isoformat(),"channelCount":len(CHANNELS),"successfulChannels":len(successes),"failedChannels":len(failures),"channels":channels}
os.makedirs("data/history",exist_ok=True)
def write_json(path,value):
    temp=path+".tmp"
    with open(temp,"w",encoding="utf-8") as f:json.dump(value,f,indent=2,ensure_ascii=False);f.write("\n")
    os.replace(temp,path)
write_json("data/current.json",record); write_json(f"data/history/{now.date().isoformat()}.json",record); write_json("data/history/latest.json",record)
series_path="data/history/series.json"; series=[]
if os.path.exists(series_path):
    try:
        with open(series_path,"r",encoding="utf-8") as f:loaded=json.load(f)
        if isinstance(loaded,list):series=loaded
    except (json.JSONDecodeError,OSError):series=[]
series=[row for row in series if row.get("date")!=record["date"]];series.append(record);series.sort(key=lambda row:row.get("date",""));write_json(series_path,series)
print(f"Snapshot: {len(successes)}/{len(CHANNELS)} channels succeeded");print(f"Avatars cached: {sum(bool(c.get('avatar')) for c in successes)}/{len(successes)}")
if failures:
    print("Warnings:");[print(f"- @{c['handle']}: {c['error']}") for c in failures]
