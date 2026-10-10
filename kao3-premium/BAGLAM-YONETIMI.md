# K3P · Bağlam yönetimi: her oturumun kuralları

Bu belge, K3P prompt'larını uygulayan ajan için yazıldı. Her prompt **taze bir oturumda** çalışır;
önceki konuşmayı hatırlamaz. Hafıza yalnız şu dört dosyada tutulur:

| Dosya | Rolü | Kim yazar |
| --- | --- | --- |
| `K3P-STATE.json` | Makine durumu: `nextPrompt`, `executionOrder`, kart durumları, taban ve hedef ölçüler | Her prompt'un kapanışı |
| `.anti-amnesia/CURRENT-STATE.md` | İnsanın okuyacağı anlık durum: son iş, sıradaki prompt, açık riskler, devir notu | Her prompt'un kapanışı; üzerine yazılır |
| `.anti-amnesia/LEDGER.md` | Kayıt defteri; her prompt sona bir kayıt ekler | Her prompt'un kapanışı; yalnız ekleme |
| `PROMPTLAR.md` | Prompt metinleri | Plan. Değişirse LEDGER'a "DÜZELTME" kaydı düşülür. |

Dört dosyanın birbiriyle uyumunu `node kao3-premium/araclar/senkron.mjs` denetler.

---

## §1 Açılış protokolü (her prompt'un ilk işi)

1. Önce yalnız şu üç dosyayı oku, başka hiçbir şey okuma:
   1. `kao3-premium/.anti-amnesia/CURRENT-STATE.md`
   2. `LEDGER.md` dosyasının son 3 kaydı: `tail -n 40 kao3-premium/.anti-amnesia/LEDGER.md`
   3. `kao3-premium/K3P-STATE.json`
2. `node kao3-premium/araclar/senkron.mjs` çalıştır.
   - Komut 0 ile çıkmalı.
   - Yazdığı **sıradaki prompt**, sana verilen prompt'un kimliğiyle aynı olmalı.
   - Biri tutmazsa **DUR**. Hiçbir dosyaya dokunma ve kullanıcıya "Sıradaki X, bana Y verildi"
     de.
3. Git durumunu denetle:
   - Dal `kao3-premium` olmalı. Tek istisna K3P-00: dalı o kurar.
   - `git status --short` boş olmalı. Boş değilse DUR.
   - İstisna: Kart `in-progress` durumundaysa ağacın kirli olması beklenir. Bu durumda
     CURRENT-STATE içindeki **Devir notu**nu oku ve oradan devam et (§4).
4. Kartın bağlamı için yalnız prompt'taki **Oku** satırında sayılan bölümleri oku. Belgelerin
   tamamını okuma.

## §2 Çalışırken bağlam bütçesi

| Kural | Neden |
| --- | --- |
| **Çalışma zamanı bütçesi:** KAO runtime 118,1 KiB, tavan 128 KiB; kalan pay yaklaşık 10 KiB. Kod ekleyen her kart `node tests/kao/test_kao2_perf_budget.js` satırındaki `runtime` değerini LEDGER'a yazar. Tavan aşılacaksa önce kart içinde aynı işi gören eski kod silinir; yetmiyorsa §5 gereği DUR. | Tavanı yalnız kullanıcı yükseltebilir (önceki yükseltmeler 80 → 88 → 128 KiB kullanıcı yetkisiyle yapıldı). |
| `app/core/quranLearn.js` (~4.100 satır), `app.js`, `index.html` ve `app/kao.css` hiçbir zaman baştan sona okunmaz. Önce `grep -n` ile yer bulunur, sonra en çok 120 satırlık aralık okunur. | `kao.css` ve içerik modüllerinde tek satırı on binlerce karakter olan satırlar var. |
| İçerik modülleri (`app/content/quran*.js`) okunmaz; yalnız `node -e` ile ölçülür. | Tek satırlık dev dosyalar. |
| Test çıktısından yalnız son satırlar okunur (`\| tail -5`). Uzun çıktı `$TMPDIR` altına yazılır. | Bağlamı korumak. |
| **Tek kart, tek commit.** Kapsam dışında görülen bir hata düzeltilmez; LEDGER'a "Gözlem" olarak yazılır. | Kapsam kayması anti-amneziyi bozar. |
| Bağlam yaklaşık %75'e dolduysa ya da sistem uyarı verdiyse yeni iş başlatılmaz; §4 devir uygulanır. | Yarım commit yerine temiz bir devir. |

## §3 Kapanış protokolü (her prompt'un son işi)

1. **Hızlı kapı:** `node kao3-premium/araclar/kapi-hizli.mjs --kart <ID>` çalıştır; 0 ile
   çıkmalı. Süresi yaklaşık 3–5 dakika. Üç yavaş test (`kabul`, `grammar_tasks`, `denetim`; toplam yaklaşık 14 dakika) varsayılan olarak atlanır. Prompt `--yavas` diyorsa bu bayrakla çalıştır; bu durumda süre yaklaşık 18 dakikaya çıkar, arka planda çalıştırılabilir. Kart, dalganın son kartıysa ayrıca `KAO2_ACCEPT_SLOW_HOST=1 bash tools/kapi/kapilar.sh` çalıştır ve "TÜM
   KAPILAR YEŞİL" çıktısını gör. Bayrak yalnız perf testinin göreli bandını atlar; bu bant `main` üzerinde de bu makinede kırmızı (taban). Mutlak tavanlar zorunlu kalır. Bu komut 10 dakikadan uzun sürer; arka planda çalıştırılabilir.
