// MON-37 · settings domain registry.
// Ayarlar görünümü ve read-only builder'lar burada; settings mutation,
// migrate/default/schema, sync sanitize ve App handler sahipliği app.js'te kalır.
(function(){
  'use strict';

  var settingsDeps=null;
  var SETTINGS_DEPENDENCIES=['state','view','theme','icon','esc','reminderCopy','daysTracked','countRec','featuresLive','todayStr','syncConfigured'];

  function registerSettings(deps){
    if(settingsDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<SETTINGS_DEPENDENCIES.length;i++) if(typeof deps[SETTINGS_DEPENDENCIES[i]]!=='function') return false;
    settingsDeps=deps;
    return true;
  }
  function dep(name){ return settingsDeps&&typeof settingsDeps[name]==='function'?settingsDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaSettings: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('state',[]); }
  function liveUi(){ return call('view',[]); }
  function liveTheme(){ return call('theme',[]); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function reminderCopy(){ return call('reminderCopy',arguments); }
  function daysTracked(){ return call('daysTracked',arguments); }
  function countRec(){ return call('countRec',arguments); }
  function featuresLive(){ return call('featuresLive',arguments); }
  function todayStr(){ return call('todayStr',arguments); }
  function syncConfigured(){ return call('syncConfigured',arguments); }
function ayarlarHTML(){
  var data=liveData(), ui=liveUi(), themePref=liveTheme();
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<button data-fx="open" type="button" id="kao-settings-entry" class="kao-settings-entry" onclick="App.kaoOpen()" aria-haspopup="dialog"><span aria-hidden="true">'+icon('book-open',19)+'</span><span><strong>Kur’an Arapçası Öğreniyorum</strong><small>Kelimelerini tanı, âyetleri daha yakından anla.</small></span><span aria-hidden="true">'+icon('chevron-right',16)+'</span></button>';
  h+='<button data-fx="open" type="button" id="sey-reminder-settings-entry" class="sey-reminder-settings-entry" onclick="App.openReminderCenter()" aria-haspopup="dialog"><span class="sey-reminder-settings-icon" aria-hidden="true">'+icon('bell-ring',19)+'</span><span class="sey-reminder-settings-copy"><strong>'+esc(reminderCopy('inApp.center.title','Hatırlatmalar ve bildirimler'))+'</strong><small>'+esc(reminderCopy('inApp.center.settingsSubtitle','Günün duraklarını, uygulama içi önizlemeyi ve izin sınırını gör.'))+'</small></span><span class="sey-reminder-settings-action">'+esc(reminderCopy('inApp.actions.open','Aç'))+' '+icon('chevron-right',15)+'</span></button>';
  // ── Veri & senkron özeti (teknik detay) ──
  var _dtracked=daysTracked(), _totalTicks=0,_dayRecs=0;
  for(var _dk in data.days){ _dayRecs++; _totalTicks+=countRec(data.days[_dk]); }
  var _sizeKB=0; try{ _sizeKB=Math.round(JSON.stringify(data).length/1024); }catch(e){}
  var _prog=(window.MotivationProgramV2&&featuresLive())?window.MotivationProgramV2.progressSummary(data):null;
  var _lastSync=data.lastSyncDate?(data.lastSyncDate===todayStr()?'bugün':esc(data.lastSyncDate)):'henüz yok';
  var _conn=syncConfigured();
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('chart-column',15)+'</span>Veri & senkron özeti</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">';
  [['Takip günü',_dtracked],['Toplam tik',_totalTicks],['Kayıt boyutu','~'+_sizeKB+' KB']].forEach(function(c){ h+='<div style="background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 8px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.3;">'+c[0]+'</div><div style="font-size:var(--f-callout);font-weight:800;margin-top:3px;font-variant-numeric:tabular-nums;">'+c[1]+'</div></div>'; });
  h+='</div>';
  var _srow=function(ic,label,val,col){ return '<div style="display:flex;align-items:center;gap:10px;"><span style="width:22px;display:flex;justify-content:center;color:'+(col||'var(--muted)')+';">'+icon(ic,14)+'</span><span style="flex:1;font-size:var(--f-footnote);color:var(--text2);">'+label+'</span><span style="font-size:var(--f-footnote);font-weight:700;text-align:right;">'+val+'</span></div>'; };
  h+='<div style="display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--card-bd);padding-top:11px;">';
  h+=_srow(_conn?'circle-check':'link-2','Repo bağlantısı',(_conn?'<span style="color:#3F8A4F;">bağlı</span>':'<span style="color:#E9899F;">bağlı değil</span>'),_conn?'#3F8A4F':'#E9899F');
  h+=_srow('save','Son repoya kayıt','<span style="color:var(--text);">'+_lastSync+'</span>');
  if(_prog) h+=_srow('compass','İçsel Pusula','<span style="color:var(--text);">Gün '+_prog.currentProgramDay+'/'+_prog.totalDays+' · %'+_prog.percent+'</span>','#6E5FCB');
  h+='</div>';
  h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.45;">Kayıt boyutu, bu cihazdaki verinin yaklaşık büyüklüğü. Sırlar (anahtarlar) repoya asla gönderilmez.</div>';
  h+='</div>';
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:8px;"><div style="font-size:var(--f-subhead);font-weight:700;">Başlangıç tarihi</div><input type="date" value="'+esc(data.startDate)+'" onchange="App.startDateChange(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px;font-size:var(--f-subhead);outline:none;"></div>';
  // appearance
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-subhead);font-weight:700;">Görünüm</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Sistem, telefonunun görünüm ayarını takip eder; açık veya koyu seçersen o sabit kalır.</div><div style="display:flex;gap:8px;">';
  var onS='background:linear-gradient(135deg,#FFE8A3,#E9AFC1);color:#5A2E2A;border:1px solid #E9AFC1;';
  var offS='background:transparent;color:var(--muted);border:1px solid var(--card-bd);';
  var _tbtn='flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px;';
  h+='<button onclick="App.setTheme(false)" aria-pressed="'+(themePref==='light')+'" style="'+_tbtn+(themePref==='light'?onS:offS)+'">'+icon('sun',15)+' Açık</button>';
  h+='<button onclick="App.setTheme(true)" aria-pressed="'+(themePref==='dark')+'" style="'+_tbtn+(themePref==='dark'?onS:offS)+'">'+icon('moon',15)+' Koyu</button>';
  h+='<button onclick="App.setTheme(\'system\')" aria-pressed="'+(themePref==='system')+'" style="'+_tbtn+(themePref==='system'?onS:offS)+'">'+icon('smartphone',15)+' Sistem</button></div></div>';
  // titreşim / haptik geri bildirimi
  var hapOn=!(data.settings&&data.settings.haptics===false);
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;">Titreşim geri bildirimi '+icon('vibrate',15)+'</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Tik, mod ve kriz dokunuşlarında minik bir titreşim (destekleyen cihazlarda hissedilir).</div><div style="display:flex;gap:8px;">';
  h+='<button onclick="App.toggleHaptic(true)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(hapOn?onS:offS)+'">'+icon('vibrate',14)+' Açık</button>';
  h+='<button onclick="App.toggleHaptic(false)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(hapOn?offS:onS)+'">'+icon('bell-off',14)+' Kapalı</button></div></div>';
  // FX-P-61: Premium Atmosfer master switch + alt FX anahtarları. Tek kart,
  // master kapalıyken alt satırlar kilitli görünür (gating mediaFx/timeTheme'de).
  var paOn=!(data.settings&&data.settings.premiumAtmosphere===false);
  var fxRows=[
    ['uiSounds','Arayüz sesleri','Tıklama, başarı ve uyarı tonları','volume-2'],
    ['richHaptics','Dokunmatik geri bildirim','Zenginleştirilmiş titreşim desenleri','vibrate'],
    ['launchRitual','Açılış ritüeli','Açılışta kısa bir karşılama animasyonu ve sesi (varsayılan açık)','sparkles'],
    ['voiceGuidance','Sesli rehberlik','Kritik anlarda kısa sesli yönlendirmeler; bulut sesi yoksa yerel sesle devam eder','mic'],
    ['ambientSounds','Ambiyans sesleri','Yağmur, dalga, ney gibi arka plan sesleri','cloud-drizzle']
  ];
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('sparkles',15)+' Premium Atmosfer</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Tüm premium efektleri tek anahtarla yönet. Kapattığında uygulama sade modda çalışır.</div>';
  h+='<div style="display:flex;gap:8px;">';
  h+='<button data-fx="toggle" onclick="App.toggleSetting(\'premiumAtmosphere\',true)" aria-pressed="'+paOn+'" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(paOn?onS:offS)+'">'+icon('sparkles',14)+' Açık</button>';
  h+='<button data-fx="toggle" onclick="App.toggleSetting(\'premiumAtmosphere\',false)" aria-pressed="'+(!paOn)+'" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(paOn?offS:onS)+'">'+icon('bell-off',14)+' Kapalı</button></div>';
  fxRows.forEach(function(row){
    var on=!!(data.settings&&data.settings[row[0]]);
    var lockStyle=paOn?'':'opacity:.45;pointer-events:none;';
    h+='<div style="display:flex;align-items:center;gap:10px;'+lockStyle+'"><div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+(row[3]?icon(row[3],14)+' ':'')+row[1]+'</div><div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.35;">'+row[2]+'</div></div>';
    h+='<button data-fx="toggle" onclick="App.toggleSetting(\''+row[0]+'\')" aria-pressed="'+on+'" aria-label="'+row[1].replace(/^[^A-Za-zÇĞİÖŞÜğöşüı]+ /,'')+' '+(on?'açık':'kapalı')+'" style="flex-shrink:0;min-width:74px;padding:8px 12px;border-radius:11px;cursor:pointer;font-size:var(--f-caption1);font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:4px;'+(on?onS:offS)+'">'+(on?'Açık':'Kapalı')+'</button></div>';
  });
  h+='</div>';
  // FX-P-57: sesli rehberlik ayarları — toggle + dil + konuşma hızı.
  var vgOn=!!(data.settings&&data.settings.voiceGuidance);
  var vLang=(data.settings&&data.settings.voiceLang)||'tr-TR';
  var vRate=(data.settings&&data.settings.voiceRate!=null)?Number(data.settings.voiceRate):1;
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('mic',15)+' Sesli rehberlik</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Kritik anlarda kısa ve nazik sesli yönlendirmeler (onboarding, seri kutlaması, zikir tamamlama). Gece 23:00–07:00 arası sessiz kalır.</div>';
  h+='<div style="display:flex;gap:8px;">';
  h+='<button onclick="App.setVoiceGuidance(true)" aria-pressed="'+vgOn+'" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(vgOn?onS:offS)+'">'+icon('mic',14)+' Açık</button>';
  h+='<button onclick="App.setVoiceGuidance(false)" aria-pressed="'+(!vgOn)+'" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;'+(vgOn?offS:onS)+'">'+icon('bell-off',14)+' Kapalı</button></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><label for="sey-voice-lang" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Dil</label><select id="sey-voice-lang" onchange="App.setVoiceLang(this.value)" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px;font-size:var(--f-footnote);outline:none;color:var(--text);">';
  [['tr-TR','Türkçe'],['en-US','English'],['ar-SA','العربية']].forEach(function(o){ h+='<option value="'+o[0]+'"'+(vLang===o[0]?' selected':'')+'>'+o[1]+'</option>'; });
  h+='</select></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><label for="sey-voice-rate" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Hız</label><input id="sey-voice-rate" type="range" min="0.75" max="1.5" step="0.25" value="'+vRate+'" oninput="App.setVoiceRate(this.value)" style="flex:1;accent-color:var(--accent-ink);"><span id="voice-rate-val" style="font-size:var(--f-caption1);font-weight:800;color:var(--text);min-width:44px;text-align:right;font-variant-numeric:tabular-nums;">'+vRate.toFixed(2).replace(/0$/,'').replace(/\.$/,'')+'x</span></div>';
  // FX-P-57: bulut TTS sinirsel ses seçici. Yalnız voiceCloudTts açıkken anlamlı;
  // yine de her zaman gösterilir (kullanıcı sesi sonradan açabilir). Emoji yok.
  var vVoice=(data.settings&&data.settings.voiceCloudVoice)||'shimmer';
  var voiceNames={alloy:'Alloy',ash:'Ash',ballad:'Ballad',coral:'Coral',echo:'Echo',fable:'Fable',juniper:'Juniper',marble:'Marble',nova:'Nova',onyx:'Onyx',sage:'Sage',shimmer:'Shimmer',verse:'Verse'};
  h+='<div style="display:flex;align-items:center;gap:10px;"><label for="sey-voice-cloud" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Ses</label><select id="sey-voice-cloud" onchange="App.setVoiceCloudVoice(this.value)" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px;font-size:var(--f-footnote);outline:none;color:var(--text);">';
  ['alloy','ash','ballad','coral','echo','fable','juniper','marble','nova','onyx','sage','shimmer','verse'].forEach(function(v){ h+='<option value="'+v+'"'+(vVoice===v?' selected':'')+'>'+(voiceNames[v]||v)+'</option>'; });
  h+='</select></div>';
  // FX-P-87: yerel TTS pitch + ses adı. Yalnız voiceCloudTts KAPALIyken etkin;
  // bulut açıkken disabled (bulut sesinde pitch/ses-adı geçersiz).
  var vCloudOn=!!(data.settings&&data.settings.voiceCloudTts);
  var vPitch=(data.settings&&data.settings.voicePitch!=null)?Number(data.settings.voicePitch):1;
  var vLock=vCloudOn?'opacity:.45;pointer-events:none;':'';
  h+='<div style="display:flex;align-items:center;gap:10px;'+vLock+'"><label for="sey-voice-pitch" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Ton</label><input id="sey-voice-pitch" type="range" min="0.7" max="1.3" step="0.05" value="'+vPitch+'" oninput="App.setVoicePitch(this.value)" style="flex:1;accent-color:var(--accent-ink);"><span style="font-size:var(--f-caption1);font-weight:800;color:var(--text);min-width:44px;text-align:right;">'+vPitch.toFixed(2)+'x</span></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;'+vLock+'"><label for="sey-voice-vname" style="font-size:var(--f-footnote);color:var(--text2);flex-shrink:0;">Yerel ses</label><select id="sey-voice-vname" onchange="App.setVoiceVoiceName(this.value)" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px;font-size:var(--f-footnote);outline:none;color:var(--text);"><option value="">Otomatik</option></select></div>';
  h+='</div>';
  // D vitamini takviyesi — 20 Temmuz 2026 Pazartesi itibarıyla D₃K₂ damla.
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('sun',15)+' D vitamini takviyesi</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">20 Temmuz 2026 Pazartesi’den itibaren yeni forma geçiyoruz.</div>';
  var vdForm=esc((data.settings&&data.settings.vitaminDForm)||'D₃K₂ damla');
  var vdDose=esc((data.settings&&data.settings.vitaminDDose)||'1 damla (D3 1000 IU + K2 100 mcg)');
  h+=_srow('pill','Form',vdForm);
  h+=_srow('droplet','Doz',vdDose);
  h+='</div>';
  // Gizlenen kartlar — yalnızca kullanıcı bir kartı sakladıysa görünür (kilitlenme yok).
  var sgh=data.settings||{};
  if(sgh.hideLocationCard||sgh.hideRepoBanner||sgh.hideVacationCard){
    h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;">Gizlenen kartlar '+icon('sparkles',15)+'</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Bugün ekranında sakladığın kartları tek dokunuşla geri getir.</div>';
    if(sgh.hideRepoBanner) h+='<button onclick="App.showBugunCard(\'repo\')" style="display:flex;align-items:center;gap:9px;border:1px solid var(--field-bd);cursor:pointer;padding:12px 13px;border-radius:13px;font-size:var(--f-subhead);font-weight:700;color:var(--text);background:var(--card);"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('link-2',16)+'</span><span style="flex:1;text-align:left;">Repoya bağlan şeridi</span><span style="font-size:var(--f-footnote);font-weight:800;color:var(--accent-ink);">Geri getir</span></button>';
    if(sgh.hideLocationCard) h+='<button onclick="App.showBugunCard(\'location\')" style="display:flex;align-items:center;gap:9px;border:1px solid var(--field-bd);cursor:pointer;padding:12px 13px;border-radius:13px;font-size:var(--f-subhead);font-weight:700;color:var(--text);background:var(--card);"><span style="display:inline-flex;color:#3F9A4F;">'+icon('map-pin',16)+'</span><span style="flex:1;text-align:left;">Konum & Hareket kartı</span><span style="font-size:var(--f-footnote);font-weight:800;color:var(--accent-ink);">Geri getir</span></button>';
    if(sgh.hideVacationCard) h+='<button onclick="App.showBugunCard(\'vacation\')" style="min-height:44px;display:flex;align-items:center;gap:9px;border:1px solid var(--field-bd);cursor:pointer;padding:12px 13px;border-radius:13px;font-size:var(--f-subhead);font-weight:700;color:var(--text);background:var(--card);"><span style="display:inline-flex;color:var(--vacation);">'+icon('plane',16)+'</span><span style="flex:1;text-align:left;">Tatil Modu kartı</span><span style="font-size:var(--f-footnote);font-weight:800;color:var(--accent-ink);">Tatil Modunu Göster</span></button>';
    h+='</div>';
  }
  h+=settingsBtn('App.printReport()','Rapor oluştur / PDF',icon('file-text',17));
  h+=settingsBtn('App.exportJson()','Yedek indir',icon('save',17));
  h+=settingsBtn('App.importClick()','Yedek yükle',icon('repeat',17));
  h+='<input type="file" id="sey-file" accept="application/json,.json" onchange="App.importJson(this)" style="display:none;">';
  h+='<div style="font-size:var(--f-footnote);color:var(--faint);line-height:1.5;padding:0 4px;">Yedek dosyanı saklarsan telefon/tarayıcı değişse bile kayıtlarını geri alabilirsin.</div>';
  // repoya otomatik kayıt — ortak durum
  var sg=data.settings||{};
  h+='<div style="padding:6px 4px 0;"><div style="font-size:var(--f-callout);font-weight:800;display:flex;align-items:center;gap:6px;">Repoya otomatik kayıt '+icon('save',15)+'</div></div>';
  h+='<div id="sey-sync-status" class="sey-tiny-hit" style="font-size:var(--f-footnote);color:var(--faint);min-height:16px;padding:0 4px;">'+esc(window.SeySync?window.SeySync.statusText():'')+'</div>';
  // Doğrudan GitHub bağlantısı
  var connected=syncConfigured();
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:8px;">Repoya bağlan '+(connected?'<span style="font-size:var(--f-caption1);font-weight:700;color:#3F8A4F;background:rgba(143,191,138,0.2);padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>':'')+'</div>';
  h+='<div style="font-size:var(--f-footnote);line-height:1.5;color:var(--text2);">Günlük kayıtlar her günün tarihine yazılır; aynı gün içindeki değişiklikler o günün kaydını günceller. Tüm günler korunur ve izlenir.</div>';
  if(!connected || ui.keyEdit){
    h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(ui.keyEdit?'':(sg.ghToken||''))+'" oninput="App.setGhToken(this)" placeholder="github_pat_… (Contents: Read and write)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-footnote);outline:none;">';
    h+='<div style="display:flex;gap:8px;">';
    h+='<button onclick="App.syncNow()" style="flex:1;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Bağla ve kaydet ⬆️</button>';
    if(connected) h+='<button onclick="App.cancelKeyEdit()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:var(--text2);background:var(--card);">İptal</button>';
    h+='</div>';
  } else {
    h+='<div style="font-size:var(--f-footnote);color:#3F8A4F;background:rgba(143,191,138,0.12);border:1px solid rgba(143,191,138,0.35);padding:10px 12px;border-radius:12px;">Bağlantı doğrulandı. Kayıtlar otomatik devam ediyor.</div>';
    h+='<div style="display:flex;gap:8px;"><button onclick="App.syncNow()" style="flex:1;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Şimdi kaydet ⬆️</button><button onclick="App.enableKeyEdit()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:700;color:var(--text2);background:var(--card);">Yeni anahtar gir</button></div>';
  }
  h+='</div>';
  // Sağlık senkronu kurulumu artık Bugün ekranındaki Konum & Hareket kartında
  // (tek kaynak — genişletilebilir kart, kopyala-yapıştır alanlarıyla). Burada
  // tekrarlamak yerine oraya yönlendiriyoruz.
  if(connected){
    h+='<button onclick="App.go(\'bugun\')" style="text-align:left;border:1px solid rgba(143,191,138,0.32);cursor:pointer;background:rgba(143,191,138,0.06);border-radius:16px;padding:13px 14px;display:flex;align-items:center;gap:10px;">';
    h+='<span style="flex-shrink:0;display:inline-flex;">'+icon('apple',18)+'</span>';
    h+='<span style="flex:1;font-size:var(--f-footnote);line-height:1.4;color:var(--text2);"><b style="color:var(--text);">Sağlık senkronu</b> kurulumu Bugün ekranındaki Konum & Hareket kartına taşındı.</span>';
    h+='<span style="flex-shrink:0;color:var(--faint);font-size:var(--f-subhead);">›</span>';
    h+='</button>';
  }
  // Luna · kişisel asistan (OpenAI anahtarı)
  var hasOaKey=!!(sg.openaiKey&&String(sg.openaiKey).trim());
  var oaBadge='';
  if(ui.openaiKeyState==='checking') oaBadge='<span style="font-size:var(--f-caption1);font-weight:700;color:#8A6A2A;background:rgba(220,180,90,0.2);padding:2px 9px;border-radius:999px;">doğrulanıyor…</span>';
  else if(ui.openaiKeyState==='invalid') oaBadge='<span style="font-size:var(--f-caption1);font-weight:700;color:#fff;background:#D9534F;padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('x',11)+' API key hatalı</span>';
  else if(ui.openaiKeyState==='valid') oaBadge='<span style="font-size:var(--f-caption1);font-weight:700;color:#fff;background:#3F8A4F;padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>';
  else if(hasOaKey) oaBadge='<span style="font-size:var(--f-caption1);font-weight:700;color:#6A4FA0;background:rgba(155,127,201,0.18);padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' bağlı</span>';
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:8px;">Luna · kişisel asistan <span style="color:#9B7FC9;display:inline-flex;">'+icon('moon',16)+'</span> '+oaBadge+'</div>';
  h+='<div style="font-size:var(--f-footnote);line-height:1.5;color:var(--text2);">Luna sorularını yanıtlayabilsin diye OpenAI API anahtarı gerekir. Anahtar <b>yalnızca bu cihazda</b> saklanır, repoya gönderilmez. Günde 5 soru hakkın olur — Luna olabildiğince detaylı yanıtlar.</div>';
  h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(sg.openaiKey||'')+'" oninput="App.setOpenaiKey(this)" placeholder="sk-… (OpenAI API anahtarı)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-footnote);outline:none;">';
  if(ui.openaiKeyState==='invalid') h+='<div style="font-size:var(--f-caption1);color:#C0605F;background:rgba(217,83,79,0.1);border:1px solid rgba(217,83,79,0.3);border-radius:12px;padding:9px 11px;">Anahtar geçersiz görünüyor. platform.openai.com’dan doğru anahtarı yapıştırıp tekrar kaydet.</div>';
  h+='<button onclick="App.saveOpenaiKey()" style="border:none;cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);box-shadow:0 8px 18px rgba(155,127,201,0.35);display:flex;align-items:center;justify-content:center;gap:6px;">Kaydet ve doğrula '+icon('check',14)+'</button>';
  h+='<div style="font-size:var(--f-caption1);color:var(--faint);">platform.openai.com → API keys bölümünden alınır.</div>';
  h+='</div>';
  h+='<button data-fx="destructive" onclick="App.askReset()" style="border:1px solid rgba(220,120,120,0.25);cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:var(--f-callout);font-weight:700;color:#C0605F;background:rgba(220,120,120,0.08);text-align:left;display:flex;justify-content:space-between;align-items:center;"><span>Verileri sıfırla</span><span style="display:inline-flex;">'+icon('trash-2',16)+'</span></button>';
  h+=settingsBtn('App.goStart()','Başlangıç ekranına dön',icon('rotate-ccw',17));
  // add to home guide
  h+='<div style="background:linear-gradient(135deg,rgba(255,232,163,0.4),rgba(247,221,229,0.45));border:1px solid var(--card-bd);border-radius:20px;padding:18px;"><div style="font-size:var(--f-callout);font-weight:800;margin-bottom:10px;display:flex;align-items:center;gap:6px;">'+icon('phone',16)+' Ana ekrana ekleme rehberi</div><div style="font-size:var(--f-subhead);line-height:1.7;color:var(--text2);">iPhone\'da tek dokunuşla açmak için:<br>1. Bu sayfayı <b>Safari</b>\'de aç<br>2. Paylaş butonuna bas<br>3. <b>Ana Ekrana Ekle</b> seç<br>4. Adı: <b>Şeyma 🦩</b><br>5. Ekle</div></div>';
  h+='<div class="surface" style="border-radius:20px;padding:16px;"><div style="font-size:var(--f-subhead);font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;">'+icon('lock',14)+' Gizlilik</div><div style="font-size:var(--f-footnote);line-height:1.55;color:var(--muted);">Kilit ekranı seni korur; parola ve kullanıcı adı düz metin olarak hiçbir yere yazılmaz. Kayıtlar bu cihazdaki tarayıcıda saklanır. Daha garanti olsun diye ara ara yedek indir.</div></div>';
  // ── Hakkında / sürüm ──
  var _mpv=window.MotivationProgramV2?window.MotivationProgramV2.version:'—';
  var _mnv=window.MotivationNarratives?window.MotivationNarratives.version:'—';
  h+='<div class="surface" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:var(--f-subhead);font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('sparkles',14)+' Hakkında</div>';
  h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.55;">Şeyma 🦩 · <b>v3.0</b> — Günışığı yenilendi. Aynı sıcaklık, çok daha sağlam bir temel.</div>';
  // Sürüm tanıtımına köprü. Bilinçli olarak ÇIPLAK <a>: yeni bir App.* handler
  // ya da onclick eklemek pinlenmiş yüzeyi bozardı — fx2 fixture'ları
  // settingsSource'u kapsayan metin taramasıyla App yüzeyini ve onclick
  // sayısını sabitler (bkz. test_fx2_touch_coverage.js combinedSource).
  // Ayrı sayfa kendi kendine yeter; buradan çağrılacak bir handler'a gerek yok.
  // DİKKAT: bu yorumların içine tıklama niteliği ya da "App.<ad>=" biçimi
  // YAZMA — tarama yorumları da sayar ve pin sessizce kayar (bir kez yaşandı).
  // Dinamik gün sayısı: uygulamanın kendi formülü (dateUtils.dayIndexFor →
  // diffDays(startDate, bugün)+1). Sabit sayı yazılmaz; her açılışta güncel.
  var _dayN=(window.SeymaDateUtils&&typeof window.SeymaDateUtils.dayIndexFor==='function')?window.SeymaDateUtils.dayIndexFor(todayStr()):null;
  var _dayLabel=(_dayN&&_dayN>0)?(_dayN+'. gün'):'Yolculuğun';
  h+='<a href="v3-tanitim/index.html" id="sey-day-journey" style="text-decoration:none;cursor:pointer;width:100%;box-sizing:border-box;text-align:left;border:1px solid color-mix(in srgb,var(--gold-2,#E6C15A) 34%,var(--card-bd));border-radius:16px;padding:12px 14px;background:linear-gradient(135deg,color-mix(in srgb,var(--gold-1,#F2D98C) 14%,var(--card)),color-mix(in srgb,var(--gold-3,#C99A3A) 8%,var(--card)));display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 8px 22px color-mix(in srgb,var(--gold-3,#C99A3A) 12%,transparent);"><span style="display:flex;align-items:center;gap:12px;min-width:0;"><span aria-hidden="true" style="flex-shrink:0;min-width:46px;height:46px;padding:0 8px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:var(--f-callout);font-weight:850;letter-spacing:-.3px;color:#140C10;background:linear-gradient(135deg,#F2D98C,#E9AEC6);box-shadow:0 6px 18px rgba(230,193,90,0.22);font-variant-numeric:tabular-nums;">'+esc(_dayN&&_dayN>0?String(_dayN):'🦩')+'</span><span style="display:flex;flex-direction:column;gap:2px;min-width:0;"><b style="font-size:var(--f-footnote);color:var(--text);">'+esc(_dayLabel)+'</b><span style="font-size:var(--f-caption1);color:var(--muted);">Yolculuğunun özeti · 3.0&#8217;da neler değişti?</span></span></span><span style="display:inline-flex;flex-shrink:0;color:var(--muted);">'+icon('chevron-right',16)+'</span></a>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  [['Program',_mpv],['Anlatı',_mnv]].forEach(function(v){ h+='<span style="font-size:var(--f-caption2);font-weight:700;color:var(--muted);background:var(--icon);border:1px solid var(--card-bd);border-radius:999px;padding:3px 10px;">'+v[0]+' '+esc(v[1])+'</span>'; });
  h+='</div></div>';
  h+='</div>';
  return h;
}

function settingsBtn(onclick,label,icon){
  return '<button onclick="'+onclick+'" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:var(--f-callout);font-weight:700;color:var(--text);background:var(--card);text-align:left;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);"><span>'+esc(label)+'</span><span>'+icon+'</span></button>';
}

  window.SeymaSettings={
    registerSettings:registerSettings,
    ayarlarHTML:ayarlarHTML,
    settingsBtn:settingsBtn
  };
})();
