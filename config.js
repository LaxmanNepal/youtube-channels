// Optional browser-side YouTube Data API key.
// Leave blank for snapshot/directory mode. Do NOT commit a private server secret here.
window.YOUTUBE_API_KEY = '';

// UI normalization + performance + instant-loading cache.
(()=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='./homepage-fix.css?v=20260916e';
  document.head.appendChild(css);
  const js=document.createElement('script');
  js.src='./homepage-layout-v9.js?v=20260916e';
  js.defer=true;
  document.head.appendChild(js);
  const perf=document.createElement('script');
  perf.src='./performance.js?v=20260916b';
  perf.defer=true;
  document.head.appendChild(perf);
  const v10=document.createElement('script');
  v10.src='./dashboard-upgrade-v10.js?v=20260917';
  v10.defer=true;
  document.head.appendChild(v10);
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20260916a').catch(()=>{}),{once:true});
  }
})();
