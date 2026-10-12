# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-A8

## Son durum

- **Tarih:** 2026-10-12
- **Son tamamlanan:** K3P-A7 (A-5, D-7): **görünür devam**. Yarım kalan ders için Bugün birincil eylemi **"Kaldığın yerden · Bölüm n/5"**, hub alt satırı **"Kaldığın yerden devam et"**; derse dönünce 5 bölümlü çubuk kalınan bölümden dolu başlar. Bilgi **yalnız mevcut `path.lessons[id].resume`** alanından okunur; yeni veri alanı yok. Önce: K3P-A6 (bölümlü ilerleme + sabit eylem bölgesi).
- **Dal:** `kao3-premium`. `main` = yedinci ara yayın `20261011f` (K3P-A5 + K3P-A6 dahil, canlıda). Dal `main`'in 1 commit önünde (K3P-A7, yayında değil).
- **Yeni oturum:** `kao3-premium/STARTER.md` içindeki metni yapıştır.
- **Kanıt düzeyi:** kaynak/headless · görsel QA yalnız K3P-00 "önce" çizgisi · cihaz yok.

## Ölçü panosu (taban → hedef)

| Ölçü | Şimdi | Hedef |
| --- | --- | --- |
| Çift şıklı görev (yerleşik) | 0/1127 ✓ | 0 |
| Okunuş hatası (vasl + idgâm) | 0 + 0 ✓ | 0 |
| Ders başına dokunuş (varsayılan açık) | 39 ✓ | ≤ 40 |
| Art arda edilgin ekran | 1 ✓ (K3P-A3) | ≤ 1 |
| İlk yeni içeriğe dokunuş | 7 ✓ (K3P-A3) | ≤ 7 |
| Oturum süresi | ≤ seçilen ✓ (K3P-A4) | ≤ seçilen |
| Uyarlanır zorluk | 2 yanlıştan sonra şık ≤3 ✓ (K3P-A5) | kaygı ↓, sıkılma ↑ |
| Bölümlü ilerleme | 5 bölüm ✓ (K3P-A6) | 5 bölüm |
| Yeniden yüklemede devam ipucu | "Kaldığın yerden · Bölüm n/5" ✓ (K3P-A7) | var |
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi kritik:** 127,45 / 128 KiB; yaklaşık **0,5 KiB pay**. Kod ekleyen sıradaki kart (A8) ve sonrası **önce eski kodu silmeli**; yetmezse §5 gereği tavan kararı kullanıcıdan istenir. CSS 13,13/14 KiB.
- **Kapı kararı K-Q:** Kart kapanışında hedefli kapı; K3P-A7 promptu `kapi-hizli --kart K3P-A7` (yavaş testler zorunlu değil); tamamı ve yavaş üçlü ayrıca koşuldu. **Sıradaki K3P-A8 dalga sonu → ayrıca `bash tools/kapi/kapilar.sh` zorunlu.**
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearn.js`. Ara yayın yöntemi: ortak sürümle tek geçiş.
- **Devam ipucu kaynağı (A-5):** yalnız `path.lessons[id].resume`; yeni veri alanı yok. `resume.phase==='practice'` ise `lessonItemId`, değilse `itemId` plan adımına eşlenir; eşleşmezse ipucu gösterilmez (güvenli geri düşüş).
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`; enjekte kolay kart devam işaretçisine yazılmaz.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu (K3P-A7: runtime 127,45/128 · css 13,13/14 KiB · p95 ~9,8 ms).
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn). K3P-A7'de üçü de yeşil.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 (K3P-A7'de korundu).
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
