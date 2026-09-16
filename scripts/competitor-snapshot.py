import json, os, urllib.parse, urllib.request
from datetime import datetime, timezone

API_KEY=os.environ.get('YOUTUBE_API_KEY','').strip()
if not API_KEY: raise SystemExit('YOUTUBE_API_KEY is required')


def get(path, params):
    q=urllib.parse.urlencode({**params, 'key': API_KEY})
    with urllib.request.urlopen('https://www.googleapis.com/youtube/v3/'+path+'?'+q, timeout=30) as r:
        return json.load(r)


def main():
    with open('config/competitors.json', encoding='utf-8') as f:
        cfg=json.load(f)
    groups=cfg.get('categories', {})
    out=[]; now=datetime.now(timezone.utc)
    for category, channels in groups.items():
        for entry in channels:
            handle=entry['handle'].lstrip('@')
            try:
                j=get('channels', {'part':'snippet,statistics,contentDetails', 'forHandle':'@'+handle})
                item=(j.get('items') or [None])[0]
                if not item: continue
                stats=item.get('statistics', {})
                uploads=item.get('contentDetails',{}).get('relatedPlaylists',{}).get('uploads')
                p=get('playlistItems', {'part':'contentDetails,snippet', 'playlistId':uploads, 'maxResults':10}) if uploads else {}
                ids=[x.get('contentDetails',{}).get('videoId') for x in p.get('items',[]) if x.get('contentDetails',{}).get('videoId')]
                videos=[]
                if ids:
                    v=get('videos', {'part':'snippet,statistics', 'id':','.join(ids)})
                    for x in v.get('items',[]):
                        sn=x.get('snippet',{}); s=x.get('statistics',{})
                        videos.append({
                            'id':x['id'],'title':sn.get('title',''),'publishedAt':sn.get('publishedAt',''),
                            'views':int(s.get('viewCount',0)),'likes':int(s.get('likeCount',0)),
                            'comments':int(s.get('commentCount',0)),
                            'thumbnail':sn.get('thumbnails',{}).get('high',{}).get('url',''),
                            'url':'https://www.youtube.com/watch?v='+x['id']
                        })
                videos.sort(key=lambda x:x.get('publishedAt',''), reverse=True)
                out.append({'category':category,'handle':handle,'name':item.get('snippet',{}).get('title',entry.get('name',handle)),
                            'subs':int(stats.get('subscriberCount',0)),'views':int(stats.get('viewCount',0)),
                            'videos':int(stats.get('videoCount',0)),'latestVideos':videos})
            except Exception as e:
                out.append({'category':category,'handle':handle,'name':entry.get('name',handle),'latestVideos':[],'error':str(e)})
    os.makedirs('data', exist_ok=True)
    with open('data/competitors.json','w',encoding='utf-8') as f:
        json.dump({'timestamp':now.isoformat(),'categories':groups,'channels':out},f,indent=2,ensure_ascii=False); f.write('\n')
    print('Competitor snapshot:',len(out),'channels')

if __name__=='__main__': main()
