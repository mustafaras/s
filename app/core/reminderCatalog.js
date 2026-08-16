(function(root){
"use strict";

var CATALOG_VERSION='1.0.0';
var ID_PREFIX='reminder.catalog.v1.';

// REM-36: reminder yüzeylerinin ortak, kısa ve mahrem kopya sözlüğü.
// Bu sözlük yalnız sabit metin taşır; kullanıcı içeriği, kategori verisi,
// zaman, DOM, ağ veya persistence bilgisi içermez.
var COPY_LEXICON={
  version:CATALOG_VERSION,
  native:{
    generic:{
      title:'Şeyma’da küçük bir durak hazır',
      body:'İstersen uygulamayı açıp bugünün küçük alanına bakabilirsin.'
    },
    medication:{
      title:'Bir küçük hatırlatman hazır',
      body:'Seçtiğin saati kontrol etmek için Şeyma’yı açabilirsin.'
    }
  },
  private:{
    prayer:{
      title:'Küçük bir durak yaklaşırken',
      body:'İstersen Şeyma’da sakin bir an açabilirsin.'
    },
    zikr:{
      title:'Kısa bir sakinlik alanı hazır',
      body:'İstersen birkaç dakikalık bir durak açabilirsin.'
    },
    therapy:{
      title:'Şeyma’da sana ayırabileceğin bir alan var',
      body:'İstersen nefes, ilk adım veya öz şefkat araçlarından birini seç.'
    },
    saygi:{
      title:'Bugünün ilham durağı hazır',
      body:'Birkaç dakikan varsa bugünkü okumayı açabilirsin.'
    },
    reading:{
      title:'Okuma yolculuğuna dönebilirsin',
      body:'İstersen kaldığın yerden birkaç sayfa açabilirsin.'
    },
    journal:{
      title:'Günü kapatmak için küçük bir alan var',
      body:'İstersen bugünden bir cümleyi sakince yazabilirsin.'
    },
    system:{
      title:'Şeyma’da ilgilenmen gereken bir durum var',
      body:'İstersen ayarlardan durumu sakince kontrol edebilirsin.'
    }
  },
  inApp:{
    center:{
      title:'Hatırlatmalar ve bildirimler',
      subtitle:'Günün küçük duraklarını burada sakince gözden geçir.',
      settingsSubtitle:'Günün duraklarını, uygulama içi önizlemeyi ve izin sınırını gör.',
      closeLabel:'Hatırlatmalar ve bildirimler merkezini kapat',
      introTitle:'Kontrol sende',
      introBody:'Native kanal yalnız açık bir kullanıcı eylemiyle açılır; ilk yüklemede izin istenmez. Uygulama içi önizleme izin gerektirmez.',
      liveNote:'Native seçimi izin, mahrem kopya ve desteklenen PWA koşullarıyla sınırlıdır; izin kapalıysa uygulama içi kartlar korunur.'
    },
    inbox:{
      eyebrow:'BUGÜNÜN SAKİN DURAKLARI',
      title:'Bugün için küçük duraklar',
      activeOne:'İstersen tek bir küçük adımla başlayabilirsin.',
      suppressed:'Bugün daha sakin tutuldu; kendine yük bindirmeden burada kalabilirsin.',
      muted:'Bugün için öneriler sessize alındı; dilediğinde geri getirebilirsin.',
      empty:'Şu an burada açılacak bir öneri yok; bu da tamam.',
      emptyTitle:'Şimdilik boş',
      emptyBody:'Bugün için uygun bir öneri oluştuğunda burada görünür.',
      mutedTitle:'Bugün susturuldu',
      mutedBody:'Öneriler kaydedilmedi; yalnızca bu uygulama oturumunda sakinleşti.',
      privacy:'Bu kart yalnız uygulama içinde görünür; native başlık, not veya hassas ayrıntı delivery günlüğüne yazılmaz.',
      remaining:'sakin öneri hazır',
      suppressedCount:'daha sakin tutuldu',
      groupNote:'Bugün için küçük duraklar',
      groupHelp:'Diğer küçük duraklar uygulamanın içinde:',
      groupPrimary:'Ana durak',
      centerAction:'Hatırlatma merkezini aç',
      mute:'Bugün tümünü sustur',
      restore:'Bugün susturuldu · geri getir'
    },
    preview:{
      kicker:'UYGULAMA İÇİ ÖNİZLEME · GÜVENLİ',
      bodySuffix:'Bu yalnızca uygulama içi bir önizlemedir; native izin, bildirim veya kayıt oluşturmaz. Hassas reminder gövdesi gösterilmez.',
      syntheticTitle:'Şeyma’da küçük bir durak hazır',
      syntheticBody:'Bu yalnızca uygulama içinde gösterildi. Gerçek Notificati\u006fn oluşturulmadı, dış sisteme gönderilmedi ve geçmişe yazılmadı.',
      syntheticNote:'Hassas reminder gövdesi burada kullanılmaz.',
      syntheticDetail:'için yalnızca uygulama içinde gösterilen sentetik test.',
      syntheticResultBody:'Bu yalnızca uygulama içinde gösterilen sentetik bir testtir.'
    },
    empty:{
      catalogTitle:'Şimdilik katalogda etkin hatırlatma yok.',
      catalogBody:'Merkez hazır; yeni kayıtlar geldiğinde burada görünür.',
      historyTitle:'Henüz geçmiş yok.',
      historyBody:'Sentetik testler ve ayar değişiklikleri de dış sisteme gönderilmez.',
      digestTitle:'Bu hafta için sakin bir boşluk var.',
      digestBody:'Burada gösterecek güvenli bir yerel özet yok. Hiçbir şey eklemen gerekmiyor.',
      clearedHistoryTitle:'Geçmiş temizlendi.',
      clearedHistoryBody:'Bu ekran yeniden boş ve yerel kalır.',
      noOpTitle:'Burada durmak da tamam.',
      noOpBody:'Hiçbir şey seçilmedi, kaydedilmedi ve bildirim üretilmedi.',
      digestFirstWeek:'İlk haftan için yumuşak bir başlangıç.',
      digestOngoing:'Bu hafta için bir durak.',
      digestBoundary:'Bu alan yaptın / yapmadın hesabı değildir. Yalnızca senin istediğinde açılır; günlük ayrıntılar, mood, ibadet, terapi ve ilaç bilgileri bu özete girmez.',
      personalizationTitle:'Uyarlama kapalı.',
      personalizationBody:'Hiç sinyal tutulmuyor ve hiçbir öneri üretilmiyor.',
      medicationTitle:'Henüz kişisel sağlık saati yok.',
      medicationBody:'Bir saat kurarsan yalnız o saati hatırlatırız; doz veya tedavi kararı üretmeyiz.',
      medicationClear:'Yerel ilaç / takviye kayıtlarını temizle'
    },
    medication:{
      safety:'Bu özellik yalnızca senin girdiğin zamanı hatırlatır; doz, tedavi veya tıbbi karar önermez. Sağlıkla ilgili kararlar için doktorunun veya eczacının yönlendirmesini takip et.'
    },
    permission:{
      unsupported:{label:'Desteklenmiyor',meaning:'Bu tarayıcı native bildirim sunmuyor.',action:'Uygulama içi hatırlatmaları kullan.'},
      default:{label:'Henüz sorulmadı',meaning:'Native bildirim izni henüz seçilmedi.',action:'İzin açıklamasını incele; bu ekranda izin istenmez.'},
      granted:{label:'Verildi',meaning:'Native kanal kullanılabilir.',action:'Uygulama içi kartlar yine açık kalır; gerçek gönderim ayrı bir adımda yönetilir.'},
      denied:{label:'Reddedildi',meaning:'Tarayıcı izni kapalı.',action:'Tarayıcı ayarlarından açabilirsin; uygulama içi hatırlatmalar açık kalır.'},
      temporaryError:{label:'Geçici hata',meaning:'Bildirim gönderme anında geçici bir hata oldu.',action:'Yeniden denenebilir; uygulama içi kart korunur.'},
      pwaLimited:{label:'PWA sınırlaması',meaning:'Uygulama kapalıyken zamanlama garanti edilemiyor.',action:'Uygulamayı açınca catch-up kartını görebilirsin.'},
      request:'Native kanalı aç',
      retry:'Yeniden dene',
      retryNote:'Bu yeniden deneme yalnızca sen dokunduğunda yapılır.',
      previewAction:'Uygulama içi test akışını gör',
      settingsTitle:'Tarayıcı ayarları rehberi',
      settingsBody:'Bu site için tarayıcı ayarlarında Bildirimler bölümünü açıp İzin ver seçeneğini seçebilirsin. O zamana kadar uygulama içi kartlar çalışır.',
      explicitNote:'İzin yalnız bu açık eylemden sonra istenir; ilk yüklemede istenmez.',
      previewNote:'Bu test gerçek Notificati\u006fn oluşturmaz.',
      fallbackInApp:'Native yerine uygulama içi hatırlatmalar kullanılabilir.',
      fallbackCatchup:'Uygulama açıldığında uygulama içi catch-up kartı gösterilebilir.'
    },
    error:{
      genericTitle:'Bir sorun oluştu',
      genericBody:'Yerel kayıt korunuyor; istersen birazdan yeniden deneyebilirsin.',
      nativeTitle:'Bildirim gönderilemedi',
      nativeBody:'Uygulama içi kartlar korunuyor; istersen daha sonra yeniden deneyebilirsin.',
      syncTitle:'Senkron tamamlanamadı',
      syncBody:'Yerel kayıt korunur; teknik ayrıntı veya token gösterilmez. Yeniden denenebilir.'
    },
    status:{
      overall:{
        fresh:{label:'Durum güncel',detail:'Yerel reminder akışı kullanılabilir.'},
        stale:{label:'Vakit verisi eski',detail:'Yeni vakit reminderı üretilmiyor; güncel veri gelene kadar bekleniyor.'},
        unavailable:{label:'Vakit verisi hazır değil',detail:'Vakit verisi olmadan bu reminder oluşturulmaz; diğer uygulama içi alanlar açık kalır.'},
        offline:{label:'Çevrimdışısın',detail:'Yerel kayıt korunur; native kanal ve ağ gerektiren yenilemeler bağlantı dönene kadar bekler.'},
        recovery:{label:'Bağlantı geri geldi',detail:'Varsa son 24 saat tek kontrollü uygulama içi özette kalır; geçmiş native olarak yeniden oynatılmaz.'}
      },
      prayer:{
        fresh:{label:'Vakit verisi güncel',detail:'Vakit kaynağı bu yerel gün için kullanılabilir.'},
        stale:{label:'Vakit verisi eski',detail:'Yeni vakitmiş gibi uygulama içi veya native reminder gösterilmiyor.'},
        unavailable:{label:'Vakit verisi kullanılamıyor',detail:'Tamamlanmamış veya doğrulanamayan veriyle reminder üretilmiyor.'}
      },
      background:{
        unsupported:{label:'Arka plan zamanlaması garanti değil',detail:'Uygulama kapalıyken kesin yerel alarm vaadi yok; foreground ve açılış catch-up sınırı kullanılır.'}
      },
      permission:{
        granted:{label:'Native izin açık',detail:'Native kanal yalnız desteklenen foreground koşullarında mümkün.'},
        denied:{label:'Native izin reddedildi',detail:'Uygulama içi reminderlar açık kalır; tarayıcı ayarları değiştirilmeden native kullanılmaz.'},
        unsupported:{label:'Native desteklenmiyor',detail:'Bu kurulumda uygulama içi reminderlar kullanılabilir.'},
        default:{label:'Native izin seçilmedi',detail:'İzin kendiliğinden istenmez; kullanıcı isterse ayarlardan karar verir.'},
        'temporary-error':{label:'Native geçici hata',detail:'Uygulama içi reminder korunur; daha sonra yeniden denenebilir.'},
        'pwa-limited':{label:'PWA zamanlama sınırı',detail:'Uygulama kapalıyken zamanlama garanti edilemiyor; açınca güvenli özet gösterilir.'}
      },
      sync:{
        disabled:{label:'Yalnız cihazda',detail:'Senkron ayarlı değil; reminder deneyimi yerelde çalışır.'},
        idle:{label:'Senkron hazır',detail:'Henüz uzak kayıt işlemi beklemiyor.'},
        synced:{label:'Senkron tamamlandı',detail:'Son güvenli kayıt kabul edildi.'},
        pending:{label:'Senkron bekliyor',detail:'Yerel reminder deneyimi kilitlenmez; uzak kayıt sırası bekleniyor.'},
        offline:{label:'Senkron çevrimdışı',detail:'Yerel kayıt korunur; bağlantı dönünce tek kontrollü yeniden deneme yapılır.'},
        error:{label:'Senkron tamamlanamadı',detail:'Yerel kayıt korunur; teknik ayrıntı veya token gösterilmez. Yeniden denenebilir.'}
      },
      safe:'Reminder deneyimi yerelde devam eder; sistem verisi eskiyse yeni vakit reminderı sessizce uydurulmaz.'
    },
    actions:{
      open:'Aç',
      openReminder:'Bu durağı aç',
      nowNot:'Şimdi değil',
      more:'Diğer seçenekler',
      details:'Ayrıntıları aç',
      previewOpen:'Uygulama içi önizleme',
      previewClose:'Önizlemeyi kapat',
      disableReminder:'Bu durağı kapat',
      enableReminder:'Bu durağı tekrar aç',
      snooze:'Ertele',
      todayOff:'Bugün sustur · bugün bir daha gösterme',
      disable:'Kapat · bu hatırlatmayı kapat',
      restore:'Geri al',
      clearHistory:'Geçmişi temizle'
    },
    snooze:{
      native10m:'10 dk ertele',
      '10m':'10 dakika',
      '30m':'30 dakika',
      '1h':'1 saat',
      thisEvening:'Bu akşam',
      tomorrow:'Yarın',
      todayOff:'Bugün bir daha gösterme'
    },
    mute:{
      today:'Bugün susturuldu',
      todayRestore:'Bugün susturuldu · geri getir',
      todayAll:'Bugün tümünü sustur',
      detail:'Bugün için öneriler sessize alındı; dilediğinde geri getirebilirsin.'
    },
    recovery:{
      label:'Bağlantı geri geldi',
      detail:'Yerel kayıt korunur; yalnızca güvenli uygulama içi akış yeniden kontrol edilir.'
    },
    history:{
      title:'Son reminder geçmişi',
      note:'Yalnız durum, kanal ve zaman tutulur. Reminder gövdesi, kişisel not veya sağlık ayrıntısı burada gösterilmez.',
      emptyTitle:'Henüz geçmiş yok.',
      emptyBody:'Sentetik testler ve ayar değişiklikleri de dış sisteme gönderilmez.',
      label:'Bir reminder durağı',
      nativeChannel:'Native kanal meta verisi',
      inAppChannel:'Uygulama içi kanal',
      selection:'Seçim',
      shortDuration:'kısa süre',
      settingsAction:'Ayar eylemi',
      unknownAction:'İşlem kaydı',
      clear:'Geçmişi temizle',
      undo:'Geri al',
      status:{scheduled:'Planlandı',shown:'Gösterildi',opened:'Açıldı',snoozed:'Ertelendi',dismissed:'Kapatıldı',reopened:'Tekrar açıldı',suppressed:'Sakince tutuldu',failed:'Gönderilemedi'},
      unknownStatus:'Kısa olay'
    }
  }
};

function freezeDeep(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function(key){ freezeDeep(value[key]); });
  return Object.freeze(value);
}

COPY_LEXICON=freezeDeep(COPY_LEXICON);

var definitions=[
  {
    id:ID_PREFIX+'prayer',
    category:'ritual',
    priority:'P2',
    triggerType:'prayer-offset',
    deepLink:'faith',
    privateTitle:COPY_LEXICON.private.prayer.title,
    privateBody:COPY_LEXICON.private.prayer.body,
    detailKeys:['prayerName','time','remainingMinutes','faithActions'],
    defaultWindow:{kind:'offset',timezone:'user',earliestMinutesBefore:30,latestMinutesBefore:5},
    defaultChannel:'in_app',
    snoozeOptions:['10m','30m','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'zikr',
    category:'ritual',
    priority:'P2',
    triggerType:'scheduled-window',
    deepLink:'zikr',
    privateTitle:COPY_LEXICON.private.zikr.title,
    privateBody:COPY_LEXICON.private.zikr.body,
    detailKeys:['presetId','durationMinutes','reflectionPrompt'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'09:00',end:'22:00'},
    defaultChannel:'in_app',
    snoozeOptions:['10m','30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'therapy',
    category:'support',
    priority:'P2',
    triggerType:'scheduled-window',
    deepLink:'room',
    privateTitle:COPY_LEXICON.private.therapy.title,
    privateBody:COPY_LEXICON.private.therapy.body,
    detailKeys:['toolId','supportNote','safetyResources'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'10:00',end:'21:00'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'saygi',
    category:'ritual',
    priority:'P3',
    triggerType:'scheduled-window',
    deepLink:'saygi',
    privateTitle:COPY_LEXICON.private.saygi.title,
    privateBody:COPY_LEXICON.private.saygi.body,
    detailKeys:['personId','articleStatus','readAction'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'09:00',end:'20:00'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'reading',
    category:'ritual',
    priority:'P3',
    triggerType:'scheduled-window',
    deepLink:'reading',
    privateTitle:COPY_LEXICON.private.reading.title,
    privateBody:COPY_LEXICON.private.reading.body,
    detailKeys:['itemId','currentPage','readingWindow'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'18:00',end:'23:00'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','thisEvening','tomorrow'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'journal',
    category:'reflection',
    priority:'P2',
    triggerType:'scheduled-window',
    deepLink:'gunluk',
    privateTitle:COPY_LEXICON.private.journal.title,
    privateBody:COPY_LEXICON.private.journal.body,
    detailKeys:['date','mood','intention','note'],
    defaultWindow:{kind:'time-range',timezone:'user',start:'19:00',end:'23:30'},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','thisEvening','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:CATALOG_VERSION
  },
  {
    id:ID_PREFIX+'system',
    category:'system',
    priority:'P0',
    triggerType:'system-event',
    deepLink:'settings',
    privateTitle:COPY_LEXICON.private.system.title,
    privateBody:COPY_LEXICON.private.system.body,
    detailKeys:['statusCode','lastCheckedAt','repairAction'],
    defaultWindow:{kind:'event',timezone:'user',start:null,end:null},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','tomorrow'],
    suppressionRules:['resolved','duplicateEvent','quietHours'],
    definitionVersion:CATALOG_VERSION
  }
].map(freezeDeep);

var byId=Object.create(null);
definitions.forEach(function(definition){ byId[definition.id]=definition; });

function copyAtPath(path){
  var value=COPY_LEXICON, parts=String(path||'').split('.');
  for(var i=0;i<parts.length;i++){
    if(!value||typeof value!=='object'||!Object.prototype.hasOwnProperty.call(value,parts[i])) return null;
    value=value[parts[i]];
  }
  return typeof value==='string'?value:null;
}

root.ReminderCatalogV1=Object.freeze({
  version:CATALOG_VERSION,
  idPrefix:ID_PREFIX,
  copy:COPY_LEXICON,
  definitions:Object.freeze(definitions),
  ids:Object.freeze(definitions.map(function(definition){ return definition.id; })),
  get:function(id){ return byId[id]||null; },
  getCopy:function(path){ return copyAtPath(path); },
  list:function(){ return definitions.slice(); }
});
})(typeof globalThis!=='undefined'?globalThis:this);
