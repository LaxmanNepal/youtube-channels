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
  const v11=document.createElement('script');
  v11.src='./dashboard-upgrade-v11.js?v=20260917';
  v11.defer=true;
  document.head.appendChild(v11);
  const v13=document.createElement('script');
  v13.src='./dashboard-upgrade-v13.js?v=20260917';
  v13.defer=true;
  document.head.appendChild(v13);
  const v14=document.createElement('script');
  v14.src='./dashboard-upgrade-v14.js?v=20260917';
  v14.defer=true;
  document.head.appendChild(v14);
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20260916a').catch(()=>{}),{once:true});
  }
})();
