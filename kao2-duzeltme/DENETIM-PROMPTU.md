# KAO2-FIX — Bağımsız kapanış denetimi (yeni oturum promptu)

> Bu metni **yeni bir oturuma olduğu gibi yapıştır.** Denetçi, programı uygulayan oturumlardan bağımsızdır.
> Hiçbir kaydın (KANIT, LEDGER, CURRENT-STATE, FIX-STATE, kapanış belgesi) doğruluğunu varsaymaz; her iddiayı
> kod, git geçmişi ve kendi koşturduğu araç çıktısıyla doğrular.

---

Şeyma deposunda (`mustafaras/s`) **KAO2-FIX programının (44 prompt, K2F-00…K2F-43) tam ve kusursuz uygulanıp
uygulanmadığını** bağımsız olarak denetle. Program klasörü: `kao2-duzeltme/`. Program kayıtlara göre
"tamamlandı" (44/44, `nextPrompt: null`, pin `20261006e`). Senin işin bu iddiayı **çürütmeye çalışmak**.

## 0. Kurallar (önce bunlar)

1. `CLAUDE.md` "DATA SAFETY" bölümünü oku ve uy: tarayıcı açma, sunucu başlatma, `mustafaras/seyma-data`'ya
   yazma **YOK**. Doğrulama yalnız headless Node (`node:vm`) fixture'ları ve salt-okur araçlarla.
2. **Salt-okur denetim.** Üretim koduna, testlere, kayıt dosyalarına dokunma. Bulduğun kusuru düzeltme;
   yalnız raporla. Tek yazma izni: `kao2-duzeltme/denetim-2/` altındaki rapor dosyaları.
3. Push yok, merge yok, `main`'e hiçbir şey yok. Raporu kendi çalışma dalına tek commit olarak koy.
4. Kayıtlardaki sayılar **iddiadır**. Handler sayısı, pin, bütçe, test sayısı, R durumu: hepsini kendin ölç.
5. Kanıt düzeylerini ayır: **kaynak/test** (sen koşturdun) · **yayın** (git/Actions kaydı) · **cihaz**
   (yalnız kullanıcı beyanı; senin elinde yok). "Cihazda çalışıyor" deme.
6. Büyük dosyaları tamamen okuma (`app/core/quranLearn.js` ~3,9k satır, `app.js`, `index.html`):
   önce `grep -n`, sonra ±60 satır. Test çıktısını `| tail` ile oku ama çıkış kodunu boru sonrasında okuma.
7. Bulgu belirsizse "doğrulanamadı" yaz; tahminle "geçti" ya da "kaldı" deme.

## 1. Ortam hazırlığı (bu konteynerde yaşanan tuzaklar)

```bash
git fetch --unshallow origin 2>/dev/null || git fetch origin   # sığ klonda plan-check/sınır testleri yanlış kırmızı verir
which rsync || apt-get install -y rsync                         # yoksa test_deploy_surface_contract yanlış kırmızı
git log --oneline | head -5 && git rev-parse HEAD origin/main
node kao2-duzeltme/tools/fix-sync-check.mjs --repro             # kayıt senkronu (yalnız tutarlılık, doğruluk değil)
```
- Geçici dosyalar için oturumun scratchpad dizinini **mutlak yolla** kullan (`$TMPDIR` boş olabilir).
- `pkill -f <desen>` kendi kabuğunu öldürebilir; gerekirse PID ile durdur.
- Konteyner referans makineden ≈2× yavaş: `test_kao2_perf_budget` göreli p95 bandı burada **değişiklik öncesi
  de** kırmızıdır. Bunu bulgu sayma; ama aynı süreçte taban commit ile A/B karşılaştır (`kao2-duzeltme/tools/perf-ab.cjs`
  varsa) ve oranı yaz.

## 2. Kaynaklar (okuma sırası)

1. `kao2-duzeltme/README.md`, `BAGLAM-YONETIMI.md`
2. `kao2-duzeltme/PROMPTLAR.md` — §1 (P1–P14 protokolü) tamamı; §2 her promptun **Amaç · Kapatır · Oku ·
   Dokun · Adımlar · Kabul · Commit** satırları; §3 bulgu→prompt eşlemesi (49/49); §4 pin/handler çizelgesi.
3. `kao2-duzeltme/denetim/KUSUR-RAPORU.md` (49 bulgu) ve `denetim/DUZELTME-PLANI.md` (KR-1…KR-7).
4. `kao2-duzeltme/FIX-STATE.json`, `.anti-amnesia/CURRENT-STATE.md`, `.anti-amnesia/LEDGER.md` (seq 1…122).
5. `kao2-duzeltme/evidence/K2F-*/` (KANIT.md, YAYIN*.md, ek kanıtlar) ve `deliverables/KAO2-FIX-KAPANIS.md`.
6. Program aralığı: `FIX-STATE.json.baseCommit` (`07802fa6`) → `HEAD`. `git log --format='%h %s' 07802fa6..HEAD`.

## 3. Denetim adımları

