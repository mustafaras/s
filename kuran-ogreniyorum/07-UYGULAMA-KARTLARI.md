# 07 — Uygulama kartları (6 dalga / 30 kart)

Her kart, [12-EK-GEREKSINIMLER](12-EK-GEREKSINIMLER.md)'deki `R-xx` maddelerinden sorumlu olduklarını kapanış kanıtında tek tek gösterir.

Uygulama sırası ve oturum promptları [UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md)'dadır;
izinli dosya/kontrol listeleri [KAO-STATE.json](KAO-STATE.json) `cards`'tan üretilir
(bu tablo özet; ayrışırsa STATE geçerli). Her kart bağımsız bir oturumda yapılabilir; **dosya sınırı**, **kontrol** ve
**durma noktası** yazılıdır. Hiçbir kart kullanıcı onayı olmadan başlamaz.
Durum [KAO-STATE.json](KAO-STATE.json)'da; tamamlanınca
[.anti-amnesia/LEDGER.md](.anti-amnesia/LEDGER.md)'ye satır.

Ortak kurallar: branch `kuran-ogreniyorum` (LOCAL-ONLY), `main`'e merge/push
yok; her kart tek commit; `node --check` + ilgili fixture yeşil; Arapça
içerik yalnız derleme aracından; IIP'nin yazdığı dosyalara (saygi.js,
render.js, styles.css, app.js hub bölümleri) yalnız Dalga 5'te ve koordineli.

## Dalga 1 — İçerik altyapısı (kod yazmadan önce veri)

| Kart | Kapsam | Dosyalar | Kontrol | Durma |
|---|---|---|---|---|
| KAO-01 Derleme aracı | `tools/kao-lexicon-build.mjs`: QAC + Tanzil okur, lemma sıklığı/kök/POS/örnek pencere çıkarır, `content/lexicon.draft.json` yazar; ağsız; girdi yoksa açık hata | `tools/`, `kuran-ogreniyorum/content/` | `--self-test` sentetik 50 satırlık mini korpusla; kapsam toplamı = 77.430 | Taslak JSON üretildi; henüz `app/content` yok |
| KAO-02 Aday liste ve kognat önerisi | Sıklık ≤500 + çapa metin kesişimi; TDK Arapça kökenli eşleme *önerisi*; inceleme Markdown'u | `content/` | Aday ≈ 530; kova A/B/C/D sayıları raporlanır | Kullanıcı inceleme tablosunu alır |
| KAO-03 İnsan doğrulaması (kullanıcı görevi) | Tablo satır satır onay; kendi Türkçe parça çevirileri | `content/lexicon.verified.json` | `verifiedBy` boş satır 0 | Onay tamamlanmadan KAO-05 açılmaz |
| KAO-04 Gramer içeriği | 24 mikro-kavram metni + tablolar (Türkçe, terimsiz/terimli çift) → `grammar.verified.json` | `content/` | Her kavram ≥3 alıştırma şablonu | İnsan onayı |
| KAO-23 Fonetik içeriği | 28 harf kova/mahreç/ipucu, minimal çift listesi, 7 okuma kuralı, transliterasyon tablosu (okunuş + DİA) → `phonics.verified.json`; mahreç SVG'leri | `content/`, `assets/kao/svg/` | Her B/C harfinde ≥1 çift; SVG ≤4 KB | İnsan onayı (Arapça bilen) |
| KAO-24 Ses varlık hattı | `tools/kao-audio-build.mjs`: kaynak veri setinden alt küme seçimi (lemma/sûre/çift), Opus→AAC dönüşüm, adlandırma `assets/kao/audio/<id>.m4a`, manifest + boyut raporu; köken/lisans kaydı | `tools/`, `assets/kao/audio/` | Toplam ≤16 MB; iOS'ta çalınabilir format; manifest = klip sayısı | **D-08/D-09 onayı** olmadan repo'ya ses girmez |
| KAO-25 Plan denetleyici | `tools/kao-plan-check.mjs`: STATE/LEDGER tutarlılığı, kart dosya sınırı, IIP dosyalarına yazma yok | `tools/` | `--self-test` | — |

## Dalga 2 — Donmuş modüller ve çekirdek

| Kart | Kapsam | Dosyalar | Kontrol | Durma |
|---|---|---|---|---|
| KAO-05 `quranLexiconV1.js` | `--freeze` ile üretim; attribution/methodology; boyut ≤260 KB | `app/content/quranLexiconV1.js`, 4 yükleme listesi, `index.html ?v=` | `tests/kao/test_kao_lexicon_contract.js`, `_coverage.js` | Yalnız yükleniyor, UI yok |
| KAO-06 `quranGrammarV1.js` + `quranShortSurahsV1.js` | Donmuş içerik | aynı | contract fixture | — |
| KAO-07 Registry iskeleti + migrate | `app/core/quranLearn.js`: `ensureQuranLearn`, register, şema; `state.js MIGRATE_DEPENDENCIES` + `app.js` shim | `app/core/quranLearn.js`, `app/core/state.js` (1 liste satırı + 1 try satırı), `app.js` (shim'ler) | `test_kao_migration.js`, `test_state_rebind_boundary.js`, driver + zikr-harness PASS | `data.quranLearn` üretiliyor, UI yok |
| KAO-08 FSRS portu | `kaoSchedule`; MIT atıfı | `quranLearn.js` | `test_kao_fsrs.js` referans vektörleri | — |
| KAO-09 Kuyruk ve görev üretici | Bütçe, serpiştirme, çeldirici, deterministik seed | `quranLearn.js` | `test_kao_queue.js` | — |

## Dalga 3 — Arayüz

| Kart | Kapsam | Dosyalar | Kontrol | Durma |
|---|---|---|---|---|
| KAO-10 Overlay kabuğu + E1 Home | `App.kaoOpen/Close/SetView`; dialog/aria/klavye; Ayarlar'da geçici giriş satırı | `quranLearn.js`, `app.js` (App atamaları), `app/core/settings.js` (1 satır), `app/kao.css` (D-03) | `test_kao_render.js` Tab/Escape; fx2 pin güncelle | Açılıp kapanıyor |
| KAO-11 E2 Oturum: anlam seç / Arapça seç | İki temel görev tipi, hedefli DOM güncelleme, doğru/yanlış aria-live | aynı | render fixture; `--dump` ile HTML | — |
| KAO-12 E2 gramer görevleri | Ek çöz, çekim tablosu, kök bul, kalıp eşle | aynı | — | — |
| KAO-13 E2 parça görevleri + E3 Done | Kelime dizme, parça çevir; oturum özeti | aynı | — | Tam oturun akıyor |
| KAO-14 E4 Üniteler + E5 Kelime | Ünite listesi, kelime detayı, kök ağacı, kognat notu | aynı | — | — |
| KAO-15 Seviye 0 kapısı | 20 kelimelik kontrol + 6 mini ders | aynı | — | — |
| KAO-16 E6 Okuyucu (20 kısa sûre) | Kelime kelime dokunma, "anladım", gecikmeli test | aynı | — | — |
| KAO-17 E7 Ayarlar + ses | dailyNew, ses stili, hareke/soldurma, translit katmanı; `App.kaoPlay` (paketli klip) | aynı | `test_kao_privacy.js`; premium fixture'lar yeşil | — |
| KAO-26 E8 Telaffuz stüdyosu | Harf kovaları, mahreç SVG, minimal çift dinleme görevleri, FSRS ses kartları | aynı | `test_kao_phonics_contract.js`, render fixture | — |
| KAO-27 Gölgeleme | `MediaRecorder` bellek-içi kayıt/dinle/at; izin metni; ağ/depo yolu yok | aynı | `test_kao_privacy.js` | — |
| KAO-28b E10 Mushaf ısı haritası + gecikmeli sûre testi | 114 sûre haritası (R-B1), 7 gün sonra 5 soruluk test (R-C6) | aynı | render + surah fixture | — |
| KAO-16b E11 "Namazda ne diyorum" | Rekât sırası görünümü, bilinen/bilinmeyen kelime (R-B2); içerik `prayerTexts` KAO-06'da | aynı | içerik insan doğrulamalı; render fixture | — |
| KAO-28 E9 Anlayabildiğin âyet | ≥%95 kapsamlı âyet seçici (deterministik, günlük), kelime kelime ses + Türkçe; hub kartında satır | aynı | `test_kao_queue.js` (seçici), coverage fixture | — |

## Dalga 4 — Kalite

| Kart | Kapsam | Kontrol |
|---|---|---|
| KAO-18 Kontrast ve erişilebilirlik | `docs/apple-design/verify-contrast.mjs` kalıbıyla KAO renk çiftleri; %200 metin, 320 px reflow (headless ölçüm) | Tüm çiftler ≥4.5:1 / 3:1 |
| KAO-19 Panel aynası | Manifest satırı + özet projeksiyon | `test_kao_panel_projection.js` + mevcut panel fixture'ları |
| KAO-20 Tam regresyon | Tüm fixture aileleri + shell-inventory gate + fx-coverage (M7 tavanı bilinir) | Rapor `deliverables/KAO-REGRESYON.md` |

## Dalga 5 — Hub entegrasyonu (IIP ile koordineli)

| Kart | Kapsam | Koşul |
|---|---|---|
| KAO-21 Hub kartı + köprüler | `saygiHTML`'e `kaoHubCard()` (1 satır), Kur'an Yolculuğu satırında "kelimelerini öğren", Esmâ kök notu | IIP'nin nav/hub kartları `main`'de ya da IIP sahibi onaylı; ayarlar geçici girişi kaldırılır |

## Dalga 6 — Kapanış

| Kart | Kapsam |
|---|---|
| KAO-22 Kapanış belgesi | `deliverables/KAO-KAPANIS.md`: kapsam ölçümü, fixture envanteri, bilinen sınırlar, cihaz kabulü (kullanıcı), push/deploy kararı ayrı |

## Bağımlılık grafiği

```
01 → 02 → 03 ─┐
        04 ───┼→ 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 26 → 27 → 28 → 28b → 16b
        23 ───┤                            (07 ⟂ 08 ⟂ 09 paralel olabilir)
        24 ───┘  (24, D-08/D-09 onayına bağlı; 17 ve 26 ses olmadan da çalışır — sessiz mod)
        25 (bağımsız, Dalga 1)
16b → 18 → 19 → 20 → 21 → 22
```

## Tahmin (kaba, saat)

Mühendislik ~65–90 (R-A/B/C dâhil); içerik doğrulama (kullanıcı + Arapça bilen ikinci göz)
~18–28; ses hattı ~8–12; toplam takvim 6–9 hafta düşük yoğunlukta. Bu bir taahhüt değil, ilk keşif tahminidir.
