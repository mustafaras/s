# K3P-26 devir notu → **Codex Luna**

**Kim için:** K3P-26'yı ("Son görsel QA, ölçüm ve kapanış belgesi") uygulayacak **yeni oturum**.
**Hazırlayan:** önceki oturum (K3P-23 · K3P-24 · K3P-25 + iki ara yayın).
**Tarih:** 2026-10-18 · **Dal:** `kao3-premium` (LOCAL-ONLY, `origin/kao3-premium` 8 commit geride)
**Durum:** 35/37 kart bitti · `senkron` **UYUMLU** · ağaç **temiz** · `nextPrompt: K3P-26`

> Bu belge **kolaylık** içindir; **bağlayıcı olan** `kao3-premium/BAGLAM-YONETIMI.md` §1–§6'dır.
> Çelişki olursa BAGLAM-YONETIMI kazanır.

---

## 0 · Oturumu başlatma (ilk mesaj olarak yapıştır)

```text
K3P programındasın (Kur'an Arapçası modalı · "Tezhip"). Repo kökü: /Users/m_ras/Desktop/seyma

1. Önce kao3-premium/BAGLAM-YONETIMI.md belgesini oku. §1–§6 bağlayıcıdır.
2. Şunu çalıştır: node kao3-premium/araclar/senkron.mjs --sonraki
   Çıktıdaki prompt bu oturumun TEK görevidir. Beklenen kimlik: K3P-26 ("Son görsel QA, ölçüm ve
   kapanış belgesi"). Farklı bir kimlik çıkarsa uygulama, bana bildir.
3. Senkron UYUMSUZ derse ya da çalışma ağacı beklenmedik biçimde kirliyse DUR ve bana bildir.
4. Bu kart DALGA SONU DEĞİL, ama TAM KAPI ZORUNLU (kartın Kabul maddesi). §3 kapanış protokolünü uygula:
   hızlı kapı + tam kapı → K3P-STATE / CURRENT-STATE / LEDGER → uyum denetimi → tek commit → kısa rapor.
5. Bağlam yetmezse §4 devir protokolünü uygula: commit yok, devir notu yaz.

Değişmez kurallar:
- Push, merge ve deploy YOK. Bunlar yalnız K3P-27'de, benim AÇIK onayımla yapılır.
- mustafaras/seyma-data deposuna yazma.
- Token ya da parola isteme.
- Yeni App.kao* handler ekleme (45'te kalır); data şeması ve migrate() değişmez (I1–I6).
```

---

## 1 · Nerede kaldık — son üç kartın özeti

| Kart | Ne yaptı | Commit |
| --- | --- | --- |
| **K3P-23** | Okuyucuda çalan kelime **altın halka** (yalnız CSS) + "Kartlarıma ekle" (`App.kaoReader('add',i)`; `kaoNewWordCard` şeması; idempotent; doğrulanmamış lemma reddi) | `c5e73343` |
| **K3P-24** | İlerleme ekranı: **üç sade ölçü** (kapsam % · yaldızlı sûre ×/20 · bu hafta gün/5) + 20 Tezhip küçük resim + tek katlanan `Ayrıntılar` | `658370ac` |
| **K3P-25** | Mevcut kullanıcıya **hızlı geçiş seçimi, BİR KEZ**; `onboarding.k3pNoticeAt`; **ayar sessizce değişmez**; "Aç" → mevcut `App.kaoToggleAutoAdvance` | `f5b068b4` + düzeltme `9de24acb` |

