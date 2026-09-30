# KAO2-FIX — Bağlam yönetimi (Sonnet 5.5 için)

Bu belge, 44 promptluk zincirin **karışıklık olmadan** yürümesi için her oturumun bağlamı nasıl
kuracağını, koruyacağını ve devredeceğini tanımlar. Kurallar bağlayıcıdır; `PROMPTLAR.md` §1 bunlara atıf yapar.

## 1. Tek doğruluk kaynağı hiyerarşisi

Bir bilgi iki yerde farklı görünürse **yukarıdaki kazanır** ve aşağıdaki düzeltilir (FIX kaydıyla):

1. **Kod ve araç çıktısı** (gerçek): `fix-sync-check.mjs`, `kapilar.sh`, `tekrar-uret.cjs`, `git`.
2. `FIX-STATE.json` — makine durumu (sıradaki prompt, prompt durumları, pinler, R durumları, kararlar).
3. `.anti-amnesia/CURRENT-STATE.md` — insan için tek sayfa "şu an".
4. `.anti-amnesia/LEDGER.md` — yalnız eklenen geçmiş.
5. `PROMPTLAR.md` — ne yapılacağı (değişmez; yalnız FIX kaydıyla düzeltilir).
6. `denetim/KUSUR-RAPORU.md`, `denetim/DUZELTME-PLANI.md` — neden (salt okunur referans).

**Sayıları ezberden yazma.** Handler sayısı, pin, test sayısı, bütçe, R durumu her seferinde araçla
ölçülür ve öyle yazılır. Önceki oturumun ya da bu belgenin sayısı "bilgi" değil "iddia"dır.

## 2. Oturum = tek prompt

- Her prompt **yeni bir oturumda** çalışır. Bir oturumda ikinci prompta geçilmez (kullanıcı açıkça
  "devam et, sıradakine geç" dese bile önce mevcut prompt P4 ile commit edilir, sonra yeni oturum önerilir).
- Oturum başında `PROMPTLAR.md` §0 metni yapıştırılır. Başka bağlam varsayılmaz.

## 3. Okuma bütçesi (oturum başı, bu sırayla)

| # | Ne | Nasıl | Neden |
|---|---|---|---|
| 1 | `CLAUDE.md` "DATA SAFETY" bölümü | yalnız o bölüm (Grep ile satırını bul, ~60 satır oku) | tarayıcı/sunucu/seyma-data yasağı |
| 2 | `kao2-duzeltme/.anti-amnesia/CURRENT-STATE.md` | tamamı (kısa) | şu an |
| 3 | `LEDGER.md` | **yalnız son 3 kayıt** (`grep -n '^## seq'` → son 3 başlığın ilkinden sonuna) | yakın geçmiş |
| 4 | `node kao2-duzeltme/tools/fix-sync-check.mjs --clean --repro` | çalıştır | senkron + temiz ağaç |
| 5 | `FIX-STATE.json` | `nextPrompt`, o promptun kaydı, `pins`, `repro` | makine durumu |
| 6 | `PROMPTLAR.md` §1 (P1–P14) | tamamı | protokol |
| 7 | `PROMPTLAR.md` yalnız **nextPrompt bölümü** | `grep -n '^#### K2F-NN'` → sonraki `#### ` başlığına kadar | ne yapılacak |
| 8 | Promptun "Oku" satırındaki kaynaklar | yalnız verilen satır aralıkları (±40) | ayrıntı |

Okunmayacaklar: diğer promptların bölümleri, arşivdeki eski programın tamamı, `KUSUR-RAPORU.md`'nin
tamamı (yalnız promptun andığı bulgu kimliğini `grep -n` ile bul ve o paragrafı oku).

## 4. Büyük dosyalarda gezinme

- `app/core/quranLearn.js` ~3.400 satır, `app.js` ~7.600 satır, `index.html`/`panel.html` çok uzun
  satırlar içerir. **Asla tamamını okuma.** Önce `grep -n 'function adı'`, sonra `Read offset/limit`
  ile ±60 satır.
- Promptlardaki satır numaraları **yaklaşıktır** (≈); önceki promptlar kaydırmış olabilir. Her zaman
  fonksiyon adıyla doğrula.
- HTML çıktısı incelerken tamamını basma: `node -e` ile render et, `replace(/<[^>]+>/g,'|')` ile metne
  çevir, `slice(0, 800)` ile kes. Test düzeneği: `tests/kao/helpers/kao-harness.js` (K2F-02'den sonra).
- Test çıktısını `| tail -20` ile oku; çıkış kodunu **boru sonrasında okuma** — gerekiyorsa komutu ayrı çalıştır.
- zsh'de tırnaklı glob genişlemez; aileleri `kapilar.sh` ile koş.

## 5. Oturum içi kontrol noktaları (sıkıştırmaya dayanıklılık)

Uzun promptlarda bağlam sıkıştırılabilir. Kaybolmamak için:

1. P1 bittiği anda `kao2-duzeltme/evidence/K2F-NN/KANIT.md` dosyasını **şablonla oluştur** ve
   "İlerleme günlüğü" bölümüne her anlamlı adımdan sonra tek satır ekle
   (`- [x] test kırmızı görüldü: …`, `- [x] Flow.masteryPlan yazıldı`).
2. Sıkıştırma ya da belirsizlik hissedildiğinde: `fix-sync-check.mjs` çalıştır → `KANIT.md` İlerleme
   günlüğünü oku → `git status` + `git diff --stat` → promptun kendi bölümünü yeniden oku → kaldığın
   adımdan devam et. Hafızaya güvenme.
3. Bir adım yarım kaldıysa (ör. dosya yarı düzenlendi) önce `git diff <dosya>` ile durumu gör; emin
   değilsen yalnız **bu promptun kendi** değişikliğini `git checkout -- <dosya>` ile geri alıp adımı baştan yap.

## 6. Oturum yarıda biterse (sonraki oturum)

- `FIX-STATE.json`'da prompt `in_progress` görünür; `git status` kirli olabilir. Bu **beklenen** bir
  durumdur: P1'in `--clean` adımı yerine §5.2 akışını uygula, `KANIT.md` İlerleme günlüğünden devam et.
- Yarım kalan promptu **yeniden başlatma**; tamamla ve P4 ile kapat. Commit'i bölme.

## 7. Devir notu (her prompt sonunda)

CURRENT-STATE "Sıradaki promptun tek cümlesi" bir sonraki oturumun ilk ihtiyacıdır; somut yaz
(ne, hangi dosya, hangi R/test). "Devam et" gibi boş cümle yasak. Beklenmeyen bir şey gördüysen
"Açık riskler"e ve LEDGER `surprises:` satırına yaz.

## 8. Karışıklık önleyiciler (kısa liste)

- Aynı anda en çok **bir** prompt `in_progress`; `fix-sync-check` bunu zorlar.
- Prompt atlanamaz; `done` bir prompttan önce `done` olmayan prompt olamaz (araç zorlar).
- LEDGER seq kesintisiz; STATE/CURRENT-STATE/LEDGER üçlüsü her commit'te aynı (araç zorlar).
- Pin/handler sayıları STATE'te gerçekle aynı (araç `app.js` ve `index.html`'den ölçer).
- R-xx bir kez `pass` olduysa geri `fail` olamaz (`--repro` gerilemeyi yakalar).
- Kullanıcı kapısında (`waiting_user`) prompt **kapatılmaz**; kullanıcı yanıtı gelince aynı prompt sürdürülür.
- Kapsam dışı iş görülürse yapılmaz → LEDGER `NOTE` + CURRENT-STATE "Açık riskler".
