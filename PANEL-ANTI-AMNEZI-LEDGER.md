# Panel Düzeltme — Anti-Amnezi Protokolü & Ledger

> Bu dosya, [PANEL-DENETIM-RAPORU.md](PANEL-DENETIM-RAPORU.md) ve
> [PANEL-DUZELTME-PROMPTLARI.md](PANEL-DUZELTME-PROMPTLARI.md) ile birlikte
> **üçlü, birbirini denetleyen bir sistem** oluşturur. Üçü de kök repoda
> birlikte durur ve hiçbiri diğerinden bağımsız okunmamalıdır.
>
> **Bu dosyanın amacı:** Her yeni ajan oturumu hafızasız (amnezik) başlar —
> önceki oturumda ne yapıldığını, hangi prompt'un uygulandığını, hangi
> testin geçtiğini bilmez. Bu dosya o hafıza kaybını önler: "şu an nerede
> kaldık" sorusunun TEK doğru cevabıdır. Rapor "ne bozuk" der, prompt listesi
> "nasıl düzeltilir" der, bu dosya "şu ana kadar ne yapıldı ve sırada ne var"
> der.

---

## 0. Anti-Amnezi Protokolü — Her Oturum Bu Sırayla Başlar

Bu üç dosyayla çalışan HER ajan (Claude Code, Cursor, Codex, insan
geliştirici — hepsi), işe başlamadan önce şu sırayı izlemelidir:

1. **Bu dosyayı (PANEL-ANTI-AMNEZI-LEDGER.md) baştan sona oku.** §2'deki
   ledger tablosu "şu an nerede kaldık"ın tek kaynağıdır — tabloyu okumadan
   hiçbir prompt'u "muhtemelen henüz yapılmamıştır" diye tahmin ederek
   uygulamaya BAŞLAMA.
2. `git log --oneline -20` çalıştır ve ledger tablosundaki commit SHA'ların
   gerçekten repo geçmişinde olduğunu doğrula — eğer ledger "yapıldı" diyor
   ama commit repoda yoksa, ledger güncel değildir, önce gerçek `git log`'a
   güven, sonra ledger'ı düzelt.
3. Ledger'da `durum: in-progress` veya `durum: blocked` olan bir satır
   varsa, önce onu bitir/çöz — yeni bir prompt'a BAŞLAMA.
4. Uygulanacak prompt'u [PANEL-DUZELTME-PROMPTLARI.md](PANEL-DUZELTME-PROMPTLARI.md)'den
   birebir al — prompt metnini kendi yorumunla değiştirme, oradaki "Görev/
   Kısıtlar/Doğrulama/Kabul kriterleri" yapısına harfiyen uy.
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
PANEL-DENETIM-RAPORU.md  ──problem tanımlar (A1-A4, B1-B3, C1-C5)──┐
                                                                     ▼
PANEL-DUZELTME-PROMPTLARI.md ──her prompt bir rapor maddesine bağlı──┤
                                                                     ▼
PANEL-ANTI-AMNEZI-LEDGER.md (bu dosya) ──her ledger satırı bir prompt'a,──┘
                                          bir commit'e, bir test sonucuna bağlı