**Ara yayınlar (canlıda):** pin `20261017a`. Pages run `39039103025` success · canlı eşlik **63/63** SHA-256 · canlı özellik kontrolü **24/24**. Final `releaseApproval` hâlâ **NOT_APPROVED** (K3P-27'de onay istenecek).

**K3P-25'te denetimde bulunan ders (tekrarlama):** kabul testleri "ayar sessizce değişmiyor"ü sınıyordu ama **düğmeye basıldıktan sonraki durumu** sınamıyordu; teklif ekranda kalıyordu ve ikinci basış ayarı geri kapatıyordu. Ledger **seq 68**. → **K3P-26'da da aynı soruyu sor: "ölçtüğüm şey gerçekten kullanıcının gördüğü şey mi?"**

---

## 2 · K3P-26'nın kabul ölçütleri (karttan)

1. `KAO_QA_SCAN` taraması **taşma göstermiyor**.
2. `kapi-hizli --kart K3P-26` **yeşil**.
3. **Tam kapı** yeşil: `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL".

Teslimatlar: `kao3-premium/kanit/sonraki/` altında kontak sayfaları, K3P-00 ile yan yana karşılaştırma sayfası, ANALIZ §7 + AKIS §6 tablolarına **"Sonra"** sütunu, ve `kao3-premium/KAPANIS.md`.

---

## 3 · ⚠️ GÖRSEL QA — GÜVENLİK PROTOKOLÜ (en kritik bölüm)

Bu repo 2026-07-10'da **gerçek kişisel veri kaybı** yaşadı: ajan "çalışıyor mu" diye tarayıcı açtı; tarayıcıda **bayat `seyma-reset-v1` + geçerli `ghToken`** vardı; uygulama açılışta `save()` → `SeySync.schedule()` çağırdı ve `mustafaras/seyma-data`'daki **17 günlük gerçek veri silindi** (4395 → 229 satır).

**K3P-26'nın kartı sana ekran görüntüsü izni VERİYOR** — ama bu izin **yalnız** aşağıdaki kanal içindir. Dışına çıkma.

### 3.1 Zorunlu sıra

```bash
# 1) ÖNCE Guard 1 testi (kart bunu zorunlu kılıyor)
node tests/app/test_local_visual_qa_guard.js
#    → PASS görmelisin. Kırmızıysa DUR.

# 2) Sonra çekim. shoot-modal SUNUCU AÇMAZ: cdp.mjs headless Chrome for Testing'i
#    CDP pipe ile sürer, http://127.0.0.1:9000/* isteklerini diskten karşılar,
#    diğer TÜM dış istekleri keser.
mkdir -p kao3-premium/kanit/sonraki
for w in 320 390 460; do
  KAO_QA_SCAN=1 node tools/kapi/gorsel-qa/shoot-modal.mjs "$PWD" "kao3-premium/kanit/sonraki/acik-$w" "prof-k3p26-a$w-$RANDOM" $w
  KAO_QA_SCAN=1 node tools/kapi/gorsel-qa/shoot-modal.mjs "$PWD" "kao3-premium/kanit/sonraki/koyu-$w" "prof-k3p26-k$w-$RANDOM" $w dark
done
```

- **Chrome macOS sandbox içinde açılmıyor** → Bash `dangerouslyDisableSandbox` / kullanıcı onayı gerekir. Reddedilirse **görsel QA'yı atla**, `KAPANIS.md`'ye **"görsel QA: yapılmadı (sandbox izni yok)"** yaz. **Asla** `python3 -m http.server` açıp `open http://...` yapma.
- Profil adı **her çalıştırmada yeni** olmalı (`$RANDOM` ile).
- URL'de **`forceSync=1` yok**, `seyma-sync-force` **set edilmez**, `v3done=1` kullanılır.

### 3.2 Asla yapılmayacaklar

| Yasak | Neden |
| --- | --- |
| `python3 -m http.server` + `open http://127.0.0.1:…` | Gerçek profil/bayat token → veri kaybı (2026-07-10) |
| Kullanıcının mevcut Chrome profilini açmak | O profilde canlı `ghToken` olabilir |
| `seyma-sync-force` ya da `?forceSync=1` | Anti-clobber korumasını devre dışı bırakır |
| Uygulamayı gerçek hesapla açmak | Push tetikleyebilir |
| Token/parola alanına dokunmak, doldurmak, okumak | Yasak (CLAUDE.md kural 6) |
| `mustafaras/seyma-data`'ya yazmak | Tek canlı kişisel veri kopyası |
| Ekran görüntülerini commit'lemek (kişisel veri içerirse) | Sentetik veri kullanılıyor; yine de `log.txt`'yi gözden geçir |

**`shoot-modal.mjs` sentetik durum kurar** (`createDefaultData()` + 60 kelime kart + `authUnlocked`/`locationGateState` bayrakları) — gerçek veri okumaz. Yine de `log.txt`'de `origin: http://127.0.0.1:9000 token: false force: null` satırını **gözünle doğrula**.

---

## 4 · Ölçü araçları — "Sonra" sütunu için çalıştırılacaklar

Hepsi **salt-okur, ağsız, `node:vm`**; sunucu/tarayıcı açmaz.

```bash
node kao3-premium/araclar/cift-sik.cjs        # çift şıklı görev (hedef 0)
node kao3-premium/araclar/okunus-denetim.cjs  # vasl + güneş harfi idgâmı (hedef 0)
node kao3-premium/araclar/dokunus-olc.cjs     # ders başına dokunuş (hedef ≤40)
node kao3-premium/araclar/ekran-dok.cjs "$TMPDIR/kao3-ekran"   # Bugün ekranı düğme sayısı (hedef ≤5)
node kao3-premium/araclar/akis-olc.cjs        # AKIS §6 tablosunun tamamı
KAO2_ACCEPT_SLOW_HOST=1 node tests/kao/test_kao2_perf_budget.js # runtime/css/content/p95
```

**Yorumlama tuzakları (bunlar bilinen, gizlenmemesi gereken sınırlar):**

| Tuzak | Doğrusu |
| --- | --- |
| `akis-olc.cjs` **2b** hedef ekranını ≤45 sayar | Gerçek kural **≤25 sözcük** (AKIS §3 ①). Araç eski; K3P-A8'de kayda geçti. İkisini de yaz. |
| `tekrar-uret.cjs` özeti **9/10** | Düşen **R-08** tarihsel araç modelidir (eski `apply.words/sentences`). Güncel denetim R-08 PASS. "10/10 iddiası yok" ilkesi LEDGER'da yazılı. |
| perf **göreli p95 bandı** bu makinede kırmızı | `main` üzerinde de kırmızı (taban). `KAO2_ACCEPT_SLOW_HOST=1` **yalnız** bu bandı atlar; **mutlak tavanlar zorunlu**. |
| `components` zamanlama flake'i | Geçmişte tek başına PASS verdi; iki koşuda görülürse "flake" diye yaz, gizleme. |
| `$?` boru hattından sonra okunmaz | `node x | tail` sonrası `$?` **tail**'in kodudur. Kapı kodunu doğrudan kullan. |

---

## 5 · Bütçe durumu (2026-10-18 ölçümü)

| Ölçü | Şimdi | Tavan | Kalan |
| --- | --- | --- | --- |
| **Runtime** (gzip L9/L6 — bağlayıcı olan L6) | **133,061 KiB** | 136 KiB | ~3,1 KB |
| **CSS** gzip L9 | **15,877 KiB** | 16 KiB | **126 B — kritik** |
| İçerik | 184,591 KiB | 256 KiB | rahat |
| `App.kao*` | 45 | 45 | sabit |
| KAO fixture sayısı | 82 | — | — |

**CSS payı 126 B.** K3P-26 bir CSS kuralı eklemek zorunda kalırsa §2 bütçe kuralı: **önce aynı işi gören eski/öksüz kuralı sil**, yetmiyorsa **§5 gereği DUR ve kullanıcıya tavan kararını sor**. Tavanı yalnız kullanıcı yükseltebilir (geçmiş: 80 → 88 → 128; CSS 16 sabit).

---

## 6 · Tuzaklar — bu dalda gerçekten ısıran şeyler

1. **K-P pin kuralı.** `app/core/quranLearn.js`, `app/core/quranLearnViews.js`, `app/kao.css` **pinned** varlıklardır.
   Onları değiştiren her kart dosyayı `K3P-STATE.json → pinDeferral.files`'a **beyan etmek zorunda**
   (`tests/app/test_asset_pin_freshness.js` ERTELENDİ diyerek PASS verir). **Şu an beyanlı:**
   `app/core/quranLearn.js`, `app/core/quranLearnViews.js`. Ara yayın pini `20261017a`.
   **`?v=` pinini K3P-27'ye kadar YÜKSELTME** (§6.3, K-P).
2. **`test_kao_migration` / `test_kao2_migration` normalize edilmiş `onboarding`'in TAM alan kümesini sabitler.**
   Yeni alan eklersen bu fixture'ları da güncellemen gerekir (K3P-25'te kapı yakaladı).
