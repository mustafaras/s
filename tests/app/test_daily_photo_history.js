// Günün Fotoğrafı tarihçesi — ağsız, sentetik Wikimedia fixture'ı.
// Gerçek browser/localStorage/senkron yoktur; yalnız app.js'in fotoğraf
// yardımcılarını ve kart HTML'sini çalıştırır.
// Çalıştırma: node tests/app/test_daily_photo_history.js

'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('node:vm');
var repoRoot=require('../repo-root');
var source=fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');

function block(start,end){
  var a=source.indexOf(start), b=source.indexOf(end,a);
  if(a<0||b<0) throw new Error('Fotoğraf kod sınırı bulunamadı: '+start+' → '+end);
  return source.slice(a,b);
}
function assert(name,condition,detail){
  if(condition){ passes++; console.log('PASS  '+name); }
  else { failures++; console.log('FAIL  '+name+(detail?'\n      → '+detail:'')); }
}

var TODAY='2026-08-30', PREVIOUS='2026-08-29', requested=[], saves=0, renders=0, passes=0, failures=0;
var data={dailyPhoto:{
  date:TODAY, url:'https://images.example/current.jpg', title:'Bugünün kaydı', artist:'Sanatçı', license:'CC BY',
  description:'', source:'Wikimedia Commons Picture of the Day', pageUrl:'https://commons.example/current', fetchedAt:'2026-08-30T08:00:00.000Z',
  // potdDate yok: eski kodun bugünün tarihiyle önbelleğe aldığı bayat kayıt.
  history:{[TODAY]:{date:TODAY,url:'https://images.example/old-chimpanzee.jpg',title:'Eski maymun kaydı',artist:'Sanatçı',license:'CC BY',description:'',source:'Wikimedia Commons Picture of the Day',pageUrl:'https://commons.example/current',fetchedAt:'2026-08-30T08:00:00.000Z'}}
}};
var ui={tab:'bugun',dailyPhotoOpen:true,dailyPhotoDate:PREVIOUS};
var context={
  console:console, data:data, ui:ui, dark:false, Promise:Promise, Date:Date, RegExp:RegExp, Object:Object, Array:Array,
  String:String, Number:Number, encodeURIComponent:encodeURIComponent,
  todayStr:function(){ return TODAY; },
  addDays:function(date,delta){ var p=date.split('-').map(Number), day=new Date(p[0],p[1]-1,p[2]); day.setDate(day.getDate()+delta); return day.getFullYear()+'-'+String(day.getMonth()+1).padStart(2,'0')+'-'+String(day.getDate()).padStart(2,'0'); },
  dateLabelTR:function(d){ return d; },
  esc:function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  icon:function(name){ return '['+name+']'; },
  save:function(){ saves++; }, render:function(){ renders++; }, App:{},
  fetch:function(url){
    requested.push(url);
    var previous=url.indexOf('2026-08-29')>=0;
    var page={title:'File:'+(previous?'Dünün Fotoğrafı':'Bugünün Yeni Fotoğrafı')+'.jpg',imageinfo:[{
      url:'https://images.example/'+(previous?'previous':'today')+'.jpg', descriptionurl:'https://commons.example/'+(previous?'previous':'today'),
      extmetadata:{ObjectName:{value:previous?'Dünün fotoğrafı':'Bugünün yeni fotoğrafı'},ImageDescription:{value:'<b>Sentetik açıklama</b>'},Artist:{value:'Test sanatçısı'},LicenseShortName:{value:'CC BY-SA 4.0'}}
    }]};
    return Promise.resolve({ok:true,json:function(){ return Promise.resolve({query:{pages:{'1':page}}}); }});
  }
};
context.window=context;
vm.createContext(context);
vm.runInContext(block('var DAILY_PHOTO_FETCHING=', 'function wxMeta('),context,{filename:'daily-photo-helpers.js'});
vm.runInContext(block('App.toggleDailyPhoto=', 'function prefersReducedMotion('),context,{filename:'daily-photo-handlers.js'});
vm.runInContext(block('function dailyPhotoCardHTML()', 'function bugunHTML('),context,{filename:'daily-photo-card.js'});