```

**Çapraz doğrulama kuralları** (bu üç dosya arasında tutarlılık için):

- Bir prompt "tamamlandı" (`done`) olarak işaretlenmeden önce: o prompt'un
  **Kabul kriterleri**nde listelenen TÜM testler gerçekten PASS vermiş
  olmalı — ledger satırına test komutunun çıktı özetini (örn.
  "12 passed, 0 failed") yaz, yalnız "yapıldı" yazma.
- Bir ledger satırı, karşılık geldiği rapor maddesini (örn. `A1`, `C3`)
  ve prompt numarasını (örn. `1.1`, `3.1`) MUTLAKA belirtmeli — bağlantısız
  bir ledger satırı geçersizdir.
- Rapor'da (`PANEL-DENETIM-RAPORU.md`) bir madde varsa ama prompt
  listesinde karşılığı yoksa, veya prompt listesinde bir prompt varsa ama
  rapor'da karşılığı yoksa — bu bir TUTARSIZLIKTIR, önce bu üç dosyayı
  senkronlamadan koda dokunma.
- Faz 1-4 sırası [PANEL-DUZELTME-PROMPTLARI.md](PANEL-DUZELTME-PROMPTLARI.md)'nin
  sonundaki "Uygulama Sırası Özeti" tablosuna uyar; ledger bu sırayı
  bozarsa (örn. 4.2, 1.1 tamamlanmadan `done` olursa) bu da bir
  TUTARSIZLIKTIR.

---

## 2. Ledger — Prompt Uygulama Kaydı

> **Append-only mantık:** Mevcut bir satırı SİLME veya geçmişini kaybedecek
> şekilde ÜZERİNE YAZMA. Durum değiştiğinde (örn. `pending` → `in-progress`
> → `done`) aynı satırı güncelle ama "Not" sütununa tarih damgalı kısa bir
> geçmiş ekle. Bir prompt tekrar açılırsa (regresyon bulunduysa) durumu
> `done`'dan `blocked`'a çevir, nedenini Not'a yaz — asla sessizce
> `done` bırakma.

| Prompt | Rapor Maddesi | Durum | Commit SHA | Test Sonucu | Deploy Run | Tarih | Not |
|--------|---------------|-------|------------|-------------|------------|-------|-----|
| 1.1 | A1 | `done` | d359cfe | test_panel_p0_sync.js 31/31 PASS (yeni [4] bloğu dahil) + 10 diğer panel test dosyası regresyonsuz PASS | 31027867404 | 2026-08-05 | SECTION_FETCH_STATE eklendi, sync ribbon uyarısı eklendi, panelSig() güncellendi |
| 1.2 | A2 | `done` | ab355dc | test_panel_p1_projection 35/35, p3_root_modules 29/29, p4_provenance 24/24 PASS (yeni [3]/[5] blokları dahil) + 9 diğer panel test dosyası regresyonsuz PASS | 31027867404 | 2026-08-05 | therapyProjection/locationTimingProjection 'stale' status eklendi (7/3 gün eşik), d4ModuleDescriptorsP rollup güncellendi |
| 1.3 | A3 | `done` | d244f6b | test_panel_p4_provenance 27/27, p4_module_cards 13/13 PASS (yeni assertion'lar dahil) + 13 diğer panel test dosyası regresyonsuz PASS | 31027867404 | 2026-08-05 | therapyRecencyTextP() eklendi; p4ProvenanceCardHTMLP + d4ModuleDescriptorsP güncellendi; test_panel_p4_module_cards.js VM loader listesine therapyRecencyTextP eklenerek ReferenceError regresyonu düzeltildi. Faz 1 tamamlandı, push+deploy edildi (run 31027867404). |
| 2.1 | A4 | `done` | 1d9d27f | test_panel_staleness_badge.js 7/7 (yeni) + p3_root_modules 29/29, p4_provenance 27/27 PASS (VM loader güncellendi) + 13 diğer panel test dosyası regresyonsuz PASS | 31078171139 | 2026-08-05 | stalenessBadgeP eklendi, 6 karta uygulandı; cache-bust panel.js→20260805c aynı commit'te yapıldı (madde 4b) |
| 2.2 | B1 | `done` | 642ca5c | test_panel_p3_root_modules.js 35/35 (yeni [6] bloğu) + p4_provenance 28/28 PASS + 14 diğer panel test dosyası regresyonsuz PASS | 31078171139 | 2026-08-06 | emptyStateReasonP/emptyStateNoteHTMLP eklendi, 7 modüle uygulandı; cache-bust panel.js→20260806a aynı commit'te yapıldı (madde 4b) |
| 2.3 | B2 | `done` | 822acce | test_panel_discomfort_trend.js 11/11 (yeni) + p3_root_modules 35/35 PASS + 15 diğer panel test dosyası regresyonsuz PASS | 31078171139 | 2026-08-06 | discomfortTrendP/discomfortTrendCardHTMLP eklendi; cache-bust panel.js→20260806b aynı commit'te yapıldı (madde 4b). Faz 2 (A4,B1,B2) tamamlandı, push+deploy+CDN doğrulaması yapıldı. |
| 3.1 | C2, C3 | `done` | a82296e | test_panel_event_focus 12/12, test_panel_p3_timeline_drawer 7/7, test_panel_p2_event_log 11/11, test_panel_p6_qa_release 16/16, test_panel_p5_responsive_a11y 24/24 PASS; grep openEventDrawerP\|closeEventDrawerP\|eventDetailsP\|statusBadgeP\|setEventDrawerLevelP panel.js → 0 sonuç; node --check panel.js OK | — | 2026-08-06 | openEventDrawerP/closeEventDrawerP/eventDetailsP/statusBadgeP/setEventDrawerLevelP silindi; UI.eventSelectedId/eventSelectedGroupKey/eventDrawerLevel ve EVENT_DRAWER_RETURN_ID temizlendi; cnt(rec) tekrarı (eski :979 civarı) silindi, tek tanım kaldı; eventDrawerKeydownP yalnız D4 modül drawer'ını yönetecek şekilde sadeleştirildi. D4 modül drawer'ı (openD4ModuleDrawerP/closeD4ModuleDrawerP/d4ModuleDrawerHTMLP) dokunulmadan test_panel_p3_timeline_drawer içinde regresyonsuz PASS. cache-bust panel.js→20260806c aynı commit'te yapıldı (madde 4b). test_panel_v2_* dosyalarındaki 3 hata bu değişiklikle ilgisiz — git stash ile doğrulandı, aynı hatalar değişiklik öncesi main'de de var (panel v2 kapsam dışı). Push+deploy bekliyor. |
| 3.2 | C1 | `pending` | — | — | — | — | 3.1'den SONRA uygulanmalı |
| 4.1 | C4 | `pending` | — | — | — | — | Faz 1-3 stabil olmadan başlanmamalı |
| 4.2 | C5 | `pending` | — | — | — | — | Faz 1-3 stabil olmadan başlanmamalı |

**Durum değerleri:** `pending` (sırada) · `in-progress` (uygulanıyor) ·
`done` (tamamlandı + doğrulandı + deploy edildi) · `blocked` (bir engelle
karşılaşıldı, çözülmeden ilerlenemez).

---

## 3. Ledger Satırı Nasıl Güncellenir

Bir prompt'a başlarken satırı şu şekilde güncelle:

```
| 1.1 | A1 | in-progress | — | — | — | 2026-08-05 | Başlandı, panel.js:4548 inceleniyor |
```

Prompt tamamlanıp TÜM doğrulama komutları PASS verince, TÜM ilgili testler
çalıştırılıp geçtikten SONRA (bkz. §4):

```
| 1.1 | A1 | done | a1b2c3d | 3/3 test PASS (test_panel_p0_sync, p1_projection, +1 yeni assertion) | 31020000001 | 2026-08-05 | section_fetch_failed durumu eklendi, sync ribbon uyarısı eklendi |
```

---

## 4. Prompt Sonrası İşlem Sırası (Süreç Kuralı)

Bu, kullanıcının talebi üzerine tanımlanan sabit süreçtir — her prompt
uygulandığında AYNEN izlenir:

1. **Uygula** — [PANEL-DUZELTME-PROMPTLARI.md](PANEL-DUZELTME-PROMPTLARI.md)'deki
   prompt'un "Görev" adımlarını uygula.
2. **Doğrula** — prompt'un "Doğrulama" bölümündeki TÜM komutları çalıştır
   (`node --check`, ilgili `tests/test_panel_*.js` dosyaları, gerekiyorsa
   yeni assertion'lar). Herhangi biri FAIL verirse §5'teki "Blocked
   Protokolü"ne geç, ilerleme.
3. **Commit at** — yalnız o prompt'un dokunduğu dosyaları stage'le
   (`git add <dosyalar>`, asla `git add -A`/`git add .` ile kör ekleme),
   commit mesajı prompt numarasını ve rapor maddesini referans versin
   (örn. `fix(panel): A1 — yan kanal fetch hatasında PROJECTION_SECTIONS artık korunuyor (prompt 1.1)`).
4. **Ledger'ı güncelle** — §3'teki formatla, commit SHA'yı
   (`git rev-parse HEAD`) ve test sonucu özetini yaz. Ledger güncellemesini
   AYRI bir commit olarak da atabilirsin (örn. `docs: ledger — prompt 1.1 done`)
   ya da kod commit'ine dahil edebilirsin, tutarlı ol.
4b. **Cache-bust kontrolü (ZORUNLU, atlanamaz)** — eğer bu commit
    `app.js`/`sync.js`/`styles.css` İÇERİĞİNİ değiştirdiyse `index.html`'deki
    ilgili `?v=` string'ini; `panel.js`/`panel.css`/`panelCoverageManifest.js`
    içeriğini değiştirdiyse `panel.html`'deki ilgili `?v=` string'ini AYNI
    commit'te bump'la. Bump'lamazsan kod doğru olsa bile canlıda eski,
    cache'lenmiş sürüm çalışmaya devam eder — bu, 2026-08-05'te 7 commit
    boyunca unutulup ancak kullanıcı ekran görüntüsüyle sorduğunda fark
    edilen gerçek bir olaydı (bkz. altındaki Olay Kaydı). `grep -n
    "app.js?v=\|sync.js?v=" index.html` ve `grep -n "panel.js?v=\|panel.css?v=\|
    panelCoverageManifest.js?v=" panel.html` ile bump'ı commit ETMEDEN ÖNCE
    doğrula; 3 test dosyası (`test_panel_p3_timeline_drawer.js`,
    `test_panel_p5_responsive_a11y.js`, `test_panel_p6_qa_release.js`)
    `panel.js`/`panel.css` versiyonunu hardcoded assert ediyor — bump
    edince bu testlerin literal'lerini de güncellemen gerekir.
