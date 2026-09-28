# KAO-10 · Devir

**Tarih:** 2026-09-24 · **Başlangıç HEAD:** `140bccd6ed8f6f118b98ebacf02e61cad6e5fd5d` · **Durum:** done

## Ne yapıldı

- `App.kaoOpen/kaoClose/kaoSetView` tek satır shimleriyle `SeymaQuranLearn` yüzey gövdelerine bağlandı.
- Ortak `#sey-ov-back/#sey-ov-card` kabuğu dialog/aria, Tab/Shift+Tab/Escape, gövde kilidi, odak dönüşü ve `SeyFx.sheetClose` sözleşmesini uygular.
- E1 Home; kapsam, anlaşılan âyet, bugünkü tekrar/yeni/~dakika, ünite, son kilometre taşı ve uygun saatte gece tekrarı satırını tek CTA ile gösterir.
- KAO-09 gece penceresi, üretimde mevcut `caffeineTargetBed` resolverına bağlandı.
- Ayarlar'a geçici giriş eklendi; `app/kao.css` yalnız izinli token ailelerini tüketir, yeni renk markası veya `:root` tanımı yoktur.
- FX2 düz-metin pinleri gerçek yeni yüzeye göre App 723 / onclick 392 olarak güncellendi.

## Kontrol sonuçları

- KAO render → PASS (dialog/aria, E1, Tab/Shift+Tab/Escape, odak dönüşü)
- Altı FX2 fixture → PASS; driver → PASS; zikir → 95/95
- State-rebind → 37/37; migration parity → 67/67
- KAO boundary/migration/FSRS 24 vektör/queue/requirements → PASS
- Shell inventory → 7.800 satır tavanında PASS
- Current panel + Panel-v2 fixture aileleri → PASS
- Plan-check → PASS (0 warn); diff-check → PASS

## Sınırlar

- Kaynak/headless kanıt tamamlandı; gerçek cihaz, gerçek ekran okuyucu ve kullanıcı kabulü iddia edilmez.
- R-A1 üretim bağlantısı ve E1 sunumu tamam olsa da kalibrasyon/kabul sahibi KAO-20 olduğu için `partial` kalır.
- Kullanıcı bu turda push/merge/deploy yetkisi verdi; tag yetkisi vermedi.

## Sonraki durum

Canlı STATE sıradaki kartı KAO-11 olarak üretir. Bu devir KAO-11 uygulama yetkisi vermez.
