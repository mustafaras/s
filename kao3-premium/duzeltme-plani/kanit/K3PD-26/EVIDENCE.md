# K3PD-26 — uygulama ve doğrulama kanıtı

Durum: `done/PASS` (bağımsız salt-okur seq153). İlk hüküm seq149 `FAIL` idi; iki bulgu düzeltildi ve taze denetimde kapandı. Başlangıç dalı `k3pd-denetim-duzeltmeleri`, HEAD `4e451288a71ae5123886e5d4ef20e46fca605c50`. Yalnız sentetik girdiler kullanıldı.

## İlk bağımsız inceleme ve düzeltme

Seq149’da denetçi H7 varsayılan tarihinin UTC olmasıyla yerel gün sözleşmesinin çeliştiğini ve exact allowlist yollarının `durum.mjs` tarafından okunmadığını buldu. Varsayılan H7 tarihi çalışma ortamının yerel takvim tarihine çevrildi; `TZ=Europe/Istanbul` altında 20:59Z→23:59 yerel ve 21:00Z→00:00 yerel sınırı test edildi. K3PD-26 allowlist satırı, yalnız bu satır düzeltme kapsamı da dahil olmak üzere exact backtick yolları içeriyor. İlk FAIL kaydı append-only KAYIT’ta korunuyor.

## Davranış ve sınırlar

- H7 hedef kararı seçili `[kesim, bugun]` dönemine bağlandı; “önce” ve bugüne kadarki “tüm dönem” oranları ayrı gösterilir. Sentetik 28 günlük örnekte kesim sonrası `7/13=%53,8` → `tutmuyor`; önce `13/13=%100,0`; tüm dönem `20/26=%76,9`. Örnekleme 5 cevap eşiği uygulanır; gelecek, cevap yetersiz veya boş seçili dönem sonucu yeşile çeviremez.
- H2 14 günlük pencerelerin her birinde `n≥20` gerektirir. Tam 5 puan düşüş dahildir; karşılaştırma tam sayı çapraz çarpımıyla yapılır, hedef/eşik değişmedi.
- H4 eski R+1 öncesi sayaçları `LEGACY_INVALID` etiketiyle dışarıda tutar. Eksik/geçersiz sayaç çifti `0%` gözlemine dönüştürülmez; geçerli yanlış sayımı ise doğru biçimde `%0,0` gösterebilir. Gelecek günlükler dışarıda kalır.
- H3 anlık kart özeti olarak kalır; 30 günlük nedensel etki `NOT_MEASURED`. H5 ve H9 açıkça proxy; özgün hipotezleri `NOT_MEASURED`. H8 girdi snapshot’ındaki anlık oran; tarihli dış snapshot olmadan önce/sonra sonucu `NOT_MEASURED`.
- Negatif sınamalar boş/az veri, geçersiz ve gelecek tarih, iki kohort, H2 sınırları, H4 legacy/eksik/bozuk sayaç, gelecekte tamamlanmış ders, bilinmeyen enum ve yasak alan getter’larını kapsar. Sentetik gizlilik yemi CLI, render ve izdüşüm çıktısına sızmadı; bilinmeyen seçenek ve bozuk girdi yemi de hata metnine sızmadı. Testte ağ ve yazma yasak stub’larıyla engellendi.

## Komutlar

[COMMANDS.json](COMMANDS.json) her komutun adı, env, child exit kodu, süresi ve son ölçüm satırlarını içerir.

| Grup | Sonuç |
| --- | --- |
| G0 | DENETLEYICI §4’teki 13 komutun tamamı exit 0; `driver` ve `zikr-harness` sentetik VM; durum `nextPrompt=K3PD-26`; control fixture negatifleri PASS. |
| G1 | DENETLEYICI §4’teki 19 komutun tamamı ayrı ayrı exit 0; perf ölçüsü ve mutlak tavanlar makbuzdadır; baseline yazma kapalı. |
| Kart | `node --check` iki dosya, `node tests/kao/test_k3p_deney_rapor.js`, `node tests/kao/test_k3p_pronunciation_fold.js`, `node kao3-premium/araclar/deney-rapor.cjs --ornek`: hepsi exit 0. Örnek sadece sentetiktir. |

Exact değişen yollar dokuzdur (PROMPTLAR’daki yalnız K3PD-26 allowlist satırı dahil): deney raporu, test, K3PD-26 deney sözleşmesi/komut makbuzu/kanıtı ve DURUM/GUNCEL-DURUM/KAYIT. Korunan dört kirli dosyanın başlangıç SHA-256’ları açılışta kaydedildi; son scope incelemesinde yeniden doğrulanacaktır. Push, merge, tag ve deploy yapılmadı. Bağımsız PASS sonrası yalnız dokuz exact path kart commit’ine alınacaktır. `releaseApproval=NOT_APPROVED`, `candidateSha=null`; K3PD-27 başlamadı.

## Bağımsız kabul

İlk bağımsız hüküm seq149 `FAIL` idi; iki bulgu düzeltilip test edildi. Taze salt-okur denetçi güncel exact diff’e `PASS` verdi (seq153). K3PD-26 kapandı; K3PD-27 başlamadı.

## Sınırlamalar

Rapor yalnız kullanıcı tarafından verilen, izinli alanları taşıyan snapshot’ı özetler; gerçek öğrenme veya nedensellik kanıtı değildir. H4’ün R+1 tarihi açıkça sağlanmalıdır. H5 ilk anlaşılan âyet olayını, H9 ertesi gün ilk tekrar sonucunu taşımaz; ikisi de `NOT_MEASURED`. H8 önce/sonra ölçümü tarihli dış snapshot yokluğunda ölçülemez. Cihaz ve kullanıcı kabulü bu kartta yoktur.