5. **Faz tamamlandıysa push + deploy** — bir Faz'ın (1, 2, 3 veya 4)
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
6. **Bu dosyayı (§1'deki tutarlılık kurallarına göre) rapor ve prompt
   listesiyle çapraz kontrol et** — yeni bir tutarsızlık oluşmadığından
   emin ol.

---

## 5. Blocked Protokolü

Bir prompt'un doğrulama adımı FAIL verirse veya beklenmeyen bir engelle
karşılaşılırsa:

1. Ledger satırını `blocked` yap, Not sütununa TAM olarak neyin
   engellediğini yaz (hangi test, hangi hata mesajı).
2. Yarım kalan kod değişikliğini commit ETME — ya `git stash` ile kenara
   al ya da sorunu çözüp tamamla, ama `blocked` durumdaki bir işi
   yarım commit olarak `main`'e bırakma.
3. Bir sonraki oturum/ajan bu dosyayı okuduğunda `blocked` satırı
   görürse, önce onu çözmeden başka bir prompt'a geçmemelidir (bkz. §0
   madde 3).

---

## 6. Güvenlik Hatırlatması (CLAUDE.md'den özet — anti-amnezi için tekrar)

- Uygulamayı asla bir tarayıcıda açma / doğrulama için canlı fetch deneme.
- `mustafaras/seyma-data` reposuna asla explicit onay olmadan yazma.
- Doğrulama yalnız `node --check`, `tests/test_panel_*.js` ve
  `.claude/skills/run-seyma/` harness'larıyla yapılır.
