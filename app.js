const API_KEY=window.YOUTUBE_API_KEY||'';
const channels=[['laxmannepalofficial','Laxman Nepal Official'],['laxmannepalenglish','Laxman Nepal English'],['iamfromhetauda','I Am From Hetauda'],['hamrotechnicalknowledge','Hamro Technical Knowledge'],['laxmannepalvlogs','Laxman Nepal Vlogs'],['lifeoflaxman','Life of Laxman'],['ShreeKathaGhar','Shree Katha Ghar'],['LaxmanLoFi','Laxman LoFi'],['LNN1053','LNN1053'],['TheLaxmanNepal','The Laxman Nepal']];
let data=[],subDesc=false;
const $=id=>document.getElementById(id);
const fmt=n=>{n=Number(n||0);if(n>=1e9)return(n/1e9).toFixed(2)+'B';if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toLocaleString()};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function status(text,type='live'){
  const el=$('lastUpdated');
  if(el)el.innerHTML=`<i></i> ${esc(text)}`;
  document.body.dataset.dataMode=type;
}
function toast(text){const x=$('toast');if(!x)return;x.textContent=text;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2800)}
function normalize(c){return{id:c.id,handle:c.handle||c.snippet?.customUrl?.replace(/^@/,'')||'',title:c.title||c.snippet?.title||c.handle||'',avatar:c.avatar||c.snippet?.thumbnails?.high?.url||c.snippet?.thumbnails?.medium?.url||c.snippet?.thumbnails?.default?.url||'',subs:Number(c.subs??c.subscribers??c.statistics?.subscriberCount??0),views:Number(c.views??c.viewCount??c.statistics?.viewCount??0),videos:Number(c.videos??c.videoCount??c.statistics?.videoCount??0)}}

async function fetchJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(`${r.status} ${r.statusText}`);return r.json()}
async function loadSnapshot(){const x=await fetchJson('./data/current.json?ts='+Date.now());const rows=Array.isArray(x)?x:(x.channels||[]);const out=rows.map(normalize).filter(c=>c.id&&c.title);if(!out.length)throw Error('Snapshot contains no valid channels');return out}
async function youtube(handle){
  if(!API_KEY)throw Error('browser API key unavailable');
  const q=new URLSearchParams({part:'snippet,statistics',forHandle:'@'+handle,key:API_KEY});
  const r=await fetch('https://www.googleapis.com/youtube/v3/channels?'+q,{cache:'no-store'});
  let j={};try{j=await r.json()}catch{}
  if(!r.ok)throw Error(j.error?.message||`YouTube API ${r.status}`);
  return j.items?.[0]||null;
}
async function loadLive(){
  const results=await Promise.allSettled(channels.map(async([handle])=>{
    const c=await youtube(handle);if(!c)return null;
    return normalize({id:c.id,handle,title:c.snippet?.title,avatar:c.snippet?.thumbnails?.high?.url||c.snippet?.thumbnails?.medium?.url||c.snippet?.thumbnails?.default?.url,subs:c.statistics?.subscriberCount,views:c.statistics?.viewCount,videos:c.statistics?.videoCount});
  }));
  const good=results.filter(r=>r.status==='fulfilled'&&r.value).map(r=>r.value);
  if(good.length<1)throw Error('YouTube returned no channel records');
  return good;
}