### A. Bağımsız tekrar üretim (önce bunu yap, kayıtları okumadan önce)
```bash
node kao2-duzeltme/denetim/tekrar-uret.cjs        # beklenen iddia: 10/10 PASS
node tests/kao/test_kao2_denetim.js               # R-01…R-10 kalıcı fixture
```
Her R-xx için: kontrolün gerçekten bulguyu sınadığını kaynaktan oku (kontrol zayıflatılmış ya da sabit
`true` dönüyor olabilir). En az 3 R kontrolünde **mutasyon testi** yap: düzeltmeyi scratchpad kopyasında geri
al (çalışma ağacında değil) ve kontrolün FAIL verdiğini göster.

### B. Tam kapı koşusu
```bash
bash kao2-duzeltme/tools/kapilar.sh               # tamamlanırsa en güçlü kanıt; ~25+ dk sürebilir
```
`kapilar.sh` bu konteynerde tamamlanamıyorsa eşdeğer paralel koşu yap ve raporda **açıkça** "kapilar.sh değil"
yaz: `tests/{kao,app,panel,panel-v2,quran}/test_*.js` (`xargs -P 4`, kabul + perf_budget hariç) · `node
tests/reminders/run-reminder-smoke.mjs` · `.claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs` ·
`docs/kuran-ogreniyorum/tools/kao-verify-contrast.mjs` · `kao2-duzeltme/tools/l2-paket-build.mjs --check` ·
`docs/kuran-ogreniyorum/tools/kao-plan-check.mjs` · en son tek başına `KAO2_ACCEPT_SLOW_HOST=1 node
tests/kao/test_kao2_kabul.js`. Paralel koşu sırasında **çalışma ağacını değiştirme** (git stash dahil).
Kırmızı her test için taban committe de kırmızı mı, kontrol et.

### C. 49 bulgu — koddan doğrulama
`KUSUR-RAPORU.md`'deki **her** bulgu için (49 satır):
- Bulgunun iddiasını yeniden üret (rapordaki ölçüm yöntemiyle) ve **bugünkü kodda** durumunu ölç.
- §3 eşlemesindeki promptun commit(ler)ini bul, diff'in bulguyu gerçekten adreslediğini oku.
- Koruyucu bir test var mı; test bulguyu sınıyor mu (adı değil, içeriği)?
- Sonuç: `KAPANDI` · `KISMEN` · `KAPANMADI` · `YALNIZ BELGE` · `DOĞRULANAMADI` + tek cümle kanıt
  (dosya:satır ya da komut çıktısı).
Kapanış belgesindeki "kapandı (kaynak/test)" damgası **toplu** yazılmıştır (betikle üretilmiş tablo); tek tek
doğrulanmamış kabul et.

### D. 44 prompt — protokol uyumu
Her K2F-NN için tablo satırı:

| Kontrol | Nasıl |
|---|---|
| Commit var, öneki tam `K2F-NN: ` | `git log --format='%h %s' 07802fa6..HEAD \| grep 'K2F-NN'`; `kao-plan-check` öneki katı denetler |
| Tek commit (P4.6) | Promptun commit sayısı; ek commit'ler (yayın kaydı, "ek", FIX) LEDGER'da gerekçeli mi? |
| Dokun listesi (P1.6) | `git show --stat` dosyaları ⊆ promptun **Dokun** listesi + `kao2-duzeltme/`; dışındakiler P6 BLOCKED ya da kayıtlı gerekçe gerektirir |
| Adımlar/Kabul | Promptun her adımı ve kabul ölçütü kodda/testte karşılanmış mı? Somut kanıt |
| TDD (P2) | KANIT'ta kırmızı satırı var mı; o kırmızı gerçekçi mi (testi o committen önceki koda karşı koştur — scratchpad'de `git worktree` ya da `git show <önceki>:<dosya>`) |
| Test zayıflatma (P2.4) | Değişen her testin diff'i: kaldırılan/gevşetilen assert var mı; "Bilerek değişen testler"de gerekçesi var mı |
| Yasaklar (P5) | `app.js` dışı dokunuş, `migrate()`/`var ui=`, yorumda `App.<ad>=` ya da tıklama niteliği adı, elle Arapça (P9), FSRS/`kaoBuildQueue` değişikliği, ses kaydı kalıcılığı, veri silen kod |
| Handler/pin (P8) | Yeni `App.kao*` yalnız K2F-12/16/30'da; shim biçimi; pin testleri aynı committe |
| Yayın pini | `?v=` yalnız yayın commit'lerinde değişti mi |
| Kayıt üçlüsü | LEDGER kaydı + CURRENT-STATE + FIX-STATE aynı committe; KANIT P11 şablonuna uygun |
| Oturum kuralı | BAGLAM §2 "oturum = tek prompt"; aynı oturumda birden çok prompt kapatıldıysa (Claude-Session satırından bak) kayıtlı mı |

