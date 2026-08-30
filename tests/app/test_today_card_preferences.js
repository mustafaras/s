// Bugün yüzeyi: Günün Fotoğrafı önceliği ve Tatil Modu kart görünürlüğü.
// Bu fixture yalnız kaynak parçalarını ve sentetik handler durumunu denetler;
// browser, gerçek localStorage, ağ veya senkron kullanmaz.
// Çalıştırma: node tests/app/test_today_card_preferences.js

'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('node:vm');
var repoRoot=require('../repo-root');
var source=fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
var passes=0,failures=0;

function assert(name,condition,detail){
  if(condition){ passes++; console.log('PASS  '+name); }
  else { failures++; console.log('FAIL  '+name+(detail?'\n      → '+detail:'')); }
}
function between(start,end){
  var a=source.indexOf(start), b=source.indexOf(end,a);
  if(a<0||b<0) throw new Error('Kaynak sınırı bulunamadı: '+start+' → '+end);
  return source.slice(a,b);
}
function lineStarting(text){
  var a=source.indexOf(text), b=source.indexOf('\n',a);
  if(a<0) throw new Error('Kaynak satırı bulunamadı: '+text);
  return source.slice(a,b);
}

console.log('\n== Bugün kart tercihleri ==\n');

var bugun=between('function bugunHTML(){','function ayarlarHTML(){');
var photoAt=bugun.indexOf('h+=dailyPhotoCardHTML()');
var saveAt=bugun.indexOf('h+=saveBanner()');
assert('Günün Fotoğrafı Bugün yüzeyindeki ilk karttır',photoAt>=0&&saveAt>=0&&photoAt<saveAt);
assert('Tatil Modu kartı yalnız gizlenmemişse render edilir',bugun.indexOf("if(!vacationCardHidden()) h+=vacationCardHTML()")>=0);

var dailyPhoto=between('function dailyPhotoCardHTML(){','function bugunHTML(){');
assert('fotoğraf kartı kalıcı açık semantik bölüm olarak render edilir',dailyPhoto.indexOf('<section class="surface sey-daily-photo"')>=0&&dailyPhoto.indexOf('sey-collbody')>=0);
assert('fotoğraf kartında kapalı önizleme veya aç-kapa yüzeyi yoktur',dailyPhoto.indexOf('Dokun, açalım')<0&&dailyPhoto.indexOf('onclick="App.toggleDailyPhoto()"')<0);
assert('fotoğraf tarih ve yenileme kontrolleri 44 px dokunma alanındadır',(dailyPhoto.match(/width:44px;height:44px/g)||[]).length>=3);

var migration=between('function migrate(d){','// ── Tema: üç durumlu tercih');
assert('eski kayıtlara Tatil Modu kart görünürlük tercihi eklenir',migration.indexOf("if(typeof d.settings.hideVacationCard!=='boolean') d.settings.hideVacationCard=false;")>=0);

var vacation=between('function vacationCardHTML(rec){','CARD_BUILDERS[\'vacation\']=vacationCardHTML;');
assert('Tatil Modu kartında erişilebilir Gizle düğmesi vardır',/App\.hideBugunCard\([^)]*vacation/.test(vacation)&&vacation.indexOf('Tatil Modu kartını gizle')>=0&&vacation.indexOf('min-height:44px')>=0);

var settings=between('function ayarlarHTML(){','function settingsBtn(');
assert('Ayarlar, kart gizliyken Tatil Modunu Göster kontrolünü sunar',settings.indexOf('sgh.hideVacationCard')>=0&&/App\.showBugunCard\([^)]*vacation/.test(settings)&&settings.indexOf('Tatil Modunu Göster')>=0);

var hideHandler=lineStarting('App.hideBugunCard=function');
var showHandler=lineStarting('App.showBugunCard=function');
var saves=0,renders=0,haptics=0,toasts=[];
var context={data:{settings:{}},App:{},save:function(){saves++;},render:function(){renders++;},haptic:function(){haptics++;},toast:function(msg){toasts.push(msg);}};
vm.createContext(context);
vm.runInContext(hideHandler,context,{filename:'today-card-hide-handler.js'});
vm.runInContext(showHandler,context,{filename:'today-card-show-handler.js'});
context.App.hideBugunCard('vacation');
assert('Gizle yalnız Tatil Modu kart görünürlüğünü saklar',context.data.settings.hideVacationCard===true&&saves===1&&renders===1&&haptics===1&&toasts[0].indexOf('Tatil Modu')>=0);
context.App.showBugunCard('vacation');
assert('Tatil Modunu Göster kartı geri getirir',context.data.settings.hideVacationCard===false&&saves===2&&renders===2&&haptics===2);

console.log('\n'+passes+'/'+(passes+failures)+' geçti.');
process.exitCode=failures?1:0;
