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
  // Yıldız alanı: yalnız gece. Dağılım sc.seed'den DETERMİNİSTİK üretilir —
  // gün içinde sabit, gün gün farklı. Parıldama zamana bağlı.
  function drawStars(ctx, w, h, sc, t){
    if (sc.time !== 'amb-time-night') return;
    var seed = typeof sc.seed === 'number' ? sc.seed : 0.5;
    var n = 46;
    ctx.save();
    for (var i = 1; i <= n; i++){
      var r1 = frac(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453);
      var r2 = frac(Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345);
      var x = r1 * w, y = r2 * h * 0.70;
      var tw = 0.55 + 0.45 * Math.sin(t / 680 + i);
      ctx.globalAlpha = (0.22 + 0.55 * r2) * tw;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, 0.6 + r1 * 1.0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // İki parallax düzlemde hacimli bulut. Her bulut üst üste binen elipslerden
  // oluşur (tek blob DEĞİL) — kenarı organik görünsün.
  function cloudPuff(ctx, x, y, s, alpha, tint){
    ctx.globalAlpha = alpha;
    ctx.fillStyle = tint;
    var pts = [[0,0,1],[-0.62,0.12,0.72],[0.60,0.14,0.76],[-0.30,-0.24,0.66],[0.32,-0.20,0.62]];
    for (var i = 0; i < pts.length; i++){
      ctx.beginPath();
      ctx.arc(x + pts[i][0]*s, y + pts[i][1]*s, s*pts[i][2], 0, Math.PI*2);
      ctx.fill();
    }
  }
  function drawClouds(ctx, w, h, sc, t){
    var wx = sc.weather;
    if (wx !== 'amb-wx-cloud' && wx !== 'amb-wx-rain' && wx !== 'amb-wx-drizzle' &&
        wx !== 'amb-wx-storm' && wx !== 'amb-wx-snow') return;
    var night = (sc.time === 'amb-time-night');
    var storm = (wx === 'amb-wx-storm');
    var tint = storm ? (night ? '#2A2740' : '#6E6A86')
                     : (night ? '#3A4358' : '#E6EAF2');
    var seed = typeof sc.seed === 'number' ? sc.seed : 0.5;
    ctx.save();
    // uzak düzlem — yavaş, küçük, soluk
    var far = (t * 0.006) % (w + 260);
    for (var i = 0; i < 3; i++){
      var fx = ((far + i * (w / 2.4) + seed * 180) % (w + 260)) - 130;
      cloudPuff(ctx, fx, h * (0.26 + 0.06 * frac(seed * (i + 3))), h * 0.17, 0.30, tint);
    }
    // yakın düzlem — hızlı, büyük, belirgin
    var near = (t * 0.014) % (w + 340);
    for (var j = 0; j < 2; j++){
      var nx = ((near + j * (w / 1.5) + seed * 90) % (w + 340)) - 170;
      cloudPuff(ctx, nx, h * (0.40 + 0.08 * frac(seed * (j + 7))), h * 0.25, 0.46, tint);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Katman çizimi. Sonraki kartlar buraya katman EKLER.
  function draw(ctx, w, h, sc, t){
    ctx.clearRect(0, 0, S.canvas.width, S.canvas.height);
    ctx.save();
    ctx.scale(S.dpr, S.dpr);
    drawStars(ctx, w, h, sc, t);
    drawCelestial(ctx, w, h, sc, t);
    drawClouds(ctx, w, h, sc, t);
    // SKY-07..09 katmanları buraya eklenecek
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