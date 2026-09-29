# KAO2-17 — Yayın kaydı (canlı)

Tarih: 2026-09-29 · Dal: `kao2-yeniden-tasarim` · Yayın: GitHub Pages

## Kapsam ve L1 onayı
Kullanıcı "tam ve kusursuz uygulandığından emin ol canlıya al sıradakine geç"
diyerek **hem yayın onayı hem metin L1 onayı** verdi. K-4 gereği dinî bağlam
içermeyen ders başlığı/vaat/arayüz metinlerinde L0+L1 yeterlidir; 133 metin
`sourced` yapıldı.

## Adımlar
| # | İşlem | Sonuç |
|---|---|---|
| 1 | Metinlerin `sourced`'a yükseltilmesi (L1) | 12 ünite + 109 ders + 12 S0 |
| 2 | Kalite taraması | 4 kesik başlık düzeltildi |
| 3 | **Pin yükseltmesi** `20260929e → 20260929f` | 9 dosya + `tests/kao` sözleşmesi |
| 4 | Kapı turu | KAO 34/34 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders/driver/zikr/kontrast/perf PASS |
| 5 | Dal push + `main` fast-forward | `6173cb4e..c1e11d5e` |
| 6 | Pages run **36597032647** | success |
| 7 | Canlı doğrulama | 7/7 dosya **bayt-eş**, pin `20260929f`, özel malzeme 404 |

## Bu yayında değişen kullanıcı davranışı
- **Yer tutucu ders başlıkları gerçek başlıklarla değişti.** Örnek (Ünite 7):
  eski `Oldu, yaptı · 1..9. ders` → yeni `Geçmiş zamanı tanıyalım · Yardımcı fiil:
  oldu, idi · İnanmak ve yapmak · Duymak ve girmek …`
- 109 dersin her birine **hedef cümlesi** eklendi ("… öğreneceksin" diliyle).
- Ünite görünümü artık başlık + vaat taşır (Ünite 1 Fâtiha'da değişiklik yok).

## Kapılar (yayın sonrası)
KAO 34/34 · app 77/77 · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders ·
driver · zikr · kontrast · perf PASS.

## Kanıt düzeyleri
- Kaynak/test **PASS** · Yayın/run/hash **PASS** · **Cihaz kabulü: doğrulanmadı**

## Sınır ve açık kapı
- İzin KAO2-17'ye kadardır; **KAO2-18 ve sonrası için yeni talimat gerekir.**
- **L2 (alan uzmanı) hâlâ açık:** yalnız `why` (neden önemli) alanı için; bu alan
  hiçbir ekranda render edilmiyor, dolayısıyla kullanıcıya görünmüyor.