- Push/deploy `main`'e doğrudan gider (ayrı review/PR aşaması yok) — bu
  yüzden §4 madde 2'deki doğrulama adımını ASLA atlamadan commit atma.

---

## 7. Olay Kaydı (Incident Log)

> Bu bölüm, ilerideki oturumların TEKRARLAMAMASI gereken gerçek hataları
> kaydeder — anti-amnezi'nin özü budur. Yeni bir olay olursa buraya EKLE,
> mevcut kaydı silme/üzerine yazma.

**2026-08-05 — Cache-bust bump'ı 7 commit boyunca unutuldu.** Prompt
1.1/1.2/1.3 ve öncesindeki "satırlarda gerçek değeri göster" commit'i
`app.js`, `panel.js`, `panelCoverageManifest.js`, `panel.css` içeriğini
değiştirdi, tüm testler PASS verdi, deploy başarılı oldu — ama
`index.html`/`panel.html`'deki `?v=` cache-bust string'leri hiç
bump'lanmadı. Kullanıcı canlı ekran görüntüsü paylaşıp "tam ve kusursuz
oldugundan emin misin" diye sorana kadar fark edilmedi; ekrandaki "Su
güncellendi" (değersiz) satırı, kullanıcının cihazının hâlâ eski
cache'lenmiş `app.js`'i çalıştırdığının işaretiydi. Düzeltme: commit
`4872509` ile `app.js` (2026080501→2026080502), `panel.css`
(20260805a→20260805b), `panel.js` (20260805a→20260805b),
`panelCoverageManifest.js` (20260802e→20260805a) bump'landı, 3 test
dosyasının hardcoded assertion'ları güncellendi, deploy run `31030556963`
ile doğrulandı. **Ders:** "testler PASS + deploy success" DEPLOY'UN
GÖRÜNÜR OLDUĞU anlamına gelmez — cache-bust ayrı, unutulması kolay bir
adımdır; bu yüzden §4'e madde 4b olarak zorunlu kontrol eklendi.
