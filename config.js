// Optional browser-side YouTube Data API key.
// Leave blank for snapshot/directory mode. Do NOT commit a private server secret here.
window.YOUTUBE_API_KEY = '';

// UI normalization layer: loaded before the dashboard modules.
(()=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='./homepage-fix.css?v=20260916';
  document.head.appendChild(css);
  const js=document.createElement('script');
  js.src='./homepage-layout-v9.js?v=20260916';
  js.defer=true;
  document.head.appendChild(js);
})();