### E. Bilinen sapmalar — bunları özellikle doğrula ve sınıflandır
Önceki oturumların kendi raporladığı ya da raporlamadığı noktalar; her biri için "kabul edilebilir / kusur" kararı ver:
1. **K2F-40** `tests/kao/test_kao_pronunciation_contract.js`'e dokundu (Dokun listesinde yok; P6 yerine KANIT'ta
   gerekçe). Ayrıca 18 HTML dökümünün bayt-eşitliği iddiası: dökümler depoda yok; 6 görev türü × 3 durumu
   kendin üret (`kaoTaskHTML`, gerçek `kaoBuildTask` görevleriyle de) ve K2F-40 öncesi (`git show <önceki>:app/core/…`)
   ile karşılaştır.
2. **K2F-40** sırasında paralel test koşusu sürerken `git stash` yapıldı — o koşunun sonucu güvenilmez; ikinci koşu
   temiz mi?
3. **K2F-41, K2F-42, K2F-43** aynı oturumda yürütüldü (BAGLAM §2 ihlali). K2F-42 kapanış tablosu betikle üretildi;
   K2F-41 belge notundaki (`archive/kuran-ogreniyorum-v2/DUZELTME-NOTU.md`) her iddiayı rapora karşı doğrula.
4. **K2F-43 kullanıcı kapısı**: prompt açık cümle ister (`YAYIN-2 onaylı`); kullanıcı "canlıya al" dedi. Kayıtta
   böyle mi yazıyor, kapı protokolü (P7, LEDGER `GATE` kaydı) uygulandı mı?
5. `kapilar.sh` hiçbir son promptta tam koşmadı (K2F-38…43 "eşdeğer paralel koşu"). Sen koşabildin mi?
6. `perf_budget` göreli bandı kırmızı; A/B oranı +%25 bandında mı?
7. Yayın kanıtı: K2F-18 sonrası her yayın için Pages run ID, ff-only, `?v=` listesi; **canlı bayt eşitliği hiçbir
   yayında konteynerden doğrulanmadı** (github.io engelli). Sen deneyebiliyor musun (`curl -sS -m 20
   https://mustafaras.github.io/s/sw.js`)? Olmuyorsa kullanıcıya verilecek tek komutluk SHA-256 doğrulama betiğini
   rapora ekle.
8. `65e94db "K2F-38 ek:"` önek hatası ve diğer "ek"/yayın-kaydı commit'leri (M-05 benzeri tek-commit ihlalleri).
9. `CLAUDE.md`/`AGENTS.md` KAO2 satırları birebir aynı mı; `tests/kao/README.md` envanteri gerçek dosya listesine eşit mi
   (yalnız `test_kao2_*` değil, tüm `tests/kao/*.js`).
10. CURRENT-STATE "Canlı gerçekler" ve "Açık riskler" bölümleri bayat satır taşıyor mu (ör. eski pin, eski bütçe,
    kapanmış risk)?

### F. Ölçümler (kendin ölç, kayıtla karşılaştır)
- `App.kao*` handler sayısı, App yüzeyi, atama sayısı, `onclick` sayısı (pin testlerinin ölçüm yöntemiyle).
- Bütçe K-1: içerik gzip (≤256 KiB; 4 modül ≤164; müfredat ≤48), runtime `quranLearn*` gzip (≤128 KiB), `kao.css` gzip (≤14 KiB).
- Yayın pini: `index.html`, `sw.js` (`SW_VERSION`, `SW_OFFLINE_VERSION`), `panel-v2.html`, pin testleri tutarlı mı.
- `texts.tr.json` inceleme düzeyleri (`draft` sayısı), L2 durumu.
- Kabul A-1…A-10: testin her ölçütü gerçekten ölçüyor mu (sabit sayı/regex sayımı yok mu) — K6-01 tekrar etmesin.

## 4. Çıktı

`kao2-duzeltme/denetim-2/` altında:
1. `DENETIM-RAPORU.md`:
   - **Tek paragraf hüküm**: program "tam ve kusursuz" mu? Değilse en ciddi 3 sorun.
   - Ölçüm tablosu (kayıttaki değer ↔ senin ölçümün).
   - 49 bulgu tablosu (C).
   - 44 prompt uyum tablosu (D) — her satırda geçti/kaldı ve kanıt.
   - Bilinen sapmalar kararları (E).
   - Yeni bulgular: kimlik `D2-NN`, önem **kritik / yüksek / orta / düşük**, yeniden üretme komutu, etkilenen
     dosya:satır, önerilen düzeltme (uygulama!).
   - Kanıt düzeyleri ayrı bölüm; doğrulanamayanlar listesi; kullanıcıya düşen işler.
2. `tekrar-uret-2.cjs` (isteğe bağlı): yeni bulguların salt-okur, ağsız yeniden üretim kontrolleri.

Sonra: `git add kao2-duzeltme/denetim-2/` ve tek commit (`KAO2-FIX denetim-2: bağımsız kapanış denetimi`).
Push yalnız kendi çalışma dalına; `main`'e yok. Kullanıcıya hükmü, bulgu sayısını önem sırasıyla ve rapor yolunu
kısaca bildir. Düzeltme kararı kullanıcınındır.
