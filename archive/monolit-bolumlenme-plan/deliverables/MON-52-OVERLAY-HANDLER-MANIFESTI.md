# MON-52 — Overlay handler lifecycle manifesti

**Kart:** MON-52 · **Durum:** tamamlandı · **Tarih:** 2026-09-13 ·
**Kapsam:** yalnız `SeymaAppSurface` overlay/archive/settings/message App
shimleri. Yerel-only; release onayı yoktur.

## Onaylı bağlama tablosu

| Owner registry | Handlerlar | Adet |
| --- | --- | ---: |
| `SeymaLibrary` | `openReading`, `closeReading`, `setReadingView`; `openWatching`, `closeWatching`, `setWatchView`; `openListening`, `closeListening`, `setListeningView`; `openLearning`, `closeLearning`; `openSoulActivity`, `closeSoulActivity`; `openSoulPracticePicker`, `closeSoulPracticePicker`, `pickSoulPractice`; `openSoulArchive`, `closeSoulArchive`, `setSoulArchiveFilter` | 19 |
| `SeymaSettings` | `setTheme`, `toggleTheme`, `toggleHaptic`, `setVoiceGuidance`, `setVoiceLang`, `setVoiceRate`, `setVoiceCloudVoice`, `setVoicePitch`, `setVoiceVoiceName`, `toggleSetting` | 10 |
| `SeymaMessaging` | `toggleMsg`, `toggleAeonBubble`, `openMesaj`, `showAeonHistory`, `toggleAeonSearch`, `clearAeonSearch`, `filterAeonSearch`, `aeonOpenAttachSheet`, `aeonCloseAttachSheet` | 9 |
| **Toplam** |  | **38** |

`app.js` gerçek closure gövdelerini `MON52_OVERLAY_HANDLERS` içinde bir kez
bağlar; ardından aynı `App.<ad>` çağrısı, imzası ve dönüş yolu
`SeymaAppSurface.overlayHandler(name, arguments)` shiminden geçer. Dispatcher,
haritalanmış owner registry'nin varlığını her çağrıda doğrular; eksik veya
bilinmeyen çağrı fail-closed'dur. Kayıt eksikse veya ikinci kez yapılırsa
başarısız olur.

`SeymaMessaging` public API'si donmuş olduğundan dispatcher ona handler
eklemez: işlevi kendi kapalı binding'inde saklar ve registry varlığını owner
kanıtı olarak kullanır. Bu, immutable API'yi mutasyona uğratmadan mesaj
overlay yaşam döngüsünü korur.

## Bilinçli olarak hariç bırakılan sınırlar

- Profil onamı/değerlendirmesi ve hassas kullanıcı verisi;
- browser/native permission, bildirim delivery ve reminder ayar şeması;
- Quran transport/outbox, ağ/fetch, mesaj gönderme, upload/record;
- bildirim veya arşivden silme gibi yıkıcı eylemler;
- modal engine, focus/scroll yardımcılarının gövdeleri, FX API'leri,
  `data`/`ui` rebind, save/render ve DOM sahipliği.

Bu yollar app.js'te kalır. Böylece open/close çağrılarının mevcut focus return,
scroll lock ve guarded FX sırası shimin altında aynı closure gövdesiyle çalışır.

## Yükleme ve kanıt

Yeni core dosyası yoktur; mevcut `appSurface.js` üretimde `app.js`den önce
yüklenir ve iki cache-bust sürümü `20260912h`dir. Driver/zikr/diğer FILES
listelerinde yapısal değişiklik gerekmedi.

- `test_app_surface_overlay_boundary.js`: 49/49; sentetik VM, browser,
  localStorage, sync ve ağ yok; frozen registry mutasyonsuzluğu, owner map,
  eksik/tekrar kayıt, ad/imza/dönüş ve hariç yüzey doğrulandı.
- Tam kabul kanıtı: app **50** fixture, Quran **9**, current panel **23**,
  Panel-v2 **27**, reminder smoke/freeze, B1/B2/B3, modal focus, ÆON expand,
  settings/voice, driver, zikr **95/95**, modularization **101/101**,
  state-rebind **37/37**, Faz10 **69/69**, tüm `app/core/*.js` ile app/sync
  syntax ve `git diff --check` exit 0 verdi.

I1--I6 ve M1--M4 kapsamında state/migration, App çağrı yüzeyi, modal/DOM,
sync Guard 1/2, yükleme sırası ve Premium FX davranışında tasarımsal değişiklik
yoktur. Bu belge kaynak/test kanıtıdır; cihaz veya deploy kabulü değildir.
