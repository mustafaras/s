# K3P · CURRENT-STATE

Sıradaki prompt: K3P-16

## Son durum

- **Tarih:** 2026-10-15.
- **Son tamamlanan:** K3P-14 — ders sonu anı; Dalga 2 kapandı. 25/37 kart tamamlandı; K3P-15 daha önce tamamlandığından sıradaki K3P-16'dır, bu oturumda açılmadı.
- **Yayın yetkisi:** kullanıcı K3P-13 + K3P-14 için commit/push/merge/deploy ve ara pin istisnasını açıkça onayladı. Ortak pin **20261015a**; pin erteleme listesi boşaltıldı. K3P-14 commit 8e9901cb, PR #107 merge b6675794, Pages 38727957725 success. 8/8 canlı varlık HTTP 200 ve no-cache SHA-256 eşliği doğrulandı (LEDGER seq 46).
- **Sınır:** bu onay K3P-27 final program yayın kabulü değildir; releaseApproval=NOT_APPROVED korunur. Veri deposuna yazma, cihaz kabulü veya K3P-16 yetkisi vermez.
- **Kanıt:** kaynak/headless. Görsel QA ve cihaz kabulü yok. Yeni oturum başlatıcısı: kao3-premium/STARTER.md.

## K3P-14 ne yaptı

- Ders başında yalnız geçici ui içinde bilinen lemma kümesi ve Kur'an kapsamı tabanı alınır. Özette yalnız bu oturumda iki yönde kalıcı eşiğe ulaşan yeni kelimeler Tezhip satırında yaldızlanır; kısmi/yetim/eski kelimeler yeni kazanım sayılmaz.
- Kapsam artışı gerçek kaoCoverage farkından yüzde puan olarak hesaplanır, negatif olamaz; 800 ms sayaç özet DOM'u render edildikten sonra çalışır. Artış yoksa sıfır gösterilir; ilk tanışmada sahte kalıcılık ödülü yoktur.
- KAO kutlaması modalın --quran/--quran2 renklerinden lacivert-altın palet alır; yedek #1C3A5F/#C9A227. Konfeti yalnız kazanılmış kilometre taşında ve hareket izniyle bir kez; özel palet animasyonu ≤1,15 sn, temizlik 1,2 sn. Varsayılan yardımcı çağrısının eski beş renkli davranışı korunur.
- Hareket azaltmada yaldız ve kapsam metni statik kalır. Yeni App.kao* handler, veri şeması, migration veya app.js değişikliği yoktur.
- Yeni tests/kao/test_k3p_lesson_moment.js; envanter 72→73. Tema/yedek palet, varsayılan konfeti regresyonu, iki yönlü kalıcılık, kapsam farkı, tek seferlik kutlama ve render-sonrası sayaç test edilir.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 127,282 KiB | 128 KiB |
| Runtime gzip L9 (perf aracı) | 126,926 KiB | 128 KiB |
| CSS gzip L9 | 15,273 KiB | 16 KiB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| app.js | 7799 satır, değişmedi | yeni çıkarım yok |
| Konfeti / sayaç | ≤1,15 sn / 800 ms | ≤1,2 sn |
| Tam kapı perf p95 / steady | 7,635 / 4,383 ms | mutlak tavanlar PASS |
| KAO fixture envanteri | 73 | eşleşiyor |

## Açık riskler

- Tam kapı PASS: KAO 73, app 78, panel 23, Panel-v2 27, quran 9; reminders smoke, driver, zikr, kontrast, çift şık, okunuş, plan ve pin kapıları yeşil. KAO2_ACCEPT_SLOW_HOST=1 yalnız göreli perf bandını atlar; mutlak tavanlar korunur.
- Son hızlı kapı tekrarı **HIZLI KAPI YEŞİL**; 61 pin bağlantısı taze, erteleme yok. İlk son-tur koşusunda test_kao2_components.js:195 pekiştirme şeridi beklentisi aralıklı kırıldı; aynı test değişiklik yapılmadan tek başına ve tam hızlı kapı tekrarında PASS. Test gerçek zamanlı ders yürüyüşünde geçmiş yanıt medyanını toplar; hızlı doğru kolu şeridi bilerek göstermez (K3P-15). Kapsam dışı test/üretim değişikliği yapılmadı.
- Tarihsel bilgi betiği tekrar-uret.cjs **9/10**: R-08 eski apply.words/sentences alanlarını sayar; K3P-13'te 95 dersin âyet satırı artık doğrulanmış örneklerden runtime'da türetilir. Güncel test_kao2_denetim R-08 ve test_k3p_lesson_ayah PASS; tarihsel betik kapı değildir ve bu kartta değiştirilmedi. 10/10 iddiası yoktur.
- akis-olc 2b eski hedef ekranı ölçüsünü kullanır; gerçek ≤25 sözcük kuralı K3P-13 fixture'ında doğrulanır. Araç düzeltmesi kapsam dışı.
- Runtime L6 kalan pay ~0,718 KiB. Tavan yükseltilmedi; Views yorumlarında kısaltma yapıldı.
- Hedef/akış çatışması (K3P-A3): açılış→ilk görev 3 dokunuş, hedef 2; karar kullanıcıda. Tanıma görevi payı %93, hedef ≤%60; sonraki kartlara aittir.
- Görsel Tezhip/forced-colors ve gerçek ekran okuyucu/cihaz kabulü yapılmadı. K3P-26'da KAO_QA_CHROME gerekir. An kartı degrade istisnası ve ui-only uyarlanır durum korunur.

## Devir notu

K3P-14 uygulaması, hızlı/tam kapı ve onaylı commit→push→PR merge→Pages→8/8 no-cache SHA-256 eşliği tamamlandı. Bu yayın makbuzu commit’i runtime baytlarını değiştirmez; son Pages koşusu ve dal eşliği teslim mesajında doğrulanır. K3P-16'yı yürütme; yeni kart ayrı istektir. Kişisel veri/gerçek hesap tarayıcısı açma.
