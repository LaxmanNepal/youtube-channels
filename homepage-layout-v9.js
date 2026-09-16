(()=>{
function arrange(){
 const main=document.querySelector('main'); if(!main)return;
 const ids=['channels','stats','monetization','publishingPlannerV8','creatorDecisionV7','analytics','analyticsCockpitV6','growthIntelligence','commandCenterV5','dataBreakdown','focus'];
 const stats=main.querySelector('.stats-grid'); if(stats)stats.id='stats';
 const nodes=ids.map(id=>document.getElementById(id)).filter(Boolean);
 nodes.forEach(n=>main.appendChild(n));
}
function boot(){arrange();setTimeout(arrange,800);setTimeout(arrange,1800);setTimeout(arrange,3200);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.addEventListener('youtube-data-ready',()=>setTimeout(arrange,100));
})();
