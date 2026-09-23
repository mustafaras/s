# IIP-09 gereksinim kanıtı

## REQ-017 / TC-017 — beş bölüm hedef mimarisi

Görünen etiketler `Bugün`, `İlham`, `İbadet`, `Zikir`, `Ritim` olarak doğrulandı. Eski `oz`, `oncu`, `iman`, `zikir`, `rapor` handler kimlikleri aynı kaldı. Tam Kur’an kartı yalnız Bugün girişinde, kıble aracı yalnız İbadet gövdesinde render edilir; diğer üç sekmeye sızmaz.

## REQ-018 / TC-018 — geri dönüş bağlamı

Mevcut `App.openQibla`, `App.openFaithCorner`, `App.openQuranJourney` ve `App.closeQuranJourney` kimlikleri korunur. Açan kontrol ile ana scroll konumu kaydedilip kapanışta geri yüklenir; hızlı çift aç/kapa idempotenttir. `popstate`, açık Kur’an veya kıble modalını bir kez kapatır; seçili `faithTab` değişmez.

## Sonuç

`tests/app/test_iip_09.js` 22/22 PASS; Saygı sınırı 20/20 PASS. Ready/empty/loading/error/return ile hızlı aç/kapa ve geri hareketi fixture içinde gerçekten çalıştırıldı. Zikir harness’inin ortak üst rail bekleyen iki eski assertion’ı DEC-02 ile çeliştiği için 93/95’tir; allowlist dışındaki fixture düzeltilmeden source gate kapanmaz.
