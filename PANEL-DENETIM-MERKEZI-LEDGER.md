# Denetim Merkezi Değişimi — Anti-Amnezi Protokolü & Ledger

> Bu dosya, [PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md](PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md)
> ve [PANEL-DENETIM-MERKEZI-PROMPTLARI.md](PANEL-DENETIM-MERKEZI-PROMPTLARI.md)
> ile birlikte **üçlü, birbirini denetleyen bir sistem** oluşturur — bu
> repoda daha önce kullanılmış (`PANEL-ANTI-AMNEZI-LEDGER.md` /
> `PANEL-DUZELTME-PROMPTLARI.md` / `PANEL-DENETIM-RAPORU.md`, artık silinmiş
> ama git geçmişinde okunabilir) üçlüyle AYNI desen ve süreç kuralları
> kullanılarak, TAMAMEN YENİ ve BAĞIMSIZ dosyalar olarak yazıldı — eski
> dosyaların üzerine yazılmadı, eskiler geri getirilmedi. Üçü de kök repoda
> birlikte durur ve hiçbiri diğerinden bağımsız okunmamalıdır.
>
> **Bu dosyanın amacı:** Her yeni ajan oturumu hafızasız (amnezik) başlar —
> önceki oturumda ne yapıldığını, hangi prompt'un uygulandığını, hangi
> testin geçtiğini bilmez. Bu dosya o hafıza kaybını önler: "şu an nerede
> kaldık" sorusunun TEK doğru cevabıdır. Plan dosyası "ne değişecek ve
> neden" der, prompt listesi "nasıl uygulanır" der, bu dosya "şu ana kadar
> ne yapıldı ve sırada ne var" der.

---

## 0. Anti-Amnezi Protokolü — Her Oturum Bu Sırayla Başlar

Bu üç dosyayla çalışan HER ajan (Claude Code, Cursor, Codex, insan
geliştirici — hepsi), işe başlamadan önce şu sırayı izlemelidir:

1. **Bu dosyayı (PANEL-DENETIM-MERKEZI-LEDGER.md) baştan sona oku.** §2'deki
   ledger tablosu "şu an nerede kaldık"ın tek kaynağıdır — tabloyu okumadan
   hiçbir prompt'u "muhtemelen henüz yapılmamıştır" diye tahmin ederek
   uygulamaya BAŞLAMA.
2. `git log --oneline -20` çalıştır ve ledger tablosundaki commit SHA'ların
   gerçekten repo geçmişinde olduğunu doğrula — eğer ledger "yapıldı" diyor
   ama commit repoda yoksa, ledger güncel değildir, önce gerçek `git log`'a
   güven, sonra ledger'ı düzelt.
3. Ledger'da `durum: in-progress` veya `durum: blocked` olan bir satır
   varsa, önce onu bitir/çöz — yeni bir prompt'a BAŞLAMA.
4. Uygulanacak prompt'u [PANEL-DENETIM-MERKEZI-PROMPTLARI.md](PANEL-DENETIM-MERKEZI-PROMPTLARI.md)'den
   birebir al — prompt metnini kendi yorumunla değiştirme, oradaki "Bağlam/
   Görev/Kısıtlar/Doğrulama/Kabul kriterleri" yapısına harfiyen uy.
5. İşin BAŞINDA ledger'a `durum: in-progress` satırı ekle/güncelle (§3'teki
   format), İŞ BİTMEDEN commit ATMA.
6. §4'teki "Prompt Sonrası İşlem Sırası" (commit → doğrula → ledger
   güncelle → faz tamamsa push/deploy) adımlarını harfiyen uygula.

**Kural:** Ledger'a yazmadan hiçbir prompt "tamamlandı" sayılmaz. Kod
değişse bile ledger güncellenmediyse, bir sonraki ajan aynı işi tekrar
yapmaya çalışabilir (amnezi tekrar oluşur) — bu yüzden ledger güncellemesi
işin bir PARÇASIDIR, opsiyonel bir not değildir.

---

## 1. Üçlü Dosyanın Birbirini Denetleme Mekanizması

```
PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md ──§4-6-12 kararları tanımlar──┐
                                                                               ▼
PANEL-DENETIM-MERKEZI-PROMPTLARI.md ──her prompt bir plan bölümüne bağlı──────┤
                                                                               ▼
PANEL-DENETIM-MERKEZI-LEDGER.md (bu dosya) ──her ledger satırı bir prompt'a,──┘
                                              bir commit'e, bir test sonucuna bağlı
```

