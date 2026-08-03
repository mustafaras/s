# Yeni Oturum Başlangıcı — Repo kalan kapıları ve ÆON panel promptları

**Hazırlanma tarihi:** 2026-08-02
**Amaç:** B3 scratch tesliminden sonra kalan repo kabul kapılarını kanıtla
tamamlamak ve ardından panel prompt zincirini kontrollü biçimde başlatmak.
**Çalışma kuralı:** Bu dosya bir başlangıç sözleşmesidir; tarihsel sohbet
hafızası yerine canlı repo, ledger ve test kanıtı esas alınır.

## Yeni oturumda ilk mesaj

```text
Bu repo için `docs/NEW-SESSION-STARTER-REPO-PANEL.md` dosyasını başlangıç
otoritesi olarak kullan. Önce AGENTS.md, CLAUDE.md, docs/README.md, repo
planı ve eşli ledger’ları oku; sonra canlı branch/main/PR/deploy durumunu
doğrula. REPO-L002–REPO-L006 review kapıları kullanıcı tarafından açıkça
kabul edilmeden production state.js/save() entegrasyonuna veya panel koduna
başlama. Kullanıcı verisine, data/ klasörüne, sync.js’e, localStorage’a ve
seyma-data reposuna dokunma. İlk güvenli eylem yalnız read-only durum ve test
doğrulamasıdır; ardından rapor ver ve bir sonraki kapı için dur.
```

## Otorite okuma sırası

Yeni oturumda aşağıdaki sırayı değiştirmeden izle:

1. `AGENTS.md` — veri güvenliği, browser yasağı, handoff ve test kuralları.
2. `CLAUDE.md` — uygulama mimarisi ve headless doğrulama sınırları.
3. `docs/README.md` — canonical belge haritası.
4. `docs/REPO-ORGANIZASYON-VE-MODULERLESTIRME-PLANI.md` — repo fazları.
5. `docs/ledgers/REPO-LEDGER-OPERATIONS.md` ve
   `docs/ledgers/REPO-LEDGER-STATE.md` — paired repo kanıtı.
6. `docs/panel/README.md` — panel prompt sırası ve dur-kontrol ilkesi.
7. `docs/panel/ledgers/PANEL-LEDGER-OPERATIONS.md` ve
   `docs/panel/ledgers/PANEL-LEDGER-STATE.md` — panel faz durumu.
8. `docs/panel/prompts/00-PANEL-ANTI-AMNESIA-BASLANGIC-PROMPTU.md`.
9. Kullanıcı açıkça başlattıktan sonra yalnızca
   `docs/panel/prompts/01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md`.

Prompt 01 okunmadan sonraki panel prompt’una geçilmez. Prompt 00 yalnızca
başlangıç/kapı sözleşmesidir; prompt 01 kullanıcı tarafından seçilmeden kod
ve panel state değişikliği yapılmaz.

## Kanıtlanmış checkpoint

