# KAO-07 · Devir

**Tarih:** 2026-09-24 · **Başlangıç HEAD:** `c1ebb5e3ca3517d4b267741c8543d87d9144bd44` · **Durum:** done

## Önceki kartın yayını

- KAO-06 `c1ebb5e3…` hem `origin/kuran-ogreniyorum` hem `origin/main` dalına taşındı.
- GitHub Pages run `35978035375` başarılıdır.
- Canlı `quranGrammarV1.js`, `quranShortSurahsV1.js` ve `quranPhonicsV1.js` hashleri yerel dosyalarla birebir eşleşti.

## KAO-07'de ne yapıldı

- `app/core/quranLearn.js`, yükte yalnız `window.SeymaQuranLearn` kuran 129 satırlık registry olarak eklendi.
- `registerQuranLearn()` sekiz bağımlılığı fail-closed doğrular; ikinci kaydı reddeder.
- `ensureQuranLearn()` v1 şemasını additive ve idempotent kurar; bilinmeyen alanları ve 114 sûre kayıtlarını korur, bozuk kökleri güvenli biçime getirir.
- İçerik sürümü değiştiğinde çözülemeyen kartlar silinmez, `orphan:true` olur; bilinen kelime/kök/gramer/sûre kartları korunur.
- `state.js` migration bağımlılığı ve fail-safe kancası, `app.js` shim/registry kaydı, dört standart yükleme listesi ve cache sürümü eklendi.
- Zorunlu migration harness'inin ayrı sabit boot listesi ilk koşuda fail-closed hatayı gösterdi; kart kapsamı kaynaklarda onarıldı ve harness'e registry eklendi.
- `app.js` dört yeni shim/bag işlemini komşu satırlarda taşıyarak donmuş 7800 satır bütçesinde kaldı; bütçe yükseltilmedi.

## Doğrulama

- Üç KAO fixture PASS.
- Migration parity 67/67, driver PASS, zikr 95/95, state-rebind 37/37.
- Shell inventory tam 7800 satır tavanında PASS; plan-check ve diff-check PASS.
- R-C7 tamamlandı: `s:<surah>:<ayah>:<i>` şeması ve 114 sûre sentetik fixture'ı geçiyor.

## Sınırlar

- Bu kart kullanıcı arayüzü üretmez; UI Dalga 3 kartlarındadır.
- Gerçek cihaz kabulü yapılmadı.
- KAO-07 için push, merge, tag veya deploy yapılmadı.

## Sonraki yetkili eylem

Sıradaki kart KAO-08'dir; bu devir KAO-08 uygulaması veya KAO-07 yayını için yetki vermez.