**Çapraz doğrulama kuralları** (bu üç dosya arasında tutarlılık için):

- Bir prompt "tamamlandı" (`done`) olarak işaretlenmeden önce: o prompt'un
  **Kabul kriterleri**nde listelenen TÜM testler gerçekten PASS vermiş
  olmalı — ledger satırına test komutunun çıktı özetini (örn.
  "12 passed, 0 failed") yaz, yalnız "yapıldı" yazma.
- Bir ledger satırı, karşılık geldiği plan bölümünü (örn. `§6.1`, `§12.1 A4`)
  ve prompt numarasını (örn. `D1.1`, `D3.2`) MUTLAKA belirtmeli — bağlantısız
  bir ledger satırı geçersizdir.
- Plan dosyasında (`PANEL-DENETIM-MERKEZI-YENIDEN-TASARIM-PLANI.md`) bir
  karar/özellik varsa ama prompt listesinde karşılığı yoksa, veya prompt
  listesinde bir prompt varsa ama plan'da karşılığı yoksa — bu bir
  TUTARSIZLIKTIR, önce bu üç dosyayı senkronlamadan koda dokunma.
- Faz sırası [PANEL-DENETIM-MERKEZI-PROMPTLARI.md](PANEL-DENETIM-MERKEZI-PROMPTLARI.md)'nin
  sonundaki "Uygulama Sırası Özeti" tablosuna uyar; ledger bu sırayı
  bozarsa (örn. D3.1, D1.x tamamlanmadan `done` olursa) bu da bir
  TUTARSIZLIKTIR.

### Token / Context Engineering ilkeleri (bu üçlünün neden bu şekilde tasarlandığı)

- **Tek kaynak, tekrar yok:** Plan dosyasındaki analiz/gerekçe hiçbir zaman
  prompt'lara veya ledger'a kopyalanmaz — yalnızca `§X` referansı verilir.
  Bir ajan bir prompt'u uygularken TÜM plan dosyasını değil, yalnızca
  referans verilen bölümü okur; bu, her oturumun context penceresinde
  gereksiz yere binlerce token'ı tekrar yüklemesini önler.
- **Append-only, minimal diff güncelleme:** Ledger satırları güncellenirken
  yalnızca değişen alanlar (durum, commit SHA, test özeti) yazılır — geçmiş
  satırlar yeniden yazılmaz/özetlenmez. Bir sonraki ajan yalnızca "hangi
  satır `pending`/`in-progress`" diye tabloyu tarar, tüm dosyanın anlamını
  yeniden inşa etmesi gerekmez.
- **Bağımsız, kendi kendine yeten prompt'lar:** Her prompt kendi başına bir
  ajana (bu konuşmanın geçmişi olmadan) verilebilecek şekilde yazılır —
  gerekli dosya:satır referanslarını, kısıtları ve doğrulama komutlarını
  kendi içinde taşır. Bu, paralel/farklı oturumlarda çalışan ajanların
  birbirinin tam geçmişini yeniden okumasını gereksiz kılar; yalnızca
  ledger tablosundaki `pending`/`done` durumuna bakarak senkron kalırlar.
- **Bağımlılık grafiği açık tutulur:** [PANEL-DENETIM-MERKEZI-PROMPTLARI.md](PANEL-DENETIM-MERKEZI-PROMPTLARI.md)'nin
  sonundaki tablo, hangi prompt'ların birbirinden bağımsız (paralel
  çalıştırılabilir) hangilerinin sıralı olması gerektiğini tek bakışta
  gösterir — bir ajan bunu okumadan "bu prompt'u şimdi yapabilir miyim"
  sorusuna cevap için tüm geçmişi taramak zorunda kalmaz.

---

## 2. Ledger — Prompt Uygulama Kaydı

> **Append-only mantık:** Mevcut bir satırı SİLME veya geçmişini kaybedecek
> şekilde ÜZERİNE YAZMA. Durum değiştiğinde (örn. `pending` → `in-progress`
> → `done`) aynı satırı güncelle ama "Not" sütununa tarih damgalı kısa bir
> geçmiş ekle. Bir prompt tekrar açılırsa (regresyon bulunduysa) durumu
> `done`'dan `blocked`'a çevir, nedenini Not'a yaz — asla sessizce `done`
> bırakma.

