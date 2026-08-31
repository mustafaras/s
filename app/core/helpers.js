(function(){
  'use strict';
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function icon(name,size){ return window.SeymaConstants && window.SeymaConstants.ICON ? window.SeymaConstants.ICON(name,size||16) : ''; }
  function find(arr,key,val){ for(var i=0;i<arr.length;i++){ if(arr[i][key]===val) return arr[i]; } return null; }

  function segTabs(defs,active,fn,accent){
    var grad=(accent==='watch')?'linear-gradient(135deg,var(--watch),color-mix(in srgb,var(--watch) 72%,#E0B080))':(accent==='listen')?'linear-gradient(135deg,#0E9AA7,var(--listen))':(accent==='zikr')?'linear-gradient(135deg,var(--zikr),var(--zikr2))':'linear-gradient(135deg,#6E55BF,#9B7FC9)';
    var glow=(accent==='watch')?'0 6px 14px rgba(200,143,76,0.30)':(accent==='listen')?'0 6px 14px rgba(14,154,167,0.30)':(accent==='zikr')?'0 6px 14px var(--zikr-glow)':'0 6px 14px rgba(110,85,191,0.32)';
    var h='<div style="display:flex;gap:4px;background:var(--icon);border-radius:14px;padding:4px;" role="tablist" aria-label="Sekme" aria-orientation="horizontal">';
    defs.forEach(function(d){
      var on=active===d[0];
      h+='<button role="tab" aria-selected="'+(on?'true':'false')+'" onclick="'+fn+'(\''+esc(d[0])+'\')" style="flex:1;border:none;cursor:pointer;padding:8px 4px;border-radius:11px;font-size:var(--f-caption1);font-weight:800;white-space:nowrap;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?grad:'transparent')+';box-shadow:'+(on?glow:'none')+';transition:all .18s;"'+(!on?' tabindex="-1"':'')+'>'+d[1]+'</button>';
    });
    h+='</div>'; return h;
  }
  function progBar(pct,col){
    pct=Math.max(0,Math.min(100,Number(pct)||0));
    col=col||'linear-gradient(90deg,#6E55BF,#E9AFC1)';
    return '<div style="height:8px;border-radius:999px;background:var(--icon);overflow:hidden;" aria-hidden="true"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:'+col+';transition:width .4s;"></div></div>';
  }
  function starRow(rating,fn,id,size){
    size=size||16;
    var h='<div style="display:flex;gap:3px;" role="group" aria-label="Puan">';
    for(var s=1;s<=5;s++){
      var on=rating!=null&&s<=rating;
      h+='<button onclick="'+fn+'(\''+esc(id)+','+s+')" aria-label="'+s+' yıldız" aria-pressed="'+(on?'true':'false')+'" style="border:none;background:none;cursor:pointer;padding:0;line-height:1;color:'+(on?'#F2B65A':'var(--faint)')+';opacity:'+(on?'1':'0.45')+';display:inline-flex;">'+icon('star',size)+'</button>';
    }
    h+='</div>'; return h;
  }
  function miniBars(rows,valKey,unit,col){
    var max=1; rows.forEach(function(r){ if(r[valKey]>max) max=r[valKey]; });
    var h='<div style="display:flex;align-items:flex-end;gap:6px;height:88px;" role="img" aria-label="Mini bar grafik">';
    rows.forEach(function(r){
      var v=r[valKey]||0;
      var hp=Math.round((v/max)*72)+4;
      var today=(r.date===window.SeymaDateUtils.todayStr());
      h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;">';
      h+='<div style="font-size:var(--f-caption2);color:var(--faint);font-weight:700;">'+(v>0?v:'')+(unit?'<span style="font-size:9px">'+unit+'</span>':'')+'</div>';
      h+='<div style="width:100%;max-width:26px;height:'+hp+'px;border-radius:7px;background:'+(v>0?(col||'linear-gradient(180deg,#9B7FC9,#6E55BF)'):'var(--icon)')+';'+(today?'outline:2px solid #E9AFC1;outline-offset:1px;':'')+'" aria-label="'+(v>0?v:'0')+'"></div>';
      h+='<div style="font-size:var(--f-caption2);color:'+(today?'var(--accent)':'var(--faint)')+';font-weight:'+(today?'800':'600')+';">'+esc(r.label)+'</div>';
      h+='</div>';
    });
    h+='</div>'; return h;
  }
  function statTile(label,val,sub){
    return '<div style="flex:1;min-width:0;background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:12px 10px;text-align:center;"><div style="font-size:var(--f-title2);font-weight:800;color:var(--text);line-height:1.1;font-variant-numeric:tabular-nums;">'+val+'</div><div style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;margin-top:3px;">'+esc(label)+'</div>'+(sub?'<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:1px;">'+esc(sub)+'</div>':'')+'</div>';
  }
  function collapsibleCardHTML(o){
    var open=!!o.open, accent=o.accent||'var(--accent)';
    var frame=open
      ? 'border:1px solid color-mix(in srgb,'+accent+' 40%, var(--card-bd));box-shadow:0 16px 40px rgba(108,74,58,0.11),inset 0 1px 0 rgba(255,255,255,0.45);'
      : 'border:1px solid color-mix(in srgb,'+accent+' 16%, var(--card-bd));box-shadow:0 5px 16px rgba(108,74,58,0.05),inset 0 1px 0 rgba(255,255,255,0.28);';
    var h='<div id="'+esc(o.id||('card-'+o.key))+'" class="surface sey-ccard" data-cardkey="'+esc(o.key)+'" data-open="'+(open?'1':'0')+'" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;'+frame+(o.cardStyle||'')+'" role="region" aria-labelledby="'+esc(o.id||('card-'+o.key))+'-title">';
    h+='<span class="sey-ccard-sheen" style="background:linear-gradient(90deg,transparent,'+accent+',transparent);"></span>';
    h+='<div class="sey-ccard-head" style="display:flex;align-items:center;gap:11px;">';
    h+='<button type="button" class="sey-asbtn" onclick="App.toggleCard(\''+esc(o.key)+'\')" aria-expanded="'+(open?'true':'false')+'" id="'+esc(o.id||('card-'+o.key))+'-title" style="cursor:pointer;display:flex;align-items:center;gap:11px;flex:1;min-width:0;width:auto;background:none;border:none;text-align:left;">';
    if(o.icon) h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';background:color-mix(in srgb,'+accent+' 14%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+o.icon+'</span>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:800;color:var(--text);line-height:1.15;">'+o.title+'</div>'+(o.subtitle?'<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">'+o.subtitle+'</div>':'')+'</div>';
    h+='</button>';
    if(o.badge) h+='<div style="flex-shrink:0;">'+o.badge+'</div>';
    h+='<button type="button" class="sey-asbtn" tabindex="-1" aria-hidden="true" onclick="App.toggleCard(\''+esc(o.key)+'\')" style="cursor:pointer;display:flex;align-items:center;flex-shrink:0;width:auto;background:none;border:none;">';
    h+='<span class="sey-collchev" style="color:'+accent+';display:inline-flex;flex-shrink:0;transition:transform .25s var(--ease-premium,ease);transform:rotate('+(open?'180deg':'0deg')+');">'+icon('chevron-down',16)+'</span>';
    h+='</button>';
    h+='</div>';
    if(open){
      h+='<div class="sey-collbody" style="display:flex;flex-direction:column;gap:12px;">'+(o.body||'')+'</div>';
    } else if(o.hint!==false){
      h+='<button type="button" class="sey-asbtn" onclick="App.toggleCard(\''+esc(o.key)+'\')" style="cursor:pointer;text-align:center;font-size:var(--f-caption2);font-weight:700;letter-spacing:.3px;color:var(--faint);display:flex;align-items:center;justify-content:center;gap:4px;background:none;border:none;">'+(o.hint||'detaylar için dokun')+' '+icon('chevron-down',11)+'</button>';
    }
    h+='</div>'; return h;
  }
  function toast(msg,ms){
    var ex=document.getElementById('sey-toast'); if(ex) ex.remove();
    var t=document.createElement('div'); t.id='sey-toast';
    t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
    t.style.cssText='position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:10000;display:flex;align-items:center;justify-content:center;max-width:88vw;padding:12px 19px;border-radius:17px;background:rgba(28,22,30,0.88);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);border:1px solid rgba(255,255,255,0.22);color:#fff;font:700 14px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;box-shadow:0 16px 42px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.14);text-align:center;letter-spacing:.1px;animation:seyToast .32s cubic-bezier(.16,1,.3,1);';
    t.textContent=msg; document.body.appendChild(t);
    clearTimeout(window.__seyToastTimer); window.__seyToastTimer=setTimeout(function(){ if(t&&t.parentNode){ t.style.transition='opacity .28s ease,transform .28s ease'; t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(8px) scale(.97)'; setTimeout(function(){ if(t.parentNode) t.remove(); },300); } }, ms||1800);
  }
  function confetti(){
    var colors=['#E9AFC1','#C9B8FF','#FFE8A3','#F7DDE5','#6B4A3A'];
    var wrap=document.createElement('div'); wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    for(var i=0;i<48;i++){ var p=document.createElement('div'); var c=colors[i%colors.length]; var sz=6+Math.random()*8; p.style.cssText='position:absolute;top:-16px;left:'+(Math.random()*100)+'%;width:'+sz+'px;height:'+(sz*0.6)+'px;background:'+c+';border-radius:2px;opacity:0.9;animation:seyConfetti '+(2+Math.random()*1.6)+'s '+(Math.random()*0.35)+'s ease-in forwards;'; wrap.appendChild(p); }
    document.body.appendChild(wrap); setTimeout(function(){ wrap.remove(); },4400);
  }
  function haptic(p){
    try{
      if(navigator.vibrate && !(window.SeymaState && window.SeymaState.data && window.SeymaState.data.settings && window.SeymaState.data.settings.haptics===false)){
        navigator.vibrate(p);
      }
    }catch(e){}
  }

  window.SeymaHelpers = {
    esc: esc,
    icon: icon,
    find: find,
    segTabs: segTabs,
    progBar: progBar,
    starRow: starRow,
    miniBars: miniBars,
    statTile: statTile,
    collapsibleCardHTML: collapsibleCardHTML,
    toast: toast,
    confetti: confetti,
    haptic: haptic
  };
})();
