# KAO-27 · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `6734443a8c76ec6acb57d3e516e17582fbce6ecb` · **Durum:** done · **Kapı:** D-10 kullanıcı onayı (2026-09-25)

## Ne yapıldı

- Ayarlar → “Gölgeleme (mikrofon)”: varsayılan **kapalı**; Türkçe amaç/saklama açıklaması.
- Açıkken Telaffuz stüdyosu harf derslerindeki her örnek kelimede “Gölgele”: model iki kez çalar → mikrofon izni → en çok 10 sn kayıt → kendi kaydını / modeli dinle → Yakın veya Tekrar.
- Kayıt yalnız bellekte (Blob URL `ui`'de); `data`, depo, senkron ve ağ yolu yok. Sil, Tekrar, ayar kapatma, görünüm değişimi ve pencere kapanışında URL iptal edilir, mikrofon izleri durdurulur.
- İzin reddi ve desteklemeyen cihaz için açık mesaj; stüdyonun geri kalanı etkilenmez.

## Kontroller

Gizlilik fixture'ı (ayar kapalıyken 0 mikrofon çağrısı, model 2×, 10 sn sınırı, data/save değişmez, revoke), tüm KAO, FX2, v3, iip_22, driver, zikr, rebind, state doğrulayıcıları, shell kapısı ve tam regresyon (120/120) PASS.

## Sınırlar

Gerçek cihazda mikrofon izni akışı, iOS Safari'nin MediaRecorder biçimi ve kayıt kalitesi denenmedi. Push/merge/deploy bu kart için yapılmadı.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-28`.
