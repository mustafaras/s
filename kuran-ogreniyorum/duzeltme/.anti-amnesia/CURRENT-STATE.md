# KAO-FIX · Güncel durum (anti-amnesia — her prompt sonunda güncellenir)

**Durum:** `active` · **Sıradaki:** **KAO-FIX-04** · **Aktif:** — · **Engel:** —
**Dal:** `kao-duzeltme` (FIX-00 açtı; `origin/kao-duzeltme` de var) · **Taban:** `main` @ `58e0ceb` · **Yayın:** `main`=`9fa910a` (FIX-03/B, kullanıcı onayı 2026-09-26, Pages success); sonraki her push/deploy yine ayrı onay
**Güncelleme:** 2026-09-26 · KAO-FIX-03/D done

> Bu dosya tek doğruluk kaynağıdır. İlk 12 satırı her oturumda oku (`sed -n '1,30p'`).
> Güncellerken yalnız ilgili satırı değiştir. Anlatı ekleme.

## Prompt durumu

| Prompt | Bulgu | Durum | Commit | Not |
|---|---|---|---|---|
| KAO-FIX-00 | — | done | denetim `201ff6d` · FIX-00 `5863002` | dal + kararlar (hepsi varsayılan) + taban |
| KAO-FIX-01 | O-4 | done | `0d54321` | freeze pini + repro testi (4 modül bayt-eş) |
| KAO-FIX-02 | K-1, Y-3 | done | `1ff09b1` | çalışma kitabı 837 satır + içe alma kapısı |
| KAO-FIX-03/A | K-1, Y-3 | done | `bebb5de` | 95–98 (230 satır) filled, copy 0, language 0 |
| KAO-FIX-03/B | K-1, Y-3 | done | `9fa910a` | 99–105 (210) filled, copy 0, language 0 |
| KAO-FIX-03/C | K-1, Y-3 | done | `582c5e2` | 106–114 (178) filled, copy 0, language 0 |
| KAO-FIX-03/D | K-1, Y-3 | done | `git log --grep=KAO-FIX-03/D` | Fâtiha 29 + tamamlayıcı 190; import 837/837, copy 0, language 0 |
| KAO-FIX-04 | K-1, Y-3 | todo | | dondurma + atıf + pin |
| KAO-FIX-05 | Y-4, D-6 | todo | | başlık şeddesi + DİA |
| KAO-FIX-06 | Y-2 | todo | | iki yönlü kart |
| KAO-FIX-07 | Y-1 | todo | | bilinen/kapsam tanımı |
| KAO-FIX-08 | O-1 | todo | | lastDistractors |
| KAO-FIX-09 | O-2 | todo | | daily budama ≤100 KB |
| KAO-FIX-10 | O-3 | todo | | kilometre taşları |
| KAO-FIX-11 | O-5 | todo | | test kör noktaları, mutasyon 15/15 |
| KAO-FIX-12 | O-6 | todo | | kaynaklar/lisanslar E7 |
| KAO-FIX-13 | O-9 | todo | | Arapça yazı tipi |
| KAO-FIX-14 | O-7 | todo | | semNeighbors sözlükten |
| KAO-FIX-15 | D-2, D-5 | todo | | serpiştirme/soldurma/kognat |
| KAO-FIX-16 | O-8, D-1, D-3 | todo | | plan/belge hizası + KAPANIŞ ek-1 |
| KAO-FIX-17 | O-11 | todo | | plan-check sertleştirme |
| KAO-FIX-18 | D-4 | todo | | sahipsiz maddeler kararı |
| KAO-FIX-19 | hepsi | todo | | kapanış regresyonu |

Durum değerleri: `todo` · `active` · `done` · `blocked` (Engel satırına neden) · `partial` (parti yarım).

## Kararlar (FIX-00 kaydeder; kullanıcı değiştirmedikçe varsayılan geçerli)

| Kimlik | Soru | Varsayılan | Karar | Kaynak |
|---|---|---|---|---|
| KF-1 | Kısa sûre, Fâtiha ve tamamlayıcı anlamları | Kendi Türkçe katmanımız (D-12 YZ doğrulama); quran.com yalnız kopya-denetim referansı | varsayılan | varsayılan |
| KF-2 | Belgelenmemiş bütçe aşımları | Ölçülen değerler plana tavan olarak yazılır: quranLearn.js ≤1.900 satır, kao.css ≤42 KB, 4 modül ham ≤480 KB; bölme sonraki program | varsayılan | varsayılan |
| KF-3 | Oturum başına gramer üst sınırı | 4 (kod kalır, plan 4'e güncellenir) | varsayılan | varsayılan |
| KF-4 | 02 §2.4 "12–16 görev" ↔ 05 §6 | 05 §6 bağlayıcı; 02 §2.4 "tipik hedef" notu | varsayılan | varsayılan |
| KF-5 | Sözlük örneklerindeki vakıf işaretleri (377 örnek) | Sadeleştirme kabul, D-02'ye not (okuyucu işaretleri korur) | varsayılan | varsayılan |
| KF-6 | Sahipsiz plan maddeleri (02 §5.6/5.7/5.8/5.10, 04 §4 FX, 10 §9) | Sonraki program; kod yok | varsayılan | varsayılan |
| KF-7 | Plan tanımına geçince kullanıcının gördüğü kapsam düşer | Kabul (doğru ölçüm; veri kaybı yok) | varsayılan | varsayılan |
| KF-8 | Yayın | Bütün FIX kartları yerel; push/merge/deploy ayrı onay | varsayılan | varsayılan |
| KF-9 | Ardışık aynı tür ≤2 kuralı gramere de uygulansın mı | Evet | varsayılan | varsayılan |

## Taban (FIX-00 doldurur)

| Ölçü | Değer |
|---|---|
| tests/kao | 14/14 |
| tests/app | 77/77 |
| tests/panel · panel-v2 · quran | 23/23 · 27/27 · 9/9 |
| kao-sim 120 g: iki yönlü lemma / kod bilinen / plan bilinen | 0 / 524 / 0 (codeCoveragePct 77.42 · grammarMax 4 · maxSameTypeRun 4) |
| Yayın pini | `20260926b` (`quranPhonicsV1` ayrı: `20260924b`) |
| app.js satır | 7.798 / 7.800 |
| fx2 pinleri | App 756 · onclick 393 · v3 556 · surface 594 |

## Tuzaklar (kalıcı; yeni bulunan ≤2 satırla eklenir)

1. **Yayın pini 9 dosyada:** `index.html`, `sw.js` (`SW_VERSION`, `SW_OFFLINE_VERSION='iip22-…'`), `tests/app/test_iip_22.js` (`release`), `test_v3_welcome.js`, `test_app_surface_{boot,domain,lifecycle,overlay}_boundary.js`, `test_header_celestial_timeline.js`. PIN-P ile hepsi birlikte.
2. **`tools/kao-content-freeze.mjs` JSON_SHA256:** `lexicon.verified.json`, `grammar/phonics.verified.json` ya da (FIX-04 sonrası) `surahs.verified.json` her değiştiğinde güncellenir. Güncellenmezse `--freeze-*` kırılır (O-4'ün kök nedeni).
3. **Git dışı girdiler:** `kuran-ogreniyorum/content/inputs/*` ve `lexicon.reference.json` yalnız bu makinede var. Başka makinede içerik promptları (01, 04, 05, 14) çalışmaz, dur.
4. **fx2 yorum tuzağı:** Yorumda `App.kao…=` ya da tıklama niteliği adı yazma.
5. **QAC `lemmaBw` bağlam şeddesi taşır** (`r~aHiym`); başlık Arapçası ve DİA buradan türer (FIX-05).
6. **Paralel oturumlar** aynı repoda çalışabilir (denetimde `58e0ceb` böyle geldi). Senin olmayan kirli dosyaya dokunma.
7. **`--import-md` `importedAt`'i değiştirir**, bu `lexicon.verified.json` hash'ini değiştirir → tuzak 2. Değişince `node tests/kao/test_kao_freeze_repro.js` kırmızı olur (FIX-01).
8. **`tools/fixture-map-build.mjs` `tests/kao`'yu taramaz** (FAMILIES'te yok); KAO fixture'ları FIXTURE-MAP'te görünmez.
9. **Parti D = 29 Fâtiha + 158 `ls_` + 32 `lp_`** (lp = Diyanet dua anlamı; quran.com referansı yok → kopya denetimi yok). `counts`'ta ek `invalid` (doğrulayıcı/tarih/biçim) de exit 1 verir.
10. **`surahs.verified.json` FIX-03'te doğar** (FIX-02'de üretilip silindi); `--surah-import` satırlar aynıysa `importedAt`'i korur (hash sabit).
11. **Kopya kapısı tek karşılıklı kelimede eş anlamlı ister;** A'da seçilenler: `Allah Teâlâ`, `Kadr`, `melâike`, `sen oku`, `asla` (kellâ), `o Kitap`/`kitabın`. B–D'de aynı karşılıkları kullan (tutarlılık).

## Cihaz kabulü (yalnız kullanıcı verir)

- R-C9b (≤90 sn oturuma başlama, gerçek dokunma), DOC04-§4f (%200 metin, 320 px), O-9 sonrası Arapça yazı tipi (FIX-13), VoiceOver.

## Sonraki program adayları (FIX-18 doldurur)

- —
