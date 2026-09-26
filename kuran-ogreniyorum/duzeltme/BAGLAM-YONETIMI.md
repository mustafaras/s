# KAO-FIX · Bağlam yönetimi (her oturumda İLK okunacak dosya)

Bu belge, düzeltme programında (KAO-FIX-00 … KAO-FIX-19) çalışan her ajanın
**gereksiz token harcamadan** doğru işi yapması içindir. Kısa tutuldu; tamamını oku (≈3 dk).

## 1. Oturum başında okuma sırası (başka bir şey okuma)

1. Bu dosya.
2. `kuran-ogreniyorum/duzeltme/.anti-amnesia/CURRENT-STATE.md` → **Sıradaki** prompt, açık kararlar, tuzaklar.
3. `kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md` içinde **yalnız** §1 (ortak sözleşme) ve sıradaki promptun bölümü:
   ```sh
   awk '/^## 1\. Ortak sözleşme/,/^## 2\. /' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md
   awk '/^## KAO-FIX-05 /,/^---$/' kuran-ogreniyorum/duzeltme/FIX-PROMPTLARI.md   # numarayı değiştir
   ```
4. Promptun **Oku** listesi. Listede olmayan plan belgesini açma.

Okuma: LEDGER'ın yalnız son 5 satırı (`tail -5`). Denetim raporunun yalnız promptta adı geçen bölümü
(`grep -n "^\*\*Y-2" -A12 kuran-ogreniyorum/deliverables/KAO-UYGUNLUK-DENETIMI-20260926.md`).

## 2. ASLA bütün olarak okunmayacak dosyalar

| Dosya | Neden | Doğru yöntem |
|---|---|---|
| `app/content/quranLexiconV1.js` (320 KB, 50 satır, satır başına ~6 KB) | Tek okuma ~80 K token | `node -e` ile tek kayıt: aşağıdaki §4 |
| `app/content/quranGrammarV1.js`, `quranShortSurahsV1.js`, `quranPhonicsV1.js` (tek satır) | Tek satır = tüm dosya | `node -e` ile alan/kayıt |
| `kuran-ogreniyorum/content/lexicon.reference.json` (16 MB, git dışı) | Bağlamı doldurur | Yalnız araç okur; elle açma |
| `kuran-ogreniyorum/content/lexicon.verified.json` (büyük) | Gereksiz | `node -e` ile `lemmaId` filtresi |
| `kuran-ogreniyorum/content/inputs/*` (QAC 6 MB, Tanzil 1,3 MB) | Ham korpus | `grep -n '^(2:5:'` gibi dar sorgu |
| `app.js` (7.8k satır, çok uzun satırlar) | — | `grep -n "kao" app.js \| cut -c1-160` |
| `app/core/quranLearn.js` (1.790 satır, satırlar 6 KB'a kadar) | — | `grep -n "function kaoX("` → `sed -n 'A,Bp' \| cut -c1-400` |
| `app/kao.css` (92 satır ama satırlar çok uzun) | — | `grep -o '\.kao-arabic-text{[^}]*}' app/kao.css` |
| `index.html`, `panel.html` (base64 satırları) | — | `grep -o 'quranLearn.js?v=[0-9a-z]*' index.html` |
| `assets/kao/**` (1.678 ses, 13 SVG) | İkili/çok dosya | `ls \| wc -l`, `du -sh` |
| `kuran-ogreniyorum/evidence/**`, eski `LEDGER.md` | Kapalı programın geçmişi | Prompt söylemedikçe açma |
| `UYGULAMA-PROMPTLARI.md` (2.066 satır, eski program) | Bu program için gereksiz | Açma |

## 3. Çıktıyı küçük tut

- Her komutu `| tail -5`, `| head -20`, `| cut -c1-200` ile sınırla.
- Uzun test çıktısını dosyaya yaz, yalnız son satırı oku:
  `node tests/kao/test_kao_queue.js > "$TMPDIR/q.log" 2>&1; echo "exit $?"; tail -2 "$TMPDIR/q.log"`
- Aileyi koşarken yalnız özet bas:
  `for f in tests/kao/*.js; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done; echo bitti`
- `git diff` yerine `git diff --stat`. Satır gerekiyorsa `git diff -U1 -- <dosya> | head -60`.
- Aynı dosyayı iki kez okuma. Düzenlemeden sonra tekrar okuma (araç hata vermediyse değişiklik yapılmıştır).
- Uzun Arapça/JSON değerlerini ekrana basma; say (`.length`), örnekle (`slice(0,3)`).

## 4. Hazır sorgu kalıpları (kopyala-kullan)

```sh
# Sözlükte tek lemma
node -e 'const fs=require("fs"),vm=require("vm");const s={window:{}};vm.createContext(s);vm.runInContext(fs.readFileSync("app/content/quranLexiconV1.js","utf8"),s);const l=s.window.QuranLexiconV1.byId(process.argv[1]);console.log(JSON.stringify({ar:l.ar,translit:l.translit,meanings:l.meanings,freq:l.freq}))' l_r_aHiym_ecdbe9

# Kısa sûre modülünde bir sûrenin kelimeleri (yalnız sayım + ilk 3)
node -e 'const fs=require("fs"),vm=require("vm");const s={window:{}};vm.createContext(s);vm.runInContext(fs.readFileSync("app/content/quranShortSurahsV1.js","utf8"),s);const w=s.window.QuranShortSurahsV1.words.filter(x=>x.surahId===+process.argv[1]);console.log(w.length,JSON.stringify(w.slice(0,3)))' 112

# Doğrulanmış sözlükte satır
node -e 'const v=JSON.parse(require("fs").readFileSync("kuran-ogreniyorum/content/lexicon.verified.json","utf8"));const r=v.lemmas.find(x=>x.lemmaId===process.argv[1]);console.log(JSON.stringify({ar:r.ar,lemmaBw:r.lemmaBw,translit:r.translit,verifiedAt:r.verifiedAt}))' l_n_aAs_ba9c78

# quranLearn.js'de fonksiyon aralığı
n=$(grep -n "function kaoCandidates(" app/core/quranLearn.js | cut -d: -f1); sed -n "${n},$((n+8))p" app/core/quranLearn.js | cut -c1-300

# Yayın pini dosyaları (değiştirmeden önce listele)
grep -rlF "$(grep -o 'quranLearn.js?v=[0-9a-z]*' index.html | cut -d= -f2)" index.html sw.js tests/app
```

## 5. Pahalı işlemler — yalnız prompt isterse

| İşlem | Süre / maliyet | Ne zaman |
|---|---|---|
| `kuran-ogreniyorum/duzeltme/araclar/kao-sim.js <repo> 365` | ~60 sn, çıktı ~60 satır | FIX-06, 07, 09, 10, 19 |
| `…/kao-mutate.mjs <kopya>` | ~2 dk, **kopyada** çalışır | FIX-11, 19 |
| `…/kao-content-check.js <repo> 20260926` | ~10 sn, çıktı uzun → `\| head -25` | FIX-04, 05, 19 |
| `…/kao-ui-probe.js <repo>` | ~30 sn | FIX-07, 12, 13, 19 |
| Tüm `tests/app` ailesi (77 dosya) | ~1–2 dk | Yalnız pin, app.js ya da ortak dosya değişince |
| `tools/kao-lexicon-build.mjs --freeze`, `tools/kao-content-freeze.mjs --freeze-*` | girdi dosyaları gerekir | İçerik promptları |

Kopya dizini (mutasyon için, repoya asla yazma):
`D="$TMPDIR/kao-mut-$(date +%s)"; mkdir -p "$D"; git archive HEAD | tar -x -C "$D"`

## 6. Alt ajan politikası

- Varsayılan: **alt ajan yok**. Tek prompt tek oturumda ana ajanla biter.
- İstisna: FIX-03 (çeviri partileri) ve FIX-05 (26 başlık) gibi içerik işlerinde, kullanıcı isterse tek bir
  alt ajana dar bir parti verilebilir. Alt ajana yalnız: parti kimlikleri, çalışma kitabı yolu, kurallar (§FIX-03).
  Alt ajan repo dosyası **yazmaz**; önerisini döndürür, ana ajan yazar.

## 7. Oturum sonu devri (bir sonraki ajanın okuyacağı tek şey)

Her prompt sonunda yalnız şunlar güncellenir:
1. `CURRENT-STATE.md` → prompt satırı `done`, **Sıradaki**, gerekirse "Tuzaklar"a yeni satır (≤2 satır).
2. `LEDGER.md` → tek satır (ne, kanıt komutu + exit, commit kısa hash).
3. `kuran-ogreniyorum/duzeltme/kanit/KAO-FIX-xx.md` → ≤40 satır: komutlar + exit + tek satır sonuç.

Uzun anlatı, tekrar eden özet, "bu oturumda şunları yaptım" paragrafları **yazılmaz**.

## 8. Bir prompt için bağlam bütçesi

Hedef: prompt başına ≤120 K token toplam bağlam. Aşılacaksa (ör. FIX-03 partisi büyükse) iş
**prompt içinde tanımlı parti sınırında** durdurulur, durum CURRENT-STATE'e yazılır, kalan kısım
aynı prompt kimliğiyle yeni oturumda sürer (`KAO-FIX-03/B` gibi).
