(() => {
  const $ = id => document.getElementById(id);
  const fmt = n => { n=Number(n||0); if(n>=1e9)return(n/1e9).toFixed(2)+'B'; if(n>=1e6)return(n/1e6).toFixed(2)+'M'; if(n>=1e3)return(n/1e3).toFixed(1)+'K'; return n.toLocaleString(); };
  const esc = s => String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  let selected = [];
  let metric = 'subs';
  let asc = false;
  const palette=['#ff375f','#ff9f0a','#34c759','#0a84ff','#5e5ce6','#bf5af2','#64d2ff','#30d158','#ff453a','#ffd60a'];
  function getData(){ return Array.isArray(window.youtubeNetworkData) ? window.youtubeNetworkData : []; }
  function inject(){
    if($('comparison')) return;
    const anchor=$('dataBreakdown')||$('channels'); if(!anchor)return;
    const section=document.createElement('section'); section.className='section'; section.id='comparison';
    section.innerHTML=`<div class="section-heading"><div><p class="eyebrow">NETWORK COMPARISON</p><h2>Compare channels side by side.</h2><p>Select channels and change the metric to see the gaps clearly.</p></div><span id="compareCount" class="api-badge">0 selected</span></div><article class="comparison-card glass"><div class="compare-toolbar"><div id="comparePicker" class="compare-picker"></div><div class="compare-actions"><select id="compareMetric"><option value="subs">Subscribers</option><option value="views">Views</option><option value="videos">Videos</option><option value="viewsPerVideo">Views / video</option><option value="subsPerVideo">Subscribers / video</option></select><button id="compareAll" class="mini-button" type="button">Select all</button><button id="compareClear" class="mini-button" type="button">Clear</button></div></div><div id="compareBars" class="comparison-bars"></div><div class="comparison-table-wrap"><table class="comparison-table"><thead><tr><th>Channel</th><th>Subscribers</th><th>Views</th><th>Videos</th><th>Views/video</th><th>Subs/video</th><th>Gap to leader</th></tr></thead><tbody id="compareRows"></tbody></table></div></article>`;
    anchor.after(section);
    $('compareMetric').addEventListener('change',e=>{metric=e.target.value;draw()});
    $('compareAll').addEventListener('click',()=>{selected=getData().map(c=>c.handle);draw()});
    $('compareClear').addEventListener('click',()=>{selected=[];draw()});
    draw();
  }
  function picker(){
    const box=$('comparePicker'); if(!box)return;
    box.innerHTML=getData().map((c,i)=>`<label class="compare-chip ${selected.includes(c.handle)?'selected':''}"><input type="checkbox" value="${esc(c.handle)}" ${selected.includes(c.handle)?'checked':''}><img src="${esc(c.avatar||'')}" alt=""><span>${esc(c.title)}</span></label>`).join('');
    box.querySelectorAll('input').forEach(input=>input.addEventListener('change',e=>{const h=e.target.value;if(e.target.checked){if(!selected.includes(h))selected.push(h)}else selected=selected.filter(x=>x!==h);draw()}));
  }
  function value(c){const v=metric==='subs'?c.subs:metric==='views'?c.views:metric==='videos'?c.videos:metric==='viewsPerVideo'?c.views/Math.max(1,c.videos):c.subs/Math.max(1,c.videos);return Number(v||0)}
  function draw(){
    const all=getData(); if(!all.length)return; if(!selected.length)selected=all.slice(0,Math.min(4,all.length)).map(c=>c.handle);
    const rows=all.filter(c=>selected.includes(c.handle)).sort((a,b)=>asc?value(a)-value(b):value(b)-value(a));
    const max=Math.max(...rows.map(value),1), leader=rows[0];
    if($('compareCount'))$('compareCount').textContent=`${rows.length} selected`;
    picker();
    $('compareBars').innerHTML=rows.map((c,i)=>`<div class="compare-bar-row"><div class="compare-bar-name"><span class="compare-rank">${i+1}</span><img src="${esc(c.avatar||'')}" alt=""><span>${esc(c.title)}</span></div><div class="compare-track"><i style="width:${Math.max(3,value(c)/max*100)}%;background:${palette[i%palette.length]}"></i></div><b>${fmt(value(c))}</b></div>`).join('');
    $('compareRows').innerHTML=rows.map((c,i)=>{const vp=c.views/Math.max(1,c.videos),sp=c.subs/Math.max(1,c.videos),gap=Math.max(0,value(leader)-value(c));return`<tr><td><div class="compare-channel"><img src="${esc(c.avatar||'')}" alt=""><span><strong>${esc(c.title)}</strong><small>@${esc(c.handle)}</small></span>${i===0?'<em>LEADER</em>':''}</div></td><td>${fmt(c.subs)}</td><td>${fmt(c.views)}</td><td>${fmt(c.videos)}</td><td>${fmt(vp)}</td><td>${sp.toFixed(2)}</td><td>${i===0?'—':fmt(gap)}</td></tr>`}).join('');
  }
  function boot(){inject();const observer=new MutationObserver(()=>{if(!window.youtubeNetworkData?.length)return;inject();});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{const d=getData();if(d.length){selected=d.slice(0,4).map(c=>c.handle);draw()}},800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();