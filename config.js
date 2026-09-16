// Optional browser-side YouTube Data API key.
// Leave blank for snapshot/directory mode. Do NOT commit a private server secret here.
window.YOUTUBE_API_KEY = '';

// UI normalization + performance layer.
(()=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='./homepage-fix.css?v=20260916d';
  document.head.appendChild(css);
  const js=document.createElement('script');
  js.src='./homepage-layout-v9.js?v=20260916d';
  js.defer=true;
  document.head.appendChild(js);
  const perf=document.createElement('script');
  perf.src='./performance.js?v=20260916a';
  perf.defer=true;
  document.head.appendChild(perf);
})();
