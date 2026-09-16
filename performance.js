(()=>{
  'use strict';

  // Keep image decoding off the critical rendering path.
  function optimizeImages(root=document){
    root.querySelectorAll('img').forEach(img=>{
      if(!img.hasAttribute('loading')) img.loading='lazy';
      if(!img.hasAttribute('decoding')) img.decoding='async';
      img.setAttribute('fetchpriority','low');
    });
  }

  // Run after the first paint so the dashboard can become interactive sooner.
  const idle=window.requestIdleCallback||((cb)=>setTimeout(cb,120));
  const boot=()=>{
    optimizeImages();
    if(window.MutationObserver){
      const observer=new MutationObserver(mutations=>{
        for(const mutation of mutations){
          mutation.addedNodes.forEach(node=>{
            if(node.nodeType===1){
              if(node.tagName==='IMG') optimizeImages(node.parentElement||document);
              else if(node.querySelector) optimizeImages(node);
            }
          });
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>observer.disconnect(),15000);
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>idle(boot),{once:true});
  else idle(boot);
})();
