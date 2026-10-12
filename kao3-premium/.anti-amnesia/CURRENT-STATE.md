# K3P · CURRENT-STATE

<!-- Bu dosya her prompt'un kapanışında BAŞTAN yazılır (BAGLAM-YONETIMI §3). Başlıkları silme; senkron.mjs okur. -->

Sıradaki prompt: K3P-A7

## Son durum

- **Tarih:** 2026-10-12
- **Son tamamlanan:** K3P-A6 (D-2, D-3): **5 bölümlü ders ilerlemesi** (① Hedef ② Isınma ③ Tanış-Sına ④ Karışık ⑤ Zirve), plan öğelerinden türetilir; etkin bölüm kendi içinde dolar; `aria-valuetext="Bölüm n/5 · etiket · x/y"`. **Sabit eylem bölgesi** (birincil eylem + şıklar `sticky` alta, `safe-area` payı) yalnız CSS. Görev görünümündeki eski tek `kao-task-progress` çubuğu 5 bölümlü çubukla **değiştirildi** (K2F-28 "tek ince ilerleme çubuğu" sözleşmesi korunur). Önce: K3P-A5 (uyarlanır zorluk).
- **Dal:** `kao3-premium`. `main` = altıncı ara yayın `20261011e` (K3P-A4 dahil, canlıda). Dal `main`'in 2 commit önünde (K3P-A5 + K3P-A6, yayında değil).
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
| Ders başına overlay yeniden kurulumu | 0 ✓ (K3P-A1) | 0 |
| Tanıma görevi payı | %93 | ≤ %60 |
| Bugün ekranı seçim sayısı | 13 | ≤ 5 |
| `App.kao*` sayısı | 45 ✓ | 45 |

## Açık riskler

- **Çalışma zamanı bütçesi kritik:** 127,1 / 128 KiB; yaklaşık **0,9 KiB pay**. Kod ekleyen sıradaki kartlar (A7, A8, 11–13, 16–18, 20, 22–24) önce **eski kodu silmeli**; yetmezse tavan kararı kullanıcıdan istenir (§5). CSS 13,13/14 KiB.
- **Kapı kararı K-Q:** Kart kapanışında hedefli kapı; K3P-A6 promptu `kapi-hizli --kart K3P-A6` (yavaş testler zorunlu değil) istedi; tamamı ve yavaş üçlü ayrıca koşuldu. Dalga sonunda (K3P-A8) tam kapı.
- **Pin ertelemesi (K-P):** `pinDeferral.files` = `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css`. Ara yayın yöntemi: ortak sürümle tek geçiş.
- **K2F-28 ↔ K3P-A6 etkileşimi:** oturum ekranında "tek ilerleme çubuğu" kuralı korundu — eski `kao-task-progress` kaldırıldı, yerine 5 bölümlü `kao-lesson-progress` geldi. `test_kao2_feedback` bu yüzden gerekçeli güncellendi (gevşetme değil: aynı kural, daha zengin çubuk).
- **Uyarlanır durum kalıcı değil (K-K):** kayan pencere/streak yalnız `ui`; enjekte kolay kart devam işaretçisine yazılmaz.
- **Hedef/akış çatışması (K3P-A3'ten, açık):** açılış → ilk görev 3 dokunuş, hedef 2. Karar kullanıcıda.
- **Perf göreli bandı makine yüküne duyarlı.** Kapılar `KAO2_ACCEPT_SLOW_HOST=1`; mutlak tavanlar zorunlu (K3P-A6: runtime 127,1/128 · css 13,13/14 KiB · p95 ~12 ms).
- **Yavaş testler:** `test_kao2_kabul` (~230–530 sn), `test_kao2_grammar_tasks` (~170–290 sn), `test_kao2_denetim` (~35–50 sn). K3P-A6'da üçü de yeşil.
- **Deney raporu (K3P-05):** gerçek yedeği yalnız kullanıcı verir.
- **Okunuş kapısı zorunlu (K3P-04'ten beri):** `okunus-denetim.cjs` exit 0 (K3P-A6'da korundu).
- **Görsel QA Chrome yolu:** K3P-26'da `KAO_QA_CHROME` ver.

## Devir notu

—
