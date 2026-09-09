(function(){
  'use strict';
  function settings(){ try{ return (window.SeymaState&&window.SeymaState.data&&window.SeymaState.data.settings)||{}; }catch(e){ return {}; } }
  function premiumOn(){ return !!settings().premiumAtmosphere; }
  function reducedMotion(){
    try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch(e){ return false; }
  }
  var S = { canvas:null, ctx:null, host:null, scene:null, running:false, raf:0, dpr:1, w:0, h:0 };

  function mount(host, scene){
    if(!host || !premiumOn()) return false;
    S.host = host; S.scene = scene || S.scene;
    var cv = (host.querySelector && host.querySelector('canvas')) || null;
    if(!cv){
      cv = document.createElement('canvas');
      cv.className = 'sey-hdr-canvas';
      cv.style.position='absolute'; cv.style.inset='0';
      cv.style.width='100%'; cv.style.height='100%';
      cv.style.pointerEvents='none';
      host.appendChild(cv);
    }
    S.canvas = cv;
    S.ctx = cv.getContext ? cv.getContext('2d') : null;
    if(!S.ctx) return false;
    resize();
    return true;
  }
  function resize(){
    if(!S.canvas || !S.host) return;
    var r = S.host.getBoundingClientRect ? S.host.getBoundingClientRect() : {width:0,height:0};
    S.dpr = Math.min(window.devicePixelRatio||1, 2);
    S.w = Math.max(1, Math.round(r.width)); S.h = Math.max(1, Math.round(r.height));
    S.canvas.width = Math.round(S.w*S.dpr); S.canvas.height = Math.round(S.h*S.dpr);
  }
  function update(scene){ if(scene) S.scene = scene; return true; }
  function pause(){ S.running=false; return true; }
  function resume(){ if(reducedMotion()) return false; S.running=true; return true; }
  function unmount(){
    S.running=false;
    if(S.canvas && S.canvas.remove) { try{ S.canvas.remove(); }catch(e){} }
    S.canvas=null; S.ctx=null; S.host=null;
    return true;
  }
  window.SeySkyFx = { mount:mount, update:update, pause:pause, resume:resume, unmount:unmount, _state:S };
})();