| Prompt | Plan Bölümü | Durum | Commit SHA | Test Sonucu | Deploy Run | Tarih | Not |
|--------|-------------|-------|------------|-------------|------------|-------|-----|
| D1.1 | §6.1 | `done` | 4eaf798 | test_panel_needs_attention.js 11/11 PASS (yeni) + test_panel_p0_sync 31/31, p1_projection 35/35 PASS + 21 diğer panel test dosyası regresyonsuz PASS (3 bilinen test_panel_v2_* çökmesi git stash ile önceden var olduğu doğrulandı, kapsam dışı) | — | 2026-08-06 | needsAttentionCardHTMLP() eklendi (panel.js:2104 sonrası), render():3218 öncesine bağlandı; cache-bust panel.js→20260806h aynı commit'te yapıldı (3 hardcoded test literal'i güncellendi) |
| D1.2 | §6.2 | `done` | 19211f1 | test_panel_curated_change_log.js 8/8 PASS (yeni) + test_panel_p2_event_log 11/11 PASS + 21 diğer panel test dosyası regresyonsuz PASS (3 bilinen test_panel_v2_* çökmesi kapsam dışı) | — | 2026-08-06 | curatedChangeLogGroupsP/curatedChangeLogCardInnerHTMLP/curatedChangeLogCardHTMLP/toggleCuratedLogShowAllP eklendi (panel.js:1685 sonrası), render():eventLogCardHTMLP() öncesine bağlandı; gerçek kategori kodu eventClassificationP().key==='user' olarak doğrulandı (varsayım değil, kod okunarak); cache-bust panel.js→20260806i aynı commit'te yapıldı |
| D1.3 | §12.1 A4 | `done` | 1437e52 | test_panel_weekly_digest.js 9/9 PASS (yeni) + 24 diğer panel test dosyası regresyonsuz PASS (3 bilinen test_panel_v2_* çökmesi kapsam dışı) | — | 2026-08-06 | trendArrowP/weeklyDigestCardHTMLP eklendi (needsAttentionCardHTMLP sonrası), render():needsAttentionCardHTMLP() çağrısının hemen ardına bağlandı; cache-bust panel.js→20260806j aynı commit'te yapıldı |
| D1.4 | §12.1 A2 | `done` | 66bad41 | test_panel_monthly_heatmap.js 10/10 PASS (yeni, Şubat/artık yıl/31 gün dahil) + 25 diğer panel test dosyası regresyonsuz PASS | — | 2026-08-06 | monthDaysP/shiftMonthP/setPanelMonthP/monthlyHeatmapCardHTMLP eklendi (order:29), render():weeklyDigestCardHTMLP() sonrasına bağlandı; cache-bust panel.js→20260806k aynı commit'te yapıldı |
| D1.5 | §12.1 A6 | `done` | 53276f3 | test_panel_milestones.js 9/9 PASS (yeni) + 26 diğer panel test dosyası regresyonsuz PASS | — | 2026-08-06 | sosFreeStreakP/milestoneRibbonHTMLP eklendi, render():commandRiskHTMLP() sonrasına bağlandı; naTh tanım sırası hatası aynı commit'te düzeltildi (D1.1'de eklenen değişken D1.5 çağrısından önce hesaplanır hale getirildi); cache-bust panel.js→20260806l aynı commit'te yapıldı. **Faz 1 (D1.1-D1.5) tamamlandı.** |
| D2.1 | §5 | `done` | bf02070 | test_panel_dev_mode_trigger.js 6/6 PASS (yeni) + 27 diğer panel test dosyası regresyonsuz PASS | — | 2026-08-06 | devLogoTapP/initDevModeUrlTriggerP eklendi, coreStripHTML'deki logo div'ine onclick bağlandı, load() sonrasına initDevModeUrlTriggerP() eklendi; görünür buton/link eklenmediği grep ile doğrulandı; cache-bust panel.js→20260806m aynı commit'te yapıldı. **Faz 2 tamamlandı.** |
| D3.1 | §4, §9 Faz 3 | `pending` | — | — | — | — | auditEntryHTMLP/eventLogCardHTMLP çağrıları render()'dan çıkar |
| D3.2 | §8 | `pending` | — | — | — | — | 8 etkilenen test dosyasının tek tek güncellenmesi |
| D4.1 | §4, §9 Faz 4 | `pending` | — | — | — | — | Kullanılmayan `.audit-*`/`.p3-*`/`.p4-*`/`.d4-*` CSS temizliği |
| D5.1 | §9 Faz 5 | `pending` | — | — | — | — | Tam regresyon + cache-bust + push/deploy |

