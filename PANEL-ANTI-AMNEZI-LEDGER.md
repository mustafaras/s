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
| 1.1 | A1 | `done` | d359cfe | test_panel_p0_sync.js 31/31 PASS (yeni [4] bloğu dahil) + 10 diğer panel test dosyası regresyonsuz PASS | — (Faz 1 tamamlanınca push/deploy edilecek) | 2026-08-05 | SECTION_FETCH_STATE eklendi, sync ribbon uyarısı eklendi, panelSig() güncellendi |
| 1.2 | A2 | `done` | ab355dc | test_panel_p1_projection 35/35, p3_root_modules 29/29, p4_provenance 24/24 PASS (yeni [3]/[5] blokları dahil) + 9 diğer panel test dosyası regresyonsuz PASS | — (Faz 1 tamamlanınca push/deploy edilecek) | 2026-08-05 | therapyProjection/locationTimingProjection 'stale' status eklendi (7/3 gün eşik), d4ModuleDescriptorsP rollup güncellendi |
| 1.3 | A3 | `pending` | — | — | — | — | Henüz uygulanmadı |
| 2.1 | A4 | `pending` | — | — | — | — | Henüz uygulanmadı |
| 2.2 | B1 | `pending` | — | — | — | — | Henüz uygulanmadı |
| 2.3 | B2 | `pending` | — | — | — | — | Henüz uygulanmadı |
| 3.1 | C2, C3 | `pending` | — | — | — | — | Henüz uygulanmadı |
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
