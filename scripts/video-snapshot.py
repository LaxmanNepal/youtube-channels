import json, os, urllib.parse, urllib.request
from datetime import datetime, timezone

API_KEY=os.environ.get('YOUTUBE_API_KEY','').strip()
if not API_KEY: raise SystemExit('YOUTUBE_API_KEY is required')
CHANNELS=['laxmannepalofficial','laxmannepalenglish','iamfromhetauda','hamrotechnicalknowledge','laxmannepalvlogs','lifeoflaxman','ShreeKathaGhar','LaxmanLoFi','LNN1053','TheLaxmanNepal','TheLaneGamer','LaxmanNepalMusic']

def get(path,params):
    q=urllib.parse.urlencode({**params,'key':API_KEY})
    with urllib.request.urlopen('https://www.googleapis.com/youtube/v3/'+path+'?'+q,timeout=30) as r:return json.load(r)

def main():
    out=[]; now=datetime.now(timezone.utc)
    for handle in CHANNELS:
        try:
            j=get('channels',{'part':'snippet,contentDetails','forHandle':'@'+handle}); item=(j.get('items') or [None])[0]
            if not item: continue
            uploads=item['contentDetails']['relatedPlaylists']['uploads']
            p=get('playlistItems',{'part':'contentDetails','playlistId':uploads,'maxResults':8})
            ids=[x.get('contentDetails',{}).get('videoId') for x in p.get('items',[]) if x.get('contentDetails',{}).get('videoId')]
            videos=[]
            if ids:
                v=get('videos',{'part':'snippet,statistics','id':','.join(ids)})
                for x in v.get('items',[]):
                    s=x.get('statistics',{}); sn=x.get('snippet',{}); thumb=sn.get('thumbnails',{}).get('high',{}).get('url') or sn.get('thumbnails',{}).get('medium',{}).get('url','')
                    videos.append({'id':x['id'],'title':sn.get('title',''),'publishedAt':sn.get('publishedAt',''),'views':int(s.get('viewCount',0)),'likes':int(s.get('likeCount',0)),'comments':int(s.get('commentCount',0)),'thumbnail':thumb,'url':'https://www.youtube.com/watch?v='+x['id']})
            videos.sort(key=lambda x:x.get('publishedAt',''),reverse=True)
            out.append({'handle':handle,'title':item.get('snippet',{}).get('title',handle),'videos':videos})
        except Exception as e:
            out.append({'handle':handle,'title':handle,'videos':[],'error':str(e)})
    record={'timestamp':now.isoformat(),'date':now.date().isoformat(),'channelCount':len(CHANNELS),'channels':out}
    os.makedirs('data',exist_ok=True)
    with open('data/recent-videos.json','w',encoding='utf-8') as f: json.dump(record,f,indent=2,ensure_ascii=False); f.write('\n')
    print('Recent video snapshot:',sum(bool(x.get('videos')) for x in out),'/',len(out),'channels')
if __name__=='__main__': main()
