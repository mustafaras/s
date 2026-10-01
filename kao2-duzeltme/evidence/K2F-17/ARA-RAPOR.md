# Dalga 1 ara raporu — Kur'an Arapçası düzeltmeleri (K2F-00…16)

Tarih: 2026-10-01 · Durum: 17/44 prompt tamam · Yalnız kaynak/test düzeyi ölçüldü; cihazda gözle doğrulama sende.

## Ne düzeldi
Denetimin 4 kritik kusuru ve niyet sorunu kapandı:
1. **Ünite ustalığı artık kaydediliyor.** Ünite sonunda 10 soruluk ustalık turu var; 8/10 ve üstü geçer, altı "onarım" turuna gider. Daha önce hiçbir şey kaydedilmediği için Ünite 1 kilidi açılmıyordu. 12 ünite baştan sona simüle edildi: her adımda ilerliyor, Ünite 3 "kaldı → onarım → geçti" yolunu tamamlıyor, sonunda "Tüm üniteler tamam".
2. **Gramer görevleri yanlış eşleme öğretmiyor.** 109 ders yürüyüşünde gösterilen gramer görevi 75 ve kural ihlali 0 (önceden 78 görevden 45'i kusurluydu). Her derste en az 9 alıştırma var. 86 şablonun 83'ü destekleniyor; 3 şablon yeni Türkçe içerik bekliyor (alan uzmanı onayı).
3. **Seviye 0 ana yolu dolu.** Okuyamayan kullanıcı ilk açılıştan 3 dokunuşla Seviye 0 içeriğine ulaşıyor. 12 harfsiz ders çökmeden çiziliyor, 5 aşamalı ve puanlı; 12 ders bitince Fâtiha'ya geçiliyor.
4. **Seviye 0 ekranı açılıyor.** Eksik olan `kaoS0` işleyicisi tanımlandı.
5. **Niyet çalışıyor (K2F-16).** İlk açılışta seçtiğin niyet Ayarlar'da görünüyor ("Her yatsı namazından sonra 5 dakika"), oradan değiştirilebiliyor ve hub'daki öneri o vaktin saatini gösteriyor.

## Nasıl doğrulandı
- `kapilar.sh`: tüm kapılar yeşil (KAO 49 · uygulama 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · plan-check · sync).
- Denetim kusurlarını yeniden üreten betik: **9/10 PASS**. Kalan R-08 ("Uygula" adımı bazı derslerde içeriksiz) K2F-23'te kapanacak.
- Bütçe: içerik 184,2 KiB (tavan 256) · çalışma zamanı 110,8 KiB (tavan 128) · css 13,56 KiB (tavan 14) · render p95 ≈4,1 ms.
- Yeni işleyici sayıları ölçüldü: `App.kao*` 44 · yüzey 765 · atama 603.

## Kanıt düzeyleri
| Düzey | Durum |
|---|---|
| Kaynak/test | ✓ yukarıdaki ölçümler |
| Yayın | K2F-12…15 canlıda (`4fd00131`, pin `20261001f`); K2F-05…11 ve K2F-16 yayında DEĞİL |
| Cihaz | yok — sende |

## Cihazda denenecek 3 akış
1. **Yeni kullanıcı, okuyamıyor:** verileri sıfırlamadan, ayrı bir deneme profilinde ilk açılışta "Henüz değil" de; Seviye 0 dersinin 3 dokunuşta açıldığını ve 5 aşamanın sırayla ilerlediğini kontrol et.
2. **Ünite sonu ustalık:** bir ünitenin derslerini bitir; ustalık turunun 10 soru sorduğunu, 8/10'un geçtiğini, altının onarıma gittiğini gör.
3. **Niyet:** Ayarlar → Niyet'te bir vakit seç; satırın değiştiğini ve hub kartında o vaktin saatiyle önerinin çıktığını gör.