**Durum değerleri:** `pending` (sırada) · `in-progress` (uygulanıyor) ·
`done` (tamamlandı + doğrulandı + deploy edildi) · `blocked` (bir engelle
karşılaşıldı, çözülmeden ilerlenemez).

---

## 3. Ledger Satırı Nasıl Güncellenir

Bir prompt'a başlarken satırı şu şekilde güncelle:

```
| D1.1 | §6.1 | in-progress | — | — | — | 2026-08-06 | Başlandı, render() içindeki order:6 konumu inceleniyor |
```

Prompt tamamlanıp TÜM doğrulama komutları PASS verince, TÜM ilgili testler
çalıştırılıp geçtikten SONRA (bkz. §4):

```
| D1.1 | §6.1 | done | a1b2c3d | test_panel_p0_sync 31/31 PASS + 3 yeni assertion PASS | — | 2026-08-06 | needsAttentionCardHTMLP() eklendi, render():3218'e bağlandı |
```

---

## 4. Prompt Sonrası İşlem Sırası (Süreç Kuralı)

Bu, `PANEL-ANTI-AMNEZI-LEDGER.md`'de (git geçmişinde) tanımlanmış olan
sabit sürecin AYNISIdır — bu girişim için de değişmeden uygulanır:

1. **Uygula** — [PANEL-DENETIM-MERKEZI-PROMPTLARI.md](PANEL-DENETIM-MERKEZI-PROMPTLARI.md)'deki
   prompt'un "Görev" adımlarını uygula.