3. **`test_kao_lexicon_coverage`** `card.readerUnknown!==true` dizesinin **tam 1** yerde geçmesini ister (yalnız `isSettled`). Kuralı kopyalama.
4. **`test_kao2_design_contract`** öksüz seçici taraması: CSS'te tanımlayıp işaretlemede kullanmadığın sınıf **kırmızı**. Yeni sınıfı `quranLearnViews.js`/`quranLearn.js` işaretlemesinde "önek + birleştirme" biçiminde kullan.
5. **`kao-verify-contrast`** `kao.css`'teki her `color:` bildirimini tarar. `--quran2`/altın ve `--kao-accent` **metin olarak** açık temada ~2,09:1 — kullanma. Güvenli vurgu metni: **`--kao-tint`**.
6. **fx2 pinleri:** `App` yüzeyi **766**, `onclick=` **393** (düz metin taraması, **yorumları da sayar**). Yorumda `App.<ad>=` yazmak pini kaydırır.
7. **`test_kao2_inventory`** README'deki sayıyı **gerçek dosya sayısına** eşit ister (şu an **82**). Yeni test eklersen aynı commit'te README satırı + sayı.
8. **`kapi-hizli`** ~6 dk, **tam kapı** ~15–20 dk. İkisini de arka planda çalıştır, çıktıyı `$TMPDIR`'a yaz, yalnız son satırları oku (§2 bağlam bütçesi).

