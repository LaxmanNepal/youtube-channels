/* YouTube Command Center v10 — freshness, dynamic network size, and small UX fixes. */
(()=>{
  const $=id=>document.getElementById(id);
  const fmt=n=>{n=Number(n||0);if(n>=1e9)return(n/1e9).toFixed(2)+'B';if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toLocaleString()};
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function ensureFreshness(){
    const heading=document.querySelector('#channels .section-heading');
    if(!heading||document.getElementById('snapshotFreshness'))return;
    const badge=document.createElement('span');
    badge.id='snapshotFreshness';
    badge.className='api-badge';
    badge.textContent='Checking snapshot…';
    badge.title='Latest saved YouTube snapshot';
    heading.appendChild(badge);
  }

  function updateNetworkCopy(){
    const rows=window.youtubeNetworkData||[];
    if(!rows.length)return;
    const count=rows.length;
    const breakdown=document.querySelector('#dataBreakdown .api-badge');
    if(breakdown)breakdown.textContent=`${count} channels`;
    const footer=document.querySelector('.site-footer p');
    if(footer)footer.textContent=`One creator. ${count} channels. One system.`;
    const footerSmall=document.querySelector('.site-footer small');
    if(footerSmall)footerSmall.textContent='Public YouTube data + saved daily snapshots from YouTube Data API v3';
  }

  async function updateFreshness(){
    ensureFreshness();
    try{
      const r=await fetch('./data/current.json?fresh='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw Error('snapshot unavailable');
      const x=await r.json();
      const ts=x.timestamp?new Date(x.timestamp):null;
      const badge=$('snapshotFreshness');
      if(!badge||!ts||Number.isNaN(ts.getTime()))return;
      const age=Math.max(0,Date.now()-ts.getTime());
      const hours=age/36e5;
      const when=ts.toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      badge.textContent=hours>36?`⚠ Snapshot ${Math.floor(hours)}h old`:`✓ Snapshot ${when}`;
      badge.title=`Last automated snapshot: ${ts.toLocaleString()}`;
      badge.dataset.stale=hours>36?'true':'false';
    }catch{
      const badge=$('snapshotFreshness');
      if(badge)badge.textContent='Snapshot status unavailable';
    }
  }

  function addSearchShortcut(){
    const input=$('searchInput');
    if(!input||input.dataset.v10)return;
    input.dataset.v10='1';
    document.addEventListener('keydown',e=>{
      if(e.key==='/' && !/input|textarea|select/i.test(document.activeElement?.tagName||'')){
        e.preventDefault();input.focus();input.select();
      }
      if(e.key==='Escape'&&document.activeElement===input){input.value='';input.dispatchEvent(new Event('input'));input.blur();}
    });
    input.title='Search channels (press / to focus, Esc to clear)';
  }

  function observeData(){
    const apply=()=>{updateNetworkCopy();addSearchShortcut();};
    window.addEventListener('youtube-data-ready',apply);
    apply();
  }

  function boot(){
    ensureFreshness();
    observeData();
    updateFreshness();
    setTimeout(updateFreshness,3000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
