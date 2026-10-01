# K2F-19 — Ders tutarlılık kapısı (test)
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 27d8d6df · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K5-03 (1/3) · R değişimi: yok

## İlerleme günlüğü
- [x] P1: sync PASS, nextPrompt K2F-19
- [x] test yazıldı, KNOWN_MISMATCH boşken kırmızı görüldü
- [x] KNOWN_MISMATCH tam liste, yeşil
- [x] README satırı, kapilar YEŞİL

## Yapılan
- `tests/kao/test_kao2_lesson_coherence.js`: 20 kategorili sözlük (başlık/hedef anahtar sözcüğü → lemma yüklemi, gerekçeli), eşik %60, 14 denetlenebilir kavram kategorisi (g3 g4 g6 g7 g9 g13–17 g19 g20 g22 g23). Başlık/hedef bir kategori anıyorsa ve kavramın kategorisi varsa her ikisi de eşiği geçmeli.
- Üretim kodu değişmedi.
- Ek tur (bağımsız 3 denetçi + çürütme, 6 bulgu doğrulandı, 7 aday reddedildi): `fiil` regex'i çekimli biçimleri (fiillerini/fiilini) kaçırıyordu → düzeltildi (+ geçmiş/şimdiki/geniş zaman → V); `ancak` yüklemi RET (idrâb harfi 'bal') saymıyor, yalnız EXP; yeni `bağlaç` (CONJ/AMD/EXL) ve `yardımcı fiil` (anlamı oldu/idi/değil/sabahladı olan V) kategorileri; g14 ve g23 kavramları yardımcı-fiil yüklemine bağlandı (g23 yanlışlıkla zarf-T'ydi); `zaman` kategorisi yalnız 'zaman kalıpları'; liste çıtası eklendi.

## TDD
- Kırmızı: `node tests/kao/test_kao2_lesson_coherence.js` (KNOWN_MISMATCH=[]) → AssertionError: bulunan: ["u02.01","u02.02","u03.02","u04.01","u04.02","u09.01","u09.02","u09.11","u10.01","u10.03","u11.04","u11.05","u12.02","u12.03"]
- Yeşil: aynı komut → PASS (5 kontrol · bilinen tutarsız 17/109; ilk tur 4 kontrol · 14/109)

## Kapılar (P3)
SONUÇ: TÜM KAPILAR YEŞİL (kapanışta)
tekrar-uret: 9/10 PASS (önceki 9/10)

## Ölçümler
- Tutarsız ders: 17/109 (ilk tur 14; ek turda +u04.03, u04.04, u07.02). K5-03'ün 10 dersinin 10'u yakalandı (u02.01 u02.02 u04.01 u04.02 u09.01 u09.02 u10.01 u11.04 u11.05 u12.02).
- Ek 4 ders (kapı yeni buldu): u03.02 (Olumsuzluk ↔ NEG lemması yok), u09.11 (Emir ve dua kalıpları), u10.03 (Daha iyi bilen ↔ tafdîl %20), u12.03 (Şart ve zaman kalıpları ↔ COND yok). Ek turda: u04.03 (bağlaç %40), u04.04 (bağlaç %20), u07.02 (yardımcı fiil dersi, kâna u03.02'de; %0).

## Bilerek değişen testler
- yok

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok · Cihaz: yok

## Sürprizler / sonraki promptlara not
- Sözlükte emir/geçmiş/şimdiki ve seslenme etiketi yok: "emir" kategorisi her zaman tutmaz sayılır (u09.01, u09.11), seslenme anlamı "ey" ile başlayan lemmalardan denetlenir. Fiil derslerinde yalnız pos=V aranır (zaman ayrımı ölçülemez). "Olumsuz şimdiki zaman" (u08.02) fiillerin olumsuzlanmasıdır; lemma etiketiyle ölçülemediği için kapsam dışı bırakıldı.
- K2F-20 yeniden dağıtımda bu listeyi boşaltmalı; emir kipi derslerini boşaltmak için emir etiketli lemma gerekir (içerik/veri kararı).
