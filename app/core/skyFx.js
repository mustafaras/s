(function(){
  'use strict';
  function settings(){ try{ return (window.SeymaState&&window.SeymaState.data&&window.SeymaState.data.settings)||{}; }catch(e){ return {}; } }
  function premiumOn(){ return !!settings().premiumAtmosphere; }
  function reducedMotion(){
    try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch(e){ return false; }
  }
  var S = { canvas:null, ctx:null, host:null, scene:null, running:false, raf:0, dpr:1, w:0, h:0, last:0 };

  // Kare döngüsü. setInterval YASAK — yalnız rAF (SKY-00 §3 değişmezi).
  function frame(ts){
    if(!S.running || !S.ctx) return;
    S.last = ts || 0;
    draw(S.ctx, S.w, S.h, S.scene || {}, S.last);
    S.raf = window.requestAnimationFrame(frame);
  }
  // Tek kare çiz (reduced-motion veya duraklatma için).
  function drawOnce(){
    if(!S.ctx) return false;
    draw(S.ctx, S.w, S.h, S.scene || {}, S.last || 0);
    return true;
  }
  // 0–1 kesirli parça (deterministik gürültü için).
  function frac(v){ return v - Math.floor(v); }
  // Güneş/ay: header yayıyla AYNI Bézier üzerinde konumlanır.
  function drawCelestial(ctx, w, h, sc, t){
    var p = Math.max(0, Math.min(1, typeof sc.solar === 'number' ? sc.solar : 0.5));
    var night = (sc.time === 'amb-time-night');
    var mt = 1 - p;
    var x = mt*mt*(0.06*w) + 2*mt*p*(0.50*w) + p*p*(0.94*w);
    var y = mt*mt*(0.86*h) + 2*mt*p*(-0.05*h) + p*p*(0.86*h);
    var r = night ? h*0.075 : h*0.095;
    ctx.save();
    var g = ctx.createRadialGradient(x, y, 0, x, y, r*3.4);
    g.addColorStop(0, night ? 'rgba(206,222,252,0.50)' : 'rgba(255,224,150,0.62)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r*3.4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = night ? '#E9EFFC' : '#FFEBAE';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  // Katman çizimi. Sonraki kartlar buraya katman EKLER.
  function draw(ctx, w, h, sc, t){
    ctx.clearRect(0, 0, S.canvas.width, S.canvas.height);
    ctx.save();
    ctx.scale(S.dpr, S.dpr);
    drawCelestial(ctx, w, h, sc, t);
    // SKY-05..09 katmanları buraya eklenecek
    ctx.restore();
  }

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
    if(reducedMotion()){ drawOnce(); return true; }   // renk kalır, hareket durur
    resume();
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
  function pause(){
    S.running = false;
    if(S.raf) { try{ window.cancelAnimationFrame(S.raf); }catch(e){} S.raf = 0; }
    return true;
  }
  function resume(){
    if(!S.ctx || reducedMotion()) return false;
    if(S.running) return true;
    S.running = true;
    S.raf = window.requestAnimationFrame(frame);
    return true;
  }
  function unmount(){
    S.running=false;
    if(S.canvas && S.canvas.remove) { try{ S.canvas.remove(); }catch(e){} }
    S.canvas=null; S.ctx=null; S.host=null;
    return true;
  }
  if(typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('visibilitychange', function(){
      if(document.hidden) pause(); else resume();
    });
  }
  window.SeySkyFx = { mount:mount, update:update, pause:pause, resume:resume, unmount:unmount, _state:S };
})();