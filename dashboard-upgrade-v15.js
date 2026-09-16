(()=>{
  'use strict';
  const KEY='laxman.youtube.queue.v12';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const fmt=n=>{n=Number(n||0);if(n>=1e9)return(n/1e9).toFixed(2)+'B';if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toLocaleString()};
  const avatar=c=>window.avatarMarkup?window.avatarMarkup(c,'opportunity-avatar'):`<span class="avatar-fallback">${esc((c.title||'?').charAt(0))}</span>`;
  const readQueue=()=>{try{const q=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(q)?q:[]}catch{return[]}};
  const pct=(n,d)=>d?Math.min(100,Math.round(n/d*100)):0;
  function opportunity(c,queue){
    const perVideo=c.videos?c.views/c.videos:0;
    const perSub=c.subs?c.views/c.subs:0;
    const q=queue.filter(x=>(x.handle||x.channel||'').toLowerCase()===String(c.handle||'').toLowerCase());
    const ideas=q.filter(x=>!['Published'].includes(x.status||'')).length;
    const candidates=[];
    if(c.subs>0&&c.subs<1000){const gap=1000-c.subs;candidates.push({score:90-gap/20,title:'Milestone push',text:`${fmt(gap)} subscribers remain to 1K.`,action:'Build a focused series and track each upload.'})}
    if(c.videos>0&&perVideo>=1000)candidates.push({score:84,title:'Proven reach',text:`${fmt(perVideo)} lifetime views per video on average.`,action:'Review your highest-viewed formats and make adjacent videos.'})
    if(c.videos>0&&c.subs<100&&perVideo>=100)candidates.push({score:82,title:'Discovery gap',text:`${fmt(perVideo)} views/video with ${fmt(c.subs)} subscribers.`,action:'Strengthen titles, thumbnails, hooks and channel conversion.'})
    if(c.videos>=100&&c.subs<500)candidates.push({score:76,title:'Catalog conversion',text:`${fmt(c.videos)} videos but ${fmt(c.subs)} subscribers.`,action:'Refresh strong back-catalog topics into current formats.'})
    if(c.videos<50&&c.views>1000)candidates.push({score:73,title:'Expand the catalog',text:`${fmt(c.views)} views from only ${fmt(c.videos)} videos.`,action:'Test a consistent upload series before adding more formats.'})
    if(c.subs>=500&&c.subs<1000)candidates.push({score:88,title:'500→1K runway',text:`${fmt(1000-c.subs)} subscribers remain to 1K.`,action:'Prioritize repeatable formats and milestone-focused publishing.'})
    if(!c.videos&&c.subs===0)candidates.push({score:30,title:'Start signal',text:'No published-video data in the snapshot.',action:'Add the first small, repeatable content series.'})
    if(ideas)candidates.push({score:Math.min(95,60+ideas*3),title:'Queue ready',text:`${ideas} queued item${ideas===1?'':'s'} already exist.`,action:'Move the next actionable item toward Recording or Scheduled.'})
    if(!candidates.length)candidates.push({score:45,title:'Test & learn',text:`${fmt(c.views)} views across ${fmt(c.videos)} videos.`,action:'Use the next 3 uploads as controlled format tests.'});
    return candidates.sort((a,b)=>b.score-a.score)[0];
  }
  function render(){
    const data=window.youtubeNetworkData;if(!Array.isArray(data)||!data.length)return;
    let section=document.getElementById('contentOpportunityRadarV15');
    if(!section){section=document.createElement('section');section.id='contentOpportunityRadarV15';section.className='section glass';
      const anchor=document.getElementById('creatorCalendarV13')||document.getElementById('creatorDecisionV7')||document.getElementById('channels');
      (anchor?.parentNode||document.querySelector('main')||document.body).insertBefore(section,anchor?.nextSibling||null);
    }
    const queue=readQueue();
    const rows=data.map(c=>({c,o:opportunity(c,queue)})).sort((a,b)=>b.o.score-a.o.score);
    const avgViews=data.reduce((s,c)=>s+(c.videos?c.views/c.videos:0),0)/Math.max(1,data.filter(c=>c.videos).length);
    const ready=queue.filter(x=>!['Published'].includes(x.status||'')).length;
    section.innerHTML=`<div class="section-heading"><div><span class="eyebrow">CONTENT INTELLIGENCE</span><h2>Content Opportunity Radar</h2><p>Data-led next moves from your current channel snapshot — no invented topics or growth numbers.</p></div><div class="radar-controls"><button type="button" data-radar-filter="all" class="active">All</button><button type="button" data-radar-filter="milestone">Milestones</button><button type="button" data-radar-filter="reach">Reach signals</button><button type="button" data-radar-filter="catalog">Catalog</button></div></div>
      <div class="radar-summary"><div><b>${rows.length}</b><span>channels scanned</span></div><div><b>${fmt(avgViews)}</b><span>avg views / video</span></div><div><b>${ready}</b><span>queue items ready</span></div><div><b>${fmt(Math.max(...data.map(c=>c.subs),0))}</b><span>top subscribers</span></div></div>
      <div class="radar-grid">${rows.map(({c,o},i)=>{const type=o.title.includes('Milestone')?'milestone':o.title==='500→1K runway'?'milestone':o.title.includes('reach')||o.title==='Proven reach'?'reach':'catalog';return `<article class="radar-card" data-radar-type="${type}" data-radar-title="${esc(o.title)}"><div class="radar-card-top">${avatar(c)}<div><strong>${esc(c.title)}</strong><span>@${esc(c.handle)}</span></div><em>#${i+1}</em></div><div class="radar-signal"><span>${esc(o.title)}</span><b>${Math.round(o.score)}</b></div><p>${esc(o.text)}</p><div class="radar-evidence"><span>${fmt(c.subs)} subs</span><span>${fmt(c.views)} views</span><span>${fmt(c.videos)} videos</span></div><div class="radar-action">Next move <b>${esc(o.action)}</b></div><a href="./channel.html?handle=${encodeURIComponent(c.handle)}">Open channel intelligence →</a></article>`}).join('')}</div>`;
    section.querySelectorAll('[data-radar-filter]').forEach(btn=>btn.addEventListener('click',()=>{section.querySelectorAll('[data-radar-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.radarFilter;section.querySelectorAll('.radar-card').forEach(card=>card.hidden=f!=='all'&&card.dataset.radarType!==f)}));
    if(!document.getElementById('radarV15Styles')){const s=document.createElement('style');s.id='radarV15Styles';s.textContent=`#contentOpportunityRadarV15{margin-top:22px;padding:22px;border-radius:28px}.radar-controls{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.radar-controls button{border:1px solid rgba(127,127,127,.2);background:rgba(127,127,127,.08);padding:8px 11px;border-radius:999px;cursor:pointer}.radar-controls button.active{background:#111;color:#fff}.radar-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.radar-summary>div{padding:14px;border-radius:18px;background:rgba(127,127,127,.08)}.radar-summary b{display:block;font-size:20px}.radar-summary span{font-size:11px;opacity:.65}.radar-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.radar-card{padding:16px;border:1px solid rgba(127,127,127,.16);border-radius:22px;background:rgba(127,127,127,.045)}.radar-card-top{display:flex;align-items:center;gap:10px}.opportunity-avatar-shell{width:42px;height:42px;flex:0 0 42px}.opportunity-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover}.radar-card-top div:nth-child(2){min-width:0;flex:1}.radar-card-top strong,.radar-card-top span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.radar-card-top span{font-size:11px;opacity:.6}.radar-card-top em{font-style:normal;font-size:11px;opacity:.5}.radar-signal{display:flex;justify-content:space-between;align-items:center;margin:15px 0 6px}.radar-signal span{font-weight:700}.radar-signal b{font-size:12px;padding:5px 8px;border-radius:9px;background:rgba(52,199,89,.13)}.radar-card p{font-size:13px;line-height:1.45;margin:0 0 11px;opacity:.78}.radar-evidence{display:flex;gap:7px;flex-wrap:wrap}.radar-evidence span{font-size:10px;padding:5px 7px;border-radius:8px;background:rgba(127,127,127,.1)}.radar-action{margin:12px 0;padding:10px;border-radius:12px;background:rgba(127,127,127,.07);font-size:10px;line-height:1.45}.radar-action b{display:block;font-size:12px;margin-top:2px}.radar-card>a{font-size:12px;text-decoration:none}.radar-card[hidden]{display:none}.eyebrow{font-size:10px;letter-spacing:.12em;opacity:.55}@media(max-width:900px){.radar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.radar-summary{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){#contentOpportunityRadarV15{padding:15px;border-radius:22px}.section-heading{display:block}.radar-controls{justify-content:flex-start;margin-top:12px}.radar-grid{grid-template-columns:1fr}.radar-summary{gap:7px}.radar-summary>div{padding:11px}}`;document.head.appendChild(s)}
  }
  const boot=()=>render();
  window.addEventListener('youtube-data-ready',boot);
  window.addEventListener('youtube-queue-updated',render);
  if(window.youtubeNetworkData?.length)boot();else setTimeout(boot,1200);
})();