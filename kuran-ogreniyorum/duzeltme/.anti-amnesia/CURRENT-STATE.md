# KAO-FIX · Güncel durum (anti-amnesia — her prompt sonunda güncellenir)

**Durum:** `active` · **Sıradaki:** **KAO-FIX-21** · **Aktif:** — · **Engel:** —
**Dal:** `kao-duzeltme` (FIX-00 açtı; `origin/kao-duzeltme` de var) · **Taban:** `main` @ `58e0ceb` · **Yayın:** `main`=`eceee66` (FIX-18 yalnız belge, Pages run 36320233598 success; canlı pin `20260926m`; index.html, sw.js, quranLearn.js canlı=repo; araç/belge Pages'te yayımlanmaz); kullanıcı her karttan sonra canlıya almayı istiyor
**Güncelleme:** 2026-09-27 · KAO-FIX-20 done (KF-11 gzip 160 KiB, KF-12 `eighty` %75; pin `20260927a`); sırada FIX-21…26 (KF-6 şimdi uygula), en son FIX-19

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
| KAO-FIX-03/D | K-1, Y-3 | done | `9f9163c` | Fâtiha 29 + tamamlayıcı 190; import 837/837, copy 0, language 0 |
| KAO-FIX-04 | K-1, Y-3 | done | `0ac1837` | dondurma + atıf + pin `20260926c`; kopya 618→0, İngilizce 26→0 |
| KAO-FIX-05 | Y-4, D-6 | done | `b1d081c` + ek `2ad2a4c` | şeddeli başlık 26→0 (+17 tamamlayıcı), DİA çift 26→0, D-6 belgeli istisna; `m~a$a` → not ile kalır (kullanıcı kararı) |
| KAO-FIX-06 | Y-2 | done | `7ef9f6e` + durum `50afcc2` | iki yönlü kart; sim 365 g iki yön 524/524, plan bilinen 0→505 |
| KAO-FIX-07 | Y-1 | done | `70b7dbc` | bilinen = iki yönde review∧s≥21; sim kod=plan 505; M10 YAKALANDI |
| KAO-FIX-08 | O-1 | done | `f021e8a` | lastDistractors cevapta yazılır (lemma kimliği), lemma düzeyinde dışlama |
| KAO-FIX-09 | O-2 | done | `5413819` | KF-10: budama yok, 100 KB sınırı kaldırıldı; koruma testi |
| KAO-FIX-10 | O-3 | done | `5ccf5db` | kaoMilestoneCheck + isSettled; sim 4 taş dolu; eighty tavan %77,42 (FIX-16) |
| KAO-FIX-11 | O-5 | done | `6f2726b` + ek `b6754ff` | 3 test; mutasyon 17/17 (M16/M17 eklendi) |
| KAO-FIX-12 | O-6 | done | `7a1ee1e` | E7 `kao-sources`: ses manifestten, metin modül ATTRIBUTION’dan, ts-fsrs MIT başlıktan; düz `<a>`; App 756/onclick 393 aynı |
| KAO-FIX-13 | O-9 | done | `a7b6ffe` | `.kao-arabic-text,.kao-dialog [lang="ar"]` yığın + `letter-spacing:normal`; çıplak `[lang="ar"]` yok (tuzak 20); cihaz bekliyor |
| KAO-FIX-14 | O-7 | done | `5330698` | D-12: 79 incelendi, 70 kümede, 9 alan dışı dışlandı; `SEM_NEIGHBOR_REVIEW` + `--sem-verify`; modül `SEM_GROUPS`; `KAO_SEMANTIC_CLUSTERS` 0; sim kod=plan 506 |
| KAO-FIX-15 | D-2, D-5 | done | `cbeef96` | KF-9 gramer dahil ≤2 (tıkanınca oturum kısalır); KF-3 kod 4; `durable30`=isSettled(s≥30) soldurma; `errorClass:'cognate'`; sim maxRun 4→2, kod=plan 510 |
| KAO-FIX-16 | O-8, D-1, D-3 | done | `1664f57` | 05 §1/§2/§5/§6, 06 §5, 02 §2.4, README; `deliverables/KAO-KAPANIS-EK-1.md`; bağlantı 44/0 kırık; `eighty` açık karar olarak EK-1'de |
| KAO-FIX-17 | O-11 | done | `7f74842` | KAO dosya kümesi → önek (taban `58e0ceb` sonrası FAIL, öncesi WARN: a9fa40c, ecc7ac7); `(ek)`/P00/Dn önekleri de tanınır; `--commits`; findings gerekçesiz WARN (D1/D5/D6); öz-test 19/19 |
| KAO-FIX-18 | D-4 | done | `eceee66` | 7/7 durum satırı: 02 §5.3 uygulandı (FIX-15); §5.6, §5.8, §5.10 uygulanmadı; §5.7, 04 §4 FX, 10 §9 kısmen — kalanlar sonraki program (KF-6) |
| KAO-FIX-20 | KF-11, KF-12 | done | (commit sonrası) | kararlar: gzip 160 KiB, `eighty` eşiği 0,75 + etiket |
| KAO-FIX-21 | 02 §5.6 | todo | | "bağ kur" görevi: 5 yeni kelimede bir, Türkçe türev (`cognate.tr`) seçimi; yeni handler yok |
| KAO-FIX-22 | 02 §5.7 | todo | | hata ağırlığı (zayıf sınıf kuyrukta öne) + "en çok karıştırdıkların" satırı |
| KAO-FIX-23 | 02 §5.8 | todo | | niyet önerisi: namaz vaktine bağlı zamanlı hub metni (bildirim yok) |
| KAO-FIX-24 | 02 §5.10 | todo | | haftalık aktarım testi: görülmemiş ≥%95 âyette çeviri seçimi, başarı ölçümü |
| KAO-FIX-25 | 04 §4 | todo | | FX: haptik + doğru sesi, countUp, konfeti (taş), `.sey-enter`; kendi kapıları |
| KAO-FIX-26 | 10 §9 | todo | | kova B/C algı doğruluğu raporu + "Yakın" öz-değerlendirme oranı |
| KAO-FIX-19 | hepsi | todo | | kapanış regresyonu (FIX-20…26'dan **sonra**; tüm kodu kapsar) |

Durum değerleri: `todo` · `active` · `done` · `blocked` (Engel satırına neden) · `partial` (parti yarım).

## Kararlar (FIX-00 kaydeder; kullanıcı değiştirmedikçe varsayılan geçerli)

| Kimlik | Soru | Varsayılan | Karar | Kaynak |
|---|---|---|---|---|
| KF-1 | Kısa sûre, Fâtiha ve tamamlayıcı anlamları | Kendi Türkçe katmanımız (D-12 YZ doğrulama); quran.com yalnız kopya-denetim referansı | varsayılan | varsayılan |
| KF-2 | Belgelenmemiş bütçe aşımları | Ölçülen değerler plana tavan olarak yazılır: quranLearn.js ≤1.900 satır, kao.css ≤42 KB, 4 modül ham ≤480 KB; bölme sonraki program | varsayılan | varsayılan |
| KF-3 | Oturum başına gramer üst sınırı | 4 (kod kalır, plan 4'e güncellenir) | varsayılan | varsayılan |
| KF-4 | 02 §2.4 "12–16 görev" ↔ 05 §6 | 05 §6 bağlayıcı; 02 §2.4 "tipik hedef" notu | varsayılan | varsayılan |
| KF-5 | Sözlük örneklerindeki vakıf işaretleri (377 örnek) | Sadeleştirme kabul, D-02'ye not (okuyucu işaretleri korur) | varsayılan | varsayılan |
| KF-6 | Sahipsiz plan maddeleri (02 §5.6/5.7/5.8/5.10, 04 §4 FX, 10 §9) | Sonraki program; kod yok | **şimdi uygula** (FIX-21…26) | kullanıcı, 2026-09-27 |
| KF-7 | Plan tanımına geçince kullanıcının gördüğü kapsam düşer | Kabul (doğru ölçüm; veri kaybı yok) | varsayılan | varsayılan |
| KF-8 | Yayın | Bütün FIX kartları yerel; push/merge/deploy ayrı onay | varsayılan | varsayılan |
| KF-9 | Ardışık aynı tür ≤2 kuralı gramere de uygulansın mı | Evet | varsayılan | varsayılan |
| KF-11 | R-C5 içerik gzip bütçesi (ölçülen 162.177 B > 130 KB) | karar bekliyor | **160 KiB** (içerik değişmez) | kullanıcı, 2026-09-27 |
| KF-12 | `eighty` kilometre taşı (tavan %77,42 < %80) | karar bekliyor | **eşik %75**, etiket "%75 kapsam", anahtar aynı | kullanıcı, 2026-09-27 |
| KF-10 | `daily` 90 gün budaması ve 100 KB durum bütçesi (05 §2, STATE `stateBudgetKB`) | budama + 100 KB | **budama yok, sınır kaldırıldı** | kullanıcı, 2026-09-26 |

## Taban (FIX-00 doldurur)

| Ölçü | Değer |
|---|---|
| tests/kao | 14/14 |
| tests/app | 77/77 |
| tests/panel · panel-v2 · quran | 23/23 · 27/27 · 9/9 |
| kao-sim 120 g: iki yönlü lemma / kod bilinen / plan bilinen | 0 / 524 / 0 (codeCoveragePct 77.42 · grammarMax 4 · maxSameTypeRun 4) |
| Yayın pini | `20260926b` taban → **`20260927a`** (FIX-20) (`quranPhonicsV1` ayrı: `20260924b`) |
| app.js satır | 7.798 / 7.800 |
| fx2 pinleri | App 756 · onclick 393 · v3 556 · surface 594 |

## Tuzaklar (kalıcı; yeni bulunan ≤2 satırla eklenir)

1. **Yayın pini 9 dosyada:** `index.html`, `sw.js` (`SW_VERSION`, `SW_OFFLINE_VERSION='iip22-…'`), `tests/app/test_iip_22.js` (`release`), `test_v3_welcome.js`, `test_app_surface_{boot,domain,lifecycle,overlay}_boundary.js`, `test_header_celestial_timeline.js`. PIN-P ile hepsi birlikte.
2. **`tools/kao-content-freeze.mjs` JSON_SHA256:** `lexicon.verified.json`, `grammar/phonics.verified.json` ya da (FIX-04 sonrası) `surahs.verified.json` her değiştiğinde güncellenir. Güncellenmezse `--freeze-*` kırılır (O-4'ün kök nedeni).
3. **Git dışı girdiler:** `kuran-ogreniyorum/content/inputs/*` ve `lexicon.reference.json` yalnız bu makinede var. Başka makinede içerik promptları (01, 04, 05, 14) çalışmaz, dur.
4. **fx2 yorum tuzağı:** Yorumda `App.kao…=` ya da tıklama niteliği adı yazma.
5. **QAC `lemmaBw` bağlam şeddesi taşır** (`r~aHiym`); başlık Arapçası ve DİA buradan türer (FIX-05).
6. **Paralel oturumlar** aynı repoda çalışabilir (denetimde `58e0ceb` böyle geldi). Senin olmayan kirli dosyaya dokunma.
7. **`--import-md` `importedAt`'i değiştirir**, bu `lexicon.verified.json` hash'ini değiştirir → tuzak 2 (FIX-04'ten beri `surahs.verified.json` da pinli). Değişince `node tests/kao/test_kao_freeze_repro.js` kırmızı olur (FIX-01).
8. **`tools/fixture-map-build.mjs` `tests/kao`'yu taramaz** (FAMILIES'te yok); KAO fixture'ları FIXTURE-MAP'te görünmez.
9. **Parti D = 29 Fâtiha + 158 `ls_` + 32 `lp_`** (lp = Diyanet dua anlamı; quran.com referansı yok → kopya denetimi yok). `counts`'ta ek `invalid` (doğrulayıcı/tarih/biçim) de exit 1 verir.
10. **`surahs.verified.json` FIX-03'te doğar** (FIX-02'de üretilip silindi); `--surah-import` satırlar aynıysa `importedAt`'i korur (hash sabit).
11. **Kopya kapısı tek karşılıklı kelimede eş anlamlı ister;** A'da seçilenler: `Allah Teâlâ`, `Kadr`, `melâike`, `sen oku`, `asla` (kellâ), `o Kitap`/`kitabın`. B–D'de aynı karşılıkları kullan (tutarlılık).
12. **Başlık biçimi `headwordBw` (FIX-05):** `readDraft` bayat taslağı normalize eder; `--draft` koşma (evidence/KAO-02'ye yazar, V8). `family` (286, `headwordAr`) ve `lexicon.workbook.md` de düzeltildi (FIX-05 ek, kullanıcı isteği).
13. **`introducedAt` artık `kaoAnswer` ilk cevabında yazılır (FIX-06);** öncesinde ana yolda yazılmadığı için R-A5 anlamsal aralık fiilen işlemiyordu. Veri 365 günde 394 KB → FIX-09.
14. **`isDurable` tek kalıcılık kuralı (FIX-07);** bilinen lemma iki yönde kalıcı. Mutasyon M04/M09 hâlâ KAÇTI → FIX-11.
15. **Veri bütçesi (FIX-09 → KF-10 kapandı):** sim 365 g `quranLearn` 241 KB (taban) → 394 (FIX-06, 2× kart) → 464 KB (FIX-08 `lastDistractors`). Kullanıcı: budama yok, sınır yok (`test_kao_state_budget.js` korur). FIX-16 kapanış ekine 05 §2 / `stateBudgetKB` istisnası yazılmalı.
16. **`eighty` taşı kazanılamaz (FIX-10):** token kapsamı tavanı %77,42 < %80 (plan LEM havuzu %80,9). FIX-16'da karar: eşik/ölçü hizası. `isSettled(card,minS)` tek kalıcılık kuralı; M10 `isDurable`'ı hedefler.
17. **İşlev kelimesi görevinde çeldirici yok (FIX-11 bulgusu):** kökü olmayan ~49 lemma × 2 yön tek şıklı (sözlük yedeği `root!==root` undefined'ı eler). Kullanıcı onayıyla düzeltildi (FIX-11 eki: katmanlı yedek + anlam çakışma süzgeci). `rsync --delete` hedefini daima doğrula (FIX-11 olayı).
18. **Süreç dersleri:** amend kancaya takılır → ayrı küçük commit at; durum betiğini commit'ten ayrı koş ve çıktısını gör; VM dizisini `Array.from` ile karşılaştır; `kaoStart` gerçek saati kullanır (test vadeleri geçmişte olmalı). Yayın düzeni: ff `main` → Pages izle → canlı `cmp`.
19. **E7 kaynaklar (FIX-12):** içerik atfı modül `ATTRIBUTION.sources`’tan okunur (kaynakta URL yazılmaz, test yasaklar); ses satırları `KAO_AUDIO_SOURCES` = `audio-manifest.json` (test eşler).
20. **`kao.css` global yüklenir (FIX-13):** çıplak `[lang="ar"]`/genel seçici yazma — `styles.css`’ten sonra geldiği için eşit özgüllükte diğer yüzeyleri (`.iip17-arabic` vb.) ezer; KAO seçicileri `.kao-dialog` ya da `kao-` sınıfıyla kapsanır (test korur).
21. **R-A5 komşuları (FIX-14):** karar `tools/kao-lexicon-build.mjs` `SEM_NEIGHBOR_REVIEW`’da; `--import-md` ve `--sem-verify` uygular, incelenmemiş kök önerisi `--freeze`’i durdurur. İçerik gzip 162.177 / tavan 163.840 (`test_kao_user_tasks.js`): pay ~1,6 KB — içerik büyüten kart önce ölçsün.
22. **Kuyruk KF-9 (FIX-15):** ardışık aynı tür ≤2 gramer dahil; salt gramer kalınca kuyruk durur (oturum kısalır, kabul). Soldurma `task.durable30` (isSettled s≥30) ister — fixture kartı açıkça review s≥30 kurmalı; `isNew:false` yetmez.
23. **plan-check önek kuralı (FIX-17):** `app/core/quranLearn.js`, `kao.css`, 4 içerik modülü, `tools/kao-*.mjs`, `tests/kao/**`, `assets/kao/**`'e dokunan commit konusu `KAO-FIX-NN:` / `KAO-FIX-NN (ek):` olmalı; numarasız `KAO-FIX:` yalnız `duzeltme/` belgeleri için (aksi FAIL).

## Cihaz kabulü (yalnız kullanıcı verir)

- R-C9b (≤90 sn oturuma başlama, gerçek dokunma), DOC04-§4f (%200 metin, 320 px), O-9 Arapça yazı tipi (FIX-13 kodda, **cihazda bekliyor**: iOS’ta yığındaki fontlar yüklü değil, sistem yedeği), VoiceOver.

## Sonraki program adayları (FIX-18 doldurur)

KF-6 (varsayılan): kod yok, sonraki programda. Durum satırları plan belgelerinde.
- 02 §5.6 "bağ kur" görevi (5 yeni kelimede bir, Türkçe türev seçimi) — yeni görev türü + kuyruk + fixture.
- 02 §5.7 hata taksonomisi → kuyruk ağırlığı + "en çok karıştırdıkların" satırı (sayaçlar zaten var).
- 02 §5.8 niyet önerisi (namaz vaktine bağlı zamanlı hub metni; REM dondurulmuş, bildirim yok).
- 02 §5.10 haftalık aktarım testi (görülmemiş ≥%95 âyette çeviri seçimi; E9 aday seçimini yeniden kullanır).
- 04 §4 FX: `SeyHaptics.tap`, `SeyAudio.tap`, `SeyFx.countUp`, konfeti (6 taş), `.sey-enter` — fx-coverage + cihaz kabulü.
- 10 §9 kova B/C algı doğruluğu raporu + "Yakın" öz-değerlendirme oranı (kalıcı alan gerekir).
- Diğer ertelenenler: `quranLearn.js`/içerik bölme (KF-2), kısa kart anahtarları (FIX-15 m.6); kullanıcı kararında: gzip bütçesi, `eighty` eşiği.