function settled(){ return new Promise(function(resolve){ setImmediate(resolve); }); }

(async function(){
  console.log('\n== Günün Fotoğrafı: günlük arşiv ve gezinme ==\n');

  // Eski tekil şema tarihi ile seçildiğinde hâlâ okunabilir: migrate() bunu
  // history'ye taşırken, geçiş anında bu fallback de fotoğrafı kaybetmez.
  var legacy={date:PREVIOUS,url:'https://images.example/legacy.jpg',title:'Eski kayıt',history:{unexpected:true}};
  var copied=context.dailyPhotoCopy(legacy);
  assert('eski kaydın tarih/URL metadatası kayıpsız kopyalanır',copied.date===PREVIOUS&&copied.url===legacy.url&&copied.potdDate===''&&!('history' in copied));

  context.fetchDailyPhoto(PREVIOUS);
  await settled(); await settled();
  var previous=data.dailyPhoto.history[PREVIOUS];
  assert('geçmiş gün tarihli Wikimedia POTD kaynağından alınır',requested[0]&&requested[0].indexOf('Template%3APotd%2F'+PREVIOUS)>=0,requested[0]);
  assert('geçmiş fotoğraf tarih anahtarıyla saklanır',previous&&previous.url==='https://images.example/previous.jpg'&&previous.title==='Dünün fotoğrafı');
  assert('geçmişe giderken bugünün kök özeti değiştirilmez',data.dailyPhoto.date===TODAY&&data.dailyPhoto.url==='https://images.example/current.jpg');

  // Kullanıcının gördüğü hata: eski yöntem bugün tarihini taşısa bile gerçek
  // tarihli kaynak doğrulaması yoktu; taze görünse dahi hemen yenilenmeli.
  context.maybeFetchDailyPhoto(TODAY);
  await settled(); await settled();
  assert('eski maymun cache’i taze zaman damgasına rağmen tarihli kaynaktan yenilenir',requested[1]&&requested[1].indexOf('Template%3APotd%2F'+TODAY)>=0,requested[1]);
  assert('yenilenen bugünün kaydı tarihli POTD doğrulaması taşır',data.dailyPhoto.url==='https://images.example/today.jpg'&&data.dailyPhoto.potdDate===TODAY&&data.dailyPhoto.history[TODAY].potdDate===TODAY);
  context.maybeFetchDailyPhoto(TODAY);
  assert('doğrulanmış bugünün fotoğrafı tekrar istenmez',requested.length===2);

  ui.dailyPhotoDate=TODAY;
  context.App.dailyPhotoMove(-1);
  assert('önceki gün düğmesi seçimi geriye taşır ve cachedeki fotoğrafı yeniden çekmez',ui.dailyPhotoDate===PREVIOUS&&requested.length===2);

  var html=context.dailyPhotoCardHTML();
  assert('kart seçilmiş geçmiş tarih ve iki yönlü gezinme kontrolünü gösterir',html.indexOf(PREVIOUS)>=0&&html.indexOf('App.dailyPhotoMove(-1)')>=0&&html.indexOf('App.dailyPhotoMove(1)')>=0);
  assert('kart geçmiş seçildiğinde geçmiş görseli gösterir',html.indexOf('https://images.example/previous.jpg')>=0);

  assert('fotoğraf fetchi yalnız sentetik save/render sınırını kullanır',saves===2&&renders===3,'save='+saves+', render='+renders);

  console.log('\n'+passes+'/'+(passes+failures)+' geçti.');
  process.exitCode=failures?1:0;
})().catch(function(err){ console.error(err&&err.stack||err); process.exitCode=1; });