2. **Doğrula** — prompt'un "Doğrulama" bölümündeki TÜM komutları çalıştır
   (`node --check`, ilgili `tests/test_panel_*.js` dosyaları, gerekiyorsa
   yeni assertion'lar). Herhangi biri FAIL verirse §5'teki "Blocked
   Protokolü"ne geç, ilerleme.
3. **Commit at** — yalnız o prompt'un dokunduğu dosyaları stage'le
   (`git add <dosyalar>`, asla `git add -A`/`git add .` ile kör ekleme),
   commit mesajı prompt numarasını ve plan bölümünü referans versin
   (örn. `feat(panel): D1.1 — Bugün Ne Yapmalıyım kartı eklendi (§6.1)`).
4. **Ledger'ı güncelle** — §3'teki formatla, commit SHA'yı
   (`git rev-parse HEAD`) ve test sonucu özetini yaz. Ledger güncellemesini
   AYRI bir commit olarak da atabilirsin (örn. `docs: ledger — D1.1 done`)
   ya da kod commit'ine dahil edebilirsin, tutarlı ol.
4b. **Cache-bust kontrolü (ZORUNLU, atlanamaz)** — bu girişim yalnızca
    `panel.js`/`panel.css`/`panelCoverageManifest.js` dosyalarına dokunuyor
    (`app.js`/`sync.js`/`styles.css` kapsam dışı, bkz. plan §3 "Hedef
    olmayanlar"). Eğer commit bu üç dosyadan birinin İÇERİĞİNİ
    değiştirdiyse, `panel.html`'deki ilgili `?v=` string'ini AYNI commit'te
    bump'la. Bump'lamazsan kod doğru olsa bile canlıda eski, cache'lenmiş
    sürüm çalışmaya devam eder — bu, git geçmişindeki
    `PANEL-ANTI-AMNEZI-LEDGER.md`'nin §7 Olay Kaydı'nda belgelenmiş,
    2026-08-05'te 7 commit boyunca unutulup ancak kullanıcı ekran
    görüntüsüyle sorduğunda fark edilen gerçek bir olaydı — AYNI HATAYI
    BURADA TEKRARLAMA. `grep -n "panel.js?v=\|panel.css?v=\|
    panelCoverageManifest.js?v=" panel.html` ile bump'ı commit ETMEDEN
    ÖNCE doğrula; `test_panel_p3_timeline_drawer.js`,
    `test_panel_p5_responsive_a11y.js`, `test_panel_p6_qa_release.js`
    dosyaları `panel.js`/`panel.css` versiyonunu hardcoded assert ediyor —
    bump edince bu testlerin literal'lerini de güncellemen gerekir.
5. **Faz tamamlandıysa push + deploy** — bir Faz'ın (1, 2, 3, 4 veya 5)
   TÜM prompt'ları `done` olduğunda:
   - `git push origin main` (bu repo doğrudan `main` üzerinde çalışıyor,
     ayrı bir feature branch/PR akışı yok — `CLAUDE.md`'deki "Git / deploy"
     bölümüne bak).
   - Push, `.github/workflows/pages.yml` üzerinden GitHub Pages deploy'unu
     otomatik tetikler ("merge" burada ayrı bir adım değildir, `main`'e
     push = deploy tetikleyicisi).
   - `gh run list --workflow=pages.yml --limit 1` ile deploy'un
     `completed`/`success` olduğunu doğrula, run ID'sini ledger'ın
     "Deploy Run" sütununa yaz.
   - **Tek prompt bitince ANINDA push etme** — push/deploy yalnız bir
     FAZ'ın tüm prompt'ları bittiğinde yapılır, aksi halde canlıya çok sık,
     yarım-faz durumunda deploy gitmiş olur.
6. **Bu dosyayı (§1'deki tutarlılık kurallarına göre) plan ve prompt
   listesiyle çapraz kontrol et** — yeni bir tutarsızlık oluşmadığından
   emin ol.

---

## 5. Blocked Protokolü

Bir prompt'un doğrulama adımı FAIL verirse veya beklenmeyen bir engelle
karşılaşılırsa:

1. Ledger satırını `blocked` yap, Not sütununa TAM olarak neyin
   engellediğini yaz (hangi test, hangi hata mesajı).
2. Yarım kalan kod değişikliğini commit ETME — ya `git stash` ile kenara
   al ya da sorunu çözüp tamamla, ama `blocked` durumdaki bir işi yarım
   commit olarak `main`'e bırakma.
3. Bir sonraki oturum/ajan bu dosyayı okuduğunda `blocked` satırı görürse,
   önce onu çözmeden başka bir prompt'a geçmemelidir (bkz. §0 madde 3).

---

## 6. Güvenlik Hatırlatması (CLAUDE.md'den özet — anti-amnezi için tekrar)

- Uygulamayı asla bir tarayıcıda açma / doğrulama için canlı fetch deneme.
- `mustafaras/seyma-data` reposuna asla explicit onay olmadan yazma.
- Doğrulama yalnız `node --check`, `tests/test_panel_*.js` ve
  `.claude/skills/run-seyma/` harness'larıyla yapılır.
- Push/deploy `main`'e doğrudan gider (ayrı review/PR aşaması yok) — bu
  yüzden §4 madde 2'deki doğrulama adımını ASLA atlamadan commit atma.
- Bu girişim `app.js`/`sync.js`'e DOKUNMAZ (plan §3) — bir prompt bu
  dosyalardan birini değiştirmeni gerektiriyor gibi görünüyorsa, önce
  planı tekrar oku; muhtemelen kapsam dışına çıkılmıştır.

---

## 7. Olay Kaydı (Incident Log)

> Bu bölüm, ilerideki oturumların TEKRARLAMAMASI gereken gerçek hataları
> kaydeder — anti-amnezi'nin özü budur. Yeni bir olay olursa buraya EKLE,
> mevcut kaydı silme/üzerine yazma. Henüz kayıt yok — bu girişim yeni
> başlıyor.

---

## 8. İlgili Geçmiş Girişim (referans, bu girişimin kapsamı dışında)

Bu repoda daha önce AYNI üçlü desenle tamamlanmış bağımsız bir girişim
vardı: panel veri akışı denetimi (`PANEL-DENETIM-RAPORU.md` /
`PANEL-DUZELTME-PROMPTLARI.md` / `PANEL-ANTI-AMNEZI-LEDGER.md`, prompt
1.1-4.2, Faz 1-4 hepsi `done`). Bu üç dosya kullanıcı tarafından bilerek
silindi ve **kasıtlı olarak geri getirilmedi** — yalnızca git geçmişinde
(`git show HEAD~N:PANEL-ANTI-AMNEZI-LEDGER.md` vb.) referans olarak
okunabilir. Bu girişim onların YERİNE geçmiyor, **farklı bir konuyu**
(Denetim Merkezi UI'ının komple yeniden tasarımı) kapsıyor ve tamamen
yeni, bağımsız dosya adlarıyla yazıldı — karıştırılmamalı.