function render(){
  if(!data.length)return;
  const subs=data.reduce((a,c)=>a+c.subs,0),views=data.reduce((a,c)=>a+c.views,0),videos=data.reduce((a,c)=>a+c.videos,0);
  if($('totalSubs'))$('totalSubs').textContent=fmt(subs);
  if($('totalViews'))$('totalViews').textContent=fmt(views);
  if($('totalVideos'))$('totalVideos').textContent=fmt(videos);
  if($('networkScore'))$('networkScore').textContent=networkScore(data);
  if($('channelCount'))$('channelCount').textContent=data.length;
  renderBars();renderDonut();renderCards();renderMonetization();
}
function networkScore(a){if(!a.length)return'—';const s=a.reduce((x,c)=>x+Math.log10(c.subs+1)*45+Math.log10(c.views+1)*25+Math.log10(c.videos+1)*10,0);return Math.min(100,Math.round(s/(a.length*6.2)))+'/100'}
function renderBars(){
  const box=$('subscriberChart');if(!box)return;
  const a=[...data].sort((x,y)=>subDesc?x.subs-y.subs:y.subs-x.subs),max=Math.max(...a.map(x=>x.subs),1);
  box.innerHTML=a.map(c=>`<div class="bar-row"><span class="bar-label" title="${esc(c.title)}">${esc(c.title)}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.max(2,Math.sqrt(c.subs/max)*100)}%"></span></span><span class="bar-value">${fmt(c.subs)}</span></div>`).join('');
}
function renderDonut(){
  const box=$('shareChart');if(!box||!data.length)return;
  const a=[...data].sort((x,y)=>y.subs-x.subs),total=a.reduce((x,c)=>x+c.subs,0)||1;
  const palette=['#ff375f','#ff9f0a','#34c759','#0a84ff','#5e5ce6','#bf5af2','#64d2ff','#30d158','#ff453a','#ffd60a'];let deg=0;
  const stops=a.map((c,i)=>{const next=deg+c.subs/total*360,s=palette[i%palette.length],z=`${s} ${deg}deg ${next}deg`;deg=next;return z}).join(',');
  box.style.background=`conic-gradient(${stops})`;
  if($('topShare'))$('topShare').textContent=Math.round((a[0]?.subs||0)/total*100)+'%';
  if($('shareLegend'))$('shareLegend').innerHTML=a.map((c,i)=>`<div class="legend-item"><i class="legend-dot" style="background:${palette[i%palette.length]}"></i><span>${esc(c.title)}</span></div>`).join('');
}
function renderCards(){
  const box=$('channelGrid');if(!box)return;
  const q=($('searchInput')?.value||'').trim().toLowerCase(),sort=$('sortSelect')?.value||'subs';
  let a=data.filter(c=>(c.title+' '+c.handle).toLowerCase().includes(q));
  a.sort((x,y)=>sort==='name'?x.title.localeCompare(y.title):Number(y[sort]||0)-Number(x[sort]||0));
  box.innerHTML=a.map((c,i)=>`<article class="channel-card glass" data-channel="${esc(c.handle)}" onclick="location.href='./channel.html?handle=${encodeURIComponent(c.handle)}'"><img class="channel-avatar" src="${esc(c.avatar)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><div><h3>${esc(c.title)}</h3><span class="handle">@${esc(c.handle)}</span><div class="channel-metrics"><span class="metric"><b>${fmt(c.subs)}</b><span>subs</span></span><span class="metric"><b>${fmt(c.views)}</b><span>views</span></span><span class="metric"><b>${fmt(c.videos)}</b><span>videos</span></span></div></div><a class="open-channel" href="https://www.youtube.com/channel/${encodeURIComponent(c.id)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">↗</a></article>`).join('')||'<div class="loading glass">No matching channels.</div>';
}
function renderMonetization(){
  const grid=$('monetizationGrid');if(!grid)return;
  const sorted=[...data].sort((a,b)=>b.subs-a.subs),top=sorted[0],near=sorted.find(c=>c.subs<1000)||top;
  grid.innerHTML=data.map(c=>{const p500=Math.min(100,c.subs/500*100),p1000=Math.min(100,c.subs/1000*100),gap=Math.max(0,1000-c.subs);return`<article class="growth-card glass"><b>${esc(c.title)}</b><span>${fmt(c.subs)} subscribers</span><div class="mini-progress"><i style="width:${p500}%"></i></div><small>500 gate: ${Math.round(p500)}%</small><div class="mini-progress"><i style="width:${p1000}%"></i></div><small>1,000 gate: ${Math.round(p1000)}% • ${gap?fmt(gap)+' left':'reached 🎉'}</small><a class="text-link" href="./channel.html?handle=${encodeURIComponent(c.handle)}">Open mission →</a></article>`}).join('');
  if($('monetizationTop'))$('monetizationTop').textContent=top?`${top.title} leads with ${fmt(top.subs)} subscribers.`:'No channel data';
  if($('monetizationNear'))$('monetizationNear').textContent=near?`${near.title} is closest to 1,000 at ${fmt(near.subs)}.`:'No channel data';
}

async function load(){
  status('Loading saved snapshot…','snapshot');
  try{
    data=await loadSnapshot();
    render();
    status(`Snapshot loaded • ${data.length} channels • ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`,'snapshot');
  }catch(e){
    data=[];
    if($('channelGrid'))$('channelGrid').innerHTML=`<div class="loading glass">Snapshot unavailable: ${esc(e.message)}</div>`;
    status('Snapshot unavailable','error');
  }
  if(!API_KEY){toast('Showing GitHub snapshot. No browser API key is configured.');return}
  try{
    const live=await loadLive();
    data=live;render();
    status(`● Live YouTube data • ${data.length} channels • ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`,'live');
  }catch(e){
    if(data.length){status(`Snapshot mode • live API unavailable • ${data.length} channels`,'snapshot');toast('Live API unavailable — latest GitHub snapshot is still visible.');}
    else{status('Live data failed','error');toast('Could not load YouTube or snapshot data: '+e.message)}
  }
}

$('refreshBtn')?.addEventListener('click',load);
$('sortSubs')?.addEventListener('click',()=>{subDesc=!subDesc;renderBars()});
$('searchInput')?.addEventListener('input',renderCards);
$('sortSelect')?.addEventListener('change',renderCards);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
