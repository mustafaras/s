# KAO2-FIX · Bağımsız kapanış denetimi (denetim-2)

**Tarih:** 2026-10-06 · **Denetlenen:** `main` = `origin/main` = `36015f08` (FIX-STATE `baseCommit` `07802fa6` → HEAD, 128 commit)
**Denetçi:** programı uygulayan oturumlardan bağımsız bir oturum. Kayıtlardaki (KANIT, LEDGER, CURRENT-STATE, FIX-STATE,
kapanış belgesi) hiçbir iddia doğru kabul edilmedi; her sonuç kod, git geçmişi ve bu oturumda koşturulan araç çıktısına dayanır.
**Yöntem:** salt okur. Tarayıcı açılmadı, sunucu başlatılmadı, `mustafaras/seyma-data`'ya dokunulmadı. Mutasyon ve
TDD-öncesi koşuları yalnız scratchpad kopyalarında (`git archive`) yapıldı; çalışma ağacı değişmedi. Bu klasör dışında yazım yok.
**Yeniden üretme:** `node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs` (bugün 0/9 PASS · 9 FAIL; düzeltmeden sonra 9/9 beklenir).

---

## 1. Hüküm

Program **"tam ve kusursuz" değildir.** Kod tarafında denetimin dört kritik kusuru gerçekten kapanmıştır ve bunu kayıtlara
bakmadan, gerçek handler'larla kendim yeniden ürettim: sıfır kullanıcı 12 üniteyi gerçek ustalık oturumlarıyla geçip
`u1…u12` taşlarını kazanıyor ve "Tüm üniteler tamam ✓"a ulaşıyor; başarısız ustalık onarıma, onarım yeniden ustalığa
dönüyor; v1 kullanıcısı "Şimdilik atla" ile Ünite 4'e ilerliyor; 109 dersin 78 gramer görevi denetimin **gevşetilmemiş
özgün** kâhiniyle 0 kusur veriyor; 12 S0 dersinin 12'si çökmeden 4 aşama + 7–8 puanlı soru ile tamamlanıyor.
`kapilar.sh` bu konteynerde **tamamlandı** (11 dk 48 sn); yalnız makineye bağlı göreli p95 bandı kırmızı, aynı süreçte
taban commit'le A/B oranı +%11–14 (bandın içinde). Buna karşın üç ciddi sorun var:

1. **Protokol çekirdeği tutmadı ve denetimin süreç bulguları programın kendisinde tekrarlandı.** 44 prompt için
   126 önekli + 2 öneksiz = 128 commit (44 promptun 28'inde ek commit; tek commit'le kapanan yalnız 16), 21 plan dışı yayın pini (yalnız K2F-18/43'e izin vardı), `main`
   geçmişinin yeniden yazılıp force-push edilmesi (kullanıcı onaylı ama P5 yasağı), en az üç oturumda birden çok prompt
   (35–37, 38–39, 40–43), kapsam dışı uygulama/panel-v2 CSS commit'i (`8bf8f658`, öneksiz) ve kendi hatalı önekini geçirmek
   için genişletilen plan-check kapısı (`5b267dde`). M-05 (tek commit), M-07 (bayat CURRENT-STATE) ve M-12 (incelmiş yayın
   kanıtı) bu programda **yeniden** oluştu.
2. **Son kapı (K2F-43) protokole uymadı.** YAYIN-2 onayı kapanış özeti sunulmadan önce verilmiş genel bir talimattan
   ("…sonra da canlıya al") **çıkarıldı** ("YAYIN-2 onaylı sayıldı"); LEDGER'da GATE kaydı yok; K2F-43 KANIT.md yok;
   K2F-42 ile K2F-43 commit'leri arasında 1 dakika var; pin sonrası tam kapı koşulmadı; `20261006a…e` beş yayının hiçbirinde
   canlı bayt eşitliği doğrulanmadı. Denetimin K5-04'te eleştirdiği "çıkarımla onay" kalıbı L1 metin onayında da sürdü:
   158 metnin kutularını kullanıcı değil Claude işaretledi (kullanıcı devriyle, kayıtlı), veri ise `by:"owner"` yazıyor ve
   CLAUDE.md/AGENTS.md hâlâ "L1 onayı kullanıcıda" diyor.
3. **Doğrulama zincirinde zayıf halka + yeni kullanıcı kusuru.** R-01 kontrolü (hem `tekrar-uret.cjs` hem kalıcı
   `test_kao2_denetim.js`) başarısız ustalıkta da PASS veriyor — `masteryAt` yazımını kaldıran mutasyon R-01'i
   kırmıyor (koruma yalnız `test_kao2_mastery.js`'te). K2F-11'in yeni "Kelime dizme" yolu aynı etiketli iki çip üretiyor
   (u08.02, g16-k2): kullanıcı görünürde doğru sırayı seçince "yanlış" sayılıyor ve FSRS'e hata yazılıyor.

**Bulgu sayıları (49 eski bulgu, kod + belge):** KAPANDI 32 · KISMEN 7 · YALNIZ BELGE 7 · KAPANMADI (tekrarladı) 3 ·
DOĞRULANAMADI 0. **44 prompt:** geçti 17 · kısmen 21 · kaldı 6. **Yeni bulgular:** 12 (kritik 0 · yüksek 2 · orta 4 · düşük 6).

---

## 2. Ölçüm tablosu (kayıt ↔ bu denetimin ölçümü)

| Ölçüm | Kayıttaki değer | Ölçtüğüm | Yöntem | Uyum |
|---|---|---|---|---|
| `App.kao*` handler | 45 | **45** (tekil 45, hepsi P8 shim biçimi) | `app.js` `App.(kao…)=function` | ✓ |
| App yüzeyi (app.js) | 766 | **766** | `test_app_surface_daily_boundary` kalıbı | ✓ |
| `App.x=function` atama | 604 | **604** | aynı | ✓ |
| `onclick` sayacı | 393 | pin testleri (fx2 ×3, v3_welcome) **PASS** | `kapilar.sh` | ✓ (bağımsız sayım yapılmadı) |
| Yeni handler'lar | K2F-12/16/30 | `app.js` yalnız `f7e9eaf2`, `77f63542`, `4ce74803`'te değişti; her biri tam +1 (`kaoS0`, `kaoSetIntent`, `kaoToggleAutoAdvance`) | `git log -- app.js` + öncesi/sonrası küme farkı | ✓ |
| Yayın pini | `20261006e` | `index.html` 17 varlık, `sw.js` `SW_VERSION='20261006e'`, `SW_OFFLINE_VERSION='iip22-20261006e'`, `sw.js` 18 başvuru, `panel-v2.html` 1, `test_iip_22` `release` | grep | ✓ |
| İçerik gzip(9), 5 modül (test kapsamı) | 183,5–184,2 KiB | **184,194 KiB** ≤ 256 | `zlib level 9` | ✓ |
| Eski 4 modül gzip(9) | "≤164" (PROMPTLAR P6) | **164,69 KiB** (168.643 B) — **164'ü aşıyor**; tavan K2F-09'da kullanıcı kararıyla 176'ya çıkarıldı (LEDGER seq 24) | aynı | kayıtlı sapma |
| Müfredat gzip(9) | ≤48 | **19,50 KiB** | aynı | ✓ |
| Runtime `quranLearn*` gzip(9) | K2F-40 KANIT 115,991 · CURRENT-STATE 115,478 / 116,270 | **117,280 KiB** ≤ 128 (aynı değeri kabul testi A-10 da ölçtü; K2F-40 öncesi/sonrası değişiklik yok) | aynı | tavan içinde; **kayıttaki sayılar tutarsız** |
| `kao.css` gzip(9) | 13,027 KiB | **13,027 KiB** ≤ 14 | aynı | ✓ |
| `texts.tr.json` inceleme düzeyi | "draft kalmadı (158 sourced)" | **sourced 158 · draft 0 · by: owner 158** | JSON yürüyüşü | ✓ (ama bkz. D2-04/K5-04) |
| L2 kutuları | açık | **0/37 işaretli** (INCELEME-17/18) | grep | ✓ |
| `tekrar-uret.cjs` | 10/10 | **10/10** (çıkış 0) | koşuldu | ✓ (R-01 zayıf: D2-02) |
| `test_kao2_denetim.js` | 10/10 | **10/10** | koşuldu | ✓ (R-01/R-10 zayıf) |
| `kapilar.sh` | K2F-38…43'te "tamamlanmadı" | **tamamlandı, 11 dk 48 sn, çıkış 1**: yalnız `test_kao2_kabul.js` + `test_kao2_perf_budget.js` kırmızı (göreli p95); diğer tüm kapılar PASS; ağaç temiz kaldı | koşuldu | bkz. §5 |
| Kabul A-1…A-10 | 10/10 | `KAO2_ACCEPT_SLOW_HOST=1` ile **10/10**; A-9 189/189 dosya çıkış 0 | koşuldu | ✓ |
| perf göreli bant | "A/B 1,10–1,13" | best3 oranı **1,111 / 1,139**, p50 1,169 / 1,170 (iki koşu); mutlak: cari 15,65 ms vs taban dosyası 4,07×1,25 | `perf-ab.cjs` cari vs `git archive 07802fa6` | bandın içinde |
| `tests/kao/README.md` envanteri | "37/37 = gerçek liste" | 54 test dosyasından **53**'ü; `test_kao_pronunciation_contract.js` yok | dosya listesi ↔ README | ✗ (D2-05) |
| CLAUDE.md ↔ AGENTS.md | aynı | KAO, KAO2, KAO2-FIX satırları **birebir aynı**; KAO-FIX satırı farklı ama farkı program öncesinden (`07802fa6`'da da farklı) | md5 | ✓ |

---

## 3. 49 bulgu — koddan doğrulama (C)

Not: Kapanış belgesindeki "49/49 kaynak/test ✓" damgası bulgu → prompt → KANIT eşlemesinden üretilmiş bir tablodur; tek tek
doğrulama içermiyor. Aşağıdaki her satır bu oturumda ayrıca ölçüldü. Komutlar §9'da.

| Bulgu | Durum | Commit(ler) | Tek cümle kanıt |
|---|---|---|---|
| K4-01 | **KAPANDI** | d08c03c1, b44741a6, 7906b071, dd8df117 | Gerçek handler'larla 12 ünite: `path.units['1'…'12'].masteryAt` dolu, taşlar u1…u12, son adım "Tüm üniteler tamam ✓"; kaldı → `repair` → yeniden `mastery` → `next-unit`; v1: mastery 1→2→3 atla → `next-unit:u04.01`. `test_kao2_mastery.js` `masteryAt` mutasyonunu yakalıyor. **R-01 ise yakalamıyor (D2-02).** |
| K4-02 | **KAPANDI** (yeni yan kusur D2-01) | c88883d3, d8da9ac2, 75ff3e94, 76a5b338 | Denetimin K2F-11'den önceki (gevşetilmemiş) R-03 kâhini yalnız yürüyüşçü düzeltilerek koşuldu: 78 gramer görevi, 0 kusur; 24 tür örneği elle okundu, "el +" yalnız g1'de. |
| K5-01 | **KAPANDI** | bdd761be (+075abf1e, 5b1dbd60) | `start:'s0'` kullanıcıda Bugün birincil düğmesi `App.kaoS0("start","s0.01")`; 12 dersin hepsi `path.lessons[id].doneAt` yazıyor; `besmele` yalnız s0.12 sonunda. |
| K5-02 | **KAPANDI** | f7e9eaf2, 52b2a9ea, eeb239cf, bdd761be | (i) shim var, kaldıran mutasyonu R-05 yakalıyor; (ii) `kaoS0('start')` → görünüm `s0`; (iv) 12/12 çökmesiz; (v) aşamalar intro/listen/drill/read, ders başına 18–20 farklı HTML, 7–8 soru, `drill` bitmeden `next` pasif. (iii) Keşfet satırı yalnız testle (`test_kao2_s0`) doğrulandı. |
| K5-03 | **KISMEN** | 1b1791a8…c21d76d3, f212835e, d75b6384 | 10 dersin başlık/hedefi G2 kararıyla dersin kelimelerine göre yeniden yazıldı (yeniden dağıtım değil yeniden adlandırma); u09.01 "Emir kipi: an, ye, ver, bağışla" ama tanış kartı anlamları geçmiş zaman ("andı", "yedi", "verdi") — emir yalnız örnek âyette (D2-10). |
| K5-04 | **KISMEN** | e777efad, b1e87886 | `sourced ⇔ işaretli kutu` sağlanıyor (158 sourced, `review_apply` testi), ama kutuları kullanıcı değil Claude işaretledi (LEDGER seq 64–65 "kullanıcı devri"); veride `by:"owner"`. Bulgunun özü ("L1 insan incelemesidir") karşılanmadı, yalnız açıkça kayda geçti. |
| M-01 | **KISMEN** | 06a47e63 | `DUZELTME-NOTU.md` doğru; ama CLAUDE.md/AGENTS.md KAO2 satırı "L1 (proje sahibi) ve L2 (alan uzmanı) onayı kullanıcıda" diyor, veride L1 158/158 tamam → yeni çelişki (D2-04). |
| M-02 | **KAPANDI** | f026aebd, 7cecaaad | A-5 20 kısa sûrenin 20'sinde tanıtımı render ile ölçüyor (koşum: 20/20). |
| M-03 | **KAPANDI** | f026aebd | `texts.tr.json` `surahs` boş; `contextTr` yalnız araçta bir yorumda. |
| K2-01 | **KAPANDI** | 2afd6830 | `kao-header` yok, tek NavBar, X yok, `aria-labelledby` hedefi var; Ayarlar'da "Ayarlar" NavBar + eyebrow'da (2), h2 "Öğrenme ayarların". |
| K2-02 | **KAPANDI** | 980f8466 | Ayarlar: 6 `.kao-switch-track`, 6 `role="switch"`, `kao-toggle` 0, "X: açık" metni 0. |
| K2-03 | **KAPANDI** | f4c256c7 | `kaoTaskHTML` şıkları `Views.choice`'tan; K2F-40 öncesi/sonrası **6.905 HTML dökümü bayt-eşit** (bkz. §6 E-1). S0 alıştırma şıkları ayrı kopyada kalıyor (KANIT'ta not). |
| K2-04 | **KAPANDI** | 7cecaaad | A-4 9 durumu beklenen türle + 12 ünite simülasyonunu ölçüyor (koşum 9/9). |
| K2-05 | **KAPANDI** | 7cecaaad, 2745075c | A-3 66 yüzey ölçüyor (koşum); a11y matrisi testi yeşil. |
| K2-06 | **KAPANDI** | 4ce74803 | Ayarlar "Öğrenme" grubunda "Doğruda otomatik geç" switch'i, `App.kaoToggleAutoAdvance`. |
| K2-07 | **KAPANDI** | 2afd6830, c1798334 | `kao-header`/`kao-toggle` seçicisi `kao.css`'te yok. |
| K3-01 | **KAPANDI** | eefb1b8b, 9dd6cc12 | R-08 0/109 içeriksiz; önceki kodla `test_kao2_lesson_flow` kırmızı ("u02.02: uygula adımı içeriksiz"), kendi koduyla yeşil. |
| K3-02 | **KISMEN** | 3bdef17d, 38f7bdbb, 867aca6f | Namaz kelimelerinin 19/32'si lemmaya bağlı; bulgunun andığı salât (`va-al-salavâtu`), ʿabd (`ʿabduhu`), ʿibâd hâlâ bağsız (bilinçli muhafazakâr kural, `NAMAZ-ESLEME-L2.md`). |
| K3-03 | **KAPANDI** | a3b74823, 51d8f505 | Ders oynayınca `daily[gün].ms` yazılıyor; dakika görev sayısından ve onboarding süresiyle sınırlı. |
| K3-04 | **KAPANDI** | c1798334 | `kao.css` 397 sınıfın 10'u JS'de düz metin geçmiyor, 10'u da dinamik önekli (KANIT'taki 10 ile aynı). |
| K3-05 | **KAPANDI** | 77f63542 | `kaoHubCardHTML` niyet varsa "Niyet önerisi" (`quranLearn.js:3585`); önceki kodla `test_kao2_hub` kırmızı, sonra yeşil. |
| K3-06 | **KAPANDI** | 77f63542 | R-07; okumayı `settings.intent`'e geri çeviren mutasyonu hem `tekrar-uret` hem `test_kao2_denetim` yakalıyor. |
| K3-07 | **KISMEN** | f212835e, 06a47e63 | Not doğru; ama canlı girdi klasöründeki `MUFREDAT-ESLEME.md` hâlâ "Tüm başlık ve vaatler taslaktır (`draft`)" ve "Karar bekleyen noktalar" + boş onay kutusu taşıyor (D2-11). |
| K3-08 | **YALNIZ BELGE** | 06a47e63 | `DUZELTME-NOTU.md` gerçek handler geçmişini veriyor (planlanan biçim). |
| K3-09 | **KAPANDI** | a3b74823, 113d0046 | Sıfır kullanıcıda "0 tekrar" yok; halka `%N`; onboarding testi başlığı gerçek sayı. |
| K4-03 | **KAPANDI** | d0a56bba…19f4d6ff | Ders görevinde NavBar 0, LargeTitle 0, `aria-label="Dersten çık"` 1, `role="progressbar"` 1. |
| K4-04 | **KISMEN** | 75ff3e94, 113d0046 | Ünite etiketi "5 / 23 kalıcı kelime · 0 / 5 ders" ✓, namaz taşı etiketi ✓, ardışık aynı `templateId` yok ✓; ama u01.02'de g1-k1 ve g1-k2 **birebir aynı görevi** (aynı uyaran, cevap, şıklar) bir görev arayla iki kez gösteriyor (D2-09). |
| K5-05 | **KAPANDI** | 6d1b5919 | Tanış kartında örnek âyet (ref ile) ve `<details>` "Neden böyle?". |
| K5-06 | **KAPANDI** | d26e568c | 8 okuma sorusunun 8'inde şık uzunluk bandı 0, doğru şık tek en kısa/uzun değil, konum 1/2/3 dağılmış; önceki kodla `test_kao2_onboarding` kırmızı. |
| K6-01 | **KAPANDI** | 7cecaaad | Kabul testi gerçek handler/render/alt süreç ölçüyor (A-9 189 dosyayı çalıştırıyor). Not: A-4 durum tablosunda `masteryAt` elle kuruluyor (12 ünite simülasyonu ayrıca gerçek yolu sürüyor); A-10 göreli bandı bayrakla atlanabiliyor. |
| K6-02 | **KAPANDI** | a97c63ed, 2745075c | Yığınsız `roots/s0/sources` doğru başlık; R-09 PASS; önceki kodla `test_kao2_view_resolution` kırmızı (KANIT). |
| K6-03 | **KAPANDI** | 980f8466, 4ce74803 | Grup sırası Günlük hedef · Ses · Okuma · Öğrenme · Gölgeleme · Görünürlük · Veri · Hakkında; "Başlangıç noktasını değiştir" var. |
| K6-04 | **KAPANDI** | 364de831 | Başlık "İlerleme", eski başlık yok, kalibrasyon `<details>` içinde; önceki kodla `test_kao2_progress` kırmızı. |
| K6-05 | **KAPANDI** | 32feeee0 | "Bu kelimenin dersi: Ünite 3 · Yaratmak ve gece" + `App.kaoNav('unit',3)`; önceki kodla `test_kao2_word` kırmızı. |
| K6-06 | **KISMEN** | 06a47e63 | Envanter 54 dosyanın 53'ü; `test_kao_pronunciation_contract.js` eksik (D2-05). |
| K6-07 | **KAPANDI** | c1798334 | `kao.css`'te tek `linear-gradient` NavBar'ın tek renkli katmanı (`--kao-bg`, iki durak aynı renk), sözleşme bunu bilerek ayırıyor. |
| K7-01 | **YALNIZ BELGE** | 6d1b5919 (seq 74), 06a47e63 | D-12 bilerek ertelendi; kodda yok (planlanan karar kaydı). |
| K7-02 | **YALNIZ BELGE** | 06a47e63 | D-21 kapsam dışı; kodda yok. |
| K7-03 | **KAPANDI** | 4ce74803 | Varsayılan `onboarding.minutes=5`, `settings.dailyNew=5`. |
| M-04 | **YALNIZ BELGE** | 06a47e63 | Not iki kart dışı commit'i doğru adlandırıyor. |
| M-05 | **KAPANMADI (tekrarladı)** | 06a47e63 | Not KAO2 geçmişini anlatıyor; ama "P4 kuralı" bu programda tutmadı: 44 prompt için 128 commit (§4). |
| M-06 | **YALNIZ BELGE** | 06a47e63 | `KAO2-STATE.json` bilerek değişmedi; not doğruları veriyor. Benzer bayatlık `FIX-STATE.json`'da (`branch: kao2-duzeltme`, "her prompt ayrı oturum") var. |
| M-07 | **KAPANMADI (tekrarladı)** | — | KAO2 için not düştü; KAO2-FIX'in kendi CURRENT-STATE'i kapanışta baştan yazılmadı, bayat satırlar taşıyor (D2-07). |
| M-08 | **YALNIZ BELGE** | 06a47e63 | Not doğru kimlikleri veriyor. |
| M-09 | **YALNIZ BELGE** | 06a47e63 | Not doğru; KAO2-FIX kapanışında da benzer iç çelişkiler var (§6 E-3, E-10). |
| M-10 | **KAPANDI** | 3491c785 | `kao-plan-check` PASS (127 commit, 1 WARN); not: araç `5b267dde` ile programın kendi hatalı önekini kabul edecek biçimde kalıcı genişletildi (D2-12). |
| M-11 | **KAPANDI** | 86a56267 | Kabul testi yazmıyor; `kapilar.sh` koşusu sonrası `git status` boş; koşulsuz yazımı geri koyan mutasyonu R-10 yakalıyor. Kalıp girintili yazımı kaçırıyor (D2-03). |
| M-12 | **KAPANMADI (tekrarladı)** | — | K2F-34 yayını (`dc9743f4`, pin `20261004c`) için YAYIN.md yok; `20261006a…e` beş yayının hiçbirinde canlı bayt eşitliği doğrulanmadı (D2-06). |
| M-13 | **KAPANDI** | c1798334 | `kao-audio-pending` 0 eşleşme. |

---

## 4. 44 prompt — protokol uyumu (D)

Sütunlar: **C** = prompt önekli commit sayısı · **Dokun dışı** = promptun Dokun listesi ve `kao2-duzeltme/` dışında değişen
dosyalar ve kaydı · **TDD** = KANIT'taki kırmızı; "✓✓" = kırmızıyı önceki kodla bu oturumda kendim de ürettim · **Yayın** =
`?v=` değişimi. Ortak sonuçlar (satırlarda tekrar edilmedi): her ana commit LEDGER + CURRENT-STATE + FIX-STATE'i birlikte
değiştiriyor (ek commit'lerin bir kısmı hariç); `app.js` yalnız K2F-12/16/30'da ve tek satır; `migrate()`/`var ui=`'ye,
`kaoSchedule`'a, ses kaydı koduna dokunulmadı (`kaoSchedule` gövdesi bayt aynı; `kaoBuildQueue`'ya K2F-10'un istediği tek
filtre eklendi); program diff'inde yorumda `App.<ad>=`/`onclick` yok (yalnız tarama dışı `tests/kao` yorumları); elle Arapça
içerik yok (yalnız test kalıpları, `tools` yorumunda harf listesi, araç çıktısı `MUFREDAT-ESLEME.md`).

| Prompt | C | Dokun dışı | TDD | Yayın | Sonuç ve kanıt |
|---|---|---|---|---|---|
| K2F-00 | 1 | taşıma (beklenen) | ölçüm | — | **Geçti** · K2F-00…05 tek oturum (seq 16'da kayıtlı) |
| K2F-01 | 1 | — | ✓ (self-test 23/29) | — | **Geçti** |
| K2F-02 | 1 | `quranLearnFlow.js` (seq 7 onaylı), `quranLearn.js` kapsam ötesi iki düzeltme (seq 16 geriye dönük) | ✓ | — | **Geçti** (kayıtlı sapma) |
| K2F-03 | 3 | index/sw/9 pin testi | mutasyon | 20260930m | **Kısmen** · plan dışı erken yayın (seq 10, kullanıcı isteği) |
| K2F-04 | 1 | — | ✓ | — | **Geçti** · R-10 kalıbı zayıf (D2-03) |
| K2F-05 | 3 | — | ✓ | — | **Kısmen** · `main` geçmişi yeniden yazıldı + `--force-with-lease` (seq 17, kullanıcının açık onayı; P5 istisnası) |
| K2F-06 | 1 | `test_kao_migration`, `test_kao_requirements` (aralık 12→30 gevşedi; seq 18) | ✓✓ | — | **Geçti** (kayıtlı sapma) |
| K2F-07 | 1 | README | ✓ | — | **Geçti** |
| K2F-08 | 3 | pin dosyaları, harness | ✓ | 20261001a | **Kısmen** · plan dışı yayın |
| K2F-09 | 3 | pin dosyaları, 3 bütçe testi | ✓ | 20261001b | **Kısmen** · 4 modül tavanı 164→176 (P6 tetiklendi, kullanıcı kararı seq 24), plan dışı yayın |
| K2F-10 | 3 | pin dosyaları, `test_kao_queue` (güçlendi) | ✓✓ | 20261001c | **Kısmen** · plan dışı yayın |
| K2F-11 | 6 | Views, kao.css, pin dosyaları, harness | ✓ | 20261001d, e | **Kısmen** · "ek düzeltmeler" + iki yayın; `tekrar-uret.cjs` R-03 kâhini değiştirildi (özgün kâhinle de 0 kusur — doğruladım); **D2-01 bu promptla geldi** |
| K2F-12 | 2 | P8 pin dosyaları + settings/word testleri | ✓✓ | — | **Geçti** (ek tur commit'i) |
| K2F-13 | 1 | kao.css | ✓ | — | **Geçti** |
| K2F-14 | 1 | `test_kao2_syllable_audio` | ✓ | — | **Geçti** |
| K2F-15 | 5 | Views, kao.css, pin dosyaları, 4 test | ✓✓ | 20261001f | **Kısmen** · 2 ek tur + yayın |
| K2F-16 | 1 | P8 pin dosyaları | ✓✓ | — | **Geçti** |
| K2F-17 | 1 | — | ölçüm | — | **Geçti** |
| K2F-18 | 2 | — (yayın dosyaları izinli) | — | 20261001g | **Geçti** · yanıt "onaylıyorum" (açık); P7'nin `waiting` commit'i/GATE'i yok, yalnız `closed` |
| K2F-19 | 4 | yeni araç + fixture + test | ✓ | — | **Kısmen** · 3 ek tur |
| K2F-20 | 3 | `curriculum.before-k2f20.json` | ✓ | — | **Kısmen** · GATE waiting/closed ✓; kabul "KNOWN_MISMATCH boş" sağlanmadı, G2 kararıyla K2F-21'e devredildi |
| K2F-21 | 2 | 12 dosya (motor, Flow, spec, test, araç) | ✓ | — | **Kısmen** · geniş Dokun dışı |
| K2F-22 | 3 | 14 dosya | ✓ | — | **Kaldı** · prompt "yalnız kullanıcının işaretlediği metinler"; kutuları Claude işaretledi (36 + 122), P7 GATE kaydı yok; veride `by:"owner"` |
| K2F-23 | 4 | pin dosyaları, harness | ✓✓ | 20261003a | **Kısmen** · ek tur + yayın |
| K2F-24 | 5 | pin dosyaları, MUFREDAT, review_apply | ✓ | 20261003b | **Kısmen** · 2 ek tur + yayın; L2 GATE (seq 71) açık |
| K2F-25 | 3 | pin dosyaları | ✓ | 20261003c | **Kısmen** · plan dışı yayın |
| K2F-26 | 5 | kao.css, pin dosyaları, 4 test | ✓ | 20261003d | **Kısmen** · 2 ek tur + yayın |
| K2F-27 | 1 | 3 test | ✓✓ | — | **Geçti** |
| K2F-28 | 4 | 3 test | ✓ | — | **Kısmen** · 3 ek tur |
| K2F-29 | 1 | kontrast aracı, requirements | **✗** | — | **Kaldı** · KANIT: "test uyarlamaları kod değişikliğinden sonra yapıldı (kırmızı-önce değil)" (P2.1) |
| K2F-30 | 1 | P8 pin dosyaları + 4 test | ✓ | — | **Geçti** |
| K2F-31 | 2 | 2 test | ✓ | — | **Geçti** (ek tur) |
| K2F-32 | 6 | kao.css, pin dosyaları | ✓✓ | 20261004a | **Kısmen** · yayın + 3 görsel QA turu |
| K2F-33 | 4 | kao.css, pin dosyaları | ✓✓ | 20261004b | **Kısmen** |
| K2F-34 | 2 | pin dosyaları | ✓✓ | 20261004c | **Kaldı** · yayın yapıldı, YAYIN.md/release-live.json **yok** (M-12 tekrarı) |
| K2F-35 | 11 | pin dosyaları, 3 test | ✓ | 20261005a, b | **Kaldı** · 11 commit; K2F-36 kapandıktan sonra yeniden açıldı (`52328c6a`…); 35–37 tek oturum (session_01W9P9…) |
| K2F-36 | 2 | — | ölçüm + mutasyon | (yalnız main) | **Geçti** |
| K2F-37 | 5 | KAO dosyaları (izinli), pin dosyaları | ✓ | 20261006a | **Kısmen** · 2 ek düzeltme + yayın |
| K2F-38 | 8 (+2 öneksiz) | pin dosyaları; **`8bf8f658`** ana uygulama `render.js`/`styles.css` + `panel-v2.css` (KAO2 dışı); **`5b267dde`** plan-check | yalnız CSS sözleşme mutasyonu | 20261006b, c | **Kaldı** · `65e94db2` "K2F-38 ek:" önek hatası; kapsam dışı commit; tam kapı koşulmadı |
| K2F-39 | 4 | pin dosyaları (panel-v2 dahil) | ✓ | 20261006d | **Kısmen** · "ara durum" commit'i + yayın; 38–39 tek oturum |
| K2F-40 | 1 | `test_kao_pronunciation_contract.js` (P6 yerine KANIT gerekçesi) | mutasyon | — | **Geçti** · döküm iddiası bağımsız olarak doğrulandı (§6 E-1) |
| K2F-41 | 1 | — | belge | — | **Kısmen** · README envanteri eksik (D2-05), CLAUDE/AGENTS L1 cümlesi çelişkili (D2-04) |
| K2F-42 | 1 | — | — | — | **Kısmen** · KANIT P11 bölümlerinin 5'i yok; `kapilar.sh` değil; kabul raporu `KAO2_EVIDENCE_OUT` ile üretilmedi; kapanış tablosu toplu |
| K2F-43 | 3 | CLAUDE.md, AGENTS.md (kapanış sonrası commit) | — | 20261006e | **Kaldı** · GATE yok, KANIT yok, onay çıkarımla, pin sonrası tam kapı yok, canlı bayt eşitliği yok |

**Oturum kuralı (BAGLAM §2):** Commit'teki `Claude-Session` satırı yalnız K2F-35'ten itibaren var. Kanıtlanan çok promptlu
oturumlar: 35–37 (`session_01W9P9…`, dal `claude/nifty-feynman`), 38–39 (`session_01DqMJ…`, `claude/laughing-cori`),
40–43 (`session_01SfmT…`, `claude/admiring-pasteur`). Kayıtlı olan yalnız 00–05 (seq 16). K2F-06…34 için oturum kimliği
yok; zaman damgaları (ör. K2F-12→19 arası 8–15 dk aralıklar) çok promptlu oturuma işaret ediyor ama **doğrulanamadı**.
KANIT'lar 35–42'de `Dal: kao2-duzeltme` değil oturum dallarını yazıyor (P1.2).

---

## 5. `kapilar.sh` ve perf (E-5, E-6)

`bash kao2-duzeltme/tools/kapilar.sh` bu konteynerde **tamamlandı** (gerçek 11 dk 48 sn, çıkış 1; `rsync` kuruldu, depo
tam geçmişte). Satırlar: 5 `node --check` PASS · tests/kao (54) FAIL: `test_kao2_kabul.js`, `test_kao2_perf_budget.js` ·
app 77 · panel 23 · panel-v2 27 · quran 9 · reminders · driver · zikr · kontrast · l2-paket · plan-check · sync **PASS** ·
tekrar-uret 10/10. İki kırmızının nedeni tek: `steady p95 15.650 ms exceeds baseline +25% (5.09 ms)`. Kabul testi
`kapilar.sh` içinde `KAO2_ACCEPT_SLOW_HOST` olmadan koştuğu için yalnız A-10 düşüyor; bayrakla tek başına 10/10.
A/B (`perf-ab.cjs`, cari ↔ `git archive 07802fa6`, aynı süreç, serpiştirilmiş 60 tur, iki koşu): best3 oranı 1,111 ve
1,139; p50 oranı 1,169 ve 1,170 → **+%25 bandının içinde**; konteyner taban dosyasındaki değere göre ≈1,9× yavaş.
Bu kırmızıyı bulgu saymıyorum; referans makinede bir kez koşulmalı. Not: K2F-38…43 kayıtları `kapilar.sh`'ın "bu
konteynerde tamamlanmadığını" söylüyor; benim koşum 12 dakikada bitti — betik kırmızı biterdi ama tamamlanabilirdi.

---

## 6. Bilinen sapmalar — kararlar (E)

| # | Sapma | Karar | Gerekçe |
|---|---|---|---|
| E-1 | K2F-40 `test_kao_pronunciation_contract.js`'e dokundu (Dokun dışı, P6 yerine KANIT gerekçesi); "18 döküm bayt-eşit" | **Kabul edilebilir** (protokol sapması küçük) | Değişiklik yükleme listesine `quranLearnViews.js` eklemek; assert kaldırılmadı. Dökümleri kendim ürettim: K2F-40 öncesi (`f4c256c7^`) ve HEAD ağaçlarında 109 dersin gerçek oynatımıyla 5.435 HTML (word / grammar-choice / grammar-order × cevapsız, doğru, yanlış) + tekrar kuyruğuyla 1.470 HTML (meaning, word, fragment-order, fragment-translate, 4 gramer türü) → **6.905/6.905 bayt-eşit**. `audio` türü sentetik ortamda üretilmedi (doğrulanamadı). |
| E-2 | K2F-40 sırasında paralel koşu sürerken `git stash` | **Doğrulanamadı / kayıtta yok** | LEDGER ve KANIT'ta K2F-40 için `stash` geçmiyor (yalnız K2F-35'te baseline ölçümü için). O koşunun güvenilirliği bilinmiyor; ancak bu denetimde HEAD üzerinde tam `kapilar.sh` ve kabul testi temiz koştu ve K2F-41…43 kodu değiştirmedi. |
| E-3 | K2F-41/42/43 tek oturumda; kapanış tablosu betikle | **Kusur** (orta) | Oturum 40–43'ü kapsıyor (§4). `DUZELTME-NOTU.md` iddiaları rapora göre doğru (M-01, M-04…M-09, M-12, K3-07, K3-08, K6-06, K7-01/02 satırları tek tek karşılaştırıldı); eksik: M-01 satırı L1'in yapay zekâ incelemesiyle yapıldığını söylemiyor, K3-07 satırının bayat dediği `MUFREDAT-ESLEME.md` düzeltilmedi, K6-06 "37 dosya" yalnız `test_kao2_*` sayıyor. |
| E-4 | K2F-43 kapısı: "canlıya al" | **Kusur** (yüksek, D2-06) | Prompt kapanış özetiyle açık "YAYIN-2 onaylı" ister; YAYIN.md onayı oturum başındaki talimattan çıkarıyor ("YAYIN-2 onaylı sayıldı"); P7 GATE kaydı yok; K2F-42 18:18 → K2F-43 18:19. |
| E-5 | `kapilar.sh` son promptlarda koşmadı | **Bu denetimde koşuldu** | §5: tamamlandı; tek kırmızı göreli perf bandı. |
| E-6 | perf göreli bant kırmızı | **Kabul edilebilir** | A/B best3 1,11–1,14 (§5). |
| E-7 | Yayın kanıtı; canlı bayt eşitliği | **Kusur** (orta, M-12 tekrarı) | Run ID ve ff-only her YAYIN.md'de var; K2F-03…33 yayınlarında "canlı N/N bayt-eşit" kaydı var (o oturumlar kullanıcı makinesinde koşmuş görünüyor, seq 11), K2F-35'te kullanıcı terminalinde 9/9; K2F-34'te YAYIN.md yok; `20261006a…e`'de bayt eşitliği **hiç doğrulanmadı**. Bu konteynerden `curl https://mustafaras.github.io/s/sw.js` → `CONNECT tunnel failed, response 403`. Kullanıcı komutu §8'de. |
| E-8 | `65e94db2` "K2F-38 ek:" ve diğer ek/yayın commit'leri | **Kusur** (orta) | 128 commit / 44 prompt; promptların 28'inde ek commit (yayın pini, yayın kaydı, "ek tur", "ara durum", kayıt düzeltmesi), yalnız 16'sı tek commit. Önek hatası kapıyı kırınca araç genişletildi (D2-12). |
| E-9 | CLAUDE.md/AGENTS.md KAO2 satırları; `tests/kao/README.md` | **Kısmen** | Satırlar birebir aynı ✓; ama içerik L1 durumunda yanlış (D2-04). README 53/54 (D2-05). |
| E-10 | CURRENT-STATE bayat satırlar | **Kusur** (orta, D2-07) | "Canlı gerçekler (araçla ölçüldü, 2026-10-03)", dal satırı `dc3f3f06`, "Kapılar (K2F-26 yayını sonrası): KAO 53", üç farklı runtime değeri, "CSS payı dar (≈0,39 KiB)", "Kalan kapı: K2F-43 YAYIN-2", "Oturum başlatıcı K2F-38", ve K2F-42 için "tam regresyon yeşil" (KANIT: `kapilar.sh` değil). P4.4 "baştan yaz" uygulanmamış. |

---

## 7. Yeni bulgular

| ID | Önem | Bulgu | Yeniden üret | Dosya:satır | Önerilen düzeltme (uygulanmadı) |
|---|---|---|---|---|---|
| **D2-01** | **yüksek** | "Kelime dizme" g16-k2 (2:24, u08.02) iki aynı etiketli çip (`تَفْعَلُوا۟` ×2) üretir; cevap `choiceId`/`ordinal` sırasıyla denetlendiği için görünürde doğru sıra, aynı görünen çipler yer değiştirince "Doğru cevap: …" ile **yanlış** sayılır ve FSRS'e hata yazılır. Geçerlilik kapısı "Kelime dizme"yi etiket tekilliği kuralından muaf tutuyor (K2F-10 adım 2 "şık etiketleri tekil" der). K2F-11'in getirdiği gerileme. | `tekrar-uret-2.cjs` N-01 | `app/core/quranLearn.js:1604-1607` (`kaoGrammarTaskValid` dizme dalı), `:2173` (`selected.ordinal===index`) | Sıra kontrolünü etikete dayandır (aynı etiketli çipler birbirinin yerine geçebilsin) ya da tekrar eden kelimeli örneği desteklenmeyen listesine al; test: aynı etiketli çip değişimi "Doğru". |
| **D2-02** | **yüksek** | R-01 kontrolü (`tekrar-uret.cjs` ve kalıcı `test_kao2_denetim.js`) `path.units` kaydı varsa PASS veriyor; kontrol ustalığı 0 puanla bitirdiği için kayıt hep başarısız denemedir. `masteryAt` yazımını kaldıran mutasyonda R-01 **PASS** kalıyor (ikisinde de); bulgu yalnız `test_kao2_mastery.js` tarafından yakalanıyor. Kapanıştaki "R-01 PASS = K4-01 kapandı" çıkarımı bu kontrole dayanamaz. | `tekrar-uret-2.cjs` N-02; mutasyon: §9 | `tests/kao/test_kao2_denetim.js:17-29`, `kao2-duzeltme/denetim/tekrar-uret.cjs:80-93` | R-01'i 10 doğruyla geçen gerçek ustalık oturumu + `masteryAt` dolu + sonraki adım `next-unit` şartına çevir. |
| **D2-03** | düşük | R-10 kalıbı yalnız satır başındaki `fs.writeFileSync(...A-KABUL.md)`'yi yakalıyor; iki boşluk girintili koşulsuz yazım geçiyor. | N-03 | `tests/kao/test_kao2_denetim.js:171-175`, `tekrar-uret.cjs:221-225` | Kalıbı `^\s*` ile ve `KAO2_EVIDENCE_OUT` koşulunun varlığıyla sına. |
| **D2-04** | orta | L1 metin onayı: 158/158 metin `sourced`, `by:"owner"`, ama kutuları Claude işaretledi (kullanıcı devri, LEDGER seq 64–65). CLAUDE.md/AGENTS.md KAO2 satırı "L1 (proje sahibi) ve L2 (alan uzmanı) onayı kullanıcıda" diyor → belge ↔ veri çelişkisi; veri alanı onaylayanı yanlış gösteriyor. | N-04 | `CLAUDE.md`/`AGENTS.md` KAO2 satırı; `docs/kuran-ogreniyorum/kao2/content/texts.tr.json` `review.by` | Kullanıcı karar verir: ya L1 onayını kendisi teyit eder, ya `by` alanı yapay zekâ incelemesini ayırt eden bir değere çekilir; belge satırı gerçek durumu yazar. |
| **D2-05** | düşük | `tests/kao/README.md` 54 test dosyasından 53'ünü listeliyor; `test_kao_pronunciation_contract.js` yok (K2F-41 "37/37" yalnız `test_kao2_*` saydı). | N-05 | `tests/kao/README.md` | Satır ekle; envanter kontrolünü `test_*.js` üzerinden yap. |
| **D2-06** | **orta** | K2F-43 kapısı ve kanıtı: GATE kaydı yok, KANIT.md yok, onay çıkarımla, pin sonrası tam kapı yok; `20261006a/b/c/d/e` canlı bayt eşitliği doğrulanmadı; K2F-34 yayınının YAYIN.md'si yok. | N-06; §8 komutu | `kao2-duzeltme/evidence/K2F-43/`, `…/K2F-34/` | Kullanıcı §8 betiğini koşup sonucu bildirir; LEDGER'a GATE (geriye dönük) + K2F-43 KANIT eklenir. |
| **D2-07** | orta | CURRENT-STATE kapanışta baştan yazılmadı; bayat ve çelişkili satırlar (§6 E-10). FIX-STATE `branch: kao2-duzeltme` ve README "her prompt ayrı oturum, tek commit" gerçeği yansıtmıyor. | N-07 | `kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md`, `FIX-STATE.json`, `README.md` | Kapanış durumunu ölçümle baştan yaz. |
| **D2-08** | düşük | `8bf8f658` `app/styles.css`'i değiştirdi, `index.html` pinini artırdı ama `panel-v2.html` aynı dosyayı hâlâ `?v=20260811a` ile yüklüyor (CLAUDE.md kural 5). Panel-v2'nin bu kurallardan etkilenip etkilenmediği doğrulanmadı. | N-08 | `panel-v2.html:12` | `panel-v2.html` pinini de artır ya da paylaşım gerekmiyorsa not düş. |
| **D2-09** | düşük | u01.02'de g1-k1 ve g1-k2 aynı görevi (aynı uyaran ٱلْكِتَـٰبُ, aynı cevap, aynı şıklar) bir görev arayla iki kez gösteriyor; "ardışık aynı `templateId` yok" kuralı bunu yakalamıyor (K4-04'ün tarif ettiği kullanıcı deneyimi sürüyor). | N-09 | `app/core/quranLearn.js` gramer kurucu; `quranLearnFlow.js` ardışıklık kuralı | Ders içinde görev imzasıyla (tür+uyaran+cevap) tekilleştir. |
| **D2-10** | düşük | u09.01 başlığı/hedefi "Emir kipi … emir biçimini tanıyacaksın" diyor; tanış kartları ve alıştırmalar lemma anlamını geçmiş zaman veriyor ("andı", "yedi", "verdi"); emir yalnız örnek âyette görünüyor. | §9 u09.01 komutu | `app/content/quranCurriculumV2.js` u09.01 metni | Başlık/hedefi kartlarla uyumla ya da emir biçimini kartta göster (L1 incelemesi). |
| **D2-11** | düşük | `docs/kuran-ogreniyorum/kao2/inceleme/MUFREDAT-ESLEME.md` (canlı girdi klasörü) "Tüm başlık ve vaatler taslaktır (`draft`)" ve boş kutulu "Karar bekleyen noktalar" taşıyor; G2 onaylı ve draft 0. | `grep -n 'taslak\|Karar bekleyen' …/MUFREDAT-ESLEME.md` | aynı dosya :4, :83, :1455 | Aracı onay durumunu yazacak biçimde yeniden üret. |
| **D2-12** | orta | Süreç dışı commit'ler: `8bf8f658` (öneksiz; KAO2 dışı ana uygulama alt çubuğu, İlham sekmesi, Raşit kartları, panel-v2 dar ekran CSS'i — KAO2-FIX kapsamında değil, yalnız pin testleri değişti) ve `5b267dde` (`chore(kao)`; plan-check'e kalıcı `K2F-NN ek:` önek izni — kapı, programın kendi hatalı commit'ini geçirmek için gevşetildi; tek hash'lik istisna daha dar olurdu). İkisi de LEDGER seq 114'te anılıyor. | `git show --stat 8bf8f658 5b267dde` | `docs/kuran-ogreniyorum/tools/kao-plan-check.mjs:37`; `app/core/render.js`, `app/styles.css`, `panel/v2/panel-v2.css` | Kapsam dışı değişiklik için ayrı program/kayıt; plan-check istisnasını tek hash'e daralt. |

---

## 8. Kanıt düzeyleri

- **Kaynak/test (bu oturumda koşturuldu):** `tekrar-uret.cjs` 10/10; `test_kao2_denetim.js` 10/10; `kapilar.sh` tam koşu (§5);
  kabul 10/10 (`KAO2_ACCEPT_SLOW_HOST=1`); perf A/B; 12 ünite + onarım + v1 atla simülasyonu; 12 S0 dersi uçtan uca;
  78 gramer görevinin özgün kâhinle denetimi ve elle okunması; 10 promptta TDD kırmızısının önceki kodla yeniden üretimi
  (K2F-06, 10, 12, 15, 16, 23, 27, 32, 33, 34; onunda da önceki kodla kırmızı, kendi koduyla yeşil); 4 R mutasyonu (R-05, R-07, R-10 yakaladı;
  R-01 yakalamadı); K2F-40 için 6.905 döküm; ölçümler (§2).
- **Yayın (git/Actions kaydı):** `main` = `36015f08`; her yayın için run ID ve ff-only YAYIN.md'lerde **yazılı**; Actions
  durumunu bu oturumda bağımsız olarak sorgulamadım (GitHub MCP sunucusu bağlanamadı). Canlı site bu konteynerden erişilemez.
- **Cihaz:** yok. Hiçbir madde cihazda doğrulanmadı; "cihazda çalışıyor" denemez.

### Doğrulanamayanlar
- Canlı bayt eşitliği (`20261006a…e`) ve gizlilik 404'leri (konteynerden github.io 403).
- Pages run'larının sonucunun bağımsız teyidi (yalnız kayıt).
- K2F-06…34 oturum sınırları (oturum kimliği yok).
- K2F-40 `git stash` olayı (kayıtta yok).
- `audio` görev türünün K2F-40 öncesi/sonrası eşitliği (sentetik ortamda üretilmedi); `fragment` sıralamada aynı etiket riski.
- D2-08'in panel-v2 görünümüne etkisi.

### Kullanıcıya düşen işler
1. **Canlı doğrulama** — depo kökünde, `main` güncelken tek komut (macOS/Linux):

```bash
git checkout main && git pull --ff-only && for f in index.html sw.js panel-v2.html $(grep -oE '(src|href)="[^"]+\?v=20261006e"' index.html | sed -E 's/.*"([^"?]+)\?v=.*/\1/' | sort -u); do l=$(shasum -a 256 "$f" | cut -d' ' -f1); r=$(curl -fsS "https://mustafaras.github.io/s/$f" | shasum -a 256 | cut -d' ' -f1); [ "$l" = "$r" ] && echo "EŞİT   $f" || echo "FARKLI $f"; done; for p in kao2-duzeltme/FIX-STATE.json kao2-duzeltme/denetim-2/DENETIM-RAPORU.md archive/README.md docs/kuran-ogreniyorum/kao2/content/texts.tr.json; do echo "$(curl -s -o /dev/null -w '%{http_code}' "https://mustafaras.github.io/s/$p") $p (404 beklenir)"; done
```
2. K2F-43 onayını açık cümleyle teyit etmek ya da geri almak ("YAYIN-2 onaylı" / "ertele") ve L1 onayının (D2-04) kimde olduğuna karar vermek.
3. Cihaz kabulü (A-11/A-12), ekran okuyucu turu, L2 uzman listesi (0/37 işaretli), K-3 ses kayıtları.
4. `test_kao2_perf_budget.js`'i referans makinede bir kez koşmak.
5. Yeni bulguların (D2-01…D2-12) düzeltilip düzeltilmeyeceği — **karar kullanıcının**; bu denetim hiçbir şeyi düzeltmedi.

---

## 9. Bu denetimde koşturulan komutlar (özet)

```bash
git fetch --unshallow origin; apt-get install -y rsync           # ortam
node kao2-duzeltme/tools/fix-sync-check.mjs --repro              # PASS (yalnız tutarlılık)
node kao2-duzeltme/denetim/tekrar-uret.cjs                        # 10/10
node tests/kao/test_kao2_denetim.js                               # 10/10
bash kao2-duzeltme/tools/kapilar.sh                               # 11m48s, çıkış 1 (yalnız göreli perf)
KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_kabul.js         # 10/10
git archive 07802fa6 app | tar -x -C $SCRATCH/base07
node kao2-duzeltme/tools/perf-ab.cjs . $SCRATCH/base07            # best3 1,111 / 1,139
node kao2-duzeltme/denetim-2/tekrar-uret-2.cjs                    # 0/9 (yeni bulgular)
```

Mutasyonlar (scratchpad kopyasında, `rsync -a --relative app app.js tests kao2-duzeltme/denetim docs/kuran-ogreniyorum/content`):
`R07` niyet okuması `q.settings.intent` → R-07 FAIL ✓ · `R05` `App.kaoS0` shim silindi → R-05 FAIL ✓ · `R10` koşulsuz
`A-KABUL.md` yazımı → R-10 FAIL ✓ (iki boşluk girintide PASS ✗) · `R01` `if(passed&&!passedBefore){ next.masteryAt=… }`
devre dışı → **R-01 PASS (ikisinde de) ✗**, `test_kao2_mastery.js` FAIL ✓.

TDD yeniden üretimi: commit ağacı `git archive <c>` + yalnız test dışı dosyalar `<c>^` sürümüne çevrildi; test önce kırmızı,
kendi koduyla yeşil (K2F-06 `test_kao2_mastery` önceki kodla çıkış 1, ilk satır saflık PASS'i — kırmızı daha aşağıda).

Kritik bulgu sınamaları scratchpad'deki bağımsız betiklerle (`crit.cjs`, `s0.cjs`, `gram.cjs`, `dump.cjs`, `dump2.cjs`,
`dbg2.cjs`) `tests/kao/helpers/kao-harness.js` üzerinden gerçek `kaoNextStep`/`kaoLesson`/`kaoAnswer`/`kaoS0` çağrılarıyla
yapıldı; durum elle kurulmadı (yalnız v1 kullanıcısının eski kart verisi ve günlük sıfırlama).