- `REPO-L006` scratch adapter commit’i: `6240ae6`.
- PR: [#96](https://github.com/mustafaras/s/pull/96), merge edilmiş durumda.
- `main` merge commit’i: `1675c6e1dc3ae7177fa405a51f24841b96a360e8`.
- Pages workflow: [run 30753065870](https://github.com/mustafaras/s/actions/runs/30753065870), `success`.
- Pages adresi: <https://mustafaras.github.io/s/>.
- Deploy edilen committe yalnız scratch/harness/doküman/ledger değişiklikleri
  vardır; kullanıcı verisi veya production persistence akışı değişmemiştir.
- B3: `20/20`; B1: `64/64`; B2: `32/32`; Zikirmatik: `90/90`;
  sync: `64/64`; panel: `50/50`; app headless boot: PASS.
- `app/core/state.js` oluşturulmadı; `migrate()` dışa açılmadı; `save()` ve
  production dependency injection entegrasyonu yapılmadı.

## Repo faz durumu

| Alan | Durum | Yeni oturumdaki anlamı |
|---|---|---|
| M0–M3 Markdown organizasyonu | `completed` | Canonical docs/archive düzeni hazır. |
| L0 runtime dependency map | `completed` | Giriş ve bağımlılık haritası kayda alındı. |
| L1 panel split | `completed` | `panel.html` shell, `panel.css`, `panel.js` ayrımı tamam. |
| L2-a `constants/icons` | `ready_for_review` | Kanıt var; kullanıcı kabulü olmadan yeni L2 taşıması yok. |
| L2-b/B1 helper fixture | `ready_for_review` | Read-only fixture kanıtı var; runtime extraction yok. |
| L2-b/B2 migration parity | `ready_for_review` | Sentetik parity kanıtı var; production migration değişmedi. |
| L2-b/B3 adapter scratch | `ready_for_review` | Sözleşme kanıtı var; gerçek `state.js` adapter’ı yok. |

`ready_for_review` kayıtlarını kullanıcı kabulü olmadan `completed` olarak
değiştirme. Kabul verildiğinde tarihsel satırları geriye dönük düzenlemek
yerine paired ledger kuralına uygun append-only kabul kanıtı oluştur.

## Panel faz durumu

- `PANEL-000`: `completed` — baseline araştırma.
- `PANEL-001`: `ready_for_review` — prompt paketi ve ledger’lar.
- `PANEL-002`: `ready_for_review` — canonical docs index.
- Sıradaki sequence: `PANEL-003`.
- Sıradaki tek dosya: `01-PANEL-P0-SENKRON-MAKBUZU-PROMPTU.md`.

Panel prompt zincirinin ilk işi, uygulama ve panel arasında senkron makbuzu,
revision/lag/conflict görünürlüğü için mevcut kanıtı çıkarmaktır. Bu adım,
user state’i değiştirmeden önce read-only araştırma ve plan kapısından geçer.

## Sert sınırlar

- Gerçek browser açma; uygulamayı kontrol etmek için `run-seyma` headless VM
  harness’lerini kullan.
- `data/`, `sync.js`, `localStorage`, `mustafaras/seyma-data` ve kullanıcı
  state’ine okuma/yazma yapma.
- `app/core/state.js`, `migrate()`, `save()`, script sırası veya persistence
  entegrasyonunu ayrı kabul kapısı olmadan başlatma.
- `SeySync`, GitHub Contents API, gerçek token veya gerçek kullanıcı verisiyle
  test yapma.
- Commit, push, merge, deploy veya branch silme için kullanıcı yetkisi yoksa
  dış aksiyon alma; mevcut deploy yetkisi yalnızca açık kullanıcı talimatı
  kapsamındadır.
- Panelde ham hassas cevapları veya token/secrets’ı DOM’a/log’a taşıma.
- `seyma_motivation_v2_package/` gibi local-only paketleri commit etme.

## İlk güvenli doğrulama turu

```bash
cd /Users/m_ras/Desktop/sey
git status --short --branch
git fetch origin
git log --oneline --decorate -5
node --check app.js
node --check sync.js
node --check panel.js
node .claude/skills/run-seyma/verify-state-adapter-contract.mjs
node .claude/skills/run-seyma/verify-state-helper-boundary.mjs
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/test_faz10_sync.js
node tests/test_faz11_panel.js
git diff --check
```

Bu komutlardan biri kırmızıysa panel prompt’una geçme; çıktıyı, commit’i ve
ilgili ledger kaydını raporla. Testlerin yeşil olması tek başına scientific,
data veya production integration izni vermez.

## Sıralı devam kapıları

### Kapı A — repo review’ını kapat

1. Canlı paired repo ledger’larını ve `git status` sonucunu doğrula.
2. Kullanıcıdan L2-a/L2-b kayıtlarını kabul edip etmediğini açıkça al.
3. Kabul yoksa yalnız rapor ver ve dur.
4. Kabul varsa append-only kabul makbuzu/ledger kanıtını yaz; tarihsel
   satırları sessizce yeniden yazma.
5. Gerçek `migrate(input, deps)` parity çalışması istenirse önce scratch
   harness’te tasarla; `app/core/state.js` ve `save()` yine ayrı kapıdır.

### Kapı B — panel prompt zincirini başlat

Kapı A’nın durumu netleştikten ve kullanıcı açıkça “01-PANEL-P0…” prompt’unu
başlattıktan sonra:

1. `PANEL-003` sequence’ini paired panel ledger’a append et.
2. Yalnız Prompt 01’in kapsamındaki senkron makbuzu/revision/lag/conflict
   araştırmasını yap.
3. Uygulamaya kod yazmadan önce mevcut alanlar, kayıp alanlar ve veri izin
   sınırlarını raporla.
4. Prompt’un kendi stop/review kapısında dur; otomatik olarak Prompt 02’ye
   geçme.

## Handoff çıktısı

Oturum sonunda şunları birlikte kaydet:

- değişen dosyalar ve temiz/kirli çalışma ağacı;
- çalıştırılan testler ve assertion sayıları;
- repo/panel ledger sequence ve durumları;
- kullanıcı verisi/data/sync sınırının korunumu;
- commit/PR/merge/deploy kanıtı varsa hash, URL ve workflow run;
- bir sonraki güvenli action ve açık kullanıcı kapısı.

Bu starter’ın ilk güvenli sonucu bir kod değişikliği değil, canlı repo
kanıtıyla hazırlanmış kısa bir durum raporudur.