2. **Ölçüm:** Kartın **Kabul** bölümündeki ölçüleri al ve sayıları not et.
3. **Durum dosyalarını güncelle:**
   - `K3P-STATE.json`: kartın `status` alanı `done` olur. `nextPrompt`, `executionOrder` içinde
     sıradaki `todo` kartı gösterir.
   - `CURRENT-STATE.md`: dosyanın içindeki şablona göre baştan yazılır.
   - `LEDGER.md`: dosyanın başındaki şablona göre sona bir kayıt eklenir. `Commit` alanına
     `(bu commit)` yazılır.
4. **Uyum denetimi:** `node kao3-premium/araclar/senkron.mjs` çalıştır; 0 ile çıkmalı.
5. **Commit:** Tek commit atılır. Mesaj `K3P-NN: <kısa Türkçe özet>` biçimindedir ve
   `Co-Authored-By` satırıyla biter. Commit hash'i sonradan yazılmaz; `git log --grep '^K3P-NN:'`
   ile bulunur. **Push yapılmaz.**
6. **Rapor:** Kullanıcıya kısa bir rapor ver. Kanıt düzeylerini ayrı ayrı yaz:
   kaynak/test · görsel QA (varsa) · cihaz (yalnız kullanıcı söylediyse). Raporun son satırı:
   `Sıradaki prompt: <ID> — "node kao3-premium/araclar/senkron.mjs --sonraki" ile al.`

## §4 Devir (kart bitmeden durmak gerekirse)

1. Commit **yapılmaz**; değişiklikler çalışma ağacında kalır.
2. `CURRENT-STATE.md` içindeki **Devir notu** bölümü doldurulur:
   - Ne yapıldı.
   - Ne kaldı.
   - Hangi dosyalarda hangi işlevler değişti.
   - Hangi komut kırmızı ve çıktısının son satırı ne.
3. `K3P-STATE.json` içinde kartın `status` alanı `in-progress` olur. `nextPrompt` aynı kalır.
4. LEDGER'a `DEVİR` türünde bir kayıt eklenir.
5. Kullanıcıya şu söylenir: "Aynı prompt'u yeni bir oturumda tekrar ver."

## §5 Durma koşulları

Aşağıdakilerden biri olursa dur ve kullanıcıya sor; kendin karar verme:

- `senkron.mjs` uyumsuzluk bildiriyor ya da prompt sırası tutmuyor.
- Kart şu sözleşmelerden birini bozmayı gerektiriyor:
  - `quranLearn` veri şeması
  - `migrate()`
  - `App.kao*` sayısı (45)
  - fx2, v3 ya da surface pinleri
  - `test_kao2_design_contract`
- Kabul ölçüsü tutmuyor ve düzeltmek kartın kapsamını aşıyor.
- İş gerçek tarayıcı, ağ ya da `seyma-data` gerektiriyor ve prompt buna açıkça izin vermiyor.
- Bir test ancak gevşetilerek geçecek gibi görünüyor.

## §6 Sabit kurallar

Hiçbir prompt bu kuralları değiştiremez.

1. **Veri güvenliği.** CLAUDE.md "DATA SAFETY" bölümü geçerlidir: doğrulama yalnız headless
   yapılır, `mustafaras/seyma-data` deposuna yazılmaz, token ya da sır istenmez.
2. **Yayın.** Push, merge, tag ve deploy yalnız K3P-27'de, kullanıcının o anki açık onayıyla
   yapılır.
3. **Sürüm pini.** Ara kartlarda `?v=` pini yükseltilmez. Yeni bir varlık eklenirse `index.html`
   ve `sw.js` içine mevcut KAO sürüm değeriyle (`sw.js` → `SW_VERSION`) eklenir. Değişen
   dosyaların pinleri K3P-27'de tek seferde yükseltilir. **Pin tazeliği (K-P):** Pinli bir dosyayı
   (`index.html`/`sw.js` içinde `?v=` ile anılan) değiştiren kart, dosyayı `K3P-STATE.json` →
   `pinDeferral.files` listesine ekler. `tests/app/test_asset_pin_freshness.js` yalnız `kao3-premium`
   dalında ve yalnız bu dosyalar için PASS yerine ERTELENDİ der; `main`'de tam katıdır.
4. **İçerik.** Arapça içerik ve okunuşlar elle yazılmaz; yalnız
   `tools/kao-lexicon-build.mjs` ve `tools/kao-content-freeze.mjs` araçlarından üretilir.
5. **Handler sayısı.** `App.kao*` sayısı 45'te kalır. Yeni etkileşimler mevcut eylem
   çoğaltıcılarına bağlanır: `kaoAnswer`, `kaoLesson`, `kaoReader`, `kaoOnboard`.
6. **Test dürüstlüğü.** Bir test, kod geçsin diye gevşetilmez. Test gerçekten yanlışsa
   düzeltilir ve gerekçesi LEDGER'a yazılır.
7. **Test envanteri.** Her yeni `tests/kao/test_*.js` dosyası `tests/kao/README.md` tablosuna
   bir satırla eklenir; eklenmezse `test_kao2_inventory` kırmızıya döner.
8. **Commit mesajı ve UI dili.** Türkçe, sıcak ve sade.

## §7 Okuma haritası

| Soru | Belge |
| --- | --- |
| Bu hata ne, kanıtı ne? | `ANALIZ.md` §1–§3, §8 |
| Neden böyle karar verildi? | `KARARLAR.md`, K-A…K-O |
| Akış, ritim, uyarlanır zorluk | `AKIS.md` §3–§5 |
| Görsel sistem, Tezhip, merdiven | `TASARIM.md` §2–§5 |
| Bu kartın kabul ölçüsü | `PROMPTLAR.md` içindeki ilgili prompt |
| Başlangıç ve hedef sayılar | `K3P-STATE.json` → `baseline`, `targets` |