---

## 7 · KAPANIS.md için hazır malzeme (K3P-27 bunu okuyacak)

Kart `KAPANIS.md`'de şunları istiyor — hazır olan veriler:

| Bölüm | Kaynak |
| --- | --- |
| Hedef karşılama tablosu | `K3P-STATE.json → baseline` + `targets` + ANALIZ §7 + AKIS §6 (Dalga A sonu tablosu dolu) |
| Kanıt düzeyleri | **kaynak/test** (kapılar) · **görsel QA** (bu kartta) · **cihaz** (BEKLİYOR — kullanıcı) |
| Hipotez takvimi H2–H9 | `node kao3-premium/araclar/deney-rapor.cjs <yedek.json> [--kesim GG] [--bugun GG]` · `--ornek` ile doğrula. 14. ve 30. gün talimatı. |
| Açık konular | **L2 okunuş uzman incelemesi** (yok), **cihaz kabulü** (yok), `tekrar-uret` 9/10, `akis-olc` 2b eski ölçü, açılış→ilk görev 3 (hedef ≤2, kullanıcı kararı A-3'ten beri açık) |

**Hipotezler (AKIS §7):** H7 uyarlanır zorluk (oturumların ≥%70'i %80–90 bandında) · H8 nefes ritmi (yarıda bırakma azalır) · H9 Tanış-Sına (ertesi gün ilk tekrar doğruluğu artar). H2–H6 için `deney-rapor.cjs` başlığını oku.

---

## 8 · Bilinen ve KABUL EDİLMİŞ açık sınırlar (gizleme, yaz)

- **Cihaz kabulü yok** — hiçbir kartta yapılmadı; yalnız kullanıcı verebilir.
- **Gerçek ekran okuyucu turu yok** (a11y sentetik olarak sınandı).
- **L2 okunuş alan uzmanı onayı yok** (L1 kayıtları `ai-delegated`).
- **230 kayıt** incelemesi kullanıcıda (KAO2'den devir).
- `releaseApproval: NOT_APPROVED` — **K3P-27'ye kadar değişmez**.

---

## 9 · Kapanışta yapılacaklar (BAGLAM-YONETIMI §3 — özet)

1. `node kao3-premium/araclar/kapi-hizli.mjs --kart K3P-26` → exit 0
2. `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` → "TÜM KAPILAR YEŞİL"
3. `K3P-STATE.json`: K3P-26 `status: done` + `doneAt` + `result`; `nextPrompt: K3P-27`
4. `CURRENT-STATE.md`: baştan yaz (şablonu var)
5. `LEDGER.md`: sona `seq 69 · K3P-26 · KART` kaydı (`Commit: (bu commit)`)
6. `node kao3-premium/araclar/senkron.mjs` → **UYUMLU**
7. **Tek commit:** `K3P-26: son görsel QA, önce/sonra ölçüm ve kapanış belgesi` + `Co-Authored-By: Copilot <223556219+Copilot@users.noreply.github.com>`
8. Rapor son satırı: `Sıradaki prompt: K3P-27 — "node kao3-premium/araclar/senkron.mjs --sonraki" ile al.`

**Push/merge/tag/deploy YOK.** K3P-27'de kullanıcıya açıkça sorulacak.

---

## 10 · Hızlı durum komutları

```bash
cd /Users/m_ras/Desktop/seyma
node kao3-premium/araclar/senkron.mjs            # uyum + sıradaki
git status --short --branch                      # ağaç temiz mi
git log --oneline -8                             # son commit'ler
python3 -c "import json;d=json.load(open('kao3-premium/K3P-STATE.json'));print(d['nextPrompt'],d['status'],d['releaseApproval'])"
```
