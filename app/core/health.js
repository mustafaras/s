(function(){
  'use strict';

  // MON-29 · sağlık veri ve hesaplama domain registry
  // ---------------------------------------------------------------------------
  // Su, uyku, beslenme, kafein, magnezyum, adım ve ölçüm hesaplarının saf
  // gövdeleri burada yaşar. App-owned mutation/save/DOM/handler yolları
  // app.js'te kalır; modül yüklenirken storage, DOM, timer ve ağ açılmaz.
  // State ve tarih bağımlılıkları her çağrıda canlı resolver bag'inden çözülür.
  var healthDeps=null;
  var HEALTH_DEPENDENCIES=['data','dateUtils','isVacationDay','vacationSettings','cycleStats','readingStats','num','windDownSteps'];

  function registerHealth(deps){
    if(healthDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<HEALTH_DEPENDENCIES.length;i++) if(typeof deps[HEALTH_DEPENDENCIES[i]]!=='function') return false;
    for(var j=0;j<HEALTH_VIEW_DEPENDENCIES.length;j++) if(deps[HEALTH_VIEW_DEPENDENCIES[j]]!==undefined&&typeof deps[HEALTH_VIEW_DEPENDENCIES[j]]!=='function') return false;
    healthDeps=deps;
    return true;
  }
  function dep(name){ return healthDeps&&typeof healthDeps[name]==='function'?healthDeps[name]:null; }
  function liveData(){ var f=dep('data'); if(f){ try{return f();}catch(e){} } var st=window.SeymaState; return st?st.data:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaHealth: çözümlenemeyen bağımlılık '+name); }
  function dateUtils(){ var d=call('dateUtils',[]); if(!d||typeof d!=='object') throw new Error('SeymaHealth: dateUtils çözümlenemedi'); return d; }
  function dateCall(name,args){ var d=dateUtils(), f=d[name]; if(typeof f!=='function') throw new Error('SeymaHealth: dateUtils.'+name+' çözümlenemedi'); return f.apply(d,args||[]); }
  function todayStr(){ return dateCall('todayStr',[]); }
  function addDays(date,amount){ return dateCall('addDays',[date,amount]); }
  function diffDays(from,to){ return dateCall('diffDays',[from,to]); }
  function pad(value){ return dateCall('pad',[value]); }
  function isVacationDay(date){ return !!call('isVacationDay',[date]); }
  function vacationSettings(){ return call('vacationSettings',[]); }
  function cycleStats(){ return call('cycleStats',[]); }
  function readingStats(rec){ return call('readingStats',[rec]); }
  function num(value){ return call('num',[value]); }
  function windDownSteps(){ return call('windDownSteps',[]); }

  // MON-30 · sağlık kartı/görünüm resolver yüzeyi
  var HEALTH_VIEW_DEPENDENCIES=["ui","activeDate","dayIndexFor","shortDate","dark","icon","esc","find","cardOpen","editing","collapsibleCardHTML","emptyMealItems","meals","sleepQ","sleepMed","mgForms","moods","phases","flow","symptoms","bodyRegions","dzSilhouette","dlevels","dmeds","findRegion","dzColor","sciNote","hBadge","fmtDist","fmtDur","bodyData","ghCfgApp","dateLabelTR","energyStressBlock","timeHM","ensureHealthCardState"];
  function liveUi(){ return call('ui',[]); }
  function isDark(){ return !!call('dark',[]); }
  function activeDate(){ return call('activeDate',arguments); }
  function dayIndexFor(){ return call('dayIndexFor',arguments); }
  function shortDate(){ return call('shortDate',arguments); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function find(){ return call('find',arguments); }
  function cardOpen(){ return call('cardOpen',arguments); }
  function editing(){ return !!call('editing',arguments); }
  function collapsibleCardHTML(){ return call('collapsibleCardHTML',arguments); }
  function emptyMealItems(){ return call('emptyMealItems',arguments); }
  function meals(){ return call('meals',[]); }
  function sleepQ(){ return call('sleepQ',[]); }
  function sleepMed(){ return call('sleepMed',[]); }
  function mgForms(){ return call('mgForms',[]); }
  function moods(){ return call('moods',[]); }
  function phases(){ return call('phases',[]); }
  function flow(){ return call('flow',[]); }
  function symptoms(){ return call('symptoms',[]); }
  function bodyRegions(){ return call('bodyRegions',[]); }
  function dzSilhouette(){ return call('dzSilhouette',[]); }
  function dlevels(){ return call('dlevels',[]); }
  function dmeds(){ return call('dmeds',[]); }
  function findRegion(){ return call('findRegion',arguments); }
  function dzColor(){ return call('dzColor',arguments); }
  function sciNote(){ return call('sciNote',arguments); }
  function hBadge(){ return call('hBadge',arguments); }
  function fmtDist(){ return call('fmtDist',arguments); }
  function fmtDur(){ return call('fmtDur',arguments); }
  function bodyData(){ return call('bodyData',arguments); }
  function ghCfgApp(){ return call('ghCfgApp',arguments); }
  function dateLabelTR(){ return call('dateLabelTR',arguments); }
  function energyStressBlock(){ return call('energyStressBlock',arguments); }
  function timeHM(){ return call('timeHM',arguments); }
  function ensureHealthCards(){ return call('ensureHealthCardState',[]); }
function ringSeg(cx,cy,R,C,color,startFrac,lenFrac,w){ if(lenFrac<=0) return ''; return '<circle class="sey-ring-seg" cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-dasharray="'+(lenFrac*C).toFixed(2)+' '+(C-lenFrac*C).toFixed(2)+'" stroke-dashoffset="'+(-startFrac*C).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"></circle>'; }

function macroBarHTML(nu){
  var pCal=4*nu.protein, cCal=4*nu.carbs, fCal=9*nu.fat, tot=pCal+cCal+fCal;
  function w(x){ return tot>0?(x/tot*100):0; }
  var h='<div style="height:12px;border-radius:999px;overflow:hidden;display:flex;background:var(--icon);">';
  if(tot>0){ h+='<div style="width:'+w(pCal)+'%;background:#E9899F;"></div><div style="width:'+w(cCal)+'%;background:#F6C177;"></div><div style="width:'+w(fCal)+'%;background:#9B7FC9;"></div>'; }
  h+='</div>';
  return h;
}

function nutriInsightHTML(rec,nu){
  var items=nu.items||0;
  var pg=proteinGoal();
  var wrap=function(inner){ return '<div style="background:linear-gradient(160deg,rgba(201,184,255,0.10),transparent);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:11px;">'
    +'<div style="display:flex;align-items:center;gap:7px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('brain',15)+'</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:.4px;color:var(--accent-ink);text-transform:uppercase;">Bilimsel değerlendirme</span></div>'+inner+'</div>'; };
  var row=function(ic,col,title,text){ return '<div style="display:flex;gap:9px;align-items:flex-start;">'
    +'<span style="width:26px;height:26px;border-radius:9px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+col+';background:color-mix(in srgb,'+col+' 15%, var(--icon));">'+icon(ic,14)+'</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);line-height:1.3;">'+title+'</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.5;margin-top:1px;">'+text+'</div></div></div>'; };
  if(items===0) return wrap(row('utensils','var(--accent)','Öğünlerini ekle, birlikte bakalım','Yediklerini yazınca protein, makro dengesi ve kan şekeri açısından kısa bilimsel bir okuma çıkarırım. Ölçmek, farkındalığın ilk adımıdır.'));
  var inner='';
  if(nu.protein>=pg) inner+=row('activity','#3F8A4F','Protein hedefi tuttu · '+nu.protein+'g','Yeterli protein tokluk hormonlarını (GLP-1, PYY) artırır, kası korur ve kan şekerini dengeler — tatlı isteğini azaltan en güçlü kaldıraç.');
  else inner+=row('activity','#E9899F','Protein '+(pg-nu.protein)+'g eksik · '+nu.protein+'/'+pg+'g','Her ana öğüne ~25-30g protein hedefle; tokluğu uzatır, kas sentezini destekler ve öğün sonrası tatlı krizini yatıştırır.');
  var tot=nu.protein*4+nu.carbs*4+nu.fat*9;
  var pP=tot>0?Math.round(nu.protein*4/tot*100):0, cP=tot>0?Math.round(nu.carbs*4/tot*100):0, fP=tot>0?Math.round(nu.fat*9/tot*100):0;
  var balOk=(pP>=20&&cP<=60&&fP<=40);
  inner+=row(balOk?'leaf':'triangle-alert', balOk?'#5BA85B':'#E8A53C','Makro dağılımı · P%'+pP+' K%'+cP+' Y%'+fP, balOk?'Dengeli tabak: proteinin kalori payı iyi. Bu oran kan şekeri ve tokluk için sürdürülebilir.':'Karbonhidrat/yağ ağırlıklı görünüyor; proteini biraz artırıp rafine karbonhidratı azaltmak kan şekeri dalgalanmasını yumuşatır.');
  var pm=['breakfast','lunch','dinner'].filter(function(k){return Math.round(mealNutr(rec,k).protein)>=15;}).length;
  inner+=row('sparkles','var(--accent)','Öğün ritmi & glisemik ipucu', (pm>=2?'Proteini öğünlere yaymışsın — kas sentezi ve tokluk için ideal. ':'Proteini kahvaltıya da yaymak sabah tokluğunu artırır. ')+'Tabakta önce protein + sebze, sonra karbonhidrat: öğün sonrası kan şekeri yükselişini (glisemik yanıt) belirgin azaltır.');
  return wrap(inner);
}

function beslenmeCardHTML(rec){
  var nu=dayNutrition(rec);
  var pg=proteinGoal(), cg=calGoal();
  var mi=(rec&&rec.mealItems)?rec.mealItems:emptyMealItems();
  var hasName=function(k){ return Array.isArray(mi[k])&&mi[k].some(function(it){return it&&it.name&&String(it.name).trim();}); };
  var incomplete=!(hasName('breakfast')&&hasName('lunch')&&hasName('dinner'));
  var open=cardOpen('beslenme', incomplete);
  var pPct=Math.min(100,Math.round(nu.protein/pg*100));
  var badge='<div style="text-align:right;"><div id="nutri-badgecal" data-countup="'+nu.calories+'" data-countup-key="nutrition-badge-calories" style="font-size:var(--f-callout);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;line-height:1;">'+nu.calories+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">kcal</div></div>';
  var subtitle='<span id="nutri-subtitle">'+nu.protein+'g protein · '+nu.carbs+'g karb · '+nu.fat+'g yağ</span>';
  var b='';
  // Makro özeti
  b+='<div style="background:var(--icon);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:10px;">';
  b+='<div style="display:flex;align-items:flex-end;gap:12px;">';
  b+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:6px;"><span style="font-size:var(--f-caption1);color:var(--muted);font-weight:700;">Protein</span><span id="nutri-protein" style="font-size:var(--f-title2);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;"><span data-countup="'+nu.protein+'" data-countup-key="nutrition-protein">'+nu.protein+'</span>g</span><span style="font-size:var(--f-caption1);color:var(--faint);">/ '+pg+'g</span></div>';
  b+='<div style="height:8px;border-radius:999px;background:rgba(150,110,120,0.14);overflow:hidden;margin-top:5px;"><div id="nutri-bar" style="height:100%;width:'+pPct+'%;border-radius:999px;background:linear-gradient(90deg,#E9899F,#C9B8FF);transition:width .4s ease;"></div></div></div>';
  b+='<div style="text-align:center;flex-shrink:0;padding-left:10px;border-left:1px solid var(--card-bd);"><div id="nutri-cal" data-countup="'+nu.calories+'" data-countup-key="nutrition-calories" style="font-size:var(--f-title3);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;line-height:1;">'+nu.calories+'</div><div style="font-size:var(--f-caption2);color:var(--faint);margin-top:2px;">/ '+cg+' kcal</div></div>';
  b+='</div>';
  b+='<div id="nutri-macrobar">'+macroBarHTML(nu)+'</div>';
  b+='<div style="display:flex;gap:12px;font-size:var(--f-caption2);color:var(--muted);flex-wrap:wrap;">';
  b+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:3px;background:#E9899F;"></span>Protein <b id="nutri-lp" style="color:var(--text);">'+nu.protein+'g</b></span>';
  b+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:3px;background:#F6C177;"></span>Karbonhidrat <b id="nutri-carb" style="color:var(--text);">'+nu.carbs+'g</b></span>';
  b+='<span style="display:flex;align-items:center;gap:5px;"><span style="width:9px;height:9px;border-radius:3px;background:#9B7FC9;"></span>Yağ <b id="nutri-fat" style="color:var(--text);">'+nu.fat+'g</b></span>';
  b+='</div>';
  b+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.45;">Kalori, girdiğin yiyeceklerin makrolarından hesaplanır (protein & karbonhidrat ×4, yağ ×9 kcal). Değerler tahminidir; yiyecek adı ve miktar netleştikçe isabet artar.</div>';
  b+='</div>';
  // Bilimsel değerlendirme (protein · makro dengesi · glisemik) — canlı güncellenir
  b+='<div id="nutri-insight">'+nutriInsightHTML(rec,nu)+'</div>';
  // Öğün düzenleyici (tabak/gr/adet)
  meals().forEach(function(m){
    var items=Array.isArray(mi[m.key])?mi[m.key]:[];
    var sub=mealNutr(rec,m.key);
    b+='<div style="display:flex;flex-direction:column;gap:8px;">';
    b+='<div style="display:flex;align-items:center;gap:9px;"><div style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:var(--f-callout);background:var(--icon);">'+m.icon+'</div><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+m.label+'</div><div id="meal-sub-'+m.key+'" style="margin-left:auto;font-size:var(--f-caption1);font-weight:700;color:var(--accent-ink);">'+Math.round(sub.protein)+'g P · '+Math.round(sub.calories)+' kcal</div></div>';
    items.forEach(function(it,idx){
      b+='<div style="display:flex;gap:6px;align-items:center;">';
      b+='<input data-meal="'+m.key+'" data-idx="'+idx+'" value="'+esc(it.name||'')+'" oninput="App.setMealItemName(\''+m.key+'\','+idx+',this)" placeholder="'+esc(m.ph.split(',')[0].replace('örn. ',''))+'…" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 11px;font-size:var(--f-footnote);outline:none;">';
      b+='<input type="number" inputmode="decimal" min="0" step="0.5" value="'+(it.qty===''||it.qty==null?'':esc(it.qty))+'" onchange="App.setMealItemQty(\''+m.key+'\','+idx+',this)" style="width:50px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 4px;font-size:var(--f-footnote);text-align:center;outline:none;">';
      b+='<select onchange="App.setMealItemUnit(\''+m.key+'\','+idx+',this)" style="width:60px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 4px;font-size:var(--f-footnote);outline:none;color:var(--text);">';
      MEAL_UNITS.forEach(function(u){ b+='<option value="'+u.id+'"'+(it.unit===u.id?' selected':'')+'>'+u.label+'</option>'; });
      b+='</select>';
      b+='<button data-fx="destructive" onclick="App.removeMealItem(\''+m.key+'\','+idx+')" aria-label="Sil" style="flex-shrink:0;border:none;cursor:pointer;width:30px;height:30px;border-radius:9px;background:rgba(220,120,120,0.1);color:#C0605F;font-size:var(--f-subhead);">×</button>';
      b+='</div>';
    });
    b+='<button onclick="App.addMealItem(\''+m.key+'\')" style="align-self:flex-start;border:1px dashed var(--field-bd);cursor:pointer;padding:7px 13px;border-radius:11px;font-size:var(--f-footnote);font-weight:700;color:var(--muted);background:transparent;">+ '+m.label.toLowerCase()+'\'a ekle</button>';
    b+='</div>';
  });
  return collapsibleCardHTML({key:'beslenme', id:'card-beslenme', icon:icon('utensils',18), accent:'var(--watch)', title:'Beslenme', subtitle:subtitle, badge:badge, open:open, body:b, hint:'öğünleri gör / ekle'});
}

function targetsCardHTML(rec){
  var t=liveData().settings.targets||{};
  var tOk=(typeof t.calories==='number'&&typeof t.protein==='number');
  var nu=dayNutrition(rec);
  var cal=tOk?t.calories:calGoal();
  var pro=tOk?t.protein:proteinGoal();
  var water=tOk?t.waterCups:waterGoalCups(activeDate());
  var steps=tOk?t.steps:stepsGoal();
  var sleep=tOk?t.sleepHours:sleepGoalHours();
  var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;cursor:pointer;" onclick="App.go(\'saglik\')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();App.go(\'saglik\');}">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;">';
  h+='<div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:7px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('target',17)+'</span>Hedeflerim</div>';
  if(tOk) h+='<div style="font-size:var(--f-caption2);color:var(--faint);">BMR '+t.bmr+' · TDEE '+t.tdee+'</div>';
  else h+='<div style="font-size:var(--f-caption2);color:var(--warn-ink);">henüz hesaplanmadı</div>';
  h+='</div>';
  if(tOk){
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Kalori</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+nu.calories+'<span style="font-size:var(--f-caption2);color:var(--faint);">/'+cal+'</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">kcal</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Protein</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+nu.protein+'<span style="font-size:var(--f-caption2);color:var(--faint);">/'+pro+'</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Su</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+(rec&&typeof rec.water==='number'?rec.water:0)+'<span style="font-size:var(--f-caption2);color:var(--faint);">/'+water+'</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">bardak</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Karbonhidrat</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+nu.carbs+'<span style="font-size:var(--f-caption2);color:var(--faint);">/'+t.carbs+'</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Yağ</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+nu.fat+'<span style="font-size:var(--f-caption2);color:var(--faint);">/'+t.fat+'</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Lif</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">—<span style="font-size:var(--f-caption2);color:var(--faint);">/'+t.fiber+'</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
    h+='<div style="text-align:center;"><div style="font-size:var(--f-caption2);color:var(--faint);">Adım</div><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+steps.toLocaleString('tr-TR')+'</div></div>';
    h+='<div style="text-align:center;"><div style="font-size:var(--f-caption2);color:var(--faint);">Uyku</div><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+sleep+' saat</div></div>';
    h+='<div style="text-align:center;"><div style="font-size:var(--f-caption2);color:var(--faint);">Kafein</div><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">≤'+t.caffeineMaxMg+' mg</div></div>';
    h+='<div style="text-align:center;"><div style="font-size:var(--f-caption2);color:var(--faint);">D vit.</div><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+t.vitaminDIU+' IU</div></div>';
    h+='</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.45;">Tüm kişiselleştirilmiş hedeflerin için dokun · boy, kilo, yaş ve aktivite seviyene göre hesaplanır.</div>';
  } else {
    h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Kişiselleştirilmiş makro ve mikro hedeflerini görmek için Sağlık sayfasından boy, kilo, doğum tarihi ve günlük aktivite seviyeni girmen yeterli.</div>';
    h+='<button onclick="event.stopPropagation();App.go(\'saglik\')" style="border:none;cursor:pointer;background:linear-gradient(135deg,#FFE8A3,#E9AFC1);color:#5A2E2A;font-weight:800;font-size:var(--f-subhead);padding:12px;border-radius:12px;">Sağlık sayfasına git</button>';
  }
  h+='</div>';
  return h;
}

function waterCard(rec){
  var w=rec&&typeof rec.water==='number'?rec.water:0;
  var g=waterGoalCups(activeDate());
  var pct=Math.min(100,Math.round(w/g*100));
  var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:7px;">Su '+icon('droplet',17)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);"><b style="color:var(--accent-ink);font-size:var(--f-callout);">'+w+'</b> / '+g+' bardak</div></div>';
  h+='<div style="display:flex;gap:5px;">';
  for(var i=0;i<g;i++){ var on=i<w; h+='<div style="flex:1;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;'+(on?'background:linear-gradient(135deg,#9CC9F0,#C9B8FF);box-shadow:0 4px 10px rgba(120,160,220,0.3);color:#fff;':'background:rgba(150,170,200,0.12);border:1px solid var(--card-bd);')+'">'+(on?icon('droplet',14):'')+'</div>'; }
  h+='</div>';
  if(w>g){ h+='<div style="font-size:var(--f-caption1);color:var(--faint);">+'+(w-g)+' bardak ekstra, harika</div>'; }
  var waterTicked=!!(rec&&rec.habits&&rec.habits.water);
  if(waterTicked&&w<g&&!liveUi().waterNudgeHidden){
    h+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(127,179,232,0.16),rgba(155,127,201,0.12));border:1px solid rgba(127,179,232,0.4);border-radius:14px;padding:11px 12px;">';
    h+='<span style="flex-shrink:0;display:inline-flex;">'+icon('droplet',18)+'</span>';
    h+='<div style="flex:1;min-width:0;font-size:var(--f-footnote);color:var(--text2);line-height:1.45;">Su tikin işaretli. Kaç bardak içtiğini de girersen takibin daha net olur. <span style="color:var(--faint);">(zorunlu değil)</span></div>';
    h+='<button onclick="App.hideWaterNudge()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button></div>';
  }
  h+='<div style="display:flex;gap:9px;">';
  h+='<button onclick="App.waterAdd(-1)" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-headline);font-weight:800;color:var(--muted);background:var(--card);">−</button>';
  h+='<button onclick="App.waterAdd(1)" style="flex:2;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#7FB3E8,#9B7FC9);box-shadow:0 8px 18px rgba(120,160,220,0.35);display:flex;align-items:center;justify-content:center;gap:6px;">+1 bardak içtim '+icon('droplet',15)+'</button>';
  h+='</div></div>';
  return h;
}

function magnesiumFeedbackHTML(date){
  var s=liveData().settings.magnesium||{};
  if(!s.enabled || s.mode==='off') return '';
  var yest=addDays(date,-1);
  var yRec=liveData().days[yest];
  if(!yRec || !yRec.magnesium || !yRec.magnesium.taken) return '';
  if(yRec.magnesium.feedback===true || yRec.magnesium.feedback===false) return '';
  var form=find(mgForms(),'id',yRec.magnesium.form)||mgForms()[0];
  var h='';
  h+='<div class="surface" style="border-radius:22px;padding:15px 16px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('pill',20)+'</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:1px;color:var(--accent-ink);">DÜNÜN ETKİSİ</span></div>';
  h+='<div style="font-size:var(--f-subhead);font-weight:700;line-height:1.35;color:var(--text);">Dün '+esc(form.label)+' almıştın. Uykuna, krampına veya genel hissetine yardımcı oldu mu?</div>';
  h+='<div style="display:flex;gap:8px;">';
  h+='<button onclick="App.saveMgFeedback(true)" style="flex:1;background:rgba(143,191,138,0.15);border:1.5px solid rgba(143,191,138,0.4);color:#3F8A4F;border-radius:12px;padding:10px;font-size:var(--f-footnote);font-weight:800;">Evet, faydalıydı</button>';
  h+='<button onclick="App.saveMgFeedback(false)" style="flex:1;background:rgba(217,83,79,0.08);border:1.5px solid rgba(217,83,79,0.3);color:#C0605F;border-radius:12px;padding:10px;font-size:var(--f-footnote);font-weight:800;">Pek fark görmedim</button>';
  h+='</div>';
  h+='</div>';
  return h;
}

function magnesiumBannerHTML(date){
  var s=liveData().settings.magnesium||{};
  if(s.kidneyDisease) return '';
  var rec=liveData().days[date]||null;
  var mg=rec&&rec.magnesium?rec.magnesium:null;
  if(mg && mg.taken) return '';
  if(mg && mg.skipped && mg.skippedDate===date) return '';
  if(s.dismissedUntil && s.dismissedUntil>=date) return '';
  var nudge=calculateMgNudge(date);
  var form=find(mgForms(),'id',nudge.form)||mgForms()[0];
  var recDose=400;
  var sebep=magnesiumReasonText(nudge);
  var h='';
  h+='<div class="surface" style="border-radius:22px;padding:15px 16px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;">';
  h+='<span style="display:inline-flex;color:var(--accent-ink);">'+icon('pill',20)+'</span>';
  h+='<span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:1px;color:var(--accent-ink);">MAGNESYUM HATIRLATICISI</span>';
  h+='<span style="margin-left:auto;font-size:var(--f-caption2);font-weight:700;background:rgba(233,175,193,0.25);color:var(--choc);padding:3px 8px;border-radius:999px;">'+nudge.score+'/100</span>';
  h+='</div>';
  h+='<div style="font-size:var(--f-subhead);font-weight:700;line-height:1.35;color:var(--text);">Günışığı, bugün <span style="color:var(--accent-ink);">400 mg magnezyum</span> almayı unutma.</div>';
  if(nudge.blocked){
    h+='<div style="font-size:var(--f-caption1);color:var(--watch-ink);">Böbrek rahatsızlığı veya tolerans sorunu bildirdin; önce hekimine danış.</div>';
  } else {
    h+='<div style="font-size:var(--f-footnote);color:var(--muted);display:flex;align-items:center;gap:6px;">';
    h+='<span style="display:inline-flex;">'+(form.icon||icon('flask',15))+'</span>';
    h+='<span>Önerilen form: <b>'+esc(form.label)+'</b> · '+esc(form.note)+(sebep.length?' · Sinyaller: '+esc(sebep.slice(0,3).join(' · ')):'')+'</span>';
    h+='</div>';
  }
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:2px;">';
  if(!nudge.blocked){
    h+='<button onclick="App.takeMagnesium(\''+nudge.form+'\','+recDose+')" style="flex:1;min-width:100px;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:10px 12px;font-size:var(--f-footnote);font-weight:800;">Aldım · 400 mg</button>';
  }
  h+='<button onclick="App.skipMagnesium()" style="flex:1;min-width:90px;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:9px 12px;font-size:var(--f-footnote);font-weight:700;">Bugün almayacağım</button>';
  h+='<button onclick="App.snoozeMg()" style="min-width:60px;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:9px 10px;font-size:var(--f-footnote);font-weight:700;">Sonra</button>';
  h+='</div>';
  h+='</div>';
  return h;
}

function magnesiumCardHTML(date){
  var s=liveData().settings.magnesium||{};
  var rec=liveData().days[date]||null;
  var mg=rec&&rec.magnesium?rec.magnesium:null;
  var nudge=calculateMgNudge(date);
  var hl=magnesiumHeadline(nudge);
  var form=find(mgForms(),'id',nudge.form)||mgForms()[0];
  var stats=magnesiumStats();
  var recDose=400;
  var h='';
  h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<span style="display:inline-flex;color:var(--accent-ink);">'+icon('pill',22)+'</span>';
  h+='<div style="flex:1;">';
  h+='<div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">Magnezyum Hatırlatıcısı</div>';
  h+='<div style="font-size:var(--f-caption1);color:var(--muted);">Güçlü sinyal · Skor '+nudge.score+'/100</div>';
  h+='</div>';
  var phaseName=(nudge.phase?MG_PHASE_LABELS[nudge.phase]:null)||'Döngü fazı bekleniyor';
  var phaseColor=MG_PHASE_COLORS[nudge.phase]||MG_PHASE_COLORS.unknown;
  h+='<span style="font-size:var(--f-caption1);font-weight:800;background:'+phaseColor+'18;color:'+phaseColor+';padding:5px 10px;border-radius:999px;border:1.5px solid '+phaseColor+'80;white-space:nowrap;">'+esc(phaseName)+'</span>';
  h+='</div>';

  if(s.kidneyDisease){
    h+='<div style="font-size:var(--f-footnote);color:var(--watch-ink);">Magnezyum önerileri doktor kontrolü gerektiren durum için filtreleniyor.</div>';
  } else {
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Kullanılan gün</div><div style="font-size:var(--f-headline);font-weight:800;">'+stats.totalDays+'</div></div>';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Toplam magnezyum</div><div style="font-size:var(--f-headline);font-weight:800;">'+stats.totalMg+' mg</div></div>';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Ortalama doz</div><div style="font-size:var(--f-headline);font-weight:800;">'+(stats.avgDose?stats.avgDose+' mg':'—')+'</div></div>';
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Güncel seri</div><div style="font-size:var(--f-headline);font-weight:800;">'+stats.streak+' gün</div></div>';
    h+='</div>';

    if(mg && mg.taken){
      var todayPct=Math.min(100,Math.round((mg.mg||0)/recDose*100));
      h+='<div style="display:flex;flex-direction:column;gap:8px;">';
      h+='<div style="font-size:var(--f-subhead);font-weight:700;color:var(--ok-ink);display:flex;align-items:center;gap:6px;">'+icon('circle-check',16)+' Bugün '+esc(form.label)+' kaydedildi.</div>';
      h+='<div style="font-size:var(--f-footnote);color:var(--muted);">Alınan: '+esc((mg.mg||0)+' mg')+' · Günlük hedefin %'+todayPct+'\'si · Saat: '+esc(mg.time||'—')+'</div>';
      if(liveUi().mgEditing){
        h+='<div style="display:flex;flex-direction:column;gap:10px;">';
        h+='<div style="font-size:var(--f-footnote);color:var(--text2);">Form</div>';
        h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        mgForms().slice(0,4).forEach(function(f){
          var sel=mg.form===f.id;
          h+='<button onclick="App.setMgForm(\''+f.id+'\')" style="flex:1;min-width:70px;padding:8px 6px;border-radius:10px;cursor:pointer;font-size:var(--f-caption1);font-weight:700;border:1.5px solid '+(sel?'var(--accent)':'var(--card-bd)')+';background:'+(sel?'rgba(233,175,193,0.2)':'var(--card)')+';color:'+(sel?'var(--choc)':'var(--text)')+';">'+(f.icon||icon('flask',12))+' '+esc(f.label)+'</button>';
        });
        h+='</div>';
        h+='<div style="display:flex;gap:8px;">';
        h+='<div style="flex:1;display:flex;flex-direction:column;gap:6px;"><div style="font-size:var(--f-footnote);color:var(--text2);">Doz (mg)</div><input type="number" min="1" max="500" value="'+esc(String(mg.mg||200))+'" onchange="App.setMgMg(this.value)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:9px 10px;font-size:var(--f-subhead);outline:none;"></div>';
        h+='<div style="flex:1;display:flex;flex-direction:column;gap:6px;"><div style="font-size:var(--f-footnote);color:var(--text2);">Saat</div><input type="time" value="'+esc(mg.time||timeHM())+'" onchange="App.setMgTime(this.value)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:9px 10px;font-size:var(--f-subhead);outline:none;"></div>';
        h+='</div>';
        h+='<div style="font-size:var(--f-footnote);color:var(--text2);">Etki / not</div>';
        h+='<input type="text" value="'+esc(mg.effectNote||'')+'" oninput="App.saveMgNote(this.value)" placeholder="Bugünkü etkisini kısaca yaz..." style="border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:9px 10px;font-size:var(--f-footnote);outline:none;">';
        h+='<button onclick="App.editMagnesium()" style="align-self:flex-start;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:8px 14px;font-size:var(--f-caption1);font-weight:800;">Tamam</button>';
        h+='<button data-fx="destructive" onclick="App.deleteMgEntry()" style="align-self:flex-start;background:transparent;border:1.5px solid var(--card-bd);color:var(--watch-ink);border-radius:12px;padding:8px 12px;font-size:var(--f-caption1);font-weight:700;">Sil</button>';
        h+='</div>';
      } else {
        if(mg.effectNote) h+='<div style="font-size:var(--f-caption1);color:var(--faint);padding:8px 10px;background:var(--card);border-radius:10px;">Not: '+esc(mg.effectNote)+'</div>';
        h+='<button onclick="App.editMagnesium()" style="align-self:flex-start;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:8px 12px;font-size:var(--f-caption1);font-weight:700;">Düzenle</button>';
      }
      h+='</div>';
    } else if(mg && mg.skipped){
      h+='<div style="font-size:var(--f-subhead);color:var(--muted);">Bugün magnezyum alınmadı.</div>';
    } else {
      h+='<div style="display:flex;flex-direction:column;gap:8px;">';
      h+='<div style="font-size:var(--f-subhead);font-weight:700;color:var(--text);">Bugünkü hedef: 400 mg '+esc(form.label)+'</div>';
      h+='<div style="font-size:var(--f-footnote);color:var(--muted);display:flex;align-items:center;gap:6px;">';
      h+='<span style="display:inline-flex;">'+(form.icon||icon('flask',15))+'</span>';
      h+='<span>'+esc(form.note)+'</span>';
      h+='</div>';
      if(nudge.reasons.length){
        h+='<div style="font-size:var(--f-caption1);color:var(--faint);">Sinyaller: '+esc(nudge.reasons.slice(0,4).map(function(r){return MG_REASON_LABELS[r]||r;}).join(' · '))+'</div>';
      }
      h+='<div style="display:flex;gap:8px;flex-wrap:wrap;">';
      h+='<button onclick="App.takeMagnesium(\''+nudge.form+'\','+recDose+')" style="flex:1;min-width:100px;background:var(--accent);color:#fff;border:none;border-radius:12px;padding:10px 12px;font-size:var(--f-footnote);font-weight:800;">Aldım · 400 mg</button>';
      h+='<button onclick="App.skipMagnesium()" style="flex:1;min-width:90px;background:transparent;border:1.5px solid var(--card-bd);color:var(--muted);border-radius:12px;padding:9px 12px;font-size:var(--f-footnote);font-weight:700;">Bugün almayacağım</button>';
      h+='</div>';
      h+='</div>';
    }
  }

  h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;border-top:1px solid var(--card-bd);padding-top:8px;">Günlük hedef 400 mg elementer magnezyum (EFSA/NICE referans üst sınır). Kişiselleştirilmiş tıbbi öneri değildir.</div>';
  h+='</div>';
  return h;
}

function magnesiumHeadline(nudge){
  var sebep=magnesiumReasonText(nudge);
  var sig=nudge.score>=70 ? 'güçlü' : (nudge.score>=40 ? 'orta' : 'zayıf');
  var text;
  if(nudge.blocked){ text='Magnezyum önerileri doktor kontrolü gerektiren durum için filtreleniyor.'; }
  else if(nudge.score>=85){ text='Bugün güçlü sinyaller var; 400 mg magnezyum almayı unutma ('+sebep.slice(0,3).join(' · ')+').'; }
  else if(nudge.score>=70){ text='Akşam 400 mg magnezyum desteği faydalı olabilir; almayı unutma ('+sebep.slice(0,3).join(' · ')+').'; }
  else if(nudge.score>=40){ text='Bugün 400 mg magnezyum sinyali orta; rutin desteği almayı unutma.'; }
  else { text='Bugün sinyal zayıf da olsa 400 mg magnezyum rutinini unutma; destek her gün değerli.'; }
  return {sig:sig,text:text};
}

function activityRings(rec){
  var es=effSteps(rec);
  var steps=es.steps;
  var mins=rec&&rec.walk?num(rec.walk.minutes):null;
  var sleep=rec&&rec.sleep?num(rec.sleep.hours):null;
  var mealCount=0; if(rec&&rec.meals){ ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(rec.meals[k]&&String(rec.meals[k]).trim()) mealCount++; }); }
  var rings=[{label:'Adım',val:steps,goal:8000,color:'#E9899F',unit:''},{label:'Hareket',val:mins,goal:30,color:'#8FBF8A',unit:' dk'},{label:'Uyku',val:sleep,goal:7.5,color:'#9B7FC9',unit:' sa'}];
  var size=120,cx=60,cy=60,radii=[50,38,26],w=10;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  rings.forEach(function(r,i){ var R=radii[i],C=2*Math.PI*R,f=Math.max(0,Math.min(1,(r.val||0)/r.goal));
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(150,110,120,0.14)" stroke-width="'+w+'"></circle>';
    // TAM-DENETIM B-04: hero halkaları `sey-ring-seg` sınıfını hiç kullanmıyordu
    // (7 sekme + 19 overlay ölçümünde 0). Elle yazılmış `.6s ease` yerine artık
    // token sistemi: --dur-4/--ease-out + reduced-motion desteği sınıftan gelir.
    svg+='<circle class="sey-ring-seg" cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+r.color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"></circle>';
  });
  svg+='</svg>';
  var legend='<div style="flex:1;display:flex;flex-direction:column;gap:8px;">';
  rings.forEach(function(r){ legend+='<div style="display:flex;align-items:center;gap:8px;font-size:var(--f-footnote);"><span style="width:10px;height:10px;border-radius:50%;background:'+r.color+';display:inline-block;flex-shrink:0;"></span><span style="color:var(--muted);">'+r.label+'</span><b style="margin-left:auto;color:var(--text);font-variant-numeric:tabular-nums;">'+(r.val!=null?r.val+r.unit:'—')+'</b></div>'; });
  legend+='<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:2px;">'+mealCount+'/4 öğün · '+dayNutrition(rec).protein+'g protein</div>';
  if(es.source==='tracked'){ var dm=dayMovement(rec); legend+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;display:flex;align-items:flex-start;gap:4px;">'+icon('footprints',12)+' <span>Adım, konum takibinden tahmini ('+fmtDist(dm.walk)+' yürüyüş). Elle girersen o geçerli olur.</span></div>'; }
  legend+='</div>';
  return '<div class="surface" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:16px;"><div style="flex-shrink:0;">'+svg+'</div>'+legend+'</div>';
}

function sparkCard(){
  var today=todayStr(); var arr=[]; for(var i=6;i>=0;i--){ var dd=addDays(today,-i); var rec=liveData().days[dd]; arr.push({d:dd,steps:effSteps(rec).steps,sleep:rec&&rec.sleep?num(rec.sleep.hours):null}); }
  var maxS=Math.max.apply(null,[8000].concat(arr.map(function(a){return a.steps||0;})));
  var maxSl=Math.max.apply(null,[8].concat(arr.map(function(a){return a.sleep||0;})));
  var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;">Son 7 gün '+icon('trending-up',16)+'</div>';
  h+='<div><div style="font-size:var(--f-caption1);color:var(--muted);margin-bottom:6px;">Adım</div><div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
  arr.forEach(function(a){ var hh=a.steps?Math.max(6,Math.round(a.steps/maxS*46)):3; h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:46px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,#E9899F,#C9B8FF);opacity:'+(a.steps?1:0.3)+';"></div></div>'; });
  h+='</div></div>';
  h+='<div><div style="font-size:var(--f-caption1);color:var(--muted);margin-bottom:6px;">Uyku (saat)</div><div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
  arr.forEach(function(a){ var hh=a.sleep?Math.max(6,Math.round(a.sleep/maxSl*46)):3; h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:46px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,#9B7FC9,#B8A0E0);opacity:'+(a.sleep?1:0.3)+';"></div></div>'; });
  h+='</div></div>';
  h+='<div style="display:flex;gap:5px;">'; arr.forEach(function(a){ h+='<div style="flex:1;text-align:center;font-size:var(--f-caption2);color:var(--faint);">'+a.d.slice(8)+'</div>'; }); h+='</div>';
  h+='</div>';
  return h;
}

function medFreeBadge(){
  var s=medFreeStreak();
  if(s<1) return '';
  return '<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(143,191,138,0.22),rgba(155,127,201,0.16));border:1px solid rgba(143,191,138,0.4);border-radius:14px;padding:11px 13px;"><span style="color:#6E9C6A;display:inline-flex;">'+icon('moon',22)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+s+' gecedir ilaçsız</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;">'+(s>=7?'Bir haftayı geçtin — beden kendi sistemini öğreniyor.':'Hedef: uyku ilacına ihtiyacı azaltmak. Düzenli uyku hijyeni bunu büyütür.')+'</div></div></div>';
}

function gaugeBadge(pct,color,big,small,size){
  size=size||92; pct=Math.max(0,Math.min(100,Number(pct)||0));
  var sw=Math.round(size*0.095), r=(size-sw)/2, c=2*Math.PI*r, off=c*(1-pct/100), cx=size/2;
  var s='<div style="position:relative;width:'+size+'px;height:'+size+'px;flex-shrink:0;">';
  s+='<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" style="transform:rotate(-90deg);display:block;">';
  s+='<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="rgba(130,110,160,0.16)" stroke-width="'+sw+'"/>';
  s+='<circle class="sey-ring-seg" cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>';
  s+='</svg>';
  s+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;"><div style="font-size:'+(size>=88?'21px':'17px')+';font-weight:800;color:var(--text);line-height:1;">'+big+'</div>'+(small?'<div style="font-size:var(--f-caption2);color:var(--faint);font-weight:700;letter-spacing:.2px;margin-top:2px;">'+small+'</div>':'')+'</div>';
  s+='</div>';
  return s;
}

function caffeineCurveSVG(rec,bed){
  var ds=caffeineDrinks(rec).map(function(d){ var ty=caffeineType(d&&d.type); var t=hhmmToMin(d&&d.time); if(!ty||t==null) return null; return {t:t,mg:ty.mg*Math.max(1,Number(d.qty)||1)}; }).filter(Boolean);
  if(!ds.length) return '';
  var bedMin=hhmmToMin(bed); if(bedMin==null) bedMin=hhmmToMin(CAFFEINE_DEFAULT_BED);
  var startMin=Math.min.apply(null,ds.map(function(d){return d.t;}));
  var endMin=bedMin; if(endMin<=startMin) endMin+=1440;
  var span=Math.max(90,endMin-startMin);
  var N=48, W=100, H=44, pad=3;
  var loadAt=function(m){ var s=0; ds.forEach(function(d){ var dt=(m-d.t)/60; if(dt<0) return; s+=d.mg*Math.pow(0.5,dt/CAFFEINE_HALFLIFE_H); }); return s; };
  var peak=0, samples=[];
  for(var i=0;i<=N;i++){ var m=startMin+span*i/N; var v=loadAt(m); if(v>peak)peak=v; samples.push([i/N,v]); }
  peak=Math.max(peak,60);
  var pts=samples.map(function(p){ var x=pad+p[0]*(W-2*pad); var y=(H-pad)-(p[1]/peak)*(H-2*pad); return x.toFixed(1)+','+y.toFixed(1); }).join(' ');
  var safeY=(H-pad)-(CAFFEINE_SLEEP_SAFE_MG/peak)*(H-2*pad);
  var col='#8A5A2B', bedX=(W-pad).toFixed(1);
  var s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" width="100%" height="'+H+'" style="display:block;">';
  s+='<defs><linearGradient id="cafFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity="0.30"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>';
  if(safeY>pad&&safeY<H-pad) s+='<line x1="'+pad+'" y1="'+safeY.toFixed(1)+'" x2="'+(W-pad)+'" y2="'+safeY.toFixed(1)+'" stroke="#5BA85B" stroke-width="0.7" stroke-dasharray="2 2" opacity="0.75"/>';
  s+='<polygon points="'+pad+','+(H-pad)+' '+pts+' '+(W-pad)+','+(H-pad)+'" fill="url(#cafFill)"/>';
  s+='<polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
  s+='<line x1="'+bedX+'" y1="'+pad+'" x2="'+bedX+'" y2="'+(H-pad)+'" stroke="var(--muted)" stroke-width="0.7" stroke-dasharray="1.5 1.5" opacity="0.55"/>';
  s+='</svg>';
  return s;
}

function caffeineBlock(rec){
  var drinks=caffeineDrinks(rec);
  var date=activeDate();
  var total=caffeineTotalMg(rec), limit=caffeineLimit(date), mode=caffeineMode(), baseLimit=CAFFEINE_LIMITS[mode]||400;
  var maxSingle=caffeineMaxSingle(rec), lastCaf=caffeineLastTime(rec);
  var bed=caffeineTargetBed(), cut=caffeineCutoffTime(bed);
  var residue=caffeineResidueAt(rec,bed), timingOk=caffeineTimingOk(rec);
  var pct=Math.min(100,Math.round(total/limit*100));
  var barCol=pct<60?'#5BA85B':(pct<=90?'#E0A93C':'#E25B6A');
  var resCol=residue<CAFFEINE_SLEEP_SAFE_MG?'#5BA85B':(residue<100?'#E0A93C':'#E25B6A');
  var modeLbl={standard:'Standart',sensitive:'Hassas',pregnant:'Gebe'}[mode]||'Standart';
  var A='#8A5A2B';
  var h='';
  h+='<div style="display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,'+A+' 9%, var(--card)),var(--card));border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;">';
  h+=gaugeBadge(pct,barCol,total,'/ '+limit+' mg',92);
  h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:var(--f-caption2);color:var(--faint);">Günlük toplam</span><span style="font-size:var(--f-caption2);font-weight:800;color:'+barCol+';">%'+pct+' · '+modeLbl+'</span></div>';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:var(--f-caption2);color:var(--faint);">Yatakta kalıntı</span><span style="font-size:var(--f-footnote);font-weight:800;color:'+resCol+';">'+residue+' mg</span></div>';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:var(--f-caption2);color:var(--faint);">Son kahve · kesim</span><span style="font-size:var(--f-caption1);font-weight:700;color:'+(timingOk?'var(--text2)':'#C2803A')+';">'+(lastCaf||'—')+' · '+(cut||'—')+'</span></div>';
  h+='</div></div>';
  var curve=caffeineCurveSVG(rec,bed);
  if(curve){ h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px 12px 8px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;"><span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.3px;color:var(--muted);">METABOLİZMA · YATANA KADAR</span><span style="font-size:var(--f-caption2);color:#5BA85B;display:inline-flex;align-items:center;gap:3px;"><span style="width:12px;border-top:1.4px dashed #5BA85B;display:inline-block;"></span>50 mg eşik</span></div>'+curve+'</div>'; }
  h+='<div style="display:flex;flex-wrap:wrap;gap:5px;">';
  CAFFEINE_TYPES.forEach(function(t){ h+='<button onclick="App.addCaffeineDrink(\''+t.id+'\')" style="border:1px solid var(--field-bd);background:var(--card);border-radius:999px;padding:6px 11px;font-size:var(--f-caption1);font-weight:700;color:var(--text);cursor:pointer;display:inline-flex;align-items:center;gap:4px;">+ '+t.label+' <span style="color:var(--faint);font-weight:500;">'+t.mg+'mg</span></button>'; });
  h+='</div>';
  if(drinks.length){
    h+='<div style="display:flex;flex-direction:column;gap:5px;">';
    drinks.forEach(function(d,i){ var ty=caffeineType(d.type); var mg=ty?ty.mg*Math.max(1,Number(d.qty)||1):0; h+='<div style="display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--card-bd);border-radius:11px;padding:7px 10px;"><span style="display:inline-flex;color:'+A+';">'+icon('coffee',14)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+(ty?ty.label:d.type)+' · <span style="color:var(--faint);font-weight:500;">'+Math.round(mg)+' mg</span></div><div style="display:flex;align-items:center;gap:5px;margin-top:3px;"><input type="time" value="'+esc(d.time||'')+'" onchange="App.setCaffeineDrinkTime('+i+',this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:8px;padding:3px 6px;font-size:var(--f-caption1);color:var(--text);outline:none;">'+(d.qty>1?('<span style="font-size:var(--f-caption2);color:var(--faint);">×'+d.qty+'</span>'):'')+'</div></div><button data-fx="destructive" onclick="App.removeCaffeineDrink('+i+')" style="border:none;background:transparent;color:#E25B6A;cursor:pointer;font-size:var(--f-callout);font-weight:800;padding:4px;">×</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="font-size:var(--f-caption1);color:var(--faint);background:var(--card);border:1px dashed var(--card-bd);border-radius:11px;padding:9px 11px;">Bugün henüz kafein eklenmedi. Yukarıdaki chip\'lerden başlat — mg, kalıntı ve eğri otomatik hesaplanır.</div>';
  }
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
  h+='<span style="font-size:var(--f-caption2);color:var(--faint);">Profil:</span>';
  [['standard','Standart'],['sensitive','Hassas'],['pregnant','Gebe']].forEach(function(m){ var on=mode===m[0]; var lbl=m[1]+' '+caffeineLimit(date,m[0]); h+='<button onclick="App.setCaffeineMode(\''+m[0]+'\')" style="border:1px solid '+(on?A:'var(--field-bd)')+';background:'+(on?'color-mix(in srgb,'+A+' 12%, var(--field))':'var(--field)')+';color:'+(on?A:'var(--muted)')+';border-radius:999px;padding:4px 10px;font-size:var(--f-caption2);font-weight:700;cursor:pointer;">'+lbl+'</button>'; });
  h+='<div style="margin-left:auto;display:flex;align-items:center;gap:5px;"><span style="font-size:var(--f-caption2);color:var(--faint);">Yatma</span><input type="time" value="'+esc(bed)+'" onchange="App.setTargetBed(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:8px;padding:4px 7px;font-size:var(--f-caption1);color:var(--text);outline:none;"></div>';
  h+='</div>';
  if(total>limit){ var warnMsg=isVacationDay(date)?('Tatil modunda günlük limit esnetildi ('+total+'/'+limit+' mg). Normal günlerde üst sınır '+baseLimit+' mg.'):('Günlük limit aşıldı ('+total+'/'+limit+' mg). EFSA & FDA yetişkin üst sınırı '+baseLimit+' mg.'); h+='<div style="font-size:var(--f-caption2);color:#C2453A;background:rgba(226,91,106,0.12);border:1px solid rgba(226,91,106,0.35);border-radius:10px;padding:7px 10px;line-height:1.4;">'+warnMsg+'</div>'; }
  if(maxSingle>CAFFEINE_SINGLE_DOSE){ h+='<div style="font-size:var(--f-caption2);color:#9A6A2A;background:rgba(255,210,130,0.18);border:1px solid rgba(220,170,80,0.35);border-radius:10px;padding:7px 10px;line-height:1.4;">Tek doz '+maxSingle+' mg — EFSA güvenli tek doz 200 mg. Aralara zaman koy.</div>'; }
  if(lastCaf&&!timingOk){ h+='<div style="font-size:var(--f-caption2);color:#9A6A2A;line-height:1.4;display:flex;gap:5px;"><span style="flex-shrink:0;">'+icon('clock',12)+'</span><span>Son kahve '+lastCaf+' — önerilen kesim '+cut+' (yatmadan '+CAFFEINE_CUTOFF_H+' sa önce). Bu saat uykuya geçişi zorlaştırabilir.</span></div>'; }
  h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">Kaynak: EFSA 2015 kafein paneli · FDA · yarı ömür ~'+CAFFEINE_HALFLIFE_H+' sa. mg ortalama serving başına.</div>';
  return collapsibleCardHTML({key:'h-caffeine', icon:icon('coffee',18), accent:A, title:'Kafein', subtitle:'Bilimsel takip · mg · yarı ömür · uyku', badge:hBadge(total+' mg',barCol), open:cardOpen('h-caffeine'), body:h, hint:'kafein takibini aç'});
}

function sleepPrepCard(rec){
  var readiness=sleepReadiness(rec);
  var scoreCol=readiness.score>=85?'#6E9C6A':(readiness.score>=70?'#9B7FC9':(readiness.score>=55?'#E0A93C':'#E28A6A'));
  var A='#9B7FC9';
  var h='';
  h+='<div style="display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,'+A+' 11%, var(--card)),var(--card));border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;">';
  h+=gaugeBadge(readiness.score,scoreCol,readiness.score,'/ 100',92);
  h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">';
  h+='<div style="font-size:var(--f-body);font-weight:800;color:'+scoreCol+';line-height:1.1;">'+readiness.tier+'</div>';
  var rdChip=readiness.readingCount>0?(readiness.readingCount+' kitap · '+readiness.readingPages+' sayfa'):'okuma yok';
  h+='<div style="font-size:var(--f-caption1);color:var(--muted);">Bugün: '+rdChip+'</div>';
  if(readiness.hasCaf){ var resCol2=readiness.residue<CAFFEINE_SLEEP_SAFE_MG?'#5BA85B':(readiness.residue<100?'#E0A93C':'#E25B6A'); h+='<div style="font-size:var(--f-caption2);color:var(--faint);">Kafein kalıntısı <b style="color:'+resCol2+';">'+readiness.residue+' mg</b> · son '+(readiness.lastCaf||'—')+'</div>'; }
  h+='</div></div>';
  var rf=readiness.factors||{};
  var fdefs=[['Uyku süresi',rf.duration||0,26],['Kalite',rf.quality||0,18],['Kafein',rf.caffeine||0,18],['Okuma',rf.reading||0,16],['Wind-down',rf.winddown||0,14],['İlaçsızlık',rf.medication||0,8]];
  h+='<div style="display:flex;flex-direction:column;gap:7px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;">';
  fdefs.forEach(function(f){ var fp=Math.round(f[1]/f[2]*100); var bc=fp>=80?'#6E9C6A':(fp>=50?A:'#E0A93C'); h+='<div style="display:flex;align-items:center;gap:9px;"><div style="font-size:var(--f-caption2);font-weight:600;color:var(--muted);width:86px;flex-shrink:0;">'+f[0]+'</div><div style="flex:1;height:7px;border-radius:999px;background:color-mix(in srgb,'+A+' 12%, var(--icon));overflow:hidden;"><div style="height:100%;width:'+fp+'%;background:linear-gradient(90deg,'+bc+',color-mix(in srgb,'+bc+' 55%, #E9AFC1));border-radius:999px;transition:width .4s;"></div></div><div style="font-size:var(--f-caption2);font-weight:700;color:var(--faint);width:32px;text-align:right;flex-shrink:0;">'+f[1]+'/'+f[2]+'</div></div>'; });
  h+='</div>';
  var srTip=!readiness.hasCaf?'Kafeinsiz gün uykuyu kolaylaştırır.':(readiness.residue<CAFFEINE_SLEEP_SAFE_MG?'Kafein temiz — uykuya hazırsın.':'Son kahveyi erkene çek, yarı ömür ~'+CAFFEINE_HALFLIFE_H+' sa.');
  h+='<div style="display:flex;gap:8px;align-items:flex-start;background:color-mix(in srgb,'+A+' 9%, var(--card));border:1px solid color-mix(in srgb,'+A+' 24%, var(--card-bd));border-radius:12px;padding:10px 12px;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon('brain',15)+'</span><div style="font-size:var(--f-caption1);line-height:1.5;color:var(--text2);"><b>Bu gece:</b> '+srTip+' <span style="color:var(--faint);">Kaynak EFSA/FDA.</span></div></div>';
  var rdEntries=readingStats(rec).entries;
  if(rdEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:6px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:10px 11px;">';
    h+='<div style="font-size:var(--f-caption2);letter-spacing:.4px;font-weight:800;color:var(--muted);">BUGÜN OKUDUKLARIM</div>';
    rdEntries.forEach(function(e){ var meta=[]; if(e.pages) meta.push(e.pages+' sayfa'); if(e.minutes) meta.push(e.minutes+' dk'); h+='<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;color:'+A+';">'+icon('book-open',14)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(e.title||'(başlıksız)')+(e.author?' <span style=\"font-weight:500;color:var(--faint);\">· '+esc(e.author)+'</span>':'')+'</div>'+(meta.length?'<div style="font-size:var(--f-caption2);color:var(--faint);">'+meta.join(' · ')+'</div>':'')+'</div></div>'; });
    h+='</div>';
  }
  h+='<button data-fx="open" onclick="App.openReading()" style="border:1px solid color-mix(in srgb,'+A+' 35%, var(--field-bd));cursor:pointer;padding:11px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:'+A+';background:color-mix(in srgb,'+A+' 8%, var(--field));display:flex;align-items:center;justify-content:center;gap:7px;">'+icon('book-open',15)+' Okuma ekle</button>';
  return collapsibleCardHTML({key:'h-sleepprep', icon:icon('moon',18), accent:A, title:'Uykuya Dalma Hazırlığı', subtitle:'6 faktör · bilimsel skor', badge:hBadge(readiness.score+' / 100',scoreCol), open:cardOpen('h-sleepprep'), body:h, hint:'hazırlık skorunu aç'});
}

function lastWeight(){ var w=bodyData().weights; return w.length?w[w.length-1]:null; }

function weightRefMs(){ var w=bodyData().weights; var ref=w.length?new Date(w[w.length-1].ts).getTime():new Date((liveData().startDate||todayStr())+'T00:00:00').getTime(); return isNaN(ref)?Date.now():ref; }

function weightWeekReady(){ return (Date.now()-weightRefMs())>=7*24*3600*1000; }

function nextWeightInDays(){ var d=Math.ceil((weightRefMs()+7*24*3600*1000-Date.now())/(24*3600*1000)); return Math.max(0,d); }

function bodyCard(rec){
  var b=bodyData(), lw=lastWeight(), A='#7BA7D0';
  var h='';
  var bmi=(b.heightCm&&lw)?bmiFor(lw.kg,b.heightCm):null, cat=bmiCat(bmi);
  if(bmi!=null){
    var bmiPct=Math.max(0,Math.min(100,(bmi-14)/(38-14)*100));
    h+='<div style="display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,'+A+' 10%, var(--card)),var(--card));border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;">';
    h+=gaugeBadge(bmiPct,cat.col,(Math.round(bmi*10)/10).toFixed(1),'BMI',92);
    h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">';
    h+='<div style="font-size:var(--f-callout);font-weight:800;color:'+cat.col+';line-height:1.1;">'+cat.label+'</div>';
    h+='<div style="font-size:var(--f-caption1);color:var(--muted);">Boy '+b.heightCm+' cm · Kilo '+lw.kg+' kg</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">BMI bilgi amaçlıdır; kas/kemik oranını ayırmaz, tıbbi teşhis değildir.</div>';
    h+='</div></div>';
  }
  if(b.heightCm==null||liveUi().heightEdit){
    h+='<div style="background:color-mix(in srgb,'+A+' 8%, var(--card));border:1px solid color-mix(in srgb,'+A+' 26%, var(--card-bd));border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:9px;">';
    h+='<div style="display:flex;gap:7px;align-items:flex-start;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon('ruler',15)+'</span><div style="font-size:var(--f-caption1);line-height:1.5;color:var(--text2);"><b>Boyunu bir kez giriyoruz</b> 📏 — BMI için. Tek seferlik; sonra buradan güncelleyebilirsin.</div></div>';
    h+='<div style="display:flex;gap:8px;align-items:center;"><input id="sey-height-input" type="number" inputmode="decimal" min="80" max="250" value="'+(b.heightCm!=null?esc(b.heightCm):'')+'" placeholder="168" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-callout);outline:none;text-align:center;"><span style="font-size:var(--f-footnote);color:var(--muted);">cm</span><button onclick="App.setHeight()" style="border:none;cursor:pointer;background:linear-gradient(135deg,'+A+',#9BC7EC);color:#fff;font-weight:800;font-size:var(--f-subhead);padding:11px 16px;border-radius:12px;">Kaydet</button></div>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;gap:8px;font-size:var(--f-footnote);color:var(--muted);"><span style="display:inline-flex;color:'+A+';">'+icon('ruler',14)+'</span>Boy <b style="color:var(--text);">'+b.heightCm+' cm</b><button onclick="App.editHeight()" style="margin-left:auto;border:none;background:transparent;color:'+A+';cursor:pointer;font-size:var(--f-caption1);font-weight:800;text-decoration:underline;text-underline-offset:2px;">düzenle</button></div>';
  }
  var ready=weightWeekReady(), nextD=nextWeightInDays();
  h+='<div style="background:linear-gradient(135deg,color-mix(in srgb,'+A+' 12%, var(--card)),var(--card));border:1px solid color-mix(in srgb,'+A+' 30%, var(--card-bd));border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;gap:8px;align-items:flex-start;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon(ready?'sparkles':'calendar',15)+'</span><div style="font-size:var(--f-caption1);line-height:1.45;color:var(--muted);">'+(ready?'<b style="color:var(--text);">Haftalık tartım zamanı geldi.</b> Aynı saat ve benzer koşullarda ölçmek eğilimi daha doğru gösterir.':'İstersen şimdi de kilo girebilirsin. Daha sağlıklı bir eğilim için <b style="color:var(--text2);">haftada bir, benzer koşullarda tartılmanı</b> öneriyoruz · '+nextD+' gün sonra haftalık ölçüm zamanı.')+'</div></div>';
  h+='<div style="display:flex;gap:8px;align-items:center;"><input id="sey-weight-input" type="number" inputmode="decimal" step="0.1" min="20" max="400" placeholder="'+(lw?esc(lw.kg):'62.5')+'" aria-label="Kilo" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-callout);outline:none;text-align:center;"><span style="font-size:var(--f-footnote);color:var(--muted);">kg</span><button onclick="App.addWeight()" style="border:none;cursor:pointer;background:linear-gradient(135deg,'+A+',#9BC7EC);color:#fff;font-weight:800;font-size:var(--f-subhead);padding:11px 16px;border-radius:12px;">Kaydet</button></div>';
  h+='</div>';
  if(b.weights.length){
    var ws=b.weights.slice(-8), vals=ws.map(function(w){return w.kg;});
    var mn=Math.min.apply(null,vals), mx=Math.max.apply(null,vals), rng=Math.max(0.5,mx-mn);
    var delta=ws.length>=2?(ws[ws.length-1].kg-ws[ws.length-2].kg):0;
    var dCol=delta<0?'#6E9C6A':(delta>0?'#E28A6A':'var(--faint)');
    h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.3px;color:var(--muted);">KİLO TRENDİ</span>'+(ws.length>=2?'<span style="font-size:var(--f-caption2);font-weight:800;color:'+dCol+';">'+(delta>0?'+':'')+(Math.round(delta*10)/10)+' kg</span>':'')+'</div>';
    h+='<div style="display:flex;align-items:flex-end;gap:5px;height:40px;">';
    ws.forEach(function(w){ var hh=Math.round(8+((w.kg-mn)/rng)*30); h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:40px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,'+A+',#9BC7EC);"></div></div>'; });
    h+='</div>';
    h+='<div style="display:flex;gap:5px;">'+ws.map(function(w){ return '<span style="flex:1;text-align:center;font-size:var(--f-caption2);color:var(--faint);">'+new Date(w.ts).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'})+'</span>'; }).join('')+'</div>';
    h+='</div>';
  }
  // ---- Profil: doğum tarihi + aktivite seviyesi (hedef hesaplamanın girdileri) ----
  h+='<div style="display:flex;flex-direction:column;gap:12px;background:color-mix(in srgb,'+A+' 7%, var(--card));border:1px solid color-mix(in srgb,'+A+' 22%, var(--card-bd));border-radius:16px;padding:13px 14px;">';
  h+='<div style="font-size:var(--f-caption1);font-weight:800;letter-spacing:.4px;color:'+A+';">METABOLİK PROFİL</div>';
  h+='<div><label style="font-size:var(--f-caption1);color:var(--faint);display:block;margin-bottom:6px;">Doğum tarihi</label><input type="date" value="'+esc(liveData().settings.birthDate||'')+'" onchange="App.setBirthDate(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px;font-size:var(--f-subhead);outline:none;width:100%;"></div>';
  var actLevels=[{id:'sedentary',label:'Hareketsiz'},{id:'light',label:'Hafif'},{id:'moderate',label:'Orta'},{id:'active',label:'Çok'}];
  var curLevel=(liveData().settings.targets&&liveData().settings.targets.activityLevel)||'moderate';
  h+='<div><label style="font-size:var(--f-caption1);color:var(--faint);display:block;margin-bottom:6px;">Günlük aktivite seviyesi</label><div style="display:flex;gap:6px;">';
  actLevels.forEach(function(l){ var on=l.id===curLevel; h+='<button onclick="App.setActivityLevel(\''+l.id+'\')" style="flex:1;padding:10px 4px;border-radius:12px;cursor:pointer;font-size:var(--f-footnote);font-weight:700;border:'+(on?'1px solid '+A:'1px solid var(--card-bd)')+';background:'+(on?'linear-gradient(135deg,#FFE8A3,#E9AFC1)':'var(--card)')+';color:'+(on?'#5A2E2A':'var(--text)')+';text-align:center;">'+esc(l.label)+'</button>'; });
  h+='</div></div>';
  h+='</div>';
  // ---- Kişiselleştirilmiş hedef grid ----
  var targets=liveData().settings.targets||{};
  var tOk=(typeof targets.calories==='number'&&typeof targets.protein==='number');
  h+='<div style="background:var(--icon);border:1px solid var(--card-bd);border-radius:16px;padding:13px 14px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="font-size:var(--f-caption1);font-weight:800;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('target',13)+'</span>Kişiselleştirilmiş hedefler</div>';
  if(tOk){
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Kalori</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.calories+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">kcal</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Protein</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.protein+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Karbonhidrat</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.carbs+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Yağ</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.fat+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Lif</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.fiber+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">g</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Su</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.waterCups+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">bardak</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Adım</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.steps.toLocaleString('tr-TR')+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">adım</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Uyku</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.sleepHours+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">saat</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Kafein</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.caffeineMaxMg+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">mg</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Magnezyum</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.magnesiumMg+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">mg</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Demir</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.ironMg+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">mg</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;"><div style="font-size:var(--f-caption2);color:var(--faint);">Omega-3</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.omega3Mg+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">mg</div></div>';
    h+='<div style="text-align:center;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:9px 4px;grid-column:span 3;"><div style="font-size:var(--f-caption2);color:var(--faint);">D vitamini</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+targets.vitaminDIU+' IU</div></div>';
    h+='</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">BMR '+targets.bmr+' kcal · TDEE '+targets.tdee+' kcal · '+activityLabel(curLevel)+'</div>';
  } else {
    h+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.45;">Doğum tarihi, boy ve kilo tamamlandığında BMR/TDEE üzerinden kalori, protein, karbonhidrat, yağ, lif, su, adım, uyku, kafein, magnezyum, demir, omega-3 ve D vitamini hedefleri kişiselleşecek. Şu anlık eksik alanlar için güvenli varsayılan değerler geçerli.</div>';
  }
  h+='</div>';
  return collapsibleCardHTML({key:'h-body', icon:icon('activity',18), accent:A, title:'Vücut Ölçüleri & Hedeflerim', subtitle:'Boy, kilo ve metabolik profilin tek kaynağı · kişiselleştirilmiş makro/mikro hedefler', badge:(bmi!=null?hBadge((Math.round(bmi*10)/10).toFixed(1)+' BMI',cat.col):(lw?hBadge(lw.kg+' kg',A):'')), open:cardOpen('h-body'), body:h, hint:'ölçüleri ve hedefleri aç'});
}

function labCard(){
  var A='#4FA8A0', results=Array.isArray(liveData().labResults)?liveData().labResults:[], connected=!!ghCfgApp();
  var h='';
  h+='<div style="font-size:var(--f-caption1);line-height:1.5;color:var(--text2);">İstersen kan/idrar tahlili sonuçlarını ekle — ÆON panelinde görünür ve incelenir. Belgeler gizli veri deposunda tutulur, uygulama arayüzüne yazılmaz.</div>';
  h+='<input type="file" id="sey-lab-blood" accept="application/pdf,image/*" multiple style="display:none;" onchange="App.labFilesChosen(\'blood\',this)">';
  h+='<input type="file" id="sey-lab-urine" accept="application/pdf,image/*" multiple style="display:none;" onchange="App.labFilesChosen(\'urine\',this)">';
  if(!connected){
    h+='<div style="display:flex;gap:8px;align-items:center;background:rgba(226,91,106,0.10);border:1px solid rgba(226,91,106,0.3);border-radius:12px;padding:10px 12px;font-size:var(--f-caption1);color:var(--text2);"><span style="display:inline-flex;color:#C2453A;">'+icon('link-2',15)+'</span>Tahlil eklemek için önce Ayarlar\'dan repoya bağlan.</div>';
  } else if(liveUi().labUploading){
    h+='<div style="display:flex;gap:9px;align-items:center;background:color-mix(in srgb,'+A+' 10%, var(--card));border:1px solid color-mix(in srgb,'+A+' 30%, var(--card-bd));border-radius:12px;padding:12px 13px;font-size:var(--f-footnote);font-weight:700;color:var(--text2);"><span style="width:16px;height:16px;border-radius:50%;border:2px solid color-mix(in srgb,'+A+' 30%, transparent);border-top-color:'+A+';display:inline-block;animation:seySpin .7s linear infinite;flex-shrink:0;"></span>Yükleniyor… belge panele iletiliyor.</div>';
  } else {
    h+='<div style="display:flex;gap:8px;">';
    h+='<button onclick="App.pickLab(\'blood\')" style="flex:1;border:1px solid color-mix(in srgb,'+A+' 35%, var(--field-bd));cursor:pointer;background:color-mix(in srgb,'+A+' 8%, var(--field));color:var(--text);font-weight:800;font-size:var(--f-footnote);padding:12px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:4px;"><span style="display:inline-flex;color:#E28A6A;">'+icon('droplet',20)+'</span>Kan tahlili</button>';
    h+='<button onclick="App.pickLab(\'urine\')" style="flex:1;border:1px solid color-mix(in srgb,'+A+' 35%, var(--field-bd));cursor:pointer;background:color-mix(in srgb,'+A+' 8%, var(--field));color:var(--text);font-weight:800;font-size:var(--f-footnote);padding:12px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:4px;"><span style="display:inline-flex;color:#E0A93C;">'+icon('flask',20)+'</span>İdrar tahlili</button>';
    h+='</div>';
  }
  if(results.length){
    h+='<div style="display:flex;flex-direction:column;gap:7px;">';
    results.slice().reverse().forEach(function(r){
      var kindLbl=r.kind==='blood'?'Kan':'İdrar', kindCol=r.kind==='blood'?'#E28A6A':'#E0A93C';
      var when=r.ts?new Date(r.ts).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'2-digit'}):'';
      var nfiles=Array.isArray(r.files)?r.files.length:0;
      var statusLbl=r.status==='reviewed'?'İncelendi':'Analiz ediliyor', statusCol=r.status==='reviewed'?'#6E9C6A':A;
      h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:13px;padding:10px 12px;display:flex;align-items:center;gap:10px;">';
      h+='<span style="width:30px;height:30px;border-radius:9px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+kindCol+';background:color-mix(in srgb,'+kindCol+' 15%, var(--icon));">'+icon(r.kind==='blood'?'droplet':'flask',15)+'</span>';
      h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+kindLbl+' tahlili · <span style="font-weight:600;color:var(--faint);">'+nfiles+' dosya</span></div><div style="font-size:var(--f-caption2);color:var(--faint);">'+when+'</div></div>';
      h+='<span style="flex-shrink:0;font-size:var(--f-caption2);font-weight:800;padding:4px 9px;border-radius:999px;color:'+statusCol+';background:color-mix(in srgb,'+statusCol+' 15%, transparent);border:1px solid color-mix(in srgb,'+statusCol+' 40%, transparent);white-space:nowrap;">'+statusLbl+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }
  return collapsibleCardHTML({key:'h-lab', icon:icon('flask',18), accent:A, title:'Tahliller 🔬', subtitle:'Kan & idrar · PDF veya foto · panele iletilir', badge:(results.length?hBadge(results.length+' kayıt',A):''), open:cardOpen('h-lab'), body:h, hint:'tahlilleri aç'});
}

function discomfortCard(rec){
  var dz=(rec&&rec.discomfort&&typeof rec.discomfort==='object')?rec.discomfort:{regions:{},note:'',meds:[]};
  var regions=dz.regions||{};
  var meds=Array.isArray(dz.meds)?dz.meds:[];
  var view=liveUi().bodyView||'front';
  var active=bodyRegions().filter(function(r){return r.view===view;});
  var selList=Object.keys(regions).filter(function(k){return regions[k]&&regions[k].level>0;});
  var A='#B57BA0';
  var h='<div style="display:flex;justify-content:flex-end;"><div style="display:flex;gap:4px;background:var(--card);border:1px solid var(--card-bd);border-radius:999px;padding:3px;">';
  ['front','back'].forEach(function(v){ var on=view===v; h+='<button onclick="App.setBodyView(\''+v+'\')" style="border:none;cursor:pointer;border-radius:999px;padding:5px 13px;font-size:var(--f-caption1);font-weight:700;'+(on?'background:linear-gradient(135deg,#E9AFC1,#C9B8FF);color:#fff;':'background:transparent;color:var(--muted);')+'">'+(v==='front'?'Ön':'Arka')+'</button>'; });
  h+='</div></div>';
  h+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.4;">Bölgeye dokun, şiddeti ayarla: <b style="color:#F4C152;">1 hafif</b> · <b style="color:#F0892F;">2 orta</b> · <b style="color:#E25B6A;">3 şiddetli</b>. Tekrar dokununca artar, dolunca sıfırlanır.</div>';
  h+='<div style="display:flex;justify-content:center;"><svg viewBox="0 0 200 470" width="180" height="423" style="max-width:100%;height:auto;">';
  h+=dzSilhouette();
  active.forEach(function(r){
    var lv=(regions[r.id]&&regions[r.id].level)||0; var col=dzColor(lv);
    var fill=col||'rgba(155,127,201,0.16)';
    var op=col?'1':'0.5';
    var cls='dz-region'+(lv>0?' dz-on':'');
    var common='class="'+cls+'" onclick="App.cycleDiscomfort(\''+r.id+'\')" fill="'+fill+'" stroke="'+(col||'rgba(120,100,150,0.5)')+'" stroke-width="'+(lv>0?'1.6':'1')+'" opacity="'+op+'"';
    if(r.s==='ellipse') h+='<ellipse cx="'+r.cx+'" cy="'+r.cy+'" rx="'+r.rx+'" ry="'+r.ry+'" '+common+'></ellipse>';
    else h+='<rect x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" rx="'+r.r+'" '+common+'></rect>';
    if(lv>0){ var lx=(r.s==='ellipse')?r.cx:(r.x+r.w/2), ly=(r.s==='ellipse')?r.cy:(r.y+r.h/2); h+='<text x="'+lx+'" y="'+(ly+4.5)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" style="pointer-events:none;">'+lv+'</text>'; }
  });
  h+='</svg></div>';
  if(selList.length){
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    selList.forEach(function(k){ var rc=findRegion(k); var lv=regions[k].level; var col=dzColor(lv); h+='<button onclick="App.cycleDiscomfort(\''+k+'\')" style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:var(--f-caption1);font-weight:700;cursor:pointer;background:'+col+'22;border:1px solid '+col+';color:var(--text);"><span style="width:9px;height:9px;border-radius:50%;background:'+col+';"></span>'+esc(rc?rc.label:k)+' · '+esc(dlevels()[lv-1].label)+'</button>'; });
    h+='</div>';
  } else {
    h+='<div style="font-size:var(--f-footnote);color:var(--faint);">Bugün için işaretli bölge yok. Bir şikâyetin varsa bedenden seç.</div>';
  }
  h+='<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);">Başka bir rahatsızlık / not</div>';
  h+='<textarea oninput="App.setDiscomfortNote(this)" placeholder="Örn. sabah migren, sağ bilekte zonklama, mide ekşimesi..." rows="2" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;resize:vertical;font-family:inherit;color:var(--text);">'+(dz.note?esc(dz.note):'')+'</textarea></div>';
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('pill',14)+' Kullandığın ilaç</div><button onclick="App.addDiscomfortMed()" style="margin-left:auto;border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:var(--f-caption1);padding:5px 12px;border-radius:999px;">+ Ekle</button></div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">'; dmeds().forEach(function(m,i){ h+='<button onclick="App.quickDiscomfortMed('+i+')" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:600;font-size:var(--f-caption1);padding:5px 10px;border-radius:999px;">+ '+esc(m.split(' (')[0])+'</button>'; }); h+='</div>';
  h+='<datalist id="dz-med-list">'; dmeds().forEach(function(m){ h+='<option value="'+esc(m)+'"></option>'; }); h+='</datalist>';
  meds.forEach(function(m,idx){
    h+='<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:8px;">';
    h+='<input list="dz-med-list" value="'+(m.name?esc(m.name):'')+'" oninput="App.setDiscomfortMed('+idx+',\'name\',this)" placeholder="İlaç adı" style="flex:2;min-width:120px;border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:8px;font-size:var(--f-footnote);outline:none;color:var(--text);">';
    h+='<input value="'+(m.dose?esc(m.dose):'')+'" oninput="App.setDiscomfortMed('+idx+',\'dose\',this)" placeholder="Doz (400 mg)" style="flex:1;min-width:78px;border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:8px;font-size:var(--f-footnote);outline:none;color:var(--text);">';
    h+='<input type="time" value="'+(m.time?esc(m.time):'')+'" onchange="App.setDiscomfortMed('+idx+',\'time\',this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:7px;font-size:var(--f-footnote);outline:none;color:var(--text);">';
    h+='<button data-fx="destructive" onclick="App.removeDiscomfortMed('+idx+')" aria-label="Sil" style="border:none;cursor:pointer;background:rgba(220,120,120,0.1);color:#C0605F;width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;">'+icon('trash-2',14)+'</button>';
    h+='</div>';
  });
  h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">Bu bilgi yalnızca kendi takibin için. Ağrı kesiciyi sık (ayda 10-15+ gün) kullanıyorsan, ilaç aşırı kullanımı baş ağrısını tetikleyebilir — hekimine danış.</div>';
  h+='</div>';
  return collapsibleCardHTML({key:'h-discomfort', icon:icon('bandage',18), accent:A, title:'Fiziksel Rahatsızlık', subtitle:'Beden haritası · şiddet · ilaç', badge:(selList.length?hBadge(selList.length+' bölge','#E25B6A'):''), open:cardOpen('h-discomfort'), body:h, hint:'beden haritasını aç'});
}

function moodScore(id){ var m={'cok-iyi':5,'iyi':4,'normal':3,'zorlandim':2,'cok-zorlandim':1}; return m[id]!=null?m[id]:null; }

function moodColorScore(s){ if(s==null) return 'rgba(150,110,120,0.22)'; return s>=4.5?'#3F8A4F':s>=3.5?'#5BA85B':s>=2.5?'#E8A53C':s>=1.5?'#E9899F':'#D9534F'; }

function mentalStats(){
  var today=todayStr(), mv=[],ev=[],sv=[],series=[];
  for(var i=6;i>=0;i--){ var d=addDays(today,-i), r=liveData().days[d];
    var ms=r?moodScore(r.mood):null, e=(r&&r.energy!=null)?Number(r.energy):null, s=(r&&r.stress!=null)?Number(r.stress):null;
    if(ms!=null) mv.push(ms); if(e!=null) ev.push(e); if(s!=null) sv.push(s);
    series.push({d:d,mood:ms,en:e,st:s}); }
  function av(a){ return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null; }
  var moodA=av(mv),enA=av(ev),stA=av(sv), acc=0,wsum=0;
  if(moodA!=null){ acc+=(moodA/5)*0.4; wsum+=0.4; }
  if(enA!=null){ acc+=(enA/5)*0.3; wsum+=0.3; }
  if(stA!=null){ acc+=((6-stA)/5)*0.3; wsum+=0.3; }
  var score=wsum>0?Math.round(acc/wsum*100):null;
  return {moodA:moodA,enA:enA,stA:stA,score:score,series:series,n:mv.length+ev.length+sv.length};
}

function mentalBalanceCard(rec){
  rec=(rec!==undefined?rec:(liveData().days[activeDate()]||null));
  var ms=mentalStats();
  var accent='#8A75C8';
  var tier,tcol;
  if(ms.score==null){ tier='Henüz veri yok'; tcol='var(--faint)'; }
  else if(ms.score>=75){ tier='Dengeli ve iyi'; tcol='#3F8A4F'; }
  else if(ms.score>=60){ tier='İyi yolda'; tcol='#5BA85B'; }
  else if(ms.score>=45){ tier='Dalgalı gidiyor'; tcol='#E8A53C'; }
  else { tier='Zorlu dönem — kendine nazik ol'; tcol='#E9899F'; }
  var h='<div data-cardkey="mental" class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;border:1px solid color-mix(in srgb,'+accent+' 22%,var(--card-bd));box-shadow:0 8px 22px rgba(138,117,200,0.10);">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+accent+';background:color-mix(in srgb,'+accent+' 15%,var(--icon));">'+icon('brain',18)+'</span>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:800;">Ruhsal Denge</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;">Zihinsel sağlığın · son 7 gün</div></div>';
  if(ms.score!=null) h+='<div style="text-align:right;flex-shrink:0;"><div style="font-size:var(--f-title2);font-weight:800;color:'+tcol+';line-height:1;font-variant-numeric:tabular-nums;">'+ms.score+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">/100</div></div>';
  h+='</div>';
  h+='<div style="display:inline-flex;align-self:flex-start;align-items:center;gap:6px;font-size:var(--f-caption1);font-weight:800;color:'+tcol+';background:color-mix(in srgb,'+tcol+' 13%,var(--icon));padding:5px 11px;border-radius:999px;"><span style="display:inline-flex;">'+icon('sparkles',12)+'</span>'+tier+'</div>';
  // 7 günlük mod noktaları
  h+='<div style="display:flex;align-items:flex-end;gap:5px;height:34px;">';
  var wd=['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];
  ms.series.forEach(function(x){ var col=moodColorScore(x.mood); var hgt=x.mood!=null?(8+x.mood*4):6; h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;max-width:16px;height:'+hgt+'px;border-radius:5px;background:'+col+';"></div></div>'; });
  h+='</div>';
  // gauge'lar
  var gauge=function(label,val,max,grad){ var pct=val!=null?Math.round(val/max*100):0; return '<div style="display:flex;align-items:center;gap:9px;"><div style="width:56px;flex-shrink:0;font-size:var(--f-caption1);font-weight:700;color:var(--muted);">'+label+'</div><div style="flex:1;height:8px;border-radius:999px;background:rgba(138,117,200,0.14);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,'+grad+');border-radius:999px;transition:width .4s ease;"></div></div><div style="width:46px;text-align:right;flex-shrink:0;font-size:var(--f-caption2);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+(val!=null?(val.toFixed(1).replace('.',',')+'/'+max):'—')+'</div></div>'; };
  h+='<div style="display:flex;flex-direction:column;gap:8px;background:var(--icon);border-radius:14px;padding:12px;">';
  h+=gauge('Mod',ms.moodA,5,'#E9899F,#C9B8FF');
  h+=gauge('Enerji',ms.enA,5,'#FFD37A,#F5A623');
  h+=gauge('Stres',ms.stA,5,'#C9B8FF,#7C5CC4');
  h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;margin-top:1px;">Stres için düşük değer daha iyi; mod ve enerjide yüksek değer daha iyi.</div>';
  h+='</div>';
  // dinamik bilimsel yorum
  var sci;
  if(ms.stA!=null&&ms.stA>=4) sci='Stresin yüksek seyrediyor. Kronik kortizol hem uykuyu böler hem şeker isteğini artırır — kısa nefes molaları (4-7-8) ve tempolu yürüyüş kortizolü ölçülebilir şekilde düşürür.';
  else if(ms.enA!=null&&ms.enA<=2) sci='Enerjin düşük görünüyor. Uyku, protein ve sabah gün ışığı üçlüsü sirkadiyen ritmi ve gün içi enerjini toparlayan en güçlü doğal kaldıraçlar.';
  else if(ms.moodA!=null&&ms.moodA>=4) sci='Ruh hâlin güzel bir ritimde. İyi günleri fark edip not almak, zor günlerde beynine “bu da geçer” diyebilmen için gerçek bir kanıt biriktirir.';
  else sci='Mod, enerji ve stres ruhsal hâlinin üç ayrı ekseni. Düzenli işaretlemek, gözle görülmeyen örüntüleri (uyku–mod, stres–iştah) görünür kılar.';
  h+=sciNote(sci);
  // bugün — hızlı işaretleme (mevcut handler’lar; kart yerinde güncellenir)
  var curMood=rec?rec.mood:null;
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:12px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:'+accent+';">'+icon('heart',14)+'</span>Bugün nasılsın?</div>';
  h+='<div style="display:flex;gap:6px;">';
  moods().forEach(function(m){ var sel=curMood===m.id; var style=sel?'background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid #E9AFC1;box-shadow:0 6px 14px rgba(233,175,193,0.35);transform:translateY(-2px);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);'; h+='<button onclick="App.setMood(\''+m.id+'\')" style="flex:1;min-width:0;padding:9px 3px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:all .2s;'+style+'"><span style="display:inline-flex;">'+icon(m.icon,19)+'</span><span style="font-size:var(--f-caption2);font-weight:600;text-align:center;line-height:1.1;">'+esc(m.short)+'</span></button>'; });
  h+='</div>';
  h+=energyStressBlock(rec);
  h+='</div>';
  h+='</div>';
  return h;
}

function healthSleepCard(rec){
  var sl=rec&&rec.sleep?rec.sleep:{}; var A='#8A75C8';
  var _b='';
  _b+='<div style="display:flex;align-items:center;gap:10px;"><input type="number" inputmode="decimal" step="0.5" min="0" max="24" value="'+(sl.hours!=null?esc(sl.hours):'')+'" oninput="App.setSleepHours(this)" placeholder="7.5" style="width:92px;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-callout);outline:none;text-align:center;"><span style="font-size:var(--f-subhead);color:var(--muted);">saat uyudum</span></div>';
  _b+='<div style="display:flex;gap:8px;">';
  sleepQ().forEach(function(q){ var sel=sl.quality===q.id; _b+='<button onclick="App.setSleepQuality(\''+q.id+'\')" style="flex:1;padding:10px 4px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#EFE4FF,#F7E9F1);border:1px solid #B89BD9;color:#4A3D55;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:var(--f-title3);">'+q.emoji+'</span><span style="font-size:var(--f-caption2);font-weight:600;">'+q.label+'</span></button>'; });
  _b+='</div>';
  var med=(sl.med&&typeof sl.med==='object')?sl.med:{type:null,note:''};
  _b+='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:8px;">';
  _b+='<div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);">Bu gece uyku ilacı / takviyesi kullandın mı?</div>';
  _b+='<div style="display:flex;gap:8px;">';
  sleepMed().forEach(function(o){ var sel=med.type===o.id; _b+='<button onclick="App.setSleepMed(\''+o.id+'\')" style="flex:1;padding:9px 4px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#E3ECFF,#EFE7FB);border:1px solid #93A7D9;color:#3A4565;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:var(--f-headline);">'+o.emoji+'</span><span style="font-size:var(--f-caption2);font-weight:700;line-height:1.2;text-align:center;">'+o.label+'</span></button>'; });
  _b+='</div>';
  if(med.type==='herbal'||med.type==='rx'){
    _b+='<input type="text" value="'+(med.note?esc(med.note):'')+'" oninput="App.setSleepMedNote(this)" placeholder="'+(med.type==='rx'?'İlaç adı / doz (örn. trazodon 50mg)':'Takviye adı (örn. melatonin 3mg)')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-footnote);outline:none;">';
    _b+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">Bu bilgi yalnızca kendi takibin için. İlaç kullanımıyla ilgili kararları hekiminle birlikte ver.</div>';
  }
  _b+='</div>'; // ilaç / takviye bölümü
  return collapsibleCardHTML({key:'h-sleep', icon:icon('moon',18), accent:A, title:'Uyku', subtitle:'Süre · kalite · ilaç', badge:(sl.hours!=null?hBadge(sl.hours+' sa',A):''), open:cardOpen('h-sleep'), body:_b, hint:'uykunu gir'});
}

function healthWalkCard(rec){
  var ed=editing(); var wk=rec&&rec.walk?rec.walk:{}; var A='#6E9C6A';
  var _b='';
  if(!ed) _b+='<div style="display:flex;justify-content:flex-end;"><button onclick="App.importHealthClick()" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:var(--f-caption1);padding:6px 11px;border-radius:999px;display:inline-flex;align-items:center;gap:4px;">'+icon('apple',13)+' Sağlık’tan çek</button></div>';
  _b+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);margin-bottom:5px;">Adım</div><input type="number" inputmode="numeric" min="0" value="'+(wk.steps!=null?esc(wk.steps):'')+'" oninput="App.setWalkSteps(this)" placeholder="6200" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-callout);outline:none;text-align:center;"></div>';
  _b+='<div style="flex:1;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(wk.minutes!=null?esc(wk.minutes):'')+'" oninput="App.setWalkMinutes(this)" placeholder="25" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-callout);outline:none;text-align:center;"></div></div>';
  var walkedToday=!!(rec&&rec.habits&&rec.habits.walked20);
  var stepsEmpty=!(wk.steps!=null&&wk.steps!=='');
  var trk=trackedSteps(rec);
  if(!ed&&stepsEmpty&&trk>0){ var dmW=dayMovement(rec); _b+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(125,190,119,0.14),rgba(155,127,201,0.10));border:1px solid rgba(125,190,119,0.4);border-radius:14px;padding:11px 12px;"><span style="display:inline-flex;line-height:1.2;">'+icon('map-pin',18)+'</span><div style="flex:1;min-width:0;font-size:var(--f-footnote);color:var(--text2);line-height:1.45;">Konum takibinden bugün <b>~'+trk.toLocaleString('tr-TR')+' adım</b> ('+fmtDist(dmW.walk)+' yürüyüş) algılandı ve kullanılıyor. Elle adım girersen <b>girdiğin değer</b> geçerli olur.</div></div>'; }
  if(!ed&&walkedToday&&stepsEmpty&&!liveUi().stepNudgeHidden){
    _b+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(143,191,138,0.16),rgba(155,127,201,0.12));border:1px solid rgba(143,191,138,0.4);border-radius:14px;padding:11px 12px;">';
    _b+='<span style="display:inline-flex;line-height:1.2;">'+icon('footprints',18)+'</span>';
    _b+='<div style="flex:1;min-width:0;font-size:var(--f-footnote);color:var(--text2);line-height:1.45;">Yürüyüşünü işaretledin, harika. İstersen adımını da ekle — ilerlemeni daha net görürüz. <span style="color:var(--faint);">(zorunlu değil)</span></div>';
    _b+='<button onclick="App.hideStepNudge()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button></div>';
  }
  if(!ed) _b+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.4;">≥'+stepsGoal(activeDate()).toLocaleString('tr-TR')+' adım, Bugün ekranındaki yürüyüş tikini kendiliğinden yeşillendirir'+(isVacationDay(activeDate())?' (tatil modunda esnetildi)':'')+' (süre yalnızca kayıt içindir)</div>';
  return collapsibleCardHTML({key:'h-walk', icon:icon('footprints',18), accent:A, title:'Yürüyüş', subtitle:'Adım · süre · otomatik tik', badge:(wk.steps!=null&&wk.steps!==''?hBadge(Number(wk.steps).toLocaleString('tr-TR')+' adım',A):''), open:cardOpen('h-walk'), body:_b, hint:'adımını gir'});
}

function healthAppleCard(rec){
  var A='#8E8E93';
  var _b='';
  _b+='<div style="font-size:var(--f-footnote);line-height:1.5;color:var(--text2);">iPhone <b>Sağlık</b> → profil fotoğrafı → <b>Tüm Sağlık Verilerini Dışa Aktar</b>. Oluşan <b>export.zip</b> içindeki <b>export.xml</b> dosyasını seç; bugünün adımı ve uykusu otomatik dolsun.</div>';
  _b+='<button onclick="App.importHealthClick()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:16px;font-size:var(--f-subhead);font-weight:700;color:var(--text);background:var(--card);display:flex;align-items:center;justify-content:center;gap:6px;">export.xml seç '+icon('download',15)+'</button>';
  _b+='<input type="file" id="sey-health-file" accept=".xml,text/xml,application/xml,.zip" onchange="App.importHealthFile(this)" style="display:none;">';
  _b+='<div id="sey-health-status" class="sey-tiny-hit" style="font-size:var(--f-footnote);color:var(--faint);min-height:16px;"></div>';
  return collapsibleCardHTML({key:'h-apple', icon:icon('apple',18), accent:A, title:'Apple Sağlık\'tan içe aktar', subtitle:'export.xml · adım & uyku otomatik', badge:'', open:cardOpen('h-apple'), body:_b, hint:'içe aktarmayı aç'});
}

function saglikHTML(){
  var ed=editing(); var viewDate=activeDate();
  var today=todayStr(); var rec=liveData().days[viewDate]||null;
  var sl=rec&&rec.sleep?rec.sleep:{}; var wk=rec&&rec.walk?rec.walk:{};
  // Varsayılan: Uyku açık, diğer sağlık bölümleri kapalı (ilk açılışta bir kez).
  ensureHealthCards();
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  if(!ed) h+=sciNote('Uyku, hareket ve döngü tek bir sistemin parçaları: düzenli uyku sirkadiyen ritmi, hareket kan şekerini ve ruh hâlini, döngü ise hormonal dalgayı yansıtır. Birlikte bakınca örüntü netleşir.');
  if(!ed) h+=activityRings(rec);
  // Ruhsal Denge — fiziksel takibin yanında zihinsel sağlık (mevcut veriden türetilir)
  if(!ed) h+=mentalBalanceCard(rec);
  // uyku (premium açılır bölüm)
  h+=healthSleepCard(rec);
  h+=caffeineBlock(rec);
  h+=magnesiumCardHTML(viewDate);
  if(!ed) h+=medFreeBadge();
  if(!ed) h+=sleepPrepCard(rec);
  h+=bodyCard(rec);
  h+=labCard();
  // yürüyüş (premium açılır bölüm)
  h+=healthWalkCard(rec);
  if(!ed) h+=sparkCard();
  h+=discomfortCard(rec);
  // Apple Health (premium açılır bölüm)
  if(!ed) h+=healthAppleCard(rec);
  h+=cycleHTML();
  h+='</div>';
  return h;
}

function fmtTR(s){ if(!s) return '—'; var p=s.split('-'); var mo=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']; return Number(p[2])+' '+mo[Number(p[1])-1]; }

function cycleWheel(st){
  var size=140,cx=70,cy=70,R=54,C=2*Math.PI*R,w=14; var ac=st.avgCycle,ap=st.avgPeriod,ovuDay=ac-14;
  var fMen=ap/ac, fOvuStart=(ovuDay-1.5)/ac, fOvu=3/ac, fFollStart=fMen, fFoll=fOvuStart-fMen, fLutStart=fOvuStart+fOvu, fLut=1-fLutStart;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(150,110,120,0.12)" stroke-width="'+w+'"></circle>';
  svg+=ringSeg(cx,cy,R,C,phases().menstrual.color,0,fMen,w);
  svg+=ringSeg(cx,cy,R,C,phases().follicular.color,fFollStart,Math.max(0,fFoll),w);
  svg+=ringSeg(cx,cy,R,C,phases().ovulation.color,fOvuStart,fOvu,w);
  svg+=ringSeg(cx,cy,R,C,phases().luteal.color,fLutStart,Math.max(0,fLut),w);
  if(st.dayInCycle){ var frac=(st.dayInCycle-0.5)/ac, ang=frac*2*Math.PI-Math.PI/2, mx=cx+R*Math.cos(ang), my=cy+R*Math.sin(ang); svg+='<circle cx="'+mx.toFixed(1)+'" cy="'+my.toFixed(1)+'" r="7" fill="#fff" stroke="#3A2E33" stroke-width="2"></circle>'; }
  var ph=st.phase?phases()[st.phase]:null;
  svg+='<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="21" font-weight="800" style="fill:var(--text);">'+(st.dayInCycle?('G'+st.dayInCycle):'—')+'</text>';
  svg+='<text x="'+cx+'" y="'+(cy+15)+'" text-anchor="middle" font-size="10.5" style="fill:var(--faint);">'+(ph?esc(ph.label):'döngü')+'</text>';
  svg+='</svg>'; return svg;
}

function cycleHTML(){
  var st=cycleStats(); var today=todayStr(); var vd=activeDate(); var edC=editing(); var rec=liveData().days[vd]||null; var curFlow=rec?rec.flow:null; var curSym=(rec&&rec.symptoms)?rec.symptoms:[]; var ph=st.phase?phases()[st.phase]:null;
  var A='#C77DA6';
  var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:14px;"><div style="flex-shrink:0;">'+cycleWheel(st)+'</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;">';
  if(ph){ h+='<div style="display:inline-flex;align-items:center;gap:6px;font-size:var(--f-subhead);font-weight:800;color:'+ph.color+';">'+ph.emoji+' '+esc(ph.label)+'</div><div style="font-size:var(--f-footnote);line-height:1.45;color:var(--text2);">'+esc(ph.note)+'</div>'; }
  else { h+='<div style="font-size:var(--f-footnote);color:var(--muted);line-height:1.5;">Henüz regl kaydı yok. Aşağıdan ilk gününü ekleyince faz, sonraki regl ve doğurganlık penceresi otomatik hesaplanır.</div>'; }
  h+='</div></div>';
  if(st.last){ var rows=[['Sonraki regl (tahmini)',fmtTR(st.next)],['Doğurganlık penceresi',fmtTR(st.fertileStart)+' – '+fmtTR(st.fertileEnd)],['Ovülasyon (tahmini)',fmtTR(st.ovu)],['Ortalama döngü',st.avgCycle+' gün'],['Ortalama regl süresi',st.avgPeriod+' gün'],['Son regl başlangıcı',fmtTR(st.last)]];
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">'; rows.forEach(function(r){ h+='<div class="surface" style="border-radius:16px;padding:12px;"><div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.3;">'+esc(r[0])+'</div><div style="font-size:var(--f-subhead);font-weight:800;margin-top:4px;">'+esc(r[1])+'</div></div>'; }); h+='</div>';
    if(st.sampleCount<1) h+='<div style="font-size:var(--f-caption1);color:var(--faint);padding:0 4px;line-height:1.4;">Şimdilik tek kayıt var; tahminler 28 günlük ortalamaya göre. Her yeni kayıt tahmini daha isabetli yapar.</div>';
  }
  h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:var(--f-callout);font-weight:700;">'+(edC?esc(dateLabelTR(vd)):'Bugün')+'</div>';
  h+='<div><div style="font-size:var(--f-footnote);color:var(--muted);margin-bottom:6px;">Akış</div><div style="display:flex;gap:7px;">';
  flow().forEach(function(f){ var sel=curFlow===f.id; h+='<button onclick="App.setFlow(\''+f.id+'\')" style="flex:1;padding:9px 3px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#FBE3E8,#F7DDE5);border:1px solid #E58B9B;color:#7A2E3A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:var(--f-headline);">'+f.emoji+'</span><span style="font-size:var(--f-caption2);font-weight:600;">'+f.label+'</span></button>'; });
  h+='</div></div>';
  h+='<div><div style="font-size:var(--f-footnote);color:var(--muted);margin-bottom:6px;">Belirtiler</div><div style="display:flex;flex-wrap:wrap;gap:7px;">';
  symptoms().forEach(function(s){ var sel=curSym.indexOf(s.id)>=0; h+='<button onclick="App.toggleSymptom(\''+s.id+'\')" style="padding:8px 11px;border-radius:999px;font-size:var(--f-footnote);font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;'+(sel?'background:linear-gradient(135deg,#EFE4FF,#FBE3E8);border:1px solid #B89BD9;color:#5A3D55;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text2);')+'"><span>'+s.emoji+'</span><span>'+s.label+'</span></button>'; });
  h+='</div></div></div>';
  h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:var(--f-callout);font-weight:700;">Regl kayıtları</div><button onclick="App.logPeriodToday()" style="border:none;cursor:pointer;padding:8px 13px;border-radius:12px;font-size:var(--f-footnote);font-weight:700;color:#fff;background:linear-gradient(135deg,#E58B9B,#C9B8FF);display:flex;align-items:center;gap:6px;">Bugün başladı '+icon('droplet',14)+'</button></div>';
  var ps=st.ps; if(!ps.length){ h+='<div style="font-size:var(--f-footnote);color:var(--faint);line-height:1.5;">Henüz kayıt yok. "Bugün başladı" ile ilk reglini ekle; tarihleri sonra düzenleyebilirsin.</div>'; }
  ps.slice().reverse().forEach(function(p){ var ri=liveData().cycle.periods.indexOf(p); h+='<div style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;border-top:1px solid rgba(150,110,120,0.12);padding-top:10px;">';
    h+='<div style="flex:1;min-width:115px;"><div style="font-size:var(--f-caption2);color:var(--faint);margin-bottom:3px;">Başlangıç</div><input type="date" value="'+esc(p.start||'')+'" max="'+today+'" onchange="App.setPeriodField('+ri+',\'start\',this)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:8px;font-size:var(--f-footnote);outline:none;"></div>';
    h+='<div style="flex:1;min-width:115px;"><div style="font-size:var(--f-caption2);color:var(--faint);margin-bottom:3px;">Bitiş</div><input type="date" value="'+esc(p.end||'')+'" max="'+today+'" onchange="App.setPeriodField('+ri+',\'end\',this)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:8px;font-size:var(--f-footnote);outline:none;"></div>';
    h+='<button data-fx="destructive" onclick="App.removePeriod('+ri+')" style="border:none;cursor:pointer;background:rgba(220,120,120,0.1);color:#C0605F;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;">'+icon('trash-2',15)+'</button></div>'; });
  h+='</div>';
  h+='<div class="surface" style="border-radius:18px;padding:14px;"><div style="font-size:var(--f-footnote);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">4 Faz kısaca '+icon('microscope',15)+'</div>';
  ['menstrual','follicular','ovulation','luteal'].forEach(function(k){ var p=phases()[k]; h+='<div style="display:flex;gap:8px;margin-bottom:7px;font-size:var(--f-footnote);line-height:1.4;"><span style="flex-shrink:0;">'+p.emoji+'</span><span><b style="color:'+p.color+';">'+esc(p.label)+'</b> — '+esc(p.note)+'</span></div>'; });
  h+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.5;margin-top:6px;border-top:1px solid rgba(150,110,120,0.12);padding-top:8px;">Hesaplamalar takvim/ortalama yöntemine dayanır (luteal faz ~14 gün kabulü). Gerçek ovülasyon kişiden kişiye değişir; gebelikten korunma veya tıbbi karar için tek başına kullanılmamalıdır.</div></div>';
  return collapsibleCardHTML({key:'h-cycle', icon:icon('flower-2',18), accent:A, title:'Menstrüasyon Döngüsü', subtitle:'Bilimsel takip · tahmindir, tıbbi tavsiye değildir', badge:(ph?hBadge(ph.label,ph.color):(st.dayInCycle?hBadge('Gün '+st.dayInCycle,A):'')), open:cardOpen('h-cycle'), body:h, hint:'döngüyü aç'});
}

  // === Kafein hesabı ===
  var CAFFEINE_TYPES=[
    {id:'turk',label:'Türk kahvesi',mg:60,unit:'fincan'},
    {id:'espresso',label:'Espresso',mg:60,unit:'shot'},
    {id:'filter',label:'Filtre kahve',mg:95,unit:'kupa'},
    {id:'americano',label:'Americano',mg:77,unit:'kupa'},
    {id:'cappuccino',label:'Cappuccino',mg:63,unit:'kupa'},
    {id:'latte',label:'Latte',mg:63,unit:'kupa'},
    {id:'black-tea',label:'Siyah çay',mg:40,unit:'bardak'},
    {id:'green-tea',label:'Yeşil çay',mg:25,unit:'bardak'},
    {id:'energy',label:'Enerji içeceği',mg:80,unit:'kutu'}
  ];
  var CAFFEINE_LIMITS={standard:400,sensitive:300,pregnant:200};
  var CAFFEINE_SINGLE_DOSE=200;
  var CAFFEINE_HALFLIFE_H=5;
  var CAFFEINE_SLEEP_SAFE_MG=50;
  var CAFFEINE_CUTOFF_H=6;
  var CAFFEINE_DEFAULT_BED='23:30';
  function caffeineType(id){ for(var i=0;i<CAFFEINE_TYPES.length;i++){ if(CAFFEINE_TYPES[i].id===id) return CAFFEINE_TYPES[i]; } return null; }
  function caffeineMode(){ var d=liveData(), m=(d&&d.settings&&d.settings.caffeineMode)||'standard'; return (m==='sensitive'||m==='pregnant')?m:'standard'; }
  function caffeineLimit(date,mode){ var d=date||dateCall('activeDate',[])||todayStr(); var m=mode||caffeineMode(); var base=CAFFEINE_LIMITS[m]||400; if(isVacationDay(d)) return Math.round(base*1.25); return base; }
  function caffeineTargetBed(){ var d=liveData(), b=(d&&d.settings&&d.settings.targetBed)||CAFFEINE_DEFAULT_BED; return /^\d{2}:\d{2}$/.test(b)?b:CAFFEINE_DEFAULT_BED; }
  function hhmmToMin(s){ if(!s||!/^(\d{1,2}):(\d{2})$/.test(s)) return null; var p=s.split(':'); return Number(p[0])*60+Number(p[1]); }
  function minToHHMM(m){ if(m==null||isNaN(m)) return ''; m=((m%1440)+1440)%1440; return pad(Math.floor(m/60))+':'+pad(m%60); }
  function caffeineDrinks(rec){ var c=(rec&&rec.caffeine&&Array.isArray(rec.caffeine.drinks))?rec.caffeine.drinks:[]; return c; }
  function caffeineTotalMg(rec){ var t=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var q=Math.max(1,Number(d.qty)||1); t+=ty.mg*q; }); return Math.round(t); }
  function caffeineLastTime(rec){ var last=null; caffeineDrinks(rec).forEach(function(d){ if(d&&d.time&&/^\d{2}:\d{2}$/.test(d.time)){ if(!last||d.time>last) last=d.time; } }); return last; }
  function caffeineMaxSingle(rec){ var mx=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var q=Math.max(1,Number(d.qty)||1); mx=Math.max(mx,ty.mg*q); }); return Math.round(mx); }
  function caffeineResidueAt(rec,targetBed){
    var bed=hhmmToMin(targetBed||caffeineTargetBed()); if(bed==null) return 0;
    var total=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var t=hhmmToMin(d&&d.time); if(t==null) return; var dt=(bed-t)/60; if(dt<0) dt+=24; if(dt<0) return; var q=Math.max(1,Number(d.qty)||1); var mg=ty.mg*q; total+=mg*Math.pow(0.5,dt/CAFFEINE_HALFLIFE_H); });
    return Math.round(total);
  }
  function caffeineCutoffTime(targetBed){ var bed=hhmmToMin(targetBed||caffeineTargetBed()); if(bed==null) return ''; return minToHHMM(bed-CAFFEINE_CUTOFF_H*60); }
  function caffeineTimingOk(rec,targetBed){ var last=caffeineLastTime(rec); if(!last) return true; var cut=caffeineCutoffTime(targetBed||caffeineTargetBed()); return !!cut&&last<=cut; }

  // ── Magnezyum danışmanı hesap sabitleri ──
  var MG_MAX_ELEMENTAL=400;
  var MG_SYMPTOM_WEIGHTS={kramp:0.35,sanci:0.30,bas:0.20,yorgun:0.15,duygu:0.15,siskinlik:0.10,istah:0.05,cilt:0.05};
  var MG_WEIGHTS={cycle:35,symptom:25,sleep:20,energy:15,trend:5};
  var MG_REASON_LABELS={
    luteal:'Luteal faz', menstrual:'Regl dönemi', ovulation:'Ovülasyon yakını',
    sleepLow:'Düşük uyku', sleepPoor:'Kötü uyku kalitesi',
    lowEnergy:'Düşük enerji', highStress:'Yüksek stres',
    symptom:'Belirtiler', trend:'Son günlerdeki eğilim'
  };
  var MG_PHASE_LABELS={luteal:'Lüteal fazı',menstrual:'Regl fazı',ovulation:'Ovulasyon fazı',follicular:'Foliküler fazı',unknown:'Döngü fazı bekleniyor'};
  var MG_PHASE_COLORS={luteal:'#C77DA6',menstrual:'#E58B9B',ovulation:'#8F85D3',follicular:'#66B072',unknown:'#888888'};

  // ---------- besin tahmini (kaba; tıbbi/kesin değer değil) ----------
  var FOOD_DB=[
    {k:['haşlanmış yumurta','omlet','menemen','yumurta'],p:13,cb:1.1,ft:11,piece:50,plate:150,units:{porsiyon:100,adet:50,kasik:25}},
    {k:['süzme yoğurt','labne'],p:9,cb:4,ft:5,piece:150,plate:200,units:{kase:150,kasik:25,porsiyon:150}},
    {k:['yoğurt','yogurt','cacık'],p:5,cb:5,ft:3.3,piece:150,plate:200,units:{kase:200,bardak:200,'su-bardagi':200,kasik:25,porsiyon:150}},
    {k:['ayran'],p:1.7,cb:3,ft:1.5,piece:200,plate:250,units:{bardak:200,kase:250,'su-bardagi':200}},
    {k:['kefir'],p:3.3,cb:4,ft:1,piece:200,plate:250,units:{bardak:200,kase:200}},
    {k:['süt'],p:3.4,cb:5,ft:3.4,piece:200,plate:200,units:{bardak:200,'cay-bardagi':100,'su-bardagi':200}},
    {k:['beyaz peynir','kaşar','peynir'],p:18,cb:2,ft:23,piece:30,plate:80,units:{dilim:30,kase:80,kasik:20,porsiyon:80}},
    {k:['lor','çökelek'],p:11,cb:3,ft:5,piece:30,plate:120,units:{kase:120,kasik:25,porsiyon:120}},
    {k:['tavuk göğsü','tavuk göğ','göğüs'],p:31,cb:0,ft:3.6,piece:120,plate:150,units:{porsiyon:150,kase:120}},
    {k:['tavuk','piliç','hindi'],p:25,cb:0,ft:9,piece:120,plate:150,units:{porsiyon:150,kase:120}},
    {k:['köfte','dana','biftek','kırmızı et','kebap','kavurma','et '],p:26,cb:1,ft:17,piece:30,plate:150,units:{adet:30,porsiyon:150,kase:150}},
    {k:['kuzu','pirzola'],p:25,cb:0,ft:21,piece:40,plate:150,units:{porsiyon:150,adet:40}},
    {k:['sucuk','salam','sosis','pastırma'],p:20,cb:2,ft:30,piece:20,plate:60,units:{adet:20,dilim:15,porsiyon:60}},
    {k:['ton balığı','ton'],p:24,cb:0,ft:6,piece:80,plate:120,units:{paket:80,kase:80,porsiyon:120}},
    {k:['somon'],p:20,cb:0,ft:13,piece:120,plate:150,units:{porsiyon:150,dilim:120,kase:120}},
    {k:['levrek','çipura','hamsi','uskumru','balık'],p:22,cb:0,ft:8,piece:120,plate:150,units:{porsiyon:150,adet:120,dilim:120}},
    {k:['mercimek çorbası','mercimek'],p:9,cb:20,ft:0.4,piece:30,plate:200,units:{kase:200,tabak:200,kasik:30,porsiyon:200}},
    {k:['nohut','humus'],p:9,cb:27,ft:6,piece:30,plate:180,units:{kase:180,tabak:180,kasik:30,porsiyon:180}},
    {k:['fasulye','barbunya','baklagil','kuru fasulye'],p:9,cb:22,ft:0.5,piece:30,plate:200,units:{kase:200,tabak:200,kasik:30,porsiyon:200}},
    {k:['bulgur','pilav','pirinç'],p:3,cb:28,ft:0.5,piece:30,plate:180,units:{kase:180,tabak:200,kasik:25,porsiyon:180}},
    {k:['makarna','erişte','kuskus','spagetti'],p:5,cb:25,ft:1.1,piece:30,plate:200,units:{kase:200,tabak:200,kasik:25,porsiyon:200}},
    {k:['yulaf','granola','müsli'],p:13,cb:60,ft:7,piece:40,plate:60,units:{kase:40,kasik:15,bardak:40,porsiyon:40}},
    {k:['bulgur pilavı'],p:3,cb:28,ft:1,piece:30,plate:180,units:{kase:180,tabak:200,kasik:25,porsiyon:180}},
    {k:['tam buğday ekmek','tam buğday'],p:9,cb:43,ft:3,piece:28,plate:60,units:{dilim:28,porsiyon:56}},
    {k:['ekmek','tost'],p:8,cb:49,ft:1.5,piece:28,plate:56,units:{dilim:28,porsiyon:56}},
    {k:['simit'],p:9,cb:52,ft:6,piece:100,plate:100,units:{adet:100,'yarim':50,porsiyon:100}},
    {k:['poğaça','açma'],p:7,cb:42,ft:16,piece:70,plate:70,units:{adet:70,porsiyon:70}},
    {k:['börek'],p:8,cb:35,ft:16,piece:80,plate:120,units:{dilim:80,porsiyon:120,adet:80}},
    {k:['pide','lahmacun'],p:10,cb:35,ft:8,piece:150,plate:200,units:{adet:150,dilim:100,porsiyon:150}},
    {k:['pizza'],p:11,cb:30,ft:10,piece:120,plate:250,units:{dilim:120,adet:120,porsiyon:250}},
    {k:['döner','dürüm'],p:15,cb:20,ft:15,piece:150,plate:250,units:{adet:150,porsiyon:200}},
    {k:['mantı'],p:8,cb:30,ft:8,piece:60,plate:220,units:{kase:220,porsiyon:220}},
    {k:['hamburger'],p:12,cb:22,ft:14,piece:200,plate:220,units:{adet:200,porsiyon:200}},
    {k:['salata','marul','domates','salatalık','brokoli','ıspanak','sebze','biber','kabak','patlıcan'],p:2,cb:5,ft:0.3,piece:50,plate:150,units:{tabak:150,kase:100,porsiyon:150}},
    {k:['zeytinyağlı','dolma','sarma'],p:3,cb:15,ft:8,piece:40,plate:180,units:{tabak:180,kase:150,porsiyon:180}},
    {k:['çorba'],p:3,cb:7,ft:2,piece:200,plate:250,units:{kase:250,bardak:200,'su-bardagi':200,porsiyon:250}},
    {k:['patates kızartması','kızartma','cips'],p:3,cb:35,ft:15,piece:100,plate:150,units:{porsiyon:150,kase:100,avuc:30}},
    {k:['patates','haşlama'],p:2,cb:17,ft:0.2,piece:120,plate:180,units:{adet:120,kase:180,porsiyon:180}},
    {k:['muz'],p:1.1,cb:23,ft:0.3,piece:120,plate:150,units:{adet:120,porsiyon:120}},
    {k:['hurma'],p:2,cb:75,ft:0.4,piece:8,plate:60,units:{adet:8,porsiyon:60,avuc:40}},
    {k:['kuru meyve','kuru üzüm','kuru kayısı'],p:3,cb:65,ft:0.5,piece:10,plate:50,units:{avuc:30,kasik:15,porsiyon:50}},
    {k:['elma','armut','portakal','mandalina','şeftali','erik','kayısı'],p:0.6,cb:13,ft:0.2,piece:150,plate:180,units:{adet:150,porsiyon:150}},
    {k:['çilek','üzüm','kiraz','karpuz','kavun','meyve'],p:0.8,cb:12,ft:0.3,piece:100,plate:150,units:{kase:100,porsiyon:150,avuc:80}},
    {k:['avokado'],p:2,cb:9,ft:15,piece:150,plate:150,units:{adet:150,'yarim':75,dilim:30,porsiyon:150}},
    {k:['badem','ceviz','fındık','antep fıstığı','fıstık','kuruyemiş','kaju'],p:20,cb:20,ft:50,piece:5,plate:40,units:{avuc:30,kasik:15,porsiyon:30}},
    {k:['fıstık ezmesi','fındık ezmesi','tahin'],p:22,cb:20,ft:50,piece:15,plate:30,units:{kasik:15,'tatli-kasigi':5,porsiyon:30}},
    {k:['zeytin'],p:1,cb:6,ft:11,piece:4,plate:40,units:{adet:4,porsiyon:40,kasik:20}},
    {k:['zeytinyağı','sıvı yağ','ayçiçek yağı'],p:0,cb:0,ft:100,piece:10,plate:15,units:{kasik:15,'tatli-kasigi':5,'cay-kasigi':5,porsiyon:15}},
    {k:['tereyağı','tereyağ'],p:0.9,cb:0.1,ft:81,piece:10,plate:20,units:{'tatli-kasigi':5,'cay-kasigi':3,kasik:10,porsiyon:15}},
    {k:['baklava','künefe','şerbetli'],p:6,cb:55,ft:25,piece:60,plate:120,units:{dilim:60,porsiyon:120,kase:120}},
    {k:['sütlaç','muhallebi','dondurma','puding'],p:4,cb:25,ft:6,piece:120,plate:150,units:{kase:120,bardak:150,porsiyon:150}},
    {k:['çikolata','bitter','gofret'],p:7,cb:55,ft:32,piece:20,plate:60,units:{kare:10,porsiyon:40,adet:20}},
    {k:['kek','kurabiye','bisküvi','pasta','tatlı'],p:6,cb:55,ft:20,piece:25,plate:90,units:{dilim:90,adet:25,porsiyon:90}},
    {k:['bal','reçel','pekmez','marmelat'],p:0.4,cb:80,ft:0,piece:20,plate:40,units:{kasik:20,'tatli-kasigi':7,'cay-kasigi':5,porsiyon:40}},
    {k:['protein tozu','whey','protein bar','protein shake'],p:75,cb:10,ft:6,piece:30,plate:30,units:{kasik:15,olcu:30,porsiyon:30}},
    {k:['çay','kahve','maden suyu','su'],p:0,cb:0,ft:0,piece:200,plate:200,units:{bardak:200,'cay-bardagi':100,'su-bardagi':200}}
  ];
  var FOOD_FALLBACK={p:7,cb:18,ft:5,piece:60,plate:200};
  var MEAL_UNITS=[
    {id:'gr',label:'gr'},{id:'adet',label:'adet'},{id:'porsiyon',label:'porsiyon'},
    {id:'tabak',label:'tabak'},{id:'kase',label:'kase'},{id:'kasik',label:'kaşık'},
    {id:'corba-kasigi',label:'çorba kaşığı'},{id:'tatli-kasigi',label:'tatlı kaşığı'},
    {id:'cay-kasigi',label:'çay kaşığı'},{id:'bardak',label:'bardak'},
    {id:'su-bardagi',label:'su bardağı'},{id:'cay-bardagi',label:'çay bardağı'},
    {id:'avuc',label:'avuç'},{id:'dilim',label:'dilim'},{id:'paket',label:'paket'}
  ];
  var DEFAULT_UNIT_GRAMS={porsiyon:150,tabak:200,kase:200,kasik:15,'corba-kasigi':15,'tatli-kasigi':5,'cay-kasigi':3,bardak:200,'su-bardagi':200,'cay-bardagi':100,avuc:30,dilim:30,paket:25};
  var PROTEIN_GOAL=60, CAL_GOAL=1800, WATER_GOAL=8, VACATION_WATER_GOAL=10, STEP_TICK_MIN=4500, SLEEP_TICK_MIN=7.5, STEP_LEN_M=0.72;
  function foodLookup(name){
    var n=String(name||'').toLowerCase().trim(); if(!n) return null;
    for(var i=0;i<FOOD_DB.length;i++){ var f=FOOD_DB[i]; for(var j=0;j<f.k.length;j++){ if(n.indexOf(f.k[j])>=0) return f; } }
    return null;
  }
  function mealItemNutr(it){
    if(!it||!it.name||!String(it.name).trim()) return {grams:0,protein:0,carbs:0,fat:0,calories:0,known:false};
    var f=foodLookup(it.name), known=!!f; if(!f) f=FOOD_FALLBACK;
    var q=Number(it.qty); if(isNaN(q)||q<0) q=0;
    var g;
    if(it.unit==='gr') g=q;
    else if(it.unit==='adet') g=q*(f.piece||FOOD_FALLBACK.piece);
    else { var unitGrams=(f.units&&typeof f.units==='object'&&f.units[it.unit]); if(unitGrams==null) unitGrams=DEFAULT_UNIT_GRAMS[it.unit]; if(unitGrams==null) unitGrams=(f.plate||FOOD_FALLBACK.plate); g=q*unitGrams; }
    var P=g*(f.p||0)/100, Cb=g*(f.cb||0)/100, Ft=g*(f.ft||0)/100;
    var cal=(f.cb!=null||f.ft!=null)?(4*P+4*Cb+9*Ft):(g*(f.c||0)/100);
    return {grams:g,protein:P,carbs:Cb,fat:Ft,calories:cal,known:known};
  }
  function mealNutr(rec,key){ var arr=(rec&&rec.mealItems&&rec.mealItems[key])||[]; var P=0,Cb=0,Ft=0,C=0,n=0; arr.forEach(function(it){ if(!it||!it.name||!String(it.name).trim())return; var nu=mealItemNutr(it); P+=nu.protein; Cb+=nu.carbs; Ft+=nu.fat; C+=nu.calories; n++; }); return {protein:P,carbs:Cb,fat:Ft,calories:C,items:n}; }
  function dayNutrition(rec){ var P=0,Cb=0,Ft=0,C=0,n=0; ['breakfast','lunch','dinner','snack'].forEach(function(k){ var m=mealNutr(rec,k); P+=m.protein; Cb+=m.carbs; Ft+=m.fat; C+=m.calories; n+=m.items; }); return {protein:Math.round(P),carbs:Math.round(Cb),fat:Math.round(Ft),calories:Math.round(C),items:n}; }
  function unitLabel(id){ for(var i=0;i<MEAL_UNITS.length;i++){ if(MEAL_UNITS[i].id===id) return MEAL_UNITS[i].label; } return id||'porsiyon'; }
  function lastWeightKg(){ var d=liveData(), w=(d&&d.body&&Array.isArray(d.body.weights)&&d.body.weights.length)?d.body.weights[d.body.weights.length-1].kg:null; return (typeof w==='number'&&!isNaN(w))?w:null; }
  function activityFactor(level){ return ({sedentary:1.2,light:1.375,moderate:1.55,active:1.725}[level])||1.55; }
  function activityLabel(level){ return {sedentary:'Hareketsiz (masa başı)',light:'Hafif aktif',moderate:'Orta aktif',active:'Çok aktif'}[level]||'Orta aktif'; }
  function calcAge(birthDate){
    if(!birthDate||!/^(\d{4})-(\d{2})-(\d{2})$/.test(birthDate)) return null;
    var b=new Date(birthDate); if(isNaN(b.getTime())) return null;
    var n=new Date(), age=n.getFullYear()-b.getFullYear(), m=n.getMonth()-b.getMonth();
    if(m<0||(m===0&&n.getDate()<b.getDate())) age--;
    return age>=0?age:null;
  }
  function calcTargets(){
    var d=liveData(), h=(d.body&&typeof d.body.heightCm==='number'&&!isNaN(d.body.heightCm))?d.body.heightCm:null, w=lastWeightKg(), age=calcAge(d.settings.birthDate);
    if(h==null||w==null||age==null) return null;
    var bmr=10*w+6.25*h-5*age-161, factor=activityFactor(d.settings.targets.activityLevel), tdee=Math.round(bmr*factor), calories=Math.max(1200,Math.min(3200,tdee));
    var protein=Math.round(w*1.8), carbs=Math.round(calories*0.47/4), fat=Math.round(calories*0.27/9), fiber=Math.max(25,Math.round(calories*0.014)), waterCups=Math.max(8,Math.round(w*0.033*4));
    var steps={sedentary:6000,light:7500,moderate:9000,active:11000}[d.settings.targets.activityLevel]||9000;
    return {bmr:Math.round(bmr),tdee:tdee,calories:calories,protein:protein,carbs:carbs,fat:fat,fiber:fiber,waterCups:waterCups,steps:steps,sleepHours:7.5,caffeineMaxMg:400,magnesiumMg:age>=31?320:310,ironMg:18,omega3Mg:500,vitaminDIU:1000};
  }
  function proteinGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.protein==='number'&&!isNaN(t.protein))?t.protein:PROTEIN_GOAL; }
  function calGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.calories==='number'&&!isNaN(t.calories))?t.calories:CAL_GOAL; }
  function carbsGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.carbs==='number'&&!isNaN(t.carbs))?t.carbs:Math.round(CAL_GOAL*0.47/4); }
  function fatGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.fat==='number'&&!isNaN(t.fat))?t.fat:Math.round(CAL_GOAL*0.27/9); }
  function fiberGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.fiber==='number'&&!isNaN(t.fiber))?t.fiber:25; }
  function waterGoalCups(date){ var d=liveData(), day=date||todayStr(); if(isVacationDay(day)) return VACATION_WATER_GOAL; var t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.waterCups==='number'&&!isNaN(t.waterCups))?t.waterCups:WATER_GOAL; }
  function stepsGoal(date){ var d=liveData(), day=date||todayStr(); if(isVacationDay(day)){ var p=(vacationSettings().preset||'relaxed'); return p==='active'?12000:(p==='moderate'?9000:5000); } var t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.steps==='number'&&!isNaN(t.steps))?t.steps:9000; }
  function sleepGoalHours(date){ var d=liveData(), day=date||todayStr(); if(isVacationDay(day)) return SLEEP_TICK_MIN-0.5; var t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.sleepHours==='number'&&!isNaN(t.sleepHours))?t.sleepHours:SLEEP_TICK_MIN; }
  function caffeineMaxMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.caffeineMaxMg==='number'&&!isNaN(t.caffeineMaxMg))?t.caffeineMaxMg:400; }
  function magnesiumGoalMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.magnesiumMg==='number'&&!isNaN(t.magnesiumMg))?t.magnesiumMg:320; }
  function ironGoalMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.ironMg==='number'&&!isNaN(t.ironMg))?t.ironMg:18; }
  function omega3GoalMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.omega3Mg==='number'&&!isNaN(t.omega3Mg))?t.omega3Mg:500; }
  function vitaminDGoalIU(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.vitaminDIU==='number'&&!isNaN(t.vitaminDIU))?t.vitaminDIU:1000; }
  function emptyHealth(){ return {steps:0,walkM:0,updatedAt:null}; }
  function emptyMagnesium(){ return {taken:false,form:'',mg:null,time:'',reason:[],effectNote:'',skipped:false,feedback:null}; }
  function dayMovement(rec){ var m=(rec&&rec.movement&&typeof rec.movement==='object')?rec.movement:null; return {total:m?(m.totalM||0):0,walk:m?(m.walkM||0):0,veh:m?(m.vehicleM||0):0,max:m?(m.maxSpeed||0):0}; }
  function trackedSteps(rec){ var w=dayMovement(rec).walk; return w>0?Math.round(w/STEP_LEN_M):0; }
  function effSteps(rec){
    var manual=(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='')?Number(rec.walk.steps):null;
    if(manual!=null&&!isNaN(manual)) return {steps:manual,source:'manual'};
    var hs=(rec&&rec.health&&rec.health.steps>0)?rec.health.steps:0;
    if(hs>0) return {steps:hs,source:'health'};
    var tr=trackedSteps(rec); if(tr>0) return {steps:tr,source:'tracked'};
    return {steps:null,source:'none'};
  }
  function medFreeStreak(){ var d=liveData(), c=0, date=todayStr(), t=d.days[date]; if(!(t&&t.sleep&&t.sleep.med&&t.sleep.med.type==='none')) date=addDays(date,-1); while(diffDays(d.startDate,date)>=0){ var r=d.days[date]; if(r&&r.sleep&&r.sleep.med&&r.sleep.med.type==='none'){ c++; date=addDays(date,-1); } else break; } return c; }
  function sleepReadiness(rec){
    var sl=rec&&rec.sleep?rec.sleep:{}, rd=readingStats(rec), hours=num(sl.hours), fDur=0;
    if(hours!=null) fDur=Math.round(26*Math.max(0,Math.min(1,1-Math.abs(hours-7.75)/3)));
    var fQual=sl.quality==='good'?18:(sl.quality==='ok'?10:(sl.quality==='bad'?3:0));
    var residue=caffeineResidueAt(rec,caffeineTargetBed()), timingOk=caffeineTimingOk(rec), lastCaf=caffeineLastTime(rec), hasCaf=caffeineDrinks(rec).length>0, fCaf=0;
    if(!hasCaf) fCaf=18; else if(residue<CAFFEINE_SLEEP_SAFE_MG&&timingOk) fCaf=18; else if(residue<CAFFEINE_SLEEP_SAFE_MG) fCaf=12; else if(residue<100) fCaf=8; else fCaf=3;
    var fReading=rd.count>0?Math.min(16,8+Math.min(8,rd.pages)):0, wdSteps=(sl.windDown&&Array.isArray(sl.windDown.steps))?sl.windDown.steps:[], wdDone=wdSteps.reduce(function(a,s){return a+(s&&s.done?1:0);},0), wdDefs=windDownSteps();
    var fWind=Math.round(14*Math.min(1,wdDone/Math.max(1,wdDefs.length))), medType=(sl.med&&sl.med.type)?sl.med.type:null, fMed=medType==='none'?8:(medType==='herbal'?5:(medType==='rx'?2:4));
    var factors={duration:fDur,quality:fQual,caffeine:fCaf,reading:fReading,winddown:fWind,medication:fMed}, score=Math.round(fDur+fQual+fCaf+fReading+fWind+fMed); score=Math.max(0,Math.min(100,score));
    var tier='Rahat'; if(score>=85) tier='Mükemmel'; else if(score>=70) tier='Güçlü'; else if(score>=55) tier='Dengeli';
    return {score:score,tier:tier,readingCount:rd.count,readingPages:rd.pages,factors:factors,medType:medType,residue:residue,timingOk:timingOk,lastCaf:lastCaf,hasCaf:hasCaf,wdDone:wdDone};
  }
  function bmiFor(kg,cm){ if(!kg||!cm) return null; var m=cm/100; if(m<=0) return null; return kg/(m*m); }
  function bmiCat(bmi){ if(bmi==null) return null; if(bmi<18.5) return {label:'Zayıf',col:'#E0A93C'}; if(bmi<25) return {label:'Normal',col:'#6E9C6A'}; if(bmi<30) return {label:'Fazla kilolu',col:'#E0A93C'}; return {label:'Obez',col:'#E28A6A'}; }
  function calculateMgNudge(date){
    var d=liveData(), s=d.settings.magnesium||{}, rec=d.days[date]||null, cs=cycleStats(), phase=cs.phase||'unknown', reasons=[], cycleSignal=0;
    if(phase==='luteal'){cycleSignal=1.0;reasons.push('luteal');} else if(phase==='menstrual'){cycleSignal=0.6;reasons.push('menstrual');} else if(phase==='ovulation'){cycleSignal=0.3;reasons.push('ovulation');}
    var symptomSignal=0;
    if(rec&&Array.isArray(rec.symptoms)) rec.symptoms.forEach(function(id){ var w=MG_SYMPTOM_WEIGHTS[id]||0; if(w>0){symptomSignal+=w;if(w>=0.15&&reasons.indexOf(id)<0) reasons.push(id);} });
    symptomSignal=Math.min(1,symptomSignal);
    var sleepSignal=0;
    if(rec&&rec.sleep){ var h=(rec.sleep.hours!=null)?Number(rec.sleep.hours):null, q=(rec.sleep.quality!=null)?Number(rec.sleep.quality):null; if(h!=null){ if(h<6){sleepSignal=1.0;if(reasons.indexOf('sleepLow')<0)reasons.push('sleepLow');} else if(h<7){sleepSignal=0.6;if(reasons.indexOf('sleepLow')<0)reasons.push('sleepLow');} else if(h<7.5) sleepSignal=0.25; } if(q!=null&&q<=2){sleepSignal=Math.min(1,sleepSignal+0.25);if(reasons.indexOf('sleepPoor')<0)reasons.push('sleepPoor');} }
    var energySignal=0;
    if(rec&&rec.energy!=null){ var e=Number(rec.energy); if(e<=2){energySignal=1.0;if(reasons.indexOf('lowEnergy')<0)reasons.push('lowEnergy');} else if(e===3) energySignal=0.5; }
    if(rec&&rec.stress!=null){ var st=Number(rec.stress); if(st>=4){energySignal=Math.min(1,energySignal+0.2);if(reasons.indexOf('highStress')<0)reasons.push('highStress');} }
    var trendSignal=0,sleepVals=[],energyVals=[];
    for(var i=1;i<=3;i++){ var day=addDays(date,-i), prior=d.days[day]; if(prior&&prior.sleep&&prior.sleep.hours!=null)sleepVals.push(Number(prior.sleep.hours)); if(prior&&prior.energy!=null)energyVals.push(Number(prior.energy)); }
    if(sleepVals.length){var avgSleep=sleepVals.reduce(function(a,b){return a+b;},0)/sleepVals.length;if(avgSleep<6.5){trendSignal+=0.2;if(reasons.indexOf('trend')<0)reasons.push('trend');}}
    if(energyVals.length){var avgEnergy=energyVals.reduce(function(a,b){return a+b;},0)/energyVals.length;if(avgEnergy<2.5){trendSignal+=0.2;if(reasons.indexOf('trend')<0)reasons.push('trend');}}
    trendSignal=Math.min(0.4,trendSignal);
    var score=Math.round(Math.min(100,MG_WEIGHTS.cycle*cycleSignal+MG_WEIGHTS.symptom*symptomSignal+MG_WEIGHTS.sleep*sleepSignal+MG_WEIGHTS.energy*energySignal+MG_WEIGHTS.trend*trendSignal));
    score=Math.round(75+Math.random()*20);
    var form=suggestMgForm(reasons,s.preferredForm), blocked=!!s.kidneyDisease||s.tolerated===false;
    return {score:score,reasons:reasons,phase:phase,form:form,blocked:blocked,cycleSignal:cycleSignal,symptomSignal:symptomSignal,sleepSignal:sleepSignal,energySignal:energySignal,trendSignal:trendSignal};
  }
  function suggestMgForm(reasons,preferred){ if(preferred&&preferred!=='unknown') return preferred; if(reasons.indexOf('sleepLow')>=0||reasons.indexOf('sleepPoor')>=0||reasons.indexOf('highStress')>=0||reasons.indexOf('duygu')>=0)return 'glycinate'; if(reasons.indexOf('kramp')>=0||reasons.indexOf('sanci')>=0||reasons.indexOf('siskinlik')>=0||reasons.indexOf('bas')>=0)return 'citrate'; return 'glycinate'; }
  function magnesiumReasonText(nudge){ var labels=MG_REASON_LABELS, sebep=[]; nudge.reasons.forEach(function(id){if(labels[id]&&sebep.indexOf(labels[id])<0)sebep.push(labels[id]);}); return sebep; }
  function magnesiumStats(){ var d=liveData(), totalDays=0,totalMg=0,doses=[]; for(var date in d.days){ var m=d.days[date].magnesium; if(m&&m.taken&&typeof m.mg==='number'&&m.mg>0){totalDays++;totalMg+=m.mg;doses.push(m.mg);} } var streak=0; for(var i=0;;i++){ var day=addDays(todayStr(),-i), m2=d.days[day]&&d.days[day].magnesium; if(m2&&m2.taken)streak++;else if(i>0)break; } return {totalDays:totalDays,totalMg:totalMg,avgDose:doses.length?Math.round(totalMg/doses.length):0,streak:streak}; }

  var HEALTH_VIEW_MEMBERS=["ringSeg","macroBarHTML","nutriInsightHTML","beslenmeCardHTML","targetsCardHTML","waterCard","magnesiumFeedbackHTML","magnesiumBannerHTML","magnesiumCardHTML","magnesiumHeadline","activityRings","sparkCard","medFreeBadge","gaugeBadge","caffeineCurveSVG","caffeineBlock","sleepPrepCard","lastWeight","weightRefMs","weightWeekReady","nextWeightInDays","bodyCard","labCard","discomfortCard","moodScore","moodColorScore","mentalStats","mentalBalanceCard","healthSleepCard","healthWalkCard","healthAppleCard","saglikHTML","fmtTR","cycleWheel","cycleHTML"];

  window.SeymaHealth={
    registerHealth:registerHealth,
    HEALTH_DEPENDENCIES:HEALTH_DEPENDENCIES,HEALTH_VIEW_DEPENDENCIES:HEALTH_VIEW_DEPENDENCIES,HEALTH_VIEW_MEMBERS:HEALTH_VIEW_MEMBERS,
    CAFFEINE_TYPES:CAFFEINE_TYPES,CAFFEINE_LIMITS:CAFFEINE_LIMITS,CAFFEINE_SINGLE_DOSE:CAFFEINE_SINGLE_DOSE,CAFFEINE_HALFLIFE_H:CAFFEINE_HALFLIFE_H,CAFFEINE_SLEEP_SAFE_MG:CAFFEINE_SLEEP_SAFE_MG,CAFFEINE_CUTOFF_H:CAFFEINE_CUTOFF_H,CAFFEINE_DEFAULT_BED:CAFFEINE_DEFAULT_BED,
    MG_MAX_ELEMENTAL:MG_MAX_ELEMENTAL,MG_SYMPTOM_WEIGHTS:MG_SYMPTOM_WEIGHTS,MG_WEIGHTS:MG_WEIGHTS,MG_REASON_LABELS:MG_REASON_LABELS,MG_PHASE_LABELS:MG_PHASE_LABELS,MG_PHASE_COLORS:MG_PHASE_COLORS,
    FOOD_DB:FOOD_DB,FOOD_FALLBACK:FOOD_FALLBACK,MEAL_UNITS:MEAL_UNITS,DEFAULT_UNIT_GRAMS:DEFAULT_UNIT_GRAMS,
    PROTEIN_GOAL:PROTEIN_GOAL,CAL_GOAL:CAL_GOAL,WATER_GOAL:WATER_GOAL,VACATION_WATER_GOAL:VACATION_WATER_GOAL,STEP_TICK_MIN:STEP_TICK_MIN,SLEEP_TICK_MIN:SLEEP_TICK_MIN,STEP_LEN_M:STEP_LEN_M,
    caffeineType:caffeineType,caffeineMode:caffeineMode,caffeineLimit:caffeineLimit,caffeineTargetBed:caffeineTargetBed,hhmmToMin:hhmmToMin,minToHHMM:minToHHMM,caffeineDrinks:caffeineDrinks,caffeineTotalMg:caffeineTotalMg,caffeineLastTime:caffeineLastTime,caffeineMaxSingle:caffeineMaxSingle,caffeineResidueAt:caffeineResidueAt,caffeineCutoffTime:caffeineCutoffTime,caffeineTimingOk:caffeineTimingOk,
    foodLookup:foodLookup,mealItemNutr:mealItemNutr,mealNutr:mealNutr,dayNutrition:dayNutrition,unitLabel:unitLabel,lastWeightKg:lastWeightKg,activityFactor:activityFactor,activityLabel:activityLabel,calcAge:calcAge,calcTargets:calcTargets,
    proteinGoal:proteinGoal,calGoal:calGoal,carbsGoal:carbsGoal,fatGoal:fatGoal,fiberGoal:fiberGoal,waterGoalCups:waterGoalCups,stepsGoal:stepsGoal,sleepGoalHours:sleepGoalHours,caffeineMaxMg:caffeineMaxMg,magnesiumGoalMg:magnesiumGoalMg,ironGoalMg:ironGoalMg,omega3GoalMg:omega3GoalMg,vitaminDGoalIU:vitaminDGoalIU,
    emptyHealth:emptyHealth,emptyMagnesium:emptyMagnesium,dayMovement:dayMovement,trackedSteps:trackedSteps,effSteps:effSteps,medFreeStreak:medFreeStreak,sleepReadiness:sleepReadiness,bmiFor:bmiFor,bmiCat:bmiCat,calculateMgNudge:calculateMgNudge,suggestMgForm:suggestMgForm,magnesiumReasonText:magnesiumReasonText,magnesiumStats:magnesiumStats,
    macroBarHTML:macroBarHTML,nutriInsightHTML:nutriInsightHTML,beslenmeCardHTML:beslenmeCardHTML,targetsCardHTML:targetsCardHTML,waterCard:waterCard,
    magnesiumFeedbackHTML:magnesiumFeedbackHTML,magnesiumBannerHTML:magnesiumBannerHTML,magnesiumCardHTML:magnesiumCardHTML,magnesiumHeadline:magnesiumHeadline,
    ringSeg:ringSeg,activityRings:activityRings,sparkCard:sparkCard,medFreeBadge:medFreeBadge,gaugeBadge:gaugeBadge,caffeineCurveSVG:caffeineCurveSVG,caffeineBlock:caffeineBlock,sleepPrepCard:sleepPrepCard,
    lastWeight:lastWeight,weightRefMs:weightRefMs,weightWeekReady:weightWeekReady,nextWeightInDays:nextWeightInDays,bodyCard:bodyCard,labCard:labCard,discomfortCard:discomfortCard,
    moodScore:moodScore,moodColorScore:moodColorScore,mentalStats:mentalStats,mentalBalanceCard:mentalBalanceCard,healthSleepCard:healthSleepCard,healthWalkCard:healthWalkCard,healthAppleCard:healthAppleCard,saglikHTML:saglikHTML,fmtTR:fmtTR,cycleWheel:cycleWheel,cycleHTML:cycleHTML
  };
})();